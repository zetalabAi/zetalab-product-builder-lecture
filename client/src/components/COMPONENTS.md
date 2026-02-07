# Client Components 코드 문서화

**디렉토리**: `client/src/components/`  
**목적**: React 컴포넌트 구현 및 사용법  
**상태**: Production (Manus 기반)  
**마이그레이션 대상**: Firebase + 다중 LLM UI

---

## 컴포넌트 개요

### 레이아웃 컴포넌트

#### MainLayout.tsx

**목적**: 전체 앱의 메인 레이아웃 (Sidebar + Content)

**현재 구현 (Manus 기반):**
```typescript
export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex h-screen">
      {/* 데스크톱: Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* 모바일: MobileDrawer */}
      {isMobile && <MobileDrawer />}
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        {user ? (
          children
        ) : (
          <LoginModal />
        )}
      </div>
    </div>
  );
}
```

**마이그레이션 명분:**
- ✅ **UI 독립적**: Manus 의존성 없음
- ✅ **Firebase로 변경**: `useAuth()` 훅만 변경
- ✅ **향후 개선**: 다크 모드 토글, 테마 커스터마이징

**Firebase 마이그레이션 코드:**
```typescript
// 변경 전: Manus 인증
const { user, isLoading } = useAuth(); // Manus OAuth 기반

// 변경 후: Firebase 인증
import { useAuth } from '@/hooks/useFirebaseAuth';
const { user, isLoading } = useAuth(); // Firebase Auth 기반

// hooks/useFirebaseAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}
```

---

#### Sidebar.tsx

**목적**: 데스크톱 좌측 네비게이션 바

**현재 구현 (Manus 기반):**
```typescript
export function Sidebar() {
  const { user } = useAuth();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const navigate = useRouter();

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col">
      {/* 로고 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">ZetaLab</h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-2">
        <NavItem icon={<Plus />} label="새 채팅" onClick={() => navigate('/')} />
        <NavItem icon={<History />} label="히스토리" onClick={() => navigate('/history')} />
        <NavItem icon={<Folder />} label="프로젝트" onClick={() => navigate('/projects')} />
      </nav>

      {/* 프로필 */}
      <div className="border-t pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded hover:bg-secondary">
              <Avatar>
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left text-sm">{user?.displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
              ⚙️ 설정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              🚪 로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 설정 모달 */}
      <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
    </div>
  );
}
```

**마이그레이션 명분:**
- ✅ **UI 독립적**: 레이아웃만 담당
- ✅ **Firebase로 변경**: `useAuth()` 훅만 변경
- ✅ **향후 개선**: 팀 협업 (공유 프로젝트), 알림 배지

**Firebase 마이그레이션 코드:**
```typescript
// 변경 사항 없음 (useAuth 훅만 변경)
// 하지만 프로필 정보 확장 가능:

export function Sidebar() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      // Firestore에서 추가 프로필 정보 조회
      const unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        (doc) => setUserProfile(doc.data())
      );
      return () => unsubscribe();
    }
  }, [user?.uid]);

  return (
    // ... 기존 코드
    // 크레딧 표시 추가
    <div className="text-sm text-muted-foreground">
      💳 크레딧: {userProfile?.credits || 0}
    </div>
  );
}
```

---

#### MobileDrawer.tsx

**목적**: 모바일 햄버거 메뉴 드로어

**현재 구현 (Manus 기반):**
```typescript
export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // 브라우저 히스토리 관리
    const handlePopState = () => {
      if (settingsModalOpen) {
        setSettingsModalOpen(false);
      } else if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, settingsModalOpen]);

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <button onClick={() => {
        setIsOpen(true);
        history.pushState({ drawer: 'open' }, '');
      }}>
        <Menu />
      </button>

      {/* 드로어 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left">
          {/* 네비게이션 */}
          <nav className="space-y-4 mt-8">
            <SheetClose asChild>
              <Link href="/">새 채팅</Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/history">히스토리</Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/projects">프로젝트</Link>
            </SheetClose>
          </nav>

          {/* 프로필 */}
          <div className="border-t mt-8 pt-4">
            <button onClick={() => {
              setSettingsModalOpen(true);
              history.pushState({ settings: 'open', drawer: 'open' }, '');
            }}>
              ⚙️ 설정
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 설정 모달 */}
      <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
    </>
  );
}
```

**마이그레이션 명분:**
- ✅ **UI 독립적**: 레이아웃만 담당
- ✅ **Firebase로 변경**: `useAuth()` 훅만 변경
- ✅ **현재 상태**: 브라우저 히스토리 관리 완료 ✓

---

### 기능 컴포넌트

#### SettingsModal.tsx

**목적**: ChatGPT 스타일 설정 모달 (전체 화면)

