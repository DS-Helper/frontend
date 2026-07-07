import { useRouter } from "next/router";
import classNames from "classnames/bind";
import { MOCK_WELFARE_DETAIL_BY_ID } from "@/lib/apis/welfare";
import styles from "@/styles/Welfare.module.scss";

const cn = classNames.bind(styles);

function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,/]|(?:\n)/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function display(value?: string): string {
  return value?.trim() || "—";
}

export default function WelfareDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const detail = id ? MOCK_WELFARE_DETAIL_BY_ID.get(id) : null;
  const sourceLink = detail?.servDtlLink || detail?.inqplHmpgReldList || "";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    void router.push("/welfare");
  };

  if (!router.isReady) {
    return (
      <main className={cn("detailPage")}>
        <div className={cn("detailInner")}>상세 정보를 불러오는 중입니다.</div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className={cn("detailPage")}>
        <div className={cn("detailInner")}>
          <button type="button" className={cn("detailBackButton")} onClick={handleBack}>
            목록으로
          </button>
          <section className={cn("detailEmpty")}>
            <h1>복지 혜택을 찾을 수 없습니다</h1>
            <p>목록에서 다시 혜택을 선택해 주세요.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={cn("detailPage")}>
      <div className={cn("detailInner")}>
        <button type="button" className={cn("detailBackButton")} onClick={handleBack}>
          목록으로
        </button>

        <section className={cn("detailHero")}>
          <div className={cn("detailBadgeRow")}>
            <span className={cn("detailBadge")}>{display(detail.intrsThemaArray)}</span>
            <span className={cn("detailBadge", "detailBadgeSubtle")}>
              온라인 신청 {detail.onapPsbltYn === "Y" ? "가능" : "확인 필요"}
            </span>
          </div>
          <h1 className={cn("detailTitle")}>{detail.servNm}</h1>
          <p className={cn("detailSummary")}>{detail.wlfareInfoOutlCn || detail.servDgst}</p>
        </section>

        <section className={cn("detailQuickInfo")} aria-label="복지 혜택 요약">
          <div>
            <span>제공 기관</span>
            <strong>{display(detail.bizChrDepNm || detail.jurOrgNm || detail.jurMnofNm)}</strong>
          </div>
          <div>
            <span>제공방식</span>
            <strong>{display(detail.srvPvsnSm || detail.srvPvsnNm)}</strong>
          </div>
          <div>
            <span>지원주기</span>
            <strong>{display(detail.sprtCycNm)}</strong>
          </div>
          <div>
            <span>기준연도</span>
            <strong>{display(detail.crtrYr)}</strong>
          </div>
        </section>

        <section className={cn("detailSection")}>
          <h2>지원대상</h2>
          <p>{display(detail.tgtrDtlCn)}</p>
          <div className={cn("detailChipRow")}>
            {splitList(detail.trgterIndvdlNmArray || detail.trgterIndvdlArray).map((item) => (
              <span key={item}>{item}</span>
            ))}
            {splitList(detail.lifeArray).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className={cn("detailSection")}>
          <h2>선정기준</h2>
          <p>{display(detail.slctCritCn)}</p>
        </section>

        <section className={cn("detailSection")}>
          <h2>지원 내용</h2>
          <p>{display(detail.alwServCn)}</p>
        </section>

        <section className={cn("detailSection")}>
          <h2>신청 방법</h2>
          <p>{display(detail.applmetList)}</p>
        </section>

        <section className={cn("detailSection")}>
          <h2>문의처</h2>
          <p>{display(detail.inqplCtadrList || detail.rprsCtadr)}</p>
        </section>

        <section className={cn("detailSection", "detailSectionMuted")}>
          <h2>추가 정보</h2>
          <dl className={cn("detailDefinitionList")}>
            <div>
              <dt>제공 기관</dt>
              <dd>{display(detail.jurMnofNm)}</dd>
            </div>
            <div>
              <dt>신청 서식</dt>
              <dd>{display(detail.basfrmList)}</dd>
            </div>
            <div>
              <dt>법적 근거</dt>
              <dd>{display(detail.baslawList)}</dd>
            </div>
          </dl>
        </section>

        <div className={cn("detailActionRow")}>
          {sourceLink ? (
            <a href={sourceLink} target="_blank" rel="noopener noreferrer" className={cn("detailPrimaryLink")}>
              원문 링크 열기
            </a>
          ) : (
            <span className={cn("detailNoLink")}>등록된 원문 링크가 없습니다.</span>
          )}
        </div>
      </div>
    </main>
  );
}
