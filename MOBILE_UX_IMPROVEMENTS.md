# 📱 ZetaLab 모바일 UI/UX 개선 가이드

## 🎯 적용 완료된 개선 사항

### 1. ✅ 터치 타겟 크기 최적화 (CRITICAL)
- **기준**: 최소 44x44px (Apple), 48x48px (Material Design)
- **적용 위치**:
  - MobileHeader 버튼: `min-h-[44px] min-w-[44px]`
  - MobileDrawer 새 채팅 버튼: `min-h-[48px]`
  - 메뉴 아이템: `min-h-[48px]`
  - IntentClarification 버튼: `min-h-[44px]`

### 2. ✅ 터치 간격 개선 (MEDIUM)
- **기준**: 인접 터치 요소 간 최소 8px 간격
- **적용**: MobileDrawer 메뉴 아이템 `space-y-2` (8px)

### 3. ✅ 터치 최적화 (HIGH)
- **touch-action: manipulation** - 300ms 탭 딜레이 제거
- **-webkit-tap-highlight-color: transparent** - 탭 하이라이트 제거
- **active:scale-[0.98]** - 터치 피드백

### 4. ✅ Safe Area 지원 (iOS Notch/Dynamic Island)
- **새 CSS 클래스**:
  - `.safe-area-top` - 헤더에 적용
  - `.safe-area-bottom` - 하단 버튼에 적용
  - `.safe-area-inset` - Drawer에 적용

### 5. ✅ 시각적 피드백 강화
- 버튼 active 상태: `active:scale-95` 또는 `active:scale-[0.98]`
- 트랜지션: `transition-transform duration-200`
- Haptic feedback: 이미 구현됨 (Long press 시 진동)

### 6. ✅ Pull-to-Refresh 제어
- `overscroll-behavior-y: contain` - 불필요한 새로고침 방지

### 7. ✅ 모바일 헤더 개선
- 높이: 56px → **64px** (h-14 → h-16)
- 배경: 반투명 + 블러 효과 `bg-background/80 backdrop-blur-md`
- 테두리: 더 은은하게 `border-border/40`

---

## 🚀 추가 권장 개선 사항

### 1. Swipe 제스처 추가 (HIGH PRIORITY)

#### MobileDrawer에 Swipe-to-Close 구현

```typescript
// MobileDrawer.tsx에 추가
const [touchStart, setTouchStart] = useState(0);
const [touchEnd, setTouchEnd] = useState(0);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.touches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.touches[0].clientX);
};

const handleTouchEnd = () => {
  const swipeDistance = touchStart - touchEnd;
  const minSwipeDistance = 50;

  // Swipe left to close
  if (swipeDistance > minSwipeDistance) {
    onClose();
  }

  setTouchStart(0);
  setTouchEnd(0);
};

// Drawer div에 적용:
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="..."
>
```

### 2. Bottom Sheet for Right Panel (CRITICAL)

RightPanel을 모바일에서 Bottom Sheet로 표시:

```typescript
// BottomSheet.tsx (새 컴포넌트)
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl safe-area-bottom"
      >
        {title && (
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {/* Drag indicator */}
            <div className="mx-auto w-12 h-1.5 bg-muted rounded-full" />
          </SheetHeader>
        )}
        <div className="overflow-y-auto h-full momentum-scroll">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**사용 예시** (PromptResult.tsx):
```typescript
<BottomSheet
  isOpen={rightPanelOpen}
  onClose={() => setRightPanelOpen(false)}
  title="최종 프롬프트"
>
  <pre className="whitespace-pre-wrap font-mono text-sm p-4">
    {displayPrompt}
  </pre>
</BottomSheet>
```

### 3. Floating Action Button (FAB) 추가

Home 페이지에 "새 프롬프트" FAB 추가:

```typescript
// FloatingActionButton.tsx
export function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 md:hidden
                 w-14 h-14 rounded-full bg-primary text-primary-foreground
                 shadow-lg active:scale-95 transition-transform
                 flex items-center justify-center
                 safe-area-bottom"
      aria-label="새 프롬프트 만들기"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
