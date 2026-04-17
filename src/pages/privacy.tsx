import styles from "../styles/Terms.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function Privacy() {
  return (
    <div className={cn("termsContainer")}>
      <h1 className={cn("termsTitle")}>개인?�보 처리방침</h1>
      
      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>1. 총칙</h2>
        <p className={cn("termsText")}>
          DS Helper(?�하 &apos;?�비??apos;)??개인?�보 보호�???관�?법령??준?�하�??�용?�의 개인?�보�??�전?�게 처리?�니??
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>2. ?�집 ??�� �??�집 방법</h2>
        <ol className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>가??로그??/strong>: 카카??고유 ID, ?�름, ?�메?? (?�정 ?? ?�령?�, ?�로???��?지(?�택)
          </li>
          <li className={cn("termsListItem")}>
            <strong>?�용 ?�계</strong>: ?��??�청 ?�용, 방문지 주소, ?�별, ?�락�??�화번호), ?�이?�항, 첨�? ?��?지(?�기·문의), ?�용 기록(?�속IP/로그·쿠키)
          </li>
          <li className={cn("termsListItem")}>
            <strong>?�집 방법</strong>: 카카??간편가???�동, ?�용?��? ?�력?????�로?? ?�비???�용 과정?�서 ?�동 ?�성
          </li>
        </ol>
        <div className={cn("termsNote")}>
          <p className={cn("termsText")}>
            민감?�보(건강·종교 ?????�칙?�으�??�집?��? ?�습?�다. 부?�이 ?�력???�요??경우 별도 ?�의�?받고 최소 범위�?처리?�니??
          </p>
        </div>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>3. 처리 목적</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>본인?�인 �?계정관�? ?�비???�공�??�퍼 배정/?�락</li>
          <li className={cn("termsListItem")}>문의/분쟁 ?�?? 고�?·?�림 ?�송</li>
          <li className={cn("termsListItem")}>?�전 ?�보, 부?�이???�팸 방�?</li>
          <li className={cn("termsListItem")}>?�비???�질 개선, ?�계·분석(비식�?처리)</li>
          <li className={cn("termsListItem")}>법령 ???�무 ?�행</li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>4. 보유 기간 �??�기</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>?�칙</strong>: 목적 ?�성 ??지�??�이 ?�기(?�원 ?�퇴 ???�함)
          </li>
          <li className={cn("termsListItem")}>
            <strong>법령???�른 ?�외 보�?</strong>(?�당 ??
            <ul className={cn("termsSubList")}>
              <li className={cn("termsSubListItem")}>?�속기록: 3개월(?�신비�?보호�?</li>
              <li className={cn("termsSubListItem")}>?�비??불만·분쟁처리 기록: 3???�자?�거?�법)</li>
            </ul>
          </li>
          <li className={cn("termsListItem")}>
            <strong>?�기 방법</strong>: ?�자?�일?� 복구 불�? 방식?�로 ??��, 출력물�? 분쇄/?�각
          </li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>5. ?????�공</h2>
        <p className={cn("termsText")}>
          법령 근거가 ?�거???�용?��? ?�의??범위�??�어 ???�에�??�공?��? ?�습?�다.
        </p>
        <p className={cn("termsText")}>
          범죄·?�전 ??공익???�요�?관계기관???�법???�구가 ?�는 경우???�해 ?�공?????�습?�다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>6. 처리 ?�탁</h2>
        <p className={cn("termsText")}>
          ?�비???�영???�해 ?�음 ?�무�??�탁?????�습?�다. ?�탁 ??계약???�해 개인?�보 보호 ?�무�?부과합?�다.
        </p>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>?�라?�드/?�버 ?�스?? 모니?�링</li>
          <li className={cn("termsListItem")}>?�메?�·푸?�·SMS 발송</li>
          <li className={cn("termsListItem")}>로그/보안 분석, 백업</li>
        </ul>
        <div className={cn("termsNote")}>
          <p className={cn("termsText")}>
            ?�탁??명칭/?�무/보�??�소???�페?��? 공�? ?�는 �?방침??부록에??최신?�합?�다.
          </p>
        </div>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>7. �?�� ?�전</h2>
        <p className={cn("termsText")}>
          ?�재 �?�� ?�전???�요??경우가 ?�다�?&quot;?�음&quot;?�로 고�??�니??
        </p>
        <p className={cn("termsText")}>
          �?�� ?�전??발생?�는 경우 ?�전 �??·?�시·방법·보�?기간·?�탁???�보�??�전 고�??�고 ?�요???�의�?받습?�다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>8. ?�용??권리 ?�사</h2>
        <p className={cn("termsText")}>
          ?�용?�는 ?�제?��? 개인?�보???�람, ?�정, ??��, 처리?��?, ?�의 철회�??�구?????�습?�다.
        </p>
        <p className={cn("termsText")}>
          ???�의 ?�정 ?�는 고객 문의�??�해 ?�청?�실 ???�으�? 본인 ?�인 ??지�??�이 조치?�니??
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>9. ?�동??개인?�보</h2>
        <p className={cn("termsText")}>
          �?14??미만 ?�동??개인?�보??법정?�리인 ?�의가 ?�요??경우???�해 처리?�니?? 법정?�리인?� ?�람·?�정·??���??�청?????�습?�다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>10. 쿠키 �??�사기술</h2>
        <p className={cn("termsText")}>
          ?�비???�질 �?로그???��? ?�을 ?�해 쿠키�??�용?????�습?�다. 브라?��? ?�정???�해 ?�?�을 거�??�거????��?????�으?? ?��? 기능 ?�용???�한???�을 ???�습?�다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>11. ?�전???�보 조치</h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>?�송구간 ?�호??HTTPS), ?�?????�호???�요 ??</li>
          <li className={cn("termsListItem")}>최소권한 ?�근?�제, ?�근기록 보�?/?��?</li>
          <li className={cn("termsListItem")}>?�기??취약???��? �?로그 모니?�링</li>
          <li className={cn("termsListItem")}>?�직??보안 교육, ?�탁??관�?�감??/li>
        </ul>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>12. 개인?�보 보호책임??/h2>
        <ul className={cn("termsList")}>
          <li className={cn("termsListItem")}>
            <strong>책임??/strong>: ?�인??
          </li>
          <li className={cn("termsListItem")}>
            <strong>?�락�?/strong>: dlsgh3760@gmail.com / 010-5250-9548
          </li>
        </ul>
        <p className={cn("termsText")}>
          문의?�시�?지�??�이 ?��? �?처리???�립?�다. ?�한 개인?�보 분쟁???�결?��? ?�는 경우 개인?�보분쟁조정?�원?? 개인?�보보호?�원???�에 분쟁조정???�청?????�습?�다.
        </p>
      </div>

      <div className={cn("termsContent")}>
        <h2 className={cn("termsSectionTitle")}>13. 고�? ?�무</h2>
        <p className={cn("termsText")}>
          �?방침??변경되??경우, ?�행 7????중요 변경�? 14???? 공�??�니??
        </p>
      </div>
    </div>
  );
}
