import styles from "@/styles/Terms.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function Privacy() {
  return (
    <div className={cn("termsContainer")}>
      <h1 className={cn("termsTitle")}>개인정보 처리방침</h1>
      
      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>1. 총칙</h2>
        <p className={cn("termsText")}>
          DS Helper(이하 &apos;서비스&apos;)는 개인정보 보호법 등 관계 법령을 준수하며 이용자의 개인정보를 안전하게 처리합니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>2. 수집 항목 및 수집 방법</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>가입/로그인</strong>: 카카오 고유 ID, 이름, 이메일, (설정 시) 연령대, 프로필 이미지(선택)
          </li>
          <li className={cn("termsListItem")}>
            <strong>이용 단계</strong>: 도움요청 내용, 방문지 주소, 성별, 연락처(전화번호), 특이사항, 첨부 이미지(후기·문의), 이용 기록(접속IP/로그·쿠키)
          </li>
          <li className={cn("termsListItem")}>
            <strong>수집 방법</strong>: 카카오 간편가입 연동, 이용자가 입력한 폼/업로드, 서비스 이용 과정에서 자동 생성
          </li>
        </ol>
        <div className={cn("termsNote")}>
          <p className={cn("termsText")}>
            민감정보(건강·종교 등)는 원칙적으로 수집하지 않습니다. 부득이 입력이 필요한 경우 별도 동의를 받고 최소 범위로 처리합니다.
          </p>
        </div>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>3. 처리 목적</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>본인확인 및 계정관리, 서비스 제공과 헬퍼 배정/연락</li>
          <li className={cn("termsListItem")}>문의/분쟁 대응, 고지·알림 전송</li>
          <li className={cn("termsListItem")}>안전 확보, 부정이용/스팸 방지</li>
          <li className={cn("termsListItem")}>서비스 품질 개선, 통계·분석(비식별 처리)</li>
          <li className={cn("termsListItem")}>법령 상 의무 이행</li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>4. 보유 기간 및 파기</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>원칙</strong>: 목적 달성 시 지체 없이 파기(회원 탈퇴 시 포함)
          </li>
          <li className={cn("termsListItem")}>
            <strong>법령에 따른 예외 보관</strong>(해당 시)
            <ul className={cn("termsSubList")}>
              <li className={cn("termsSubListItem")}>접속기록: 3개월(통신비밀보호법)</li>
              <li className={cn("termsSubListItem")}>소비자 불만·분쟁처리 기록: 3년(전자상거래법)</li>
            </ul>
          </li>
          <li className={cn("termsListItem")}>
            <strong>파기 방법</strong>: 전자파일은 복구 불가 방식으로 삭제, 출력물은 분쇄/소각
          </li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>5. 제3자 제공</h2>
        <p className={cn("termsText")}>
          법령 근거가 있거나 이용자가 동의한 범위를 넘어 제3자에게 제공하지 않습니다.
        </p>
        <p className={cn("termsText")}>
          범죄·안전 등 공익상 필요로 관계기관의 적법한 요구가 있는 경우에 한해 제공될 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>6. 처리 위탁</h2>
        <p className={cn("termsText")}>
          서비스 운영을 위해 다음 업무를 위탁할 수 있습니다. 위탁 시 계약을 통해 개인정보 보호 의무를 부과합니다.
        </p>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>클라우드/서버 호스팅, 모니터링</li>
          <li className={cn("termsListItem")}>이메일·푸시·SMS 발송</li>
          <li className={cn("termsListItem")}>로그/보안 분석, 백업</li>
        </ul>
        <div className={cn("termsNote")}>
          <p className={cn("termsText")}>
            수탁사 명칭/업무/보관장소는 홈페이지 공지 또는 본 방침의 부록에서 최신화합니다.
          </p>
        </div>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>7. 국외 이전</h2>
        <p className={cn("termsText")}>
          현재 국외 이전이 필요한 경우가 없다면 &quot;없음&quot;으로 고지합니다.
        </p>
        <p className={cn("termsText")}>
          국외 이전이 발생하는 경우 이전 국가·일시·방법·보관기간·수탁자 정보를 사전 고지하고 필요한 동의를 받습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>8. 이용자 권리 행사</h2>
        <p className={cn("termsText")}>
          이용자는 언제든지 개인정보의 열람, 정정, 삭제, 처리정지, 동의 철회를 요구할 수 있습니다.
        </p>
        <p className={cn("termsText")}>
          앱/웹의 설정 또는 고객 문의를 통해 요청하실 수 있으며, 본인 확인 후 지체 없이 조치합니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>9. 아동의 개인정보</h2>
        <p className={cn("termsText")}>
          만 14세 미만 아동의 개인정보는 법정대리인 동의가 필요한 경우에 한해 처리합니다. 법정대리인은 열람·정정·삭제를 요청할 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>10. 쿠키 및 유사기술</h2>
        <p className={cn("termsText")}>
          서비스 품질 및 로그인 유지 등을 위해 쿠키를 사용할 수 있습니다. 브라우저 설정을 통해 저장을 거부하거나 삭제할 수 있으나, 일부 기능 이용에 제한이 있을 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>11. 안전성 확보 조치</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>전송구간 암호화(HTTPS), 저장 시 암호화(필요 시)</li>
          <li className={cn("termsListItem")}>최소권한 접근통제, 접근기록 보관/점검</li>
          <li className={cn("termsListItem")}>정기적 취약점 점검 및 로그 모니터링</li>
          <li className={cn("termsListItem")}>임직원 보안 교육, 위탁사 관리·감독</li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>12. 개인정보 보호책임자</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>책임자</strong>: 신인호
          </li>
          <li className={cn("termsListItem")}>
            <strong>연락처</strong>: dlsgh3760@gmail.com / 010-5250-9548
          </li>
        </ul>
        <p className={cn("termsText")}>
          문의하시면 지체 없이 답변 및 처리해 드립니다. 또한 개인정보 분쟁이 해결되지 않는 경우 개인정보분쟁조정위원회, 개인정보보호위원회 등에 분쟁조정을 신청할 수 있습니다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>13. 고지 의무</h2>
        <p className={cn("termsText")}>
          본 방침이 변경되는 경우, 시행 7일 전(중요 변경은 14일 전) 공지합니다.
        </p>
      </div>
    </div>
  );
}
