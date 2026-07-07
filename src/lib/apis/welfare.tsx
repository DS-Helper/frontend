import { instance } from "./axios";
import type {
  WelfareDetail,
  WelfareListItem,
  WelfareOption,
  WelfareProfile,
  WelfareRecommendPayload,
  WelfareRecommendationPage,
  WelfareRecommendationParams,
} from "@/types/welfare";

export const WELFARE_INTRS_THEMA_OPTIONS: WelfareOption[] = [
  { code: "THEMA01", label: "일자리" },
  { code: "THEMA02", label: "주거" },
  { code: "THEMA03", label: "교육" },
  { code: "THEMA04", label: "의료·건강" },
  { code: "THEMA05", label: "생활지원" },
];

export const WELFARE_TRGTER_OPTIONS: WelfareOption[] = [
  { code: "TRG01", label: "저소득층" },
  { code: "TRG02", label: "장애인" },
  { code: "TRG03", label: "한부모가족" },
  { code: "TRG04", label: "청년" },
];

export const DALSEONG_SIDO_OPTIONS = [
  { value: "", label: "시도를 선택하세요" },
  { value: "대구광역시", label: "대구광역시" },
] as const;

export const DALSEONG_SIGUNGU_OPTIONS = [
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

const MOCK_DETAIL_SEEDS: WelfareDetail[] = [
  {
    servId: "mock-1",
    servNm: "달성군 맞춤형 생활안정 지원",
    servDgst: "위기 가구에 한시적 생계·주거 비용을 지원합니다.",
    trgterIndvdlArray: "저소득층, 한부모가족",
    srvPvsnNm: "현금 지급",
    rprsCtadr: "달성군 복지정책과 053-000-0000",
    jurMnofNm: "대구광역시 달성군",
    jurOrgNm: "복지정책과",
    bizChrDepNm: "복지정책과",
    intrsThemaArray: "생활지원, 주거",
    lifeArray: "중장년, 노년",
    trgterIndvdlNmArray: "저소득층, 한부모가족",
    sprtCycNm: "월별",
    srvPvsnSm: "현금",
    onapPsbltYn: "Y",
    wlfareInfoOutlCn:
      "갑작스러운 위기 상황으로 생계와 주거 부담이 커진 가구를 대상으로 지역 상담과 심사를 거쳐 필요한 생활안정 자원을 연결합니다.",
    tgtrDtlCn: "기초생활수급자 또는 차상위 본인 부담 경감 대상 등 상세 기준은 별도 안내.",
    alwServCn: "가구당 월 30만 원 한도 내 필요 경비를 지원합니다. (예시)",
    slctCritCn: "소득·재산 조사 및 면담 결과를 반영합니다.",
    applmetList: "읍·면·동 행정복지센터 방문 신청 또는 복지로 온라인 신청.",
    inqplCtadrList: "복지정책과 053-000-0000, 복지상담 129",
    inqplHmpgReldList: "https://www.bokjiro.go.kr",
    applPd: "상시 신청",
    baslawList: "사회보장급여의 이용·제공 및 수급권자 발굴에 관한 법률",
    basfrmList: "신청서, 소득·재산 확인 서류",
    servDtlLink: "https://www.bokjiro.go.kr",
    lastModYmd: "2026-07-01",
    crtrYr: "2026",
  },
  {
    servId: "mock-2",
    servNm: "청년 취업 역량 강화 교육비 지원",
    servDgst: "구직 활동 중인 청년 대상 교육·자격 취득 비용을 지원합니다.",
    trgterIndvdlArray: "청년",
    srvPvsnNm: "교육비 환급",
    rprsCtadr: "고용센터 1577-7114",
    jurMnofNm: "고용노동부",
    jurOrgNm: "지역고용센터",
    bizChrDepNm: "지역고용센터",
    intrsThemaArray: "일자리, 교육",
    lifeArray: "청년",
    trgterIndvdlNmArray: "청년",
    sprtCycNm: "1회성",
    srvPvsnSm: "교육비",
    onapPsbltYn: "Y",
    wlfareInfoOutlCn:
      "취업을 준비하는 청년이 교육과 자격 취득 과정에서 겪는 비용 부담을 줄이고 구직 역량을 높일 수 있도록 지원합니다.",
    tgtrDtlCn: "만 18~34세 미취업 청년 (예시)",
    alwServCn: "연 1회 최대 50만 원 한도 (예시)",
    slctCritCn: "선착순 또는 심사 순으로 선정될 수 있습니다.",
    applmetList: "온라인 신청 후 서류 제출.",
    inqplCtadrList: "1577-7114",
    inqplHmpgReldList: "",
    applPd: "예산 소진 시까지",
    baslawList: "청년고용촉진 특별법",
    basfrmList: "교육 수강 확인서, 환급 신청서",
    servDtlLink: "",
    lastModYmd: "2026-06-20",
    crtrYr: "2026",
  },
  {
    servId: "mock-3",
    servNm: "의료비 본인부담 경감 대상자 건강검진",
    servDgst: "건강검진 비용 일부를 지원하여 조기 발견을 돕습니다.",
    trgterIndvdlArray: "차상위계층, 장애인",
    srvPvsnNm: "바우처",
    rprsCtadr: "국민건강보험 1577-1000",
    jurMnofNm: "국민건강보험공단",
    jurOrgNm: "건강검진 담당부서",
    bizChrDepNm: "건강검진 담당부서",
    intrsThemaArray: "의료·건강",
    lifeArray: "전 생애",
    trgterIndvdlNmArray: "차상위계층, 장애인",
    sprtCycNm: "연간",
    srvPvsnSm: "바우처",
    onapPsbltYn: "N",
    wlfareInfoOutlCn:
      "건강검진 비용 일부를 지원해 의료 접근성을 높이고 질환을 조기에 발견할 수 있도록 돕는 건강 지원 제도입니다.",
    tgtrDtlCn: "지역별 세부 기준에 따릅니다.",
    alwServCn: "검진 항목에 따라 상이합니다.",
    slctCritCn: "건강보험 자격 확인 결과에 따릅니다.",
    applmetList: "지정 의료기관 방문 또는 앱 신청.",
    inqplCtadrList: "1577-1000",
    inqplHmpgReldList: "https://www.nhis.or.kr",
    applPd: "검진 대상 연도 내",
    baslawList: "국민건강보험법",
    basfrmList: "신분증, 건강검진 대상 확인서",
    servDtlLink: "https://www.nhis.or.kr",
    lastModYmd: "2026-06-15",
    crtrYr: "2026",
  },
  {
    servId: "mock-4",
    servNm: "아동 돌봄 공백 긴급 지원",
    servDgst: "보호자의 일시적 부재로 돌봄이 필요한 아동에게 서비스를 연결합니다.",
    trgterIndvdlArray: "아동, 한부모가족",
    srvPvsnNm: "돌봄서비스",
    rprsCtadr: "아이돌봄 상담 1577-2514",
    jurMnofNm: "여성가족부",
    jurOrgNm: "아이돌봄서비스",
    bizChrDepNm: "아이돌봄서비스",
    intrsThemaArray: "생활지원",
    lifeArray: "영유아, 아동",
    trgterIndvdlNmArray: "아동, 한부모가족",
    sprtCycNm: "수시",
    srvPvsnSm: "서비스",
    onapPsbltYn: "Y",
    wlfareInfoOutlCn:
      "보호자의 근로, 질병, 긴급 상황 등으로 돌봄 공백이 발생한 가정에 단기 돌봄 서비스를 연결합니다.",
    tgtrDtlCn: "돌봄 공백이 발생한 만 12세 이하 아동 가구를 우선 검토합니다. (예시)",
    alwServCn: "단기 돌봄 인력 연계 및 이용 비용 일부를 지원합니다.",
    slctCritCn: "가구 상황과 돌봄 필요 시간을 확인해 선정합니다.",
    applmetList: "거주지 행정복지센터 상담 후 신청.",
    inqplCtadrList: "1577-2514",
    inqplHmpgReldList: "https://www.idolbom.go.kr",
    applPd: "돌봄 필요 발생 시",
    baslawList: "아이돌봄 지원법",
    basfrmList: "가족관계증명서, 돌봄 필요 증빙",
    servDtlLink: "https://www.idolbom.go.kr",
    lastModYmd: "2026-06-30",
    crtrYr: "2026",
  },
  {
    servId: "mock-5",
    servNm: "고령자 주거환경 개선 지원",
    servDgst: "안전손잡이, 문턱 제거 등 생활 안전을 위한 주거 개선을 지원합니다.",
    trgterIndvdlArray: "노인, 저소득층",
    srvPvsnNm: "현물 지원",
    rprsCtadr: "주거복지 상담 1600-1004",
    jurMnofNm: "국토교통부",
    jurOrgNm: "주거복지센터",
    bizChrDepNm: "주거복지센터",
    intrsThemaArray: "주거, 생활지원",
    lifeArray: "노년",
    trgterIndvdlNmArray: "노인, 저소득층",
    sprtCycNm: "1회성",
    srvPvsnSm: "현물",
    onapPsbltYn: "N",
    wlfareInfoOutlCn:
      "고령자의 낙상과 생활 안전 위험을 줄이기 위해 주거 환경을 점검하고 필요한 개선 공사를 지원합니다.",
    tgtrDtlCn: "주거 취약 고령자 가구를 대상으로 현장 확인 후 지원합니다. (예시)",
    alwServCn: "가구별 필요 공사 범위에 따라 현물 또는 시공을 지원합니다.",
    slctCritCn: "소득 기준, 주택 상태, 안전 위험도를 종합 검토합니다.",
    applmetList: "읍·면 행정복지센터 방문 신청.",
    inqplCtadrList: "1600-1004",
    inqplHmpgReldList: "",
    applPd: "연중 접수",
    baslawList: "주거기본법",
    basfrmList: "주택 현황 확인서, 개인정보 동의서",
    servDtlLink: "",
    lastModYmd: "2026-06-10",
    crtrYr: "2026",
  },
  {
    servId: "mock-6",
    servNm: "장애인 이동 편의 바우처",
    servDgst: "병원 방문과 생활 이동에 필요한 교통비 일부를 바우처로 지원합니다.",
    trgterIndvdlArray: "장애인",
    srvPvsnNm: "바우처",
    rprsCtadr: "장애인복지 상담 129",
    jurMnofNm: "보건복지부",
    jurOrgNm: "장애인정책과",
    bizChrDepNm: "장애인정책과",
    intrsThemaArray: "의료·건강, 생활지원",
    lifeArray: "전 생애",
    trgterIndvdlNmArray: "장애인",
    sprtCycNm: "월별",
    srvPvsnSm: "바우처",
    onapPsbltYn: "Y",
    wlfareInfoOutlCn:
      "이동에 어려움이 있는 장애인의 병원 방문과 일상 이동 부담을 줄이기 위해 교통 바우처를 제공합니다.",
    tgtrDtlCn: "등록 장애인 중 이동 지원 필요성이 확인되는 주민을 대상으로 합니다. (예시)",
    alwServCn: "월별 이용 한도 내 교통 바우처를 제공합니다.",
    slctCritCn: "장애 정도와 이동 목적, 기존 지원 여부를 확인합니다.",
    applmetList: "복지로 또는 행정복지센터에서 신청.",
    inqplCtadrList: "129",
    inqplHmpgReldList: "https://www.bokjiro.go.kr",
    applPd: "상시 신청",
    baslawList: "장애인복지법",
    basfrmList: "장애인등록증, 바우처 신청서",
    servDtlLink: "https://www.bokjiro.go.kr",
    lastModYmd: "2026-06-25",
    crtrYr: "2026",
  },
];

export const MOCK_WELFARE_DETAILS: WelfareDetail[] = Array.from({ length: 18 }, (_, index) => {
  const seed = MOCK_DETAIL_SEEDS[index % MOCK_DETAIL_SEEDS.length];
  const round = Math.floor(index / MOCK_DETAIL_SEEDS.length) + 1;
  return {
    ...seed,
    servId: `mock-${index + 1}`,
    servNm: round === 1 ? seed.servNm : `${seed.servNm} ${round}`,
  };
});

export const MOCK_WELFARE_DETAIL_BY_ID = new Map(
  MOCK_WELFARE_DETAILS.map((item) => [item.servId, item])
);

function toListItem(detail: WelfareDetail): WelfareListItem {
  return {
    servId: detail.servId,
    servNm: detail.servNm,
    servDgst: detail.servDgst,
    trgterIndvdlArray: detail.trgterIndvdlArray,
    srvPvsnNm: detail.srvPvsnNm,
    rprsCtadr: detail.rprsCtadr,
    jurMnofNm: detail.jurMnofNm,
    jurOrgNm: detail.jurOrgNm,
    bizChrDepNm: detail.bizChrDepNm,
    intrsThemaArray: detail.intrsThemaArray,
    lifeArray: detail.lifeArray,
    trgterIndvdlNmArray: detail.trgterIndvdlNmArray,
    sprtCycNm: detail.sprtCycNm,
    srvPvsnSm: detail.srvPvsnSm,
    onapPsbltYn: detail.onapPsbltYn,
    servDtlLink: detail.servDtlLink,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return "data" in value ? value.data : value;
}

function readString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeProfile(value: unknown): WelfareProfile | null {
  const data = unwrapData(value);
  if (!isRecord(data)) return null;

  const targetCodes = readStringArray(data.targetCodes ?? data.trgterIndvdlArray);

  return {
    residenceSido: readString(data, ["residenceSido", "sido", "ctpvNm"]),
    residenceSigungu: readString(data, ["residenceSigungu", "sigungu", "sggNm"]),
    age: readString(data, ["age"]),
    themaCodes: readStringArray(data.themaCodes ?? data.intrsThemaArray),
    noneTarget:
      typeof data.noneTarget === "boolean" ? data.noneTarget : targetCodes.length === 0,
    targetCodes,
  };
}

function normalizeRecommendationItem(value: unknown): WelfareListItem | null {
  if (!isRecord(value)) return null;

  const servId = readString(value, ["servId", "id"]);
  const servNm = readString(value, ["servNm"]);
  if (!servId || !servNm) return null;

  return {
    servId,
    servNm,
    servDgst: readString(value, ["servDgst"]),
    trgterIndvdlArray: readString(value, ["trgterIndvdlArray"]),
    srvPvsnNm: readString(value, ["srvPvsnNm"]),
    rprsCtadr: readString(value, ["rprsCtadr"]),
    jurMnofNm: readString(value, ["jurMnofNm"]),
    jurOrgNm: readString(value, ["jurOrgNm"]),
    bizChrDepNm: readString(value, ["bizChrDepNm"]),
    intrsThemaArray: readString(value, ["intrsThemaArray"]),
    lifeArray: readString(value, ["lifeArray"]),
    trgterIndvdlNmArray: readString(value, ["trgterIndvdlNmArray"]),
    sprtCycNm: readString(value, ["sprtCycNm"]),
    srvPvsnSm: readString(value, ["srvPvsnSm"]),
    onapPsbltYn: readString(value, ["onapPsbltYn"]),
    servDtlLink: readString(value, ["servDtlLink"]),
  };
}

function normalizeRecommendationPage(
  value: unknown,
  page: number,
  size: number
): WelfareRecommendationPage | null {
  const data = unwrapData(value);
  const sourceItems = Array.isArray(data)
    ? data
    : isRecord(data)
      ? data.items ?? data.content ?? data.recommendations ?? data.welfareList
      : null;

  if (!Array.isArray(sourceItems)) return null;

  const items = sourceItems
    .map(normalizeRecommendationItem)
    .filter((item): item is WelfareListItem => item !== null);

  const totalCount = isRecord(data)
    ? Number(data.totalCount ?? data.totalElements ?? items.length)
    : items.length;
  const hasMore = isRecord(data)
    ? Boolean(data.hasMore ?? (page + 1) * size < totalCount)
    : (page + 1) * size < totalCount;

  return {
    items,
    page: isRecord(data) && typeof data.page === "number" ? data.page : page,
    size,
    totalCount,
    hasMore,
  };
}

function toRecommendPayload(params: WelfareRecommendationParams): WelfareRecommendPayload {
  const targetCodes = params.noneTarget ? [] : params.targetCodes;

  return {
    ...params,
    targetCodes,
    intrsThemaArray: params.themaCodes,
    trgterIndvdlArray: targetCodes,
  };
}

export const getWelfareProfile = async (): Promise<WelfareProfile | null> => {
  try {
    const res = await instance.get<unknown>("/api/v1/welfare/profile");
    return normalizeProfile(res.data);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postWelfareRecommend = async (
  params: WelfareRecommendationParams
): Promise<boolean> => {
  try {
    await instance.post("/api/v1/welfare/recommend", toRecommendPayload(params));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getWelfareRecommendations = async (
  params: WelfareRecommendationParams & { page: number; size: number }
): Promise<WelfareRecommendationPage | null> => {
  try {
    const res = await instance.get<unknown>("/api/v1/welfare/recommendations", {
      params,
    });
    return normalizeRecommendationPage(res.data, params.page, params.size);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getWelfareDetail = async (servId: string): Promise<WelfareDetail | null> => {
  try {
    const res = await instance.get<WelfareDetail>(`/welfare/recommendations/${servId}`);
    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getMockWelfareRecommendations = async (
  params: WelfareRecommendationParams & {
    page: number;
    size: number;
    forceEmpty?: boolean;
  }
): Promise<WelfareRecommendationPage> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const allItems = params.forceEmpty ? [] : MOCK_WELFARE_DETAILS.map(toListItem);
  const start = params.page * params.size;
  const items = allItems.slice(start, start + params.size);

  return {
    items,
    page: params.page,
    size: params.size,
    totalCount: allItems.length,
    hasMore: start + params.size < allItems.length,
  };
};

export const getMockWelfareDetail = async (servId: string): Promise<WelfareDetail | null> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return MOCK_WELFARE_DETAIL_BY_ID.get(servId) ?? null;
};