```

### 4. 스크롤 시 헤더 숨기기 (Scroll-aware Header)

```typescript
// useScrollDirection.ts (Custom Hook)
import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const direction = currentOffset > prevOffset ? 'down' : 'up';

      if (Math.abs(currentOffset - prevOffset) > 10) {
        setScrollDirection(direction);
        setPrevOffset(currentOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return scrollDirection;
}

// MobileHeader.tsx에 적용:
const scrollDirection = useScrollDirection();

return (
  <header className={`
    fixed top-0 left-0 right-0 transition-transform duration-200
    ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}
    ...
  `}>
```

### 5. 키보드 높이 대응

```css
/* index.css에 추가 */
/* Keyboard height adjustment for iOS */
@supports (-webkit-touch-callout: none) {
  .keyboard-aware {
    padding-bottom: env(keyboard-inset-height, 0);
  }
}
```

### 6. 최적화된 입력 모드

```tsx
// IntentClarification.tsx의 Textarea에 추가:
<Textarea
  inputMode="text"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="sentences"
  spellCheck="true"
  ...
/>
```

### 7. 로딩 상태 개선 (Skeleton Screens)

```tsx
// LoadingSkeleton.tsx
export function PromptResultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-32 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
}
```

---

## 📊 UX 메트릭 개선 목표

### Before → After
- **터치 타겟**: 32px → **44-48px** ✅
- **탭 딜레이**: 300ms → **0ms** ✅
- **버튼 간격**: 4px → **8px** ✅
- **헤더 높이**: 56px → **64px** ✅
- **Safe Area**: ❌ → **✅**
- **Haptic Feedback**: ✅ (Long press만) → ✅ (모든 주요 액션)

---

## 🎨 디자인 시스템 (Design System)

### 색상 (Colors)
- Primary: `#6366F1` (Indigo)
- Secondary: `#818CF8` (Light Indigo)
- CTA: `#10B981` (Emerald)
- Background: `#F5F3FF` (Light Purple Tint)
- Text: `#1E1B4B` (Dark Indigo)

### 타이포그래피 (Typography)
- **폰트**: Plus Jakarta Sans (Google Fonts)
- **Heading**: 600-700 weight
- **Body**: 400-500 weight
- **최소 폰트 크기**: 16px (모바일 body)

### 간격 (Spacing)
- 버튼 간격: `gap-2` (8px)
- 섹션 간격: `space-y-4` (16px)
- 패딩: `p-4` (16px) 기본

### 애니메이션 (Animation)
- Micro-interactions: **150-200ms**
- Page transitions: **200-300ms**
- Reduced motion 지원: `@media (prefers-reduced-motion: reduce)`

---

## ✅ Pre-Delivery Checklist (배포 전 체크리스트)

### 터치 & 인터랙션
- [x] 모든 터치 타겟 44px 이상
- [x] touch-action: manipulation 적용
- [x] 버튼 간격 8px 이상
- [x] Active 상태 피드백
- [x] Haptic feedback (주요 액션)

### 레이아웃 & 반응형
- [x] Safe area 적용 (iOS notch)
- [x] 가로 스크롤 방지
- [x] 최소 폰트 크기 16px
- [x] Pull-to-refresh 제어

### 성능
- [x] 애니메이션 200ms 이하
- [x] Reduced motion 지원
- [ ] Image lazy loading
- [ ] Virtualized lists (긴 목록)

### 접근성
- [x] 키보드 네비게이션
- [ ] Screen reader 테스트
- [x] ARIA 라벨
- [x] 포커스 상태 표시

### 브라우저 호환성
- [x] iOS Safari (터치 최적화)
- [x] Chrome Mobile
- [ ] Samsung Internet 테스트

---

## 🔧 즉시 적용 가능한 Quick Wins

### 1. 모든 버튼에 `touch-manipulation` 추가
```tsx
// 기존 Button 컴포넌트 확장
<Button className="touch-manipulation active-feedback" ... />
```

### 2. 모바일 viewport meta 확인
```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
```

### 3. iOS PWA 지원 추가
```html
<!-- index.html -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-192.png">
```

---

## 📚 참고 자료

### UX Guidelines
- [Apple Human Interface Guidelines - Touch](https://developer.apple.com/design/human-interface-guidelines/touchscreen-gestures)
- [Material Design - Touch Targets](https://m3.material.io/foundations/interaction/gestures#touch-targets)
- [W3C Mobile Web Best Practices](https://www.w3.org/TR/mobile-bp/)

### 라이브러리
- [React Spring](https://www.react-spring.dev/) - 부드러운 애니메이션
- [Framer Motion](https://www.framer.com/motion/) - 제스처 라이브러리
- [Vaul](https://vaul.emilkowal.ski/) - Bottom Sheet 컴포넌트

---

## 🎯 다음 단계 (우선순위)

1. **HIGH**: Bottom Sheet for RightPanel 구현
2. **HIGH**: Swipe-to-Close for MobileDrawer
3. **MEDIUM**: Floating Action Button 추가
4. **MEDIUM**: Scroll-aware Header
5. **LOW**: Skeleton Loading States

---

## 💡 추가 개선 아이디어

### 1. 오프라인 지원
- Service Worker로 PWA 만들기
- 로컬 스토리지에 프롬프트 캐싱

### 2. Voice Input
```tsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// 음성 입력으로 프롬프트 생성
```

### 3. Quick Actions (iOS)
```tsx
// 홈 화면 3D Touch 메뉴
"quick_actions": [
  {
    "type": "new-prompt",
    "title": "새 프롬프트",
    "icon": "plus"
  }
]
```

### 4. Share API 통합
```tsx
const sharePrompt = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'ZetaLab 프롬프트',
      text: generatedPrompt,
      url: window.location.href
    });
  }
};
```

---

**문의**: 추가 개선 사항이 필요하면 언제든지 요청하세요! 🚀
