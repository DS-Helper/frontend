# 디자인·UI 구현

## 원칙

- **SCSS Modules** + `classNames/bind` (`cn()`)
- **시맨틱 CSS 변수** — `src/styles/globals.css`의 `:root` 토큰
- **모바일 우선** — 휴지통 지도 등은 데스크톱에서 안내 문구 표시
- **인라인 스타일 지양** — 불가피한 경우(지도 SDK 등)만 예외

## 디자인 토큰 (`globals.css`)

### 색상

- Primary: `--color-primitive-primary-500` (#0dba53), brand text/background semantic 토큰
- Gray scale: 100–800
- Danger: red 500/600
- Semantic: `--color-semantic-text-*`, `--color-semantic-bg-*`, `--color-semantic-border-*`

컴포넌트 SCSS에서는 가능하면 **semantic** 변수를 사용합니다.

### 타이포그래피

- Display, title (XL–XS), body (L–S), caption, label, value — `rem` 기준 크기·굵기 변수

### 레이아웃

- 페이지별 `src/styles/*.module.scss` (예: `Home.module.scss`, `TrashBinList.module.scss`)
- 공통 헤더·푸터: `components/common/`

## 컴포넌트 패턴

```tsx
import classNames from "classnames/bind";
import styles from "@/styles/Example.module.scss";

const cn = classNames.bind(styles);

export function Example() {
  return <div className={cn("root", { active: true })} />;
}
```

- 클래스명: **camelCase** (예: `mapTapSheet`, `bottomSheetClosing`)
- 모듈 스코프로 스타일 격리 — 전역 오염 방지

## 모션

- 바텀시트·모달: CSS transition + closing 클래스 (예: `bottomSheetClosing`, `mapTapSheetClosing`)
- **순서 주의**: closing modifier는 base 클래스 **뒤**에 정의해 cascade 덮어쓰기 방지 (`TrashBinList.module.scss`)

## 이미지

- `next/image` 사용
- `next.config.ts`: `remotePatterns`로 외부 이미지 허용
- 정적 에셋: `public/` (SVG 아이콘 다수)

## 지도 UI

- `TrashBinListMapView`: Kakao Map, SSR 비활성 (`dynamic(..., { ssr: false })`)
- 마커·오버레이·바텀시트는 전용 SCSS 모듈

## 접근성 (권장)

- 버튼에 `aria-label` (아이콘만 있는 경우)
- 모달 열림 시 `body` overflow 제어 (`NotificationListModal`)
- 폼: `_app.tsx`에서 autocomplete off 등 일괄 적용

상세 감사는 별도 a11y 이슈로 추적.

## 이 레포에 없는 것

- Figma 링크·디자인 시스템 패키지 — 팀 Notion/피그마가 있으면 이 절에 링크 추가
- Tailwind — 미사용

## 관련 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AGENTS.md](./AGENTS.md) — AI가 스타일 수정할 때 규칙
