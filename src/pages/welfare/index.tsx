import { useCallback, useMemo, useState } from "react";
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import styles from "@/styles/Welfare.module.scss";

const cn = classNames.bind(styles);

/** 공공 API 원문 값을 가정한 목업 (실연동 시 그대로 치환) */
const MOCK_INTRS_THEMA = [
  { code: "THEMA01", label: "일자리" },
  { code: "THEMA02", label: "주거" },
  { code: "THEMA03", label: "교육" },
  { code: "THEMA04", label: "의료·건강" },
  { code: "THEMA05", label: "생활지원" },
] as const;

const MOCK_TRGTER = [
  { code: "TRG01", label: "저소득층" },
  { code: "TRG02", label: "장애인" },
  { code: "TRG03", label: "한부모가족" },
  { code: "TRG04", label: "청년" },
] as const;

/** 대구 달성군 주민 대상: 시·도 없이 구·군(읍·면) 단일 선택 */
const DALSEONG_SIGUNGU_OPTIONS = [
  { value: "", label: "구·군을 선택하세요" },
  { value: "논공읍", label: "논공읍" },
  { value: "다사읍", label: "다사읍" },
  { value: "유가읍", label: "유가읍" },
  { value: "옥포면", label: "옥포면" },
  { value: "현풍읍", label: "현풍읍" },
  { value: "화원읍", label: "화원읍" },
  { value: "가창면", label: "가창면" },
  { value: "하빈면", label: "하빈면" },
  { value: "구지면", label: "구지면" },
] as const;

type WelfareListItem = {
  servId: string;
  servNm: string;
  servDgst: string;
  trgterIndvdlArray: string;
  srvPvsnNm: string;
  rprsCtadr: string;
};

type WelfareDetail = WelfareListItem & {
  tgtrDtlCn: string;
  alwServCn: string;
  slctCritCn: string;
  applmetList: string;
  inqplCtadrList: string;
  inqplHmpgReldList: string;
};

const MOCK_DETAIL_BY_ID: Record<string, WelfareDetail> = {
  "mock-1": {
    servId: "mock-1",
    servNm: "달성군 맞춤형 생활안정 지원",
    servDgst: "위기 가구에 한시적 생계·주거 비용을 지원합니다.",
    trgterIndvdlArray: "저소득층, 한부모가족",
    srvPvsnNm: "현금 지급",
    rprsCtadr: "달성군 복지정책과 053-000-0000",
    tgtrDtlCn: "기초생활수급자 또는 차상위 본인 부담 경감 대상 등 상세 기준은 별도 안내.",
    alwServCn: "가구당 월 30만 원 한도 내 필요 경비를 지원합니다. (예시)",
    slctCritCn: "소득·재산 조사 및 면담 결과를 반영합니다.",
    applmetList: "읍·면·동 행정복지센터 방문 신청 또는 복지로 온라인 신청.",
    inqplCtadrList: "복지정책과 053-000-0000, 복지상담 129",
    inqplHmpgReldList: "https://www.bokjiro.go.kr",
  },
  "mock-2": {
    servId: "mock-2",
    servNm: "청년 취업 역량 강화 교육비 지원",
    servDgst: "구직 활동 중인 청년 대상 교육·자격 취득 비용을 지원합니다.",
    trgterIndvdlArray: "청년",
    srvPvsnNm: "교육비 환급",
    rprsCtadr: "고용센터 1577-7114",
    tgtrDtlCn: "만 18~34세 미취업 청년 (예시)",
    alwServCn: "연 1회 최대 50만 원 한도 (예시)",
    slctCritCn: "선착순 또는 심사 순으로 선정될 수 있습니다.",
    applmetList: "온라인 신청 후 서류 제출.",
    inqplCtadrList: "1577-7114",
    inqplHmpgReldList: "",
  },
  "mock-3": {
    servId: "mock-3",
    servNm: "의료비 본인부담 경감 대상자 건강검진",
    servDgst: "건강검진 비용 일부를 지원하여 조기 발견을 돕습니다.",
    trgterIndvdlArray: "차상위계층, 장애인",
    srvPvsnNm: "바우처",
    rprsCtadr: "국민건강보험 1577-1000",
    tgtrDtlCn: "지역별 세부 기준에 따릅니다.",
    alwServCn: "검진 항목에 따라 상이합니다.",
    slctCritCn: "건강보험 자격 확인 결과에 따릅니다.",
    applmetList: "지정 의료기관 방문 또는 앱 신청.",
    inqplCtadrList: "1577-1000",
    inqplHmpgReldList: "https://www.nhis.or.kr",
  },
};

