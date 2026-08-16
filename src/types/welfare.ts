export type WelfareOption = {
  code: string;
  label: string;
};

export type WelfareRecommendationParams = {
  residenceSido: string;
  residenceSigungu: string;
  age: string;
  themaCodes: string[];
  noneTarget: boolean;
  targetCodes: string[];
};

export type WelfareProfile = WelfareRecommendationParams;

export type WelfareRecommendPayload = WelfareRecommendationParams & {
  intrsThemaArray: string[];
  trgterIndvdlArray: string[];
};

export type WelfareListItem = {
  servId: string;
  servNm: string;
  servDgst: string;
  trgterIndvdlArray: string;
  srvPvsnNm: string;
  rprsCtadr: string;
  jurMnofNm?: string;
  jurOrgNm?: string;
  bizChrDepNm?: string;
  intrsThemaArray?: string;
  lifeArray?: string;
  trgterIndvdlNmArray?: string;
  sprtCycNm?: string;
  srvPvsnSm?: string;
  onapPsbltYn?: "Y" | "N" | string;
  servDtlLink?: string;
};

export type WelfareDetail = WelfareListItem & {
  /** 복지 정보 개요 */
  wlfareInfoOutlCn: string;
  /** 지원대상 상세 */
  tgtrDtlCn: string;
  /** 지원내용 */
  alwServCn: string;
  /** 선정기준 */
  slctCritCn: string;
  /** 신청방법 */
  applmetList: string;
  /** 문의처 목록 */
  inqplCtadrList: string;
  /** 관련 홈페이지/원문 링크 */
  inqplHmpgReldList: string;
  /** 신청기간 */
  applPd: string;
  /** 근거법령 */
  baslawList: string;
  /** 서식/자료 */
  basfrmList: string;
  /** 최종 수정일 */
  lastModYmd: string;
  /** 기준연도 */
  crtrYr: string;
};

export type WelfareRecommendationPage = {
  items: WelfareListItem[];
  page: number;
  size: number;
  totalCount: number;
  hasMore: boolean;
};
