import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import {
  DALSEONG_SIGUNGU_OPTIONS,
  DALSEONG_SIDO_OPTIONS,
  WELFARE_INTRS_THEMA_OPTIONS,
  WELFARE_TRGTER_OPTIONS,
  getWelfareProfile,
  getWelfareRecommendations,
  getMockWelfareRecommendations,
  postWelfareRecommend,
} from "@/lib/apis/welfare";
import styles from "@/styles/Welfare.module.scss";
import type { WelfareListItem, WelfareRecommendationParams } from "@/types/welfare";

const cn = classNames.bind(styles);
const RECOMMENDATION_PAGE_SIZE = 5;
const WELFARE_PAGE_CACHE_KEY = "factory.welfare.pageState.v1";

function buildSnapshot(input: WelfareRecommendationParams): string {
  return JSON.stringify({
    ...input,
    themaCodes: [...input.themaCodes].sort(),
    targetCodes: [...input.targetCodes].sort(),
  });
}

type WelfareTab = "input" | "results";

type WelfarePageCache = {
  version: 1;
  activeTab: WelfareTab;
  residenceSido: string;
  residenceSigungu: string;
  age: string;
  themaCodes: string[];
  noneTarget: boolean;
  targetCodes: string[];
  lastSnapshot: string | null;
  results: WelfareListItem[] | null;
  resultPage: number;
  totalCount: number;
  hasMore: boolean;
};