function buildSnapshot(input: {
  residenceSigungu: string;
  age: string;
  themaCodes: string[];
  noneTarget: boolean;
  targetCodes: string[];
}): string {
  return JSON.stringify({
    ...input,
    themaCodes: [...input.themaCodes].sort(),
    targetCodes: [...input.targetCodes].sort(),
  });
}

function mockRecommend(input: { forceEmpty: boolean }): WelfareListItem[] {
  if (input.forceEmpty) return [];
  const base = Object.values(MOCK_DETAIL_BY_ID).map(
    (d): WelfareListItem => ({
      servId: d.servId,
      servNm: d.servNm,
      servDgst: d.servDgst,
      trgterIndvdlArray: d.trgterIndvdlArray,
      srvPvsnNm: d.srvPvsnNm,
      rprsCtadr: d.rprsCtadr,
    })
  );
  return [base[0], base[1]];
}

type WelfareTab = "input" | "results";

export default function WelfarePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<WelfareTab>("input");
  const [residenceSigungu, setResidenceSigungu] = useState("");
  const [age, setAge] = useState("");
  const [themaCodes, setThemaCodes] = useState<string[]>([]);
  const [noneTarget, setNoneTarget] = useState(true);
  const [targetCodes, setTargetCodes] = useState<string[]>([]);

  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [results, setResults] = useState<WelfareListItem[] | null>(null);
  const [detail, setDetail] = useState<WelfareDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const forceEmptyDemo = router.query.demo === "empty";

  const currentSnapshot = useMemo(
    () =>
      buildSnapshot({
        residenceSigungu,
        age,
        themaCodes,
        noneTarget,
        targetCodes,
      }),
    [residenceSigungu, age, themaCodes, noneTarget, targetCodes]
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

  const formValid =
    Boolean(residenceSigungu) &&
    age.trim() !== "" &&
    !Number.isNaN(Number(age)) &&
    themaCodes.length > 0;

  const handleSubmit = useCallback(() => {
    if (!formValid) return;
    const snap = buildSnapshot({
      residenceSigungu,
      age,
      themaCodes,
      noneTarget,
      targetCodes,
    });
    setLastSnapshot(snap);
    setResults(mockRecommend({ forceEmpty: forceEmptyDemo }));
    setActiveTab("results");
  }, [
    formValid,
    residenceSigungu,
    age,
    themaCodes,
    noneTarget,
    targetCodes,
    forceEmptyDemo,
  ]);

  const resetForm = () => {
    setResidenceSigungu("");
    setAge("");
    setThemaCodes([]);
    setNoneTarget(true);
    setTargetCodes([]);
    setResults(null);
    setLastSnapshot(null);
    setActiveTab("input");
  };

  const openDetail = (id: string) => {
    const row = MOCK_DETAIL_BY_ID[id];
    if (!row) return;
    setDetail(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setDetail(null), 280);
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
              <p className={cn("fieldHint")}>
                생애주기는 입력하신 나이를 시스템에서 자동 변환해 추천에만 사용합니다.
                (화면에 별도로 표시하지 않습니다.)
              </p>

              <div className={cn("formGroup")}>
                <label className={cn("formLabel")} htmlFor="welfare-residence">
                  거주 구·군 (읍·면)
                  <span className={cn("requiredMark")} aria-hidden>
                    *
                  </span>
                </label>
                <p className={cn("fieldHint")}>
                  대구 달성군 거주 기준입니다. 행정구역에 맞게 하나만 선택해 주세요.
                </p>
                <select
                  id="welfare-residence"
                  className={cn("welfareSelect")}
                  value={residenceSigungu}
                  onChange={(e) => setResidenceSigungu(e.target.value)}
                  aria-label="거주 구군 읍면 선택"
                >
                  {DALSEONG_SIGUNGU_OPTIONS.map((o) => (
                    <option key={o.value || "placeholder"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
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
                <p className={cn("fieldHint")}>
                  공공데이터 API의 <code>intrsThemaArray</code> 값과 동일한 코드로 연동한다고
                  가정한 목록입니다. 복수 선택 가능합니다.
                </p>
                <div className={cn("chipGroup")} role="group" aria-label="도움 유형">
                  {MOCK_INTRS_THEMA.map((t) => (
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
                <p className={cn("fieldHint")}>
                  <code>trgterIndvdlArray</code> 매칭용. &apos;선택안함&apos;을 누르면 다른
                  조건이 해제됩니다. 선택 사항입니다.
                </p>
                <div className={cn("chipGroup")} role="group" aria-label="지원대상 조건">
                  <button
                    type="button"
                    className={cn("chip", { chipActive: noneTarget })}
                    onClick={toggleNoneTarget}
                  >
                    선택안함
                  </button>
                  {MOCK_TRGTER.map((t) => (
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
                추천 받기
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
              ) : results.length === 0 ? (
                <div className={cn("emptyBox")}>
                  <p className={cn("emptyMessage")}>조건에 맞는 혜택이 없습니다</p>
                  <p className={cn("fieldHint", "emptySubtext")}>
                    거주 구·군·나이·도움 유형을 조정한 뒤 다시 추천받아 보시거나, 고객센터로
                    문의해 주세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className={cn("resultMeta", "resultCountRow")}>총 {results.length}건</p>
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
                          <p className={cn("resultMeta")}>
                            지원대상 {item.trgterIndvdlArray || "—"} · 제공방식{" "}
                            {item.srvPvsnNm || "—"}
                          </p>
                          <p className={cn("resultMeta")}>문의 {item.rprsCtadr || "—"}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn("modalOverlay", { modalOverlayVisible: modalOpen })}
        onClick={closeModal}
        role="presentation"
      >
        <div
          className={cn("modalPanel")}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welfare-detail-title"
        >
          {detail && (
            <>
              <div className={cn("modalHeader")}>
                <h2 id="welfare-detail-title" className={cn("modalTitle")}>
                  {detail.servNm}
                </h2>
                <button
                  type="button"
                  className={cn("modalClose")}
                  onClick={closeModal}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
              <div className={cn("modalBody")}>
                <div>
                  <h3 className={cn("detailBlockTitle")}>지원대상</h3>
                  <p className={cn("detailBlockBody")}>{detail.tgtrDtlCn || "—"}</p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>지원 내용</h3>
                  <p className={cn("detailBlockBody")}>{detail.alwServCn || "—"}</p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>선정기준</h3>
                  <p className={cn("detailBlockBody")}>{detail.slctCritCn || "—"}</p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>제공방식</h3>
                  <p className={cn("detailBlockBody")}>{detail.srvPvsnNm || "—"}</p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>신청 방법</h3>
                  <p className={cn("detailBlockBody")}>{detail.applmetList || "—"}</p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>문의처</h3>
                  <p className={cn("detailBlockBody")}>
                    {[detail.inqplCtadrList, detail.rprsCtadr].filter(Boolean).join(" / ") ||
                      "—"}
                  </p>
                </div>
                <div>
                  <h3 className={cn("detailBlockTitle")}>신청기한</h3>
                  <p className={cn("detailBlockBody")}>
                    {/** 목업: API 필드 연동 시 `applPd` 등으로 교체 */ "—"}
                  </p>
                </div>
              </div>
              <div className={cn("modalFooter")}>
                {detail.inqplHmpgReldList ? (
                  <a
                    href={detail.inqplHmpgReldList}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("externalLink")}
                  >
                    원문·외부 상세 페이지로 이동
                  </a>
                ) : (
                  <p className={cn("fieldHint")}>등록된 원문 링크가 없습니다.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