**현재 구현 (Manus 기반):**
```typescript
export function SettingsModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-screen">
        <div className="flex h-full">
          {/* 좌측 탭 */}
          <div className="w-48 border-r p-4 space-y-2">
            <TabButton 
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            >
              일반
            </TabButton>
            <TabButton 
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
            >
              계정
            </TabButton>
            <TabButton 
              active={activeTab === 'privacy'}
              onClick={() => setActiveTab('privacy')}
            >
              개인정보보호
            </TabButton>
            <TabButton 
              active={activeTab === 'billing'}
              onClick={() => setActiveTab('billing')}
            >
              결제
            </TabButton>
          </div>

          {/* 우측 콘텐츠 */}
          <div className="flex-1 p-8 overflow-auto">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'billing' && <BillingSettings />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**마이그레이션 명분:**
- ✅ **UI 독립적**: 모달 레이아웃만 담당
- ✅ **Firebase로 변경**: 각 탭의 데이터 소스 변경
- ✅ **향후 개선**: 결제 탭 (Stripe 통합)

**Firebase 마이그레이션 코드:**

```typescript
// BillingSettings.tsx (결제 탭)
export function BillingSettings() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [plans] = useState([
    {
      name: 'Starter',
      price: 9900,
      credits: 30,
      description: '월 30 크레딧'
    },
    {
      name: 'Pro',
      price: 24900,
      credits: 100,
      description: '월 100 크레딧'
    },
    {
      name: 'Business',
      price: 59900,
      credits: 300,
      description: '월 300 크레딧'
    }
  ]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        (doc) => setUserProfile(doc.data())
      );
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleSubscribe = async (plan) => {
    // Stripe 결제 처리
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        planId: plan.name,
        credits: plan.credits
      })
    });

    const { sessionId } = await response.json();
    window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">현재 크레딧</h3>
        <p className="text-3xl font-bold text-primary">
          {userProfile?.credits || 0}
        </p>
        <p className="text-sm text-muted-foreground">
          월 {userProfile?.monthlyCredits || 0} 크레딧 포함
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">요금제</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className="border rounded-lg p-4">
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-2xl font-bold my-2">₩{plan.price.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <button 
                onClick={() => handleSubscribe(plan)}
                className="w-full bg-primary text-primary-foreground rounded py-2"
              >
                구독하기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 결제 이력 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">결제 이력</h3>
        <TransactionHistory userId={user.uid} />
      </div>
    </div>
  );
}
```

---

#### LLMSelector.tsx (새 컴포넌트)

**목적**: 프롬프트 생성 시 LLM 선택 (Firebase 마이그레이션 후)

**Firebase 마이그레이션 코드:**
```typescript
export function LLMSelector({ 
  onSelect 
}: { 
  onSelect: (llm: 'gpt5.2' | 'claude' | 'gemini') => void;
}) {
  const [selectedLLM, setSelectedLLM] = useState('gpt5.2');
  const [userCredits, setUserCredits] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        (doc) => setUserCredits(doc.data()?.credits || 0)
      );
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const llmOptions = [
    {
      id: 'gpt5.2',
      name: 'GPT-5.2',
      provider: 'OpenAI',
      costPerPrompt: 20,
      description: '가장 강력한 모델',
      speed: '느림',
      quality: '최고'
    },
    {
      id: 'claude',
      name: 'Claude',
      provider: 'Anthropic',
      costPerPrompt: 11,
      description: '긴 문맥 처리 최적화',
      speed: '중간',
      quality: '높음'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      provider: 'Google',
      costPerPrompt: 3,
      description: '빠르고 저렴함',
      speed: '빠름',
      quality: '중간'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        💳 보유 크레딧: {userCredits}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {llmOptions.map((llm) => (
          <button
            key={llm.id}
            onClick={() => {
              setSelectedLLM(llm.id);
              onSelect(llm.id);
            }}
            className={`p-4 border rounded-lg text-left transition ${
              selectedLLM === llm.id 
                ? 'border-primary bg-primary/10' 
                : 'border-border'
            }`}
          >
            <h4 className="font-semibold">{llm.name}</h4>
            <p className="text-xs text-muted-foreground">{llm.provider}</p>
            <p className="text-sm mt-2">{llm.description}</p>
            
            <div className="mt-3 space-y-1 text-xs">
              <div>⚡ 속도: {llm.speed}</div>
              <div>✨ 품질: {llm.quality}</div>
              <div className={userCredits < llm.costPerPrompt ? 'text-red-500' : ''}>
                💰 {llm.costPerPrompt} 크레딧
              </div>
            </div>

            {userCredits < llm.costPerPrompt && (
              <div className="mt-2 text-xs text-red-500 font-semibold">
                크레딧 부족
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 마이그레이션 체크리스트

### 인증 관련
- [ ] `useAuth()` 훅을 Firebase 기반으로 변경
- [ ] Manus 프로필 → Firebase 프로필
- [ ] 세션 관리 → Firebase 토큰

### 데이터 조회
- [ ] tRPC → Firestore 직접 조회 (또는 Cloud Functions)
- [ ] 사용자 데이터 → Firestore 문서
- [ ] 히스토리 → Firestore 컬렉션

### 결제 기능
- [ ] 결제 탭 추가 (SettingsModal)
- [ ] Stripe 통합
- [ ] 크레딧 시스템 UI

### LLM 선택
- [ ] LLMSelector 컴포넌트 추가
- [ ] 프롬프트 생성 시 LLM 선택 UI
- [ ] 크레딧 비용 표시

---

## 참고 자료

- [React 공식 문서](https://react.dev)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase React SDK](https://firebase.google.com/docs/web/setup)

---

**마지막 업데이트**: 2026년 2월 3일  
**상태**: 마이그레이션 대기 중  
**담당자**: ZetaLab 개발팀