export default function WelfarePage() {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sidoDropdownRef = useRef<HTMLDivElement | null>(null);
  const sigunguDropdownRef = useRef<HTMLDivElement | null>(null);
  const profileLoadedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<WelfareTab>("input");
  const [residenceSido, setResidenceSido] = useState("대구광역시");
  const [residenceSigungu, setResidenceSigungu] = useState("");
  const [sidoMenuOpen, setSidoMenuOpen] = useState(false);
  const [sigunguMenuOpen, setSigunguMenuOpen] = useState(false);
  const [age, setAge] = useState("");
  const [themaCodes, setThemaCodes] = useState<string[]>([]);
  const [noneTarget, setNoneTarget] = useState(true);
  const [targetCodes, setTargetCodes] = useState<string[]>([]);

  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [results, setResults] = useState<WelfareListItem[] | null>(null);
  const [resultPage, setResultPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultError, setResultError] = useState("");
  const [cacheReady, setCacheReady] = useState(false);
  const [restoredFromCache, setRestoredFromCache] = useState(false);

  const forceEmptyDemo = router.query.demo === "empty";

  const currentSnapshot = useMemo(
    () =>
      buildSnapshot({
        residenceSido,
        residenceSigungu,
        age,
        themaCodes,
        noneTarget,
        targetCodes,
      }),
    [residenceSido, residenceSigungu, age, themaCodes, noneTarget, targetCodes]
  );

  const isDirty =
    lastSnapshot !== null &&
    results !== null &&
    currentSnapshot !== lastSnapshot;

  const toggleThema = (code: string) => {
    setThemaCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleNoneTarget = () => {
    setNoneTarget(true);
    setTargetCodes([]);
  };

  const toggleTarget = (code: string) => {
    setNoneTarget(false);
    setTargetCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedSidoLabel =
    DALSEONG_SIDO_OPTIONS.find((o) => o.value === residenceSido)?.label ?? "";
  const selectedSigunguLabel =
    DALSEONG_SIGUNGU_OPTIONS.find((o) => o.value === residenceSigungu)?.label ?? "";

  const formValid =
    Boolean(residenceSido) &&
    Boolean(residenceSigungu) &&
    age.trim() !== "" &&
    !Number.isNaN(Number(age)) &&
    themaCodes.length > 0;

  const recommendationParams = useMemo<WelfareRecommendationParams>(
    () => ({
      residenceSido,
      residenceSigungu,
      age,
      themaCodes,
      noneTarget,
      targetCodes,
    }),
    [residenceSido, residenceSigungu, age, themaCodes, noneTarget, targetCodes]
  );

  const loadRecommendationPage = useCallback(
    async (nextPage: number, replace = false) => {
      setIsLoadingResults(true);
      setResultError("");

      try {
        const requestParams = {
          ...recommendationParams,
          page: nextPage,
          size: RECOMMENDATION_PAGE_SIZE,
        };
        const apiRes = forceEmptyDemo ? null : await getWelfareRecommendations(requestParams);
        const res =
          apiRes ??
          (await getMockWelfareRecommendations({
            ...requestParams,
            forceEmpty: forceEmptyDemo,
          }));

        setResults((prev) => (replace ? res.items : [...(prev ?? []), ...res.items]));
        setResultPage(res.page);
        setTotalCount(res.totalCount);
        setHasMore(res.hasMore);
      } catch (e) {
        console.error(e);
        setResultError("복지 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        if (replace) {
          setResults([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        setIsLoadingResults(false);
      }
    },
    [forceEmptyDemo, recommendationParams]
  );

  const handleSubmit = useCallback(() => {
    if (!formValid || isLoadingResults) return;
    const snap = buildSnapshot(recommendationParams);
    setLastSnapshot(snap);
    setResults([]);
    setResultPage(0);
    setTotalCount(0);
    setHasMore(false);
    setIsLoadingResults(true);
    setActiveTab("results");
    void (async () => {
      await postWelfareRecommend(recommendationParams);
      await loadRecommendationPage(0, true);
    })();
  }, [formValid, isLoadingResults, loadRecommendationPage, recommendationParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.sessionStorage.getItem(WELFARE_PAGE_CACHE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<WelfarePageCache>;
      if (parsed.version !== 1) return;

      setRestoredFromCache(true);
      setActiveTab(parsed.activeTab === "results" ? "results" : "input");
      setResidenceSido(typeof parsed.residenceSido === "string" ? parsed.residenceSido : "대구광역시");
      setResidenceSigungu(
        typeof parsed.residenceSigungu === "string" ? parsed.residenceSigungu : ""
      );
      setAge(typeof parsed.age === "string" ? parsed.age : "");
      setThemaCodes(Array.isArray(parsed.themaCodes) ? parsed.themaCodes : []);
      setNoneTarget(typeof parsed.noneTarget === "boolean" ? parsed.noneTarget : true);
      setTargetCodes(Array.isArray(parsed.targetCodes) ? parsed.targetCodes : []);
      setLastSnapshot(typeof parsed.lastSnapshot === "string" ? parsed.lastSnapshot : null);
      setResults(Array.isArray(parsed.results) ? parsed.results : null);
      setResultPage(typeof parsed.resultPage === "number" ? parsed.resultPage : 0);
      setTotalCount(typeof parsed.totalCount === "number" ? parsed.totalCount : 0);
      setHasMore(typeof parsed.hasMore === "boolean" ? parsed.hasMore : false);
    } catch (e) {
      console.error(e);
      window.sessionStorage.removeItem(WELFARE_PAGE_CACHE_KEY);
    } finally {
      setCacheReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cacheReady || profileLoadedRef.current) return;

    profileLoadedRef.current = true;
    let canceled = false;

    void (async () => {
      const profile = await getWelfareProfile();
      if (!profile || canceled || restoredFromCache) return;

      setResidenceSido(profile.residenceSido || "대구광역시");
      setResidenceSigungu(profile.residenceSigungu || "");
      setAge(profile.age || "");
      setThemaCodes(profile.themaCodes);
      setNoneTarget(profile.noneTarget);
      setTargetCodes(profile.noneTarget ? [] : profile.targetCodes);
    })();

    return () => {
      canceled = true;
    };
  }, [cacheReady, restoredFromCache]);

  useEffect(() => {
    if (!cacheReady || typeof window === "undefined") return;

    const cache: WelfarePageCache = {
      version: 1,
      activeTab,
      residenceSido,
      residenceSigungu,
      age,
      themaCodes,
      noneTarget,
      targetCodes,
      lastSnapshot,
      results,
      resultPage,
      totalCount,
      hasMore,
    };

    window.sessionStorage.setItem(WELFARE_PAGE_CACHE_KEY, JSON.stringify(cache));
  }, [
    activeTab,
    age,
    cacheReady,
    hasMore,
    lastSnapshot,
    noneTarget,
    residenceSido,
    residenceSigungu,
    resultPage,
    results,
    targetCodes,
    themaCodes,
    totalCount,
  ]);

  useEffect(() => {
    if (!sidoMenuOpen && !sigunguMenuOpen) return;

    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sidoDropdownRef.current && !sidoDropdownRef.current.contains(target)) {
        setSidoMenuOpen(false);
      }
      if (sigunguDropdownRef.current && !sigunguDropdownRef.current.contains(target)) {
        setSigunguMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sidoMenuOpen, sigunguMenuOpen]);

  useEffect(() => {
    if (!sidoMenuOpen && !sigunguMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidoMenuOpen(false);
        setSigunguMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidoMenuOpen, sigunguMenuOpen]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (
      !target ||
      activeTab !== "results" ||
      results === null ||
      isDirty ||
      !hasMore ||
      isLoadingResults
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadRecommendationPage(resultPage + 1);
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    activeTab,
    hasMore,
    isDirty,
    isLoadingResults,
    loadRecommendationPage,
    resultPage,
    results,
  ]);

  const resetForm = () => {
    setResidenceSido("대구광역시");
    setResidenceSigungu("");
    setAge("");
    setThemaCodes([]);
    setNoneTarget(true);
    setTargetCodes([]);
    setResults(null);
    setLastSnapshot(null);
    setResultPage(0);
    setTotalCount(0);
    setHasMore(false);
    setResultError("");
    setActiveTab("input");
  };

  const openDetail = (id: string) => {
    void router.push(`/welfare/${id}`);
  };

  const leadCopy =
    "달성군에 거주하시는 주민을 위한 맞춤 복지 안내입니다. 거주 구·군(읍·면)과 나이, 필요한 도움 유형을 입력하면 관련 혜택을 우선순위에 맞게 안내합니다.";

  return (
    <div className={cn("background")}>
      <div className={cn("welfareInner")}>
        <h1 className={cn("title")}>복지 정보 제공</h1>
        <h1 className={cn("mobileTitle")}>복지 정보 제공</h1>
        <p className={cn("lead")}>{leadCopy}</p>

        {forceEmptyDemo && (
          <p className={cn("demoHint")}>
            미리보기: URL에 <code>?demo=empty</code> 가 있어 &apos;결과 없음&apos; 상태를
            시뮬레이션합니다.
          </p>
        )}

        <div className={cn("tabMenu")} role="tablist" aria-label="복지 안내 구역">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "input"}
            className={cn("tab", { tabActive: activeTab === "input" })}
            onClick={() => setActiveTab("input")}
          >
            정보 입력
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "results"}
            className={cn("tab", { tabActive: activeTab === "results" })}
            onClick={() => setActiveTab("results")}
          >
            추천 결과
          </button>
        </div>

        <div className={cn("tabContent")}>
          {activeTab === "input" && (
            <div className={cn("welfareForm")}>
              <div className={cn("formGroup")}>
                <label className={cn("formLabel")} htmlFor="welfare-sido">
                  거주 시도
                  <span className={cn("requiredMark")} aria-hidden>
                    *
                  </span>
                </label>
                <div
                  className={cn("customSelectWrapper", {
                    customSelectWrapperOpen: sidoMenuOpen,
                  })}
                  ref={sidoDropdownRef}
                >
                  <button
                    id="welfare-sido"
                    type="button"
                    className={cn("welfareSelectTrigger", {
                      welfareSelectTriggerPlaceholder: residenceSido === "",
                    })}
                    onClick={() => {
                      setSidoMenuOpen((open) => !open);
                      setSigunguMenuOpen(false);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={sidoMenuOpen}
                    aria-controls="welfare-sido-listbox"
                  >
                    <span className={cn("welfareSelectTriggerText")}>
                      {selectedSidoLabel || "\u200b"}
                    </span>
                    <IoIosArrowDown
                      className={cn("welfareSelectChevron", {
                        welfareSelectChevronOpen: sidoMenuOpen,
                      })}
                      aria-hidden
                    />
                  </button>
                  {sidoMenuOpen && (
                    <ul
                      id="welfare-sido-listbox"
                      className={cn("welfareSelectList")}
                      role="listbox"
                      aria-label="거주 시도 선택"
                    >
                      {DALSEONG_SIDO_OPTIONS.map((option) => (
                        <li key={option.value || "placeholder"} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={residenceSido === option.value}
                            className={cn("welfareSelectOption", {
                              welfareSelectOptionActive: residenceSido === option.value,
                            })}
                            onClick={() => {
                              setResidenceSido(option.value);
                              setSidoMenuOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={cn("formGroup")}>
                <label className={cn("formLabel")} htmlFor="welfare-residence">
                  거주 구·군
                  <span className={cn("requiredMark")} aria-hidden>
                    *
                  </span>
                </label>
                <div
                  className={cn("customSelectWrapper", {
                    customSelectWrapperOpen: sigunguMenuOpen,
                  })}
                  ref={sigunguDropdownRef}
                >
                  <button
                    id="welfare-residence"
                    type="button"
                    className={cn("welfareSelectTrigger", {
                      welfareSelectTriggerPlaceholder: residenceSigungu === "",
                    })}
                    onClick={() => {
                      setSigunguMenuOpen((open) => !open);
                      setSidoMenuOpen(false);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={sigunguMenuOpen}
                    aria-controls="welfare-sigungu-listbox"
                  >
                    <span className={cn("welfareSelectTriggerText")}>
                      {selectedSigunguLabel || "\u200b"}
                    </span>
                    <IoIosArrowDown
                      className={cn("welfareSelectChevron", {
                        welfareSelectChevronOpen: sigunguMenuOpen,
                      })}
                      aria-hidden
                    />
                  </button>
                  {sigunguMenuOpen && (
                    <ul
                      id="welfare-sigungu-listbox"
                      className={cn("welfareSelectList")}
                      role="listbox"
                      aria-label="거주 구군 선택"
                    >
                      {DALSEONG_SIGUNGU_OPTIONS.map((option) => (
                        <li key={option.value || "placeholder"} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={residenceSigungu === option.value}
                            className={cn("welfareSelectOption", {
                              welfareSelectOptionActive: residenceSigungu === option.value,
                            })}
                            onClick={() => {
                              setResidenceSigungu(option.value);
                              setSigunguMenuOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={cn("formGroup")}>
                <label className={cn("formLabel")} htmlFor="welfare-age">
                  나이
                  <span className={cn("requiredMark")} aria-hidden>
                    *
                  </span>
                </label>
                <input
                  id="welfare-age"
                  className={cn("welfareInput")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  placeholder="만 나이를 입력하세요"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  aria-label="나이"
                />
              </div>

              <div className={cn("formGroup")}>
                <span className={cn("formLabel")}>
                  필요한 도움 유형
                  <span className={cn("requiredMark")} aria-hidden>
                    *
                  </span>
                </span>
                <div className={cn("chipGroup")} role="group" aria-label="도움 유형">
                  {WELFARE_INTRS_THEMA_OPTIONS.map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      className={cn("chip", { chipActive: themaCodes.includes(t.code) })}
                      onClick={() => toggleThema(t.code)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn("formGroup")}>
                <span className={cn("formLabel")}>해당 조건</span>
                <div className={cn("chipGroup")} role="group" aria-label="지원대상 조건">
                  <button
                    type="button"
                    className={cn("chip", { chipActive: noneTarget })}
                    onClick={toggleNoneTarget}
                  >
                    선택안함
                  </button>
                  {WELFARE_TRGTER_OPTIONS.map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      className={cn("chip", {
                        chipActive: !noneTarget && targetCodes.includes(t.code),
                        chipMuted: noneTarget,
                      })}
                      onClick={() => toggleTarget(t.code)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {isDirty && (
                <div className={cn("dirtyBanner")} role="status">
                  입력이 변경되었습니다. 변경된 조건으로 다시 추천받으려면 아래 버튼을 눌러
                  주세요.
                </div>
              )}

              <button
                type="button"
                className={cn("submitBtn", { submitBtnDisabled: !formValid })}
                disabled={!formValid}
                onClick={handleSubmit}
              >
                {isLoadingResults ? "추천 불러오는 중" : "추천 받기"}
              </button>
              <button type="button" className={cn("resetLink")} onClick={resetForm}>
                입력 초기화
              </button>
            </div>
          )}

          {activeTab === "results" && (
            <div>
              {results === null ? (
                <div className={cn("emptyBox")}>
                  <p className={cn("emptyMessage")}>
                    먼저 &apos;정보 입력&apos; 탭에서 조건을 입력한 뒤 추천 받기를 눌러 주세요.
                  </p>
                </div>
              ) : isDirty ? (
                <div className={cn("emptyBox")}>
                  <p className={cn("emptyMessage")}>
                    입력이 변경되었습니다. &apos;정보 입력&apos; 탭에서 추천 받기를 다시 누르면
                    결과가 갱신됩니다.
                  </p>
                </div>
              ) : resultError ? (
                <div className={cn("emptyBox")}>
                  <p className={cn("emptyMessage")}>{resultError}</p>
                  <button
                    type="button"
                    className={cn("retryButton")}
                    onClick={() => loadRecommendationPage(0, true)}
                  >
                    다시 불러오기
                  </button>
                </div>
              ) : results.length === 0 && !isLoadingResults ? (
                <div className={cn("emptyBox")}>
                  <p className={cn("emptyMessage")}>조건에 맞는 혜택이 없습니다</p>
                  <p className={cn("fieldHint", "emptySubtext")}>
                    거주 구·군·나이·도움 유형을 조정한 뒤 다시 추천받아 보시거나, 고객센터로
                    문의해 주세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className={cn("resultMeta", "resultCountRow")}>
                    총 {totalCount}건 중 {results.length}건 표시
                  </p>
                  <ul className={cn("resultList")}>
                    {results.map((item) => (
                      <li key={item.servId}>
                        <button
                          type="button"
                          className={cn("resultItem")}
                          onClick={() => openDetail(item.servId)}
                        >
                          <span className={cn("resultBadge")}>추천</span>
                          <h3 className={cn("resultTitle")}>{item.servNm}</h3>
                          <p className={cn("resultDigest")}>{item.servDgst}</p>
                          <div className={cn("resultInfoGrid")}>
                            <span>
                              제공 기관 {item.bizChrDepNm || item.jurOrgNm || item.jurMnofNm || "—"}
                            </span>
                            <span>지원대상 {item.trgterIndvdlNmArray || item.trgterIndvdlArray || "—"}</span>
                            <span>제공방식 {item.srvPvsnSm || item.srvPvsnNm || "—"}</span>
                            <span>지원주기 {item.sprtCycNm || "—"}</span>
                          </div>
                          <p className={cn("resultMeta")}>
                            온라인 신청 {item.onapPsbltYn === "Y" ? "가능" : "확인 필요"}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div ref={sentinelRef} className={cn("scrollSentinel")} aria-hidden />
                  {isLoadingResults && (
                    <div className={cn("loadingBox")} role="status">
                      복지 데이터를 불러오는 중입니다.
                    </div>
                  )}
                  {!hasMore && results.length > 0 && (
                    <p className={cn("endMessage")}>모든 추천 복지 데이터를 확인했습니다.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
