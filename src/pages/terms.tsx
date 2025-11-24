import styles from "@/styles/Terms.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function Terms() {
  return (
    <div className={cn("termsContainer")}>
      <h1 className={cn("termsTitle")}>이용약관</h1>
      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>1. 목적</h2>
        <p className={cn("termsText")}>
          본 약관은 DS Helper(이하 &quot;서비스&quot;)의 이용 조건과 절차, 운영자와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>2. 정의</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>&quot;서비스&quot;: 무상 방문/동행/생활 지원 등 정서·생활적 도움을 제공하는 비영리 서비스</li>
          <li className={cn("termsListItem")}>&quot;이용자&quot;: SNS 로그인으로 서비스에 가입하여 이용하는 개인 또는 기관</li>
          <li className={cn("termsListItem")}>&quot;헬퍼(크루)&quot;: 운영자가 선발하여 활동하는 봉사 성격의 인원(고용관계 아님)</li>
          <li className={cn("termsListItem")}>&quot;운영자&quot;: 서비스 기획·운영 주체</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>3. 약관의 게시와 변경</h2>
        <p className={cn("termsText")}>
          운영자는 약관을 서비스 화면 또는 연동 페이지에 게시합니다. 관련 법령 개정 또는 서비스 정책 변경 시 약관을 변경할 수 있으며, 변경 시 시행 7일 전(이용자에게 불리한 경우 14일 전) 고지합니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>4. 가입 및 계정 관리</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>가입은 카카오 등 SNS 인증으로 이루어집니다.</li>
          <li className={cn("termsListItem")}>이용자는 본인 정보(이름·이메일 등)를 최신 상태로 유지할 책임이 있습니다.</li>
          <li className={cn("termsListItem")}>타인의 계정을 도용하거나 허위 정보를 제공할 수 없습니다.</li>
          <li className={cn("termsListItem")}>계정·접속 정보 유출 방지 책임은 이용자에게 있습니다.</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>5. 서비스 제공 범위 및 특성</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>서비스는 무료로 제공되며, 일상 지원·동행·간단 대행 등 비전문 영역에 한합니다.</li>
          <li className={cn("termsListItem")}>응급상황, 전문적 판단(의료·법률·세무 등), 고위험 작업(전기/가스/고소작업)은 제공하지 않습니다.</li>
          <li className={cn("termsListItem")}>서비스 제공 여부·시기·내용은 운영자의 자원 상황에 따라 조정될 수 있습니다.</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>6. 요청 접수 및 배정·변경</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>이용자는 텍스트로 도움 요청을 접수합니다.</li>
          <li className={cn("termsListItem")}><strong>헬퍼 배정은 운영자가 판단하여 수행</strong>하며, 이용자가 직접 헬퍼를 선택하지 않습니다.</li>
          <li className={cn("termsListItem")}>요청 <strong>수정은 불가</strong>하며, 변경이 필요한 경우 <strong>취소 후 재요청</strong>합니다.</li>
          <li className={cn("termsListItem")}>안전·윤리·법령 위반 소지가 있는 요청은 거절될 수 있습니다.</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>7. 금지 행위</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>불법 행위, 타인의 권리 침해, 폭력·성적·차별 표현, 혐오·괴롭힘</li>
          <li className={cn("termsListItem")}>의료행위·약물투여·법률/세무 자문 등 전문 영역 요구</li>
          <li className={cn("termsListItem")}>고위험·위험물 취급, 구조 변경, 고소작업 등 안전에 중대한 위험이 있는 행위</li>
          <li className={cn("termsListItem")}>계정 대여·양도·거래 및 서비스 목적 외 상업적 이용</li>
          <li className={cn("termsListItem")}>허위 사실 유포, 운영·헬퍼 활동 방해</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>8. 후기 및 게시물</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>이용자가 서비스 내 게시한 콘텐츠(텍스트·이미지 등)의 저작권은 이용자에게 있습니다.</li>
          <li className={cn("termsListItem")}>이용자는 운영자에게 서비스 운영 및 비식별 홍보 목적 범위 내에서 <strong>무상·비독점적 이용권(2차적 저작물 작성 포함)</strong>을 허여합니다.</li>
          <li className={cn("termsListItem")}>이용자는 제3자의 초상권·저작권 등 권리를 침해하지 않도록 보증합니다. 분쟁 발생 시 이용자가 책임을 부담합니다.</li>
          <li className={cn("termsListItem")}>후기 게시 시 <strong>최대 3장 이미지</strong> 업로드 제한 등 서비스 정책을 준수합니다.</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>9. 개인정보 보호</h2>
        <p className={cn("termsText")}>
          운영자는 관련 법령과 <strong>개인정보 처리방침</strong>을 준수하여 개인정보를 처리합니다. 가입·이용 과정에서 필요한 최소 정보를 수집하며, 상세 내용은 개인정보 처리방침에 따릅니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>10. 서비스의 변경·중단</h2>
        <p className={cn("termsText")}>
          천재지변, 시스템 점검, 기술/운영상 필요, 법령·정책 변경 등의 사유로 서비스의 전부 또는 일부를 변경·중단할 수 있으며, 가능한 범위에서 사전 고지합니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>11. 손해배상 및 면책</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>운영자·헬퍼는 <strong>고의 또는 중대한 과실이 없는 한</strong>, 서비스 제공과 관련하여 발생한 손해에 대해 책임을 지지 않습니다.</li>
          <li className={cn("termsListItem")}>제3자 서비스 연계, 이용자 과실, 약관·정책 위반에서 기인한 손해는 책임을 지지 않습니다.</li>
          <li className={cn("termsListItem")}>이용자의 위반행위로 운영자에게 손해가 발생한 경우 이용자는 이를 배상해야 합니다.</li>
        </ol>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>12. 계약 해지(탈퇴)</h2>
        <p className={cn("termsText")}>
          이용자는 언제든지 서비스 탈퇴를 요청할 수 있으며, 관련 법령 및 내부 정책에 따라 일정 기간 데이터가 보관될 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>13. 통지</h2>
        <p className={cn("termsText")}>
          운영자는 서비스 내 공지, 전자우편 등 합리적 수단으로 이용자에게 통지할 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>14. 준거법 및 관할</h2>
        <p className={cn("termsText")}>
          본 약관은 대한민국 법령을 준거로 하며, 분쟁은 <strong>운영자 소재지 관할 법원</strong>의 전속 관할로 합니다.
        </p>
      </div>
    </div>
  );
}