# Feature 10: 프롬프트 체인 - 설계 문서 (Part 2)

## 5. 컴포넌트 설계

### 페이지 컴포넌트

#### 1. Chains.tsx (체인 목록)

```typescript
// client/src/pages/Chains.tsx

export default function Chains() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const chainsQuery = trpc.chains.getChains.useQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const chains = chainsQuery.data || [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⛓️ 프롬프트 체인</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          복잡한 작업을 여러 단계로 나누어 자동화하세요
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Link href="/chains/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 체인 만들기
          </Button>
        </Link>
        <Link href="/chain-templates">
          <Button variant="outline">
            <BookTemplate className="w-4 h-4 mr-2" />
            템플릿 보기
          </Button>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'blog', 'video', 'analysis', 'creative', 'custom'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat as any)}
          >
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      {/* Chain List */}
      {chainsQuery.isLoading && <div>로딩 중...</div>}

      {chains.length === 0 && !chainsQuery.isLoading && (
        <EmptyState
          icon={<Link2 />}
          title="체인이 없습니다"
          description="첫 체인을 만들거나 템플릿을 사용해보세요"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map((chain) => (
          <ChainCard key={chain.id} chain={chain} />
        ))}
      </div>
    </div>
  );
}
```

#### 2. ChainBuilder.tsx (생성/편집)

```typescript
// client/src/pages/ChainBuilder.tsx

interface ChainBuilderProps {
  chainId?: string; // 편집 모드
}

export default function ChainBuilder({ chainId }: ChainBuilderProps) {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('custom');
  const [steps, setSteps] = useState<ChainStep[]>([]);

  // 편집 모드인 경우 기존 체인 로드
  const chainQuery = trpc.chains.getChainById.useQuery(
    { chainId: chainId! },
    { enabled: !!chainId }
  );

  useEffect(() => {
    if (chainQuery.data) {
      setName(chainQuery.data.name);
      setDescription(chainQuery.data.description);
      setCategory(chainQuery.data.category);
      setSteps(chainQuery.data.steps);
    }
  }, [chainQuery.data]);

  const createMutation = trpc.chains.createChain.useMutation({
    onSuccess: (data) => {
      toast.success('체인이 생성되었습니다!');
      navigate(`/chains/${data.id}`);
    },
  });

  const updateMutation = trpc.chains.updateChain.useMutation({
    onSuccess: () => {
      toast.success('체인이 수정되었습니다!');
      navigate(`/chains/${chainId}`);
    },
  });

  const handleSave = () => {
    if (chainId) {
      updateMutation.mutate({
        chainId,
        updates: { name, description, category, steps },
      });
    } else {
      createMutation.mutate({
        name,
        description,
        category,
        steps,
      });
    }
  };

  const handleAddStep = () => {
    const newStep: ChainStep = {
      id: generateStepId(),
      order: steps.length + 1,
      name: `단계 ${steps.length + 1}`,
      promptTemplate: '',
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: steps.length > 0,
      estimatedCost: 0.01,
    };
    setSteps([...steps, newStep]);
  };

  const handleDeleteStep = (stepId: string) => {
    const updated = steps
      .filter((s) => s.id !== stepId)
      .map((s, index) => ({ ...s, order: index + 1 }));
    setSteps(updated);
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = steps.findIndex((s) => s.id === stepId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => (s.order = i + 1));
    setSteps(updated);
  };

  const totalEstimatedCost = steps.reduce((sum, s) => sum + s.estimatedCost, 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">
          {chainId ? '체인 편집' : '새 체인 만들기'}
        </h1>

        {/* Basic Info */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              체인 이름 *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 블로그 작성 체인"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 체인이 무엇을 하는지 설명하세요"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              카테고리
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">블로그</SelectItem>
                <SelectItem value="video">영상</SelectItem>
                <SelectItem value="analysis">분석</SelectItem>
                <SelectItem value="creative">창작</SelectItem>
                <SelectItem value="custom">커스텀</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">단계 설정</h2>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepEditor
                key={step.id}
                step={step}
                stepIndex={index}
                canUsePreviousOutput={index > 0}
                onChange={(updated) => {
                  const newSteps = [...steps];
                  newSteps[index] = updated;
                  setSteps(newSteps);
                }}
                onDelete={() => handleDeleteStep(step.id)}
                onMoveUp={
                  index > 0 ? () => handleMoveStep(step.id, 'up') : undefined
                }
                onMoveDown={
                  index < steps.length - 1
                    ? () => handleMoveStep(step.id, 'down')
                    : undefined
                }
              />
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-4"
            onClick={handleAddStep}
          >
            <Plus className="w-4 h-4 mr-2" />
            단계 추가
          </Button>
        </div>

        <Separator className="my-8" />

        {/* Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                총 단계
              </p>
              <p className="text-2xl font-bold">{steps.length}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                예상 비용
              </p>
              <p className="text-2xl font-bold">
                ${totalEstimatedCost.toFixed(3)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!name || steps.length === 0}
          >
            {chainId ? '저장' : '체인 만들기'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/chains')}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### 3. ChainExecution.tsx (실행 화면)

```typescript
// client/src/pages/ChainExecution.tsx

interface ChainExecutionProps {
  executionId: string;
}

export default function ChainExecution({ executionId }: ChainExecutionProps) {
  const [, navigate] = useLocation();

  // 실시간 업데이트를 위한 Firestore 리스너
  const [execution, setExecution] = useState<ChainExecution | null>(null);

  useEffect(() => {
    if (!executionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'chainExecutions', executionId),
      (snapshot) => {
        if (snapshot.exists()) {
          setExecution({
            id: snapshot.id,
            ...snapshot.data(),
          } as ChainExecution);
        }
      },
      (error) => {
        console.error('[ChainExecution] Firestore error:', error);
        toast.error('실행 정보를 불러올 수 없습니다.');
      }
    );

    return () => unsubscribe();
  }, [executionId]);

  const cancelMutation = trpc.chains.cancelExecution.useMutation({
    onSuccess: () => {
      toast.success('체인 실행이 취소되었습니다.');
    },
  });

  if (!execution) {
    return <div>로딩 중...</div>;
  }

  const isRunning = execution.status === 'running';
  const isCompleted = execution.status === 'completed';
  const isFailed = execution.status === 'failed';
  const isCancelled = execution.status === 'cancelled';

  const completedSteps = execution.stepResults.filter((r) => r.success).length;
  const totalSteps = execution.stepResults.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isRunning && '⏳ 체인 실행 중'}
            {isCompleted && '✅ 체인 완료'}
            {isFailed && '❌ 체인 실패'}
            {isCancelled && '⏸️ 체인 취소됨'}
          </h1>
          {execution.initialInput && (
            <p className="text-zinc-600 dark:text-zinc-400">
              초기 입력: "{execution.initialInput}"
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>
                진행률: {completedSteps} / {totalSteps} 단계
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Results */}
        <div className="space-y-4 mb-8">
          {execution.stepResults.map((result, index) => (
            <StepResultCard
              key={result.stepId}
              result={result}
              isLast={index === execution.stepResults.length - 1}
            />
          ))}

          {/* Current Running Step */}
          {isRunning &&
            execution.currentStepIndex < totalSteps && (
            <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                <div>
                  <p className="font-semibold">
                    {execution.currentStepIndex + 1}단계 실행 중...
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    잠시만 기다려주세요
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Final Result */}
        {isCompleted && execution.stepResults.length > 0 && (
          <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-6 bg-green-50 dark:bg-green-950/20 mb-8">
            <h3 className="text-lg font-semibold mb-4">📄 최종 결과</h3>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <pre className="whitespace-pre-wrap text-sm">
                {execution.stepResults[execution.stepResults.length - 1].output}
              </pre>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    execution.stepResults[execution.stepResults.length - 1]
                      .output
                  );
                  toast.success('복사되었습니다!');
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                복사
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {!isRunning && (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  총 소요 시간
                </p>
                <p className="text-xl font-bold">
                  {(execution.totalDuration / 1000).toFixed(1)}초
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  총 비용
                </p>
                <p className="text-xl font-bold">
                  ${execution.totalCost.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  완료된 단계
                </p>
                <p className="text-xl font-bold">
                  {completedSteps} / {totalSteps}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {isFailed && execution.error && (
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950/20 mb-8">
            <p className="text-red-900 dark:text-red-100 font-semibold mb-2">
              에러 발생
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {execution.error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isRunning && (
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate({ executionId })}
            >
              실행 취소
            </Button>
          )}
          {!isRunning && (
            <>
              <Button onClick={() => navigate(`/chains/${execution.chainId}`)}>
                체인으로 돌아가기
              </Button>
              <Button variant="outline" onClick={() => navigate('/chains')}>
                목록으로
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 하위 컴포넌트

#### 1. ChainCard.tsx

```typescript
// client/src/components/chains/ChainCard.tsx

interface ChainCardProps {
  chain: ChainWithExecutions;
}

export function ChainCard({ chain }: ChainCardProps) {
  const [, navigate] = useLocation();

  const deleteMutation = trpc.chains.deleteChain.useMutation({
    onSuccess: () => {
      toast.success('체인이 삭제되었습니다.');
      // Refetch chains
    },
  });

  const executeMutation = trpc.chains.executeChain.useMutation({
    onSuccess: (data) => {
      toast.success('체인 실행을 시작했습니다!');
      navigate(`/chains/execution/${data.executionId}`);
    },
  });

  const handleExecute = () => {
    // 초기 입력이 필요한 경우 다이얼로그 표시
    if (chain.steps[0] && !chain.steps[0].usePreviousOutput) {
      // Show input dialog
      const input = prompt('초기 입력을 제공하세요:');
      if (input !== null) {
        executeMutation.mutate({
          chainId: chain.id,
          initialInput: input,
        });
      }
    } else {
      executeMutation.mutate({
        chainId: chain.id,
      });
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{chain.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {chain.description}
          </p>
        </div>
        <Badge variant="secondary">{categoryLabels[chain.category]}</Badge>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        <span>{chain.steps.length}단계</span>
        <span>${chain.totalEstimatedCost.toFixed(3)}</span>
        {chain.lastExecution && (
          <span>
            마지막 실행: {formatDistanceToNow(chain.lastExecution.startedAt, { locale: ko })} 전
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleExecute}>
          <Play className="w-4 h-4 mr-2" />
          실행
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/chains/${chain.id}/edit`)}
        >
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm('정말 삭제하시겠습니까?')) {
              deleteMutation.mutate({ chainId: chain.id });
            }
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

#### 2. StepEditor.tsx

```typescript
// client/src/components/chains/StepEditor.tsx

interface StepEditorProps {
  step: ChainStep;
  stepIndex: number;
  canUsePreviousOutput: boolean;
  onChange: (step: ChainStep) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function StepEditor({
  step,
  stepIndex,
  canUsePreviousOutput,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: StepEditorProps) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-zinc-400">
            {stepIndex + 1}
          </span>
          <Input
            value={step.name}
            onChange={(e) => onChange({ ...step, name: e.target.value })}
            placeholder="단계 이름"
            className="font-semibold"
          />
        </div>

        <div className="flex gap-1">
          {onMoveUp && (
            <Button size="icon" variant="ghost" onClick={onMoveUp}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          {onMoveDown && (
            <Button size="icon" variant="ghost" onClick={onMoveDown}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Prompt Template */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          프롬프트 템플릿
        </label>
        <Textarea
          value={step.promptTemplate}
          onChange={(e) =>
            onChange({ ...step, promptTemplate: e.target.value })
          }
          placeholder="프롬프트를 입력하세요..."
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-zinc-500 mt-2">
          💡 변수 사용: <code>{'{{previous_output}}'}</code>,{' '}
          <code>{'{{initial_input}}'}</code>
        </p>
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">모델</label>
          <Select
            value={step.modelId}
            onValueChange={(value) => onChange({ ...step, modelId: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-sonnet-4-5">
                Claude Sonnet 4.5
              </SelectItem>
              <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gemini-2.0-flash">
                Gemini 2.0 Flash
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">예상 비용</label>
          <Input
            type="number"
            step="0.001"
            value={step.estimatedCost}
            onChange={(e) =>
              onChange({
                ...step,
                estimatedCost: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      {/* Use Previous Output */}
      {canUsePreviousOutput && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step.usePreviousOutput}
            onCheckedChange={(checked) =>
              onChange({ ...step, usePreviousOutput: checked as boolean })
            }
          />
          <label className="text-sm">이전 단계 출력 사용</label>
        </div>
      )}
    </div>
  );
}
```

#### 3. StepResultCard.tsx

```typescript
// client/src/components/chains/StepResultCard.tsx

interface StepResultCardProps {
  result: StepResult;
  isLast: boolean;
}

export function StepResultCard({ result, isLast }: StepResultCardProps) {
  const [showDetails, setShowDetails] = useState(isLast);

  return (
    <div
      className={`border rounded-lg p-4 ${
        result.success
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          {result.success ? (
            <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-600 dark:text-red-500" />
          )}
          <div>
            <p className="font-semibold">
              {result.stepOrder}단계: {result.stepName}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {(result.duration / 1000).toFixed(1)}초 · $
              {result.cost.toFixed(3)} · {result.modelUsed}
            </p>
          </div>
        </div>
        {showDetails ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-4 space-y-4">
          {/* Input */}
          <div>
            <p className="text-sm font-medium mb-2">입력:</p>
            <div className="bg-white dark:bg-zinc-900 rounded p-3 border border-zinc-200 dark:border-zinc-800">
              <pre className="text-xs whitespace-pre-wrap">{result.input}</pre>
            </div>
          </div>

          {/* Output */}
          {result.success && (
            <div>
              <p className="text-sm font-medium mb-2">출력:</p>
              <div className="bg-white dark:bg-zinc-900 rounded p-3 border border-zinc-200 dark:border-zinc-800">
                <pre className="text-xs whitespace-pre-wrap">
                  {result.output}
                </pre>
              </div>
            </div>
          )}

          {/* Error */}
          {!result.success && result.error && (
            <div>
              <p className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">
                에러:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {result.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## 6. UI/UX 플로우

### 사용자 여정

#### 1. 체인 생성 플로우

```
사용자 진입
    ↓
[체인 목록] → "새 체인 만들기" 클릭
    ↓
[체인 빌더]
    ├─> 기본 정보 입력 (이름, 설명, 카테고리)
    ├─> 1단계 추가
    │   ├─> 프롬프트 작성
    │   ├─> 모델 선택
    │   └─> 예상 비용 입력
    ├─> 2단계 추가
    │   ├─> "이전 출력 사용" 체크
    │   ├─> {{previous_output}} 활용
    │   └─> ...
    ├─> N단계 추가
    └─> "체인 만들기" 클릭
    ↓
[체인 상세] → 생성 완료!
```

#### 2. 템플릿 사용 플로우

```
사용자 진입
    ↓
[체인 목록] → "템플릿 보기" 클릭
    ↓
[템플릿 목록]
    ├─> 카테고리 필터
    ├─> 템플릿 카드 탐색
    └─> "사용하기" 클릭
    ↓
[체인 빌더] (템플릿으로 미리 채워짐)
    ├─> 이름/설명 수정 (선택)
    ├─> 단계 수정 (선택)
    └─> "체인 만들기" 클릭
    ↓
[체인 상세] → 바로 사용 가능!
```

#### 3. 체인 실행 플로우

```
사용자 진입
    ↓
[체인 목록] → 체인 선택 → "실행" 클릭
    ↓
(초기 입력 필요 시)
[입력 다이얼로그]
    ├─> 초기 입력 제공
    └─> "실행" 클릭
    ↓
[실행 화면]
    ├─> 1단계 실행 중... (로딩 애니메이션)
    ├─> 1단계 완료! ✓
    ├─> 2단계 실행 중...
    ├─> 2단계 완료! ✓
    ├─> ...
    └─> N단계 완료! ✓
    ↓
[최종 결과]
    ├─> 마지막 단계 출력 표시
    ├─> "복사" 버튼
    ├─> 각 단계 결과 펼쳐보기
    └─> "다시 실행" or "체인 편집"
```

### 화면 전환 다이어그램

```
┌───────────┐
│  Chains   │◄────────┐
│  (목록)    │         │
└─────┬─────┘         │
      │               │
      ├─ 새 체인 ─────┤
      │               │
      ├─ 템플릿 ──────┤
      │               │
      └─ 실행 ────────┤
                      │
┌──────────────┐      │
│ ChainBuilder │      │
│ (생성/편집)   ├──────┘
└──────┬───────┘
       │ 저장
       ↓
┌──────────────┐
│ ChainDetail  │
│ (상세)        │
└──────┬───────┘
       │ 실행
       ↓
┌──────────────┐
│ChainExecution│
│ (실행 상태)   │
└──────────────┘
```

## 7. 템플릿 정의

### 템플릿 1: 블로그 작성 체인

```typescript
{
  id: 'template-blog-writing',
  name: '블로그 작성 체인',
  description: '아이디어부터 완성된 블로그 글까지 자동화',
  category: 'blog',
  isOfficial: true,
  estimatedTime: 180,  // 3분
  tags: ['블로그', '콘텐츠', '작성'],
  steps: [
    {
      order: 1,
      name: '아이디어 브레인스토밍',
      promptTemplate: `당신은 10년 경력의 콘텐츠 크리에이터입니다.

주제: {{initial_input}}

이 주제로 블로그 글을 작성하려고 합니다.
독자들의 관심을 끌 수 있는 5가지 구체적인 아이디어를 제안해주세요.

각 아이디어마다:
- 제목 (클릭을 유도하는)
- 핵심 메시지 (2-3문장)
- 예상 독자층

형식: 번호 목록`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.015,
    },
    {
      order: 2,
      name: '최적 아이디어 선택 및 아웃라인',
      promptTemplate: `당신은 콘텐츠 전략가입니다.

다음 아이디어 중 가장 흥미롭고 실용적인 것을 1개 선택하고,
상세한 블로그 글 아웃라인을 작성해주세요:

{{previous_output}}

아웃라인 구성:
1. 도입 (훅 + 문제 제기)
2. 본론 (3-4개 섹션, 각 섹션 설명 포함)
3. 결론 (요약 + 행동 촉구)

각 섹션마다 2-3문장으로 설명하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.020,
    },
    {
      order: 3,
      name: '초안 작성',
      promptTemplate: `당신은 전문 블로거입니다.

다음 아웃라인을 바탕으로 1500-2000자 분량의 블로그 초안을 작성하세요:

{{previous_output}}

작성 가이드:
- 친근하고 쉬운 말투
- 구체적인 예시 포함
- 각 섹션은 명확한 소제목으로 구분
- 도입부는 독자의 관심을 끌도록
- 결론은 명확한 행동 촉구 (CTA)

마크다운 형식으로 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.035,
    },
    {
      order: 4,
      name: '퇴고 및 개선',
      promptTemplate: `당신은 전문 에디터입니다.

다음 블로그 초안을 검토하고 개선하세요:

{{previous_output}}

개선 포인트:
1. 문법 및 맞춤법 수정
2. 문장 길이 조절 (읽기 쉽게)
3. 논리 흐름 개선
4. 불필요한 반복 제거
5. 더 강력한 제목 제안 (3가지)

개선된 최종본을 출력하세요.`,
      modelId: 'gpt-4o',
      usePreviousOutput: true,
      estimatedCost: 0.030,
    },
  ],
}
```

### 템플릿 2: 유튜브 쇼츠 대본

```typescript
{
  id: 'template-youtube-shorts',
  name: '유튜브 쇼츠 대본 체인',
  description: '훅부터 자막까지 완벽한 60초 쇼츠 대본',
  category: 'video',
  isOfficial: true,
  estimatedTime: 120,
  tags: ['유튜브', '쇼츠', '대본'],
  steps: [
    {
      order: 1,
      name: '강력한 훅 아이디어',
      promptTemplate: `당신은 유튜브 크리에이터입니다.

주제: {{initial_input}}

첫 3초를 사로잡을 강력한 훅 5개를 제안하세요.
각 훅은:
- 한 문장으로
- 궁금증 유발
- 감정 자극 (놀라움, 호기심, 공감)

예시:
"이거 몰랐다면 지금까지 돈 버린 겁니다"
"99%가 틀리는 이 질문, 당신은?"`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.010,
    },
    {
      order: 2,
      name: '60초 스크립트 작성',
      promptTemplate: `선택한 훅을 바탕으로 60초 쇼츠 대본을 작성하세요:

{{previous_output}}

구조:
- 훅 (3초): 시선 사로잡기
- 문제 제시 (7초): 왜 중요한지
- 해결책 (40초): 핵심 내용 (3가지 포인트)
- CTA (7초): 좋아요/구독 유도

각 섹션마다 (초) 표시하고,
말하기 쉬운 구어체로 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.020,
    },
    {
      order: 3,
      name: '자막 생성',
      promptTemplate: `다음 대본을 자막 형식으로 변환하세요:

{{previous_output}}

자막 규칙:
- 각 자막은 2-3초 분량
- 한 줄당 최대 15자
- 강조할 단어는 **굵게**
- 타임스탬프 포함 [0:00-0:03]

형식:
[0:00-0:03]
**이거** 몰랐다면
돈 버린 겁니다

[0:03-0:06]
...`,
      modelId: 'gpt-4o-mini',
      usePreviousOutput: true,
      estimatedCost: 0.008,
    },
  ],
}
```

### 템플릿 3: 소설 개요 작성

```typescript
{
  id: 'template-novel-outline',
  name: '소설 개요 작성 체인',
  description: '캐릭터부터 플롯까지 완벽한 소설 개요',
  category: 'creative',
  isOfficial: true,
  estimatedTime: 240,
  tags: ['소설', '창작', '플롯'],
  steps: [
    {
      order: 1,
      name: '캐릭터 설정',
      promptTemplate: `당신은 소설가입니다.

장르: {{initial_input}}

이 장르에 어울리는 매력적인 주인공과 조연 2명의 캐릭터를 설정하세요.

각 캐릭터마다:
- 이름 및 나이
- 외모 특징
- 성격 (강점/약점)
- 배경 스토리
- 캐릭터의 욕망
- 캐릭터의 두려움

상세하게 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.025,
    },
    {
      order: 2,
      name: '갈등 구조 설계',
      promptTemplate: `캐릭터 설정:
{{previous_output}}

이 캐릭터들을 활용한 갈등 구조를 설계하세요:

1. 외적 갈등: 주인공이 극복해야 할 외부 장애물
2. 내적 갈등: 주인공의 심리적 갈등
3. 관계 갈등: 캐릭터 간 갈등
4. 절정: 모든 갈등이 폭발하는 순간
5. 해결: 갈등이 해결되는 방식

각 항목을 3-4문장으로 설명하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.020,
    },
    {
      order: 3,
      name: '3막 구조 플롯',
      promptTemplate: `캐릭터와 갈등:
{{previous_output}}

3막 구조로 상세한 플롯을 작성하세요:

**1막: 설정 (전체의 25%)**
- 일상의 세계
- 사건의 계기
- 결정 (모험 시작)

**2막: 대립 (전체의 50%)**
- 장애물들
- 중간 전환점
- 최대 위기

**3막: 해결 (전체의 25%)**
- 절정
- 해결
- 새로운 일상

각 항목을 장면 단위로 상세하게 설명하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.030,
    },
    {
      order: 4,
      name: '챕터 구분',
      promptTemplate: `플롯:
{{previous_output}}

이 플롯을 10-15개 챕터로 나누고,
각 챕터의 내용을 요약하세요:

형식:
**Chapter 1: [제목]**
- 시점: 누구의 관점
- 장소: 어디서
- 핵심 사건: 무슨 일이
- 감정 곡선: 어떤 감정
- 다음으로: 어떻게 이어지는지`,
      modelId: 'gpt-4o',
      usePreviousOutput: true,
      estimatedCost: 0.025,
    },
    {
      order: 5,
      name: '첫 장면 작성',
      promptTemplate: `챕터 개요:
{{previous_output}}

Chapter 1의 첫 장면 (500-800자)을 실제로 작성하세요.

요구사항:
- 독자를 즉시 몰입시킬 것
- 주인공의 성격이 드러나도록
- 일상의 세계를 보여줄 것
- 사건의 계기를 암시할 것

문학적 표현을 사용하세요.`,
      modelId: 'claude-opus-4-6',
      usePreviousOutput: true,
      estimatedCost: 0.045,
    },
  ],
}
```

### 템플릿 4: 비즈니스 기획서

```typescript
{
  id: 'template-business-proposal',
  name: '비즈니스 기획서 작성 체인',
  description: '시장 분석부터 실행 계획까지',
  category: 'analysis',
  isOfficial: true,
  estimatedTime: 300,
  tags: ['비즈니스', '기획서', '분석'],
  steps: [
    {
      order: 1,
      name: '시장 분석',
      promptTemplate: `당신은 비즈니스 컨설턴트입니다.

비즈니스 아이디어: {{initial_input}}

다음 관점에서 시장 분석을 수행하세요:

1. 시장 규모 및 성장률
2. 타겟 고객 (페르소나 3개)
3. 경쟁사 분석 (주요 3개)
4. 시장 기회 (3가지)
5. 위협 요소 (3가지)

각 항목을 데이터와 함께 설명하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.030,
    },
    {
      order: 2,
      name: '가치 제안',
      promptTemplate: `시장 분석:
{{previous_output}}

이 분석을 바탕으로 명확한 가치 제안을 작성하세요:

1. 문제 정의: 고객의 어떤 문제를 해결?
2. 솔루션: 우리의 솔루션은?
3. 차별점: 경쟁사 대비 우리만의 강점 (3가지)
4. 증거: 가치를 증명하는 데이터/사례
5. 한 문장 요약: 엘리베이터 피치

설득력 있게 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.025,
    },
    {
      order: 3,
      name: '비즈니스 모델',
      promptTemplate: `가치 제안:
{{previous_output}}

비즈니스 모델 캔버스를 작성하세요:

1. 고객 세그먼트
2. 가치 제안
3. 채널 (유통 경로)
4. 고객 관계
5. 수익원
6. 핵심 자원
7. 핵심 활동
8. 핵심 파트너십
9. 비용 구조

각 항목을 구체적으로 설명하세요.`,
      modelId: 'gpt-4o',
      usePreviousOutput: true,
      estimatedCost: 0.028,
    },
    {
      order: 4,
      name: '실행 계획',
      promptTemplate: `비즈니스 모델:
{{previous_output}}

6개월 실행 계획을 수립하세요:

**Month 1-2: MVP 개발**
- 주요 작업 (5개)
- 필요 자원
- 예상 비용
- 성공 지표

**Month 3-4: 베타 테스트**
- 주요 작업
- 목표 고객 수
- 수집할 피드백
- 성공 지표

**Month 5-6: 공식 론칭**
- 마케팅 전략
- 예상 매출
- 성장 목표

각 단계를 실행 가능하게 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.030,
    },
  ],
}
```

### 템플릿 5: 마케팅 이메일 시퀀스

```typescript
{
  id: 'template-email-sequence',
  name: '마케팅 이메일 시퀀스',
  description: '웰컴부터 전환까지 자동화된 이메일 시리즈',
  category: 'creative',
  isOfficial: true,
  estimatedTime: 150,
  tags: ['마케팅', '이메일', '자동화'],
  steps: [
    {
      order: 1,
      name: '타겟 페르소나 정의',
      promptTemplate: `당신은 이메일 마케팅 전문가입니다.

제품/서비스: {{initial_input}}

이메일 수신자의 페르소나를 정의하세요:

1. 인구통계 (나이, 직업, 소득)
2. 고민/문제점 (3가지)
3. 목표/욕구 (3가지)
4. 행동 패턴 (온라인 활동)
5. 이메일 선호도 (읽는 시간, 스타일)

구체적으로 작성하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.018,
    },
    {
      order: 2,
      name: '이메일 시퀀스 구조',
      promptTemplate: `페르소나:
{{previous_output}}

5개 이메일 시퀀스를 설계하세요:

**Email 1 (Day 0): 웰컴**
- 목적: 첫인상, 기대감 조성
- 핵심 메시지: (2-3문장)
- CTA: (행동 촉구)

**Email 2 (Day 3): 교육**
- 목적: 가치 제공
- 핵심 메시지:
- CTA:

**Email 3 (Day 7): 사회적 증거**
- 목적: 신뢰 구축
- 핵심 메시지:
- CTA:

**Email 4 (Day 10): 긴급성**
- 목적: 행동 유도
- 핵심 메시지:
- CTA:

**Email 5 (Day 14): 최종 제안**
- 목적: 전환
- 핵심 메시지:
- CTA:

각 이메일의 전략을 설명하세요.`,
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: true,
      estimatedCost: 0.022,
    },
    {
      order: 3,
      name: '실제 이메일 작성',
      promptTemplate: `이메일 구조:
{{previous_output}}

Email 1 (웰컴 이메일)의 실제 본문을 작성하세요:

형식:
---
제목: [클릭 유도하는 제목]
프리헤더: [미리보기 텍스트]

본문:
[이름]님, 안녕하세요!

[도입 - 환영 & 공감]

[본론 - 약속 & 가치]

[마무리 - 다음 스텝]

[CTA 버튼]

[서명]
---

친근하고 진정성 있게 작성하세요.
이메일 길이: 200-300자`,
      modelId: 'gpt-4o',
      usePreviousOutput: true,
      estimatedCost: 0.020,
    },
  ],
}
```

## 8. 실시간 업데이트

### Firestore 리스너 구현

```typescript
// client/src/hooks/useChainExecution.ts

export function useChainExecution(executionId: string) {
  const [execution, setExecution] = useState<ChainExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!executionId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firestore 실시간 리스너
    const unsubscribe = onSnapshot(
      doc(db, 'chainExecutions', executionId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setExecution({
            id: snapshot.id,
            ...data,
            startedAt: data.startedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            stepResults: data.stepResults?.map((r: any) => ({
              ...r,
              executedAt: r.executedAt?.toDate(),
            })) || [],
          } as ChainExecution);

          setError(null);
        } else {
          setError('실행 기록을 찾을 수 없습니다.');
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useChainExecution] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [executionId]);

  return { execution, loading, error };
}
```

### 사용 예시

```typescript
// ChainExecution.tsx
const { execution, loading, error } = useChainExecution(executionId);

// 실행 상태가 변경될 때마다 자동 업데이트
useEffect(() => {
  if (!execution) return;

  // 완료 알림
  if (execution.status === 'completed') {
    toast.success('체인 실행이 완료되었습니다!', {
      duration: 5000,
    });
  }

  // 실패 알림
  if (execution.status === 'failed') {
    toast.error(`체인 실행 실패: ${execution.error}`);
  }

  // 단계 완료 알림
  const lastResult = execution.stepResults[execution.stepResults.length - 1];
  if (lastResult && lastResult.success) {
    toast.info(`${lastResult.stepName} 완료!`);
  }
}, [execution?.status, execution?.stepResults?.length]);
```

## 9. 에러 처리 전략

### 에러 타입 정의

```typescript
type ChainError =
  | 'network_error'      // 네트워크 연결 실패
  | 'api_error'          // AI API 오류
  | 'timeout_error'      // 타임아웃
  | 'validation_error'   // 입력 검증 실패
  | 'cost_exceeded'      // 비용 한도 초과
  | 'user_cancelled';    // 사용자 취소

interface ChainExecutionError {
  type: ChainError;
  message: string;
  stepId?: string;
  retryable: boolean;
}
```

### 에러 처리 로직

```typescript
// server/lib/chain-executor.ts

async function executeStepWithErrorHandling(
  step: ChainStep,
  prompt: string
): Promise<StepResult> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeAIModel(step.modelId, prompt);

      return {
        stepId: step.id,
        stepName: step.name,
        stepOrder: step.order,
        input: prompt,
        output: result.response,
        modelUsed: step.modelId,
        duration: 0,  // Calculated by caller
        cost: result.cost,
        success: true,
        executedAt: new Date(),
      };
    } catch (error: any) {
      lastError = error;

      // 에러 타입 분류
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        // 네트워크 오류 - 재시도
        console.log(`[Chain] Network error, retrying (${attempt}/${maxRetries})...`);
        await sleep(Math.pow(2, attempt) * 1000);  // 지수 백오프
        continue;
      }

      if (error.status === 429) {
        // Rate limit - 재시도
        console.log(`[Chain] Rate limited, retrying (${attempt}/${maxRetries})...`);
        await sleep(5000);
        continue;
      }

      if (error.status === 500) {
        // 서버 오류 - 재시도
        console.log(`[Chain] Server error, retrying (${attempt}/${maxRetries})...`);
        await sleep(2000);
        continue;
      }

      // 재시도 불가능한 오류 - 즉시 실패
      if (error.status === 400 || error.status === 401) {
        throw error;
      }
    }
  }

  // 모든 재시도 실패
  throw new Error(
    `Step execution failed after ${maxRetries} retries: ${lastError?.message}`
  );
}
```

### 사용자 피드백

```typescript
// 에러 메시지 매핑
const errorMessages: Record<ChainError, string> = {
  network_error: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
  api_error: 'AI 모델 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  timeout_error: '요청 시간이 초과되었습니다. 프롬프트를 간소화하거나 다시 시도해주세요.',
  validation_error: '입력 값이 올바르지 않습니다. 다시 확인해주세요.',
  cost_exceeded: '예상 비용이 한도를 초과했습니다. 설정을 확인해주세요.',
  user_cancelled: '사용자가 실행을 취소했습니다.',
};

// UI에서 사용
toast.error(errorMessages[error.type]);
```

### 복구 옵션

```typescript
// 특정 단계부터 재실행 (선택 기능)
async function resumeFromStep(
  executionId: string,
  fromStepIndex: number
): Promise<void> {
  const execution = await getExecutionFromDb(executionId);
  if (!execution) throw new Error('Execution not found');

  const chain = await getChainFromDb(execution.chainId);
  if (!chain) throw new Error('Chain not found');

  // 이전 단계의 출력을 가져와서 이어서 실행
  const previousOutput =
    execution.stepResults[fromStepIndex - 1]?.output || '';

  // fromStepIndex부터 실행
  for (let i = fromStepIndex; i < chain.steps.length; i++) {
    // ... 실행 로직
  }
}
```

## 10. 성능 고려사항

### 비용 관리

```typescript
// 비용 한도 체크
const COST_LIMIT = 1.00;  // $1

async function checkCostLimit(chain: PromptChain): Promise<boolean> {
  if (chain.totalEstimatedCost > COST_LIMIT) {
    return false;
  }
  return true;
}

// 실행 전 확인
if (!await checkCostLimit(chain)) {
  throw new Error(
    `예상 비용($${chain.totalEstimatedCost.toFixed(2)})이 한도($${COST_LIMIT})를 초과합니다.`
  );
}
```

### 실행 시간 최적화

```typescript
// 병렬 실행 불가능 (단계는 순차적)
// 하지만 여러 체인을 동시에 실행 가능

// 동시 실행 제한
const MAX_CONCURRENT_EXECUTIONS = 3;

async function executeChainWithConcurrencyLimit(
  chain: PromptChain,
  initialInput?: string
): Promise<string> {
  // 현재 실행 중인 체인 수 체크
  const runningCount = await getRunningExecutionCount();

  if (runningCount >= MAX_CONCURRENT_EXECUTIONS) {
    throw new Error(
      '동시에 실행 가능한 체인 수를 초과했습니다. 잠시 후 다시 시도해주세요.'
    );
  }

  return await executeChainBackground(executionId, chain, initialInput);
}
```

### 캐싱 전략 (선택사항)

```typescript
// 동일한 프롬프트에 대한 결과 캐싱
// (정확히 같은 입력이 반복될 경우)

interface CacheEntry {
  prompt: string;
  modelId: string;
  response: string;
  cost: number;
  cachedAt: Date;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 3600000;  // 1시간

function getCacheKey(prompt: string, modelId: string): string {
  return `${modelId}:${hashString(prompt)}`;
}

async function executeAIModelWithCache(
  modelId: string,
  prompt: string
): Promise<{ response: string; cost: number }> {
  const cacheKey = getCacheKey(prompt, modelId);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.cachedAt.getTime() < CACHE_TTL) {
    console.log('[Chain] Cache hit');
    return {
      response: cached.response,
      cost: 0,  // 캐시된 결과는 비용 없음
    };
  }

  const result = await executeAIModel(modelId, prompt);

  // 캐시에 저장
  cache.set(cacheKey, {
    prompt,
    modelId,
    response: result.response,
    cost: result.cost,
    cachedAt: new Date(),
  });

  return result;
}
```

## 11. 테스트 계획

### 단위 테스트

```typescript
// server/lib/__tests__/chain-executor.test.ts

describe('preparePrompt', () => {
  it('should replace {{previous_output}}', () => {
    const template = 'Use this: {{previous_output}}';
    const previousOutput = 'Hello World';
    const result = preparePrompt(template, previousOutput);
    expect(result).toBe('Use this: Hello World');
  });

  it('should replace {{initial_input}}', () => {
    const template = 'Topic: {{initial_input}}';
    const result = preparePrompt(template, '', 'AI Trends');
    expect(result).toBe('Topic: AI Trends');
  });

  it('should replace both variables', () => {
    const template = 'Initial: {{initial_input}}, Previous: {{previous_output}}';
    const result = preparePrompt(template, 'Output1', 'Input1');
    expect(result).toBe('Initial: Input1, Previous: Output1');
  });
});

describe('calculateClaudeCost', () => {
  it('should calculate Sonnet cost correctly', () => {
    const cost = calculateClaudeCost('claude-sonnet-4-5', 1000, 1000);
    expect(cost).toBe(0.018);  // (1000/1000)*0.003 + (1000/1000)*0.015
  });
});

describe('executeChainBackground', () => {
  it('should execute all steps sequentially', async () => {
    // Mock AI calls
    const mockChain = createMockChain();
    const executionId = 'test-exec-1';

    await executeChainBackground(executionId, mockChain);

    const execution = await getExecutionFromDb(executionId);
    expect(execution.status).toBe('completed');
    expect(execution.stepResults).toHaveLength(mockChain.steps.length);
  });

  it('should handle errors correctly', async () => {
    // Mock API failure
    const mockChain = createMockChain();
    mockAIModel.mockRejectedValueOnce(new Error('API Error'));

    await expect(
      executeChainBackground('test-exec-2', mockChain)
    ).rejects.toThrow('API Error');

    const execution = await getExecutionFromDb('test-exec-2');
    expect(execution.status).toBe('failed');
  });
});
```

### 통합 테스트

```typescript
// server/__tests__/chains.integration.test.ts

describe('Chains API Integration', () => {
  it('should create and execute a chain end-to-end', async () => {
    // 1. 체인 생성
    const createResult = await caller.chains.createChain({
      name: 'Test Chain',
      description: 'Integration test',
      category: 'custom',
      steps: [
        {
          order: 1,
          name: 'Step 1',
          promptTemplate: 'Say: {{initial_input}}',
          modelId: 'claude-sonnet-4-5',
          usePreviousOutput: false,
          estimatedCost: 0.01,
        },
      ],
    });

    expect(createResult.id).toBeDefined();

    // 2. 체인 실행
    const executeResult = await caller.chains.executeChain({
      chainId: createResult.id,
      initialInput: 'Hello',
    });

    expect(executeResult.executionId).toBeDefined();

    // 3. 실행 완료 대기
    await waitForExecution(executeResult.executionId, 'completed');

    // 4. 결과 확인
    const execution = await caller.chains.getChainExecution({
      executionId: executeResult.executionId,
    });

    expect(execution.status).toBe('completed');
    expect(execution.stepResults).toHaveLength(1);
    expect(execution.stepResults[0].success).toBe(true);
  });
});
```

### E2E 시나리오

```typescript
// e2e/chains.spec.ts (Playwright)

test('user can create and execute a chain', async ({ page }) => {
  // 1. 로그인
  await loginAsTestUser(page);

  // 2. 체인 목록으로 이동
  await page.goto('/chains');
  await expect(page.locator('h1')).toContainText('프롬프트 체인');

  // 3. 새 체인 만들기
  await page.click('text=새 체인 만들기');
  await page.fill('input[name="name"]', 'E2E Test Chain');
  await page.fill('textarea[name="description"]', 'Created by E2E test');

  // 4. 단계 추가
  await page.click('text=단계 추가');
  await page.fill(
    'textarea[placeholder*="프롬프트"]',
    'Write a short story about: {{initial_input}}'
  );

  // 5. 저장
  await page.click('button:has-text("체인 만들기")');
  await expect(page).toHaveURL(/\/chains\/chain_/);

  // 6. 실행
  await page.click('button:has-text("실행")');

  // 초기 입력 다이얼로그
  await page.fill('input[placeholder*="초기 입력"]', 'a robot');
  await page.click('dialog button:has-text("실행")');

  // 7. 실행 화면으로 이동
  await expect(page).toHaveURL(/\/chains\/execution\//);
  await expect(page.locator('text=실행 중')).toBeVisible();

  // 8. 완료 대기 (최대 60초)
  await expect(page.locator('text=완료')).toBeVisible({ timeout: 60000 });

  // 9. 결과 확인
  await expect(page.locator('text=최종 결과')).toBeVisible();
});
```

## 12. 다음 단계 (Step 2)

### 구현 Phase 순서

**Phase 1: 백엔드 기초** (우선순위: 높음)
1. TypeScript 타입 정의 (`types/chain.ts`)
2. Firestore 스키마 설정
3. DB 함수 구현 (`server/lib/chain-db.ts`)
   - CRUD operations
4. 체인 실행 엔진 (`server/lib/chain-executor.ts`)
   - `executeChainBackground`
   - `preparePrompt`
   - `executeAIModel` (Claude, GPT, Gemini)
5. Chains Router (`server/routers/chains.ts`)
   - 10개 API 엔드포인트
6. 라우터 등록 (`server/routers.ts`)

**Phase 2: 기본 UI** (우선순위: 높음)
7. 하위 컴포넌트
   - `ChainCard`
   - `StepEditor`
   - `StepResultCard`
8. Chains 페이지 (목록)
9. ChainBuilder 페이지 (생성/편집)
10. 라우팅 추가 (`App.tsx`, `Sidebar.tsx`)

**Phase 3: 실행 시스템** (우선순위: 높음)
11. 실시간 업데이트 훅 (`useChainExecution`)
12. ChainExecution 페이지
13. 에러 처리 UI
14. 취소 기능

**Phase 4: 템플릿 시스템** (우선순위: 중간)
15. 템플릿 데이터 (`server/data/initial-chain-templates.ts`)
16. 템플릿 시딩 스크립트 (`server/scripts/seed-chain-templates.ts`)
17. ChainTemplates 페이지
18. `useChainTemplate` API 연결

**Phase 5: 최적화 & 테스트** (우선순위: 중간)
19. 비용 관리 로직
20. 재시도 로직
21. 단위 테스트
22. 통합 테스트

**Phase 6: 고급 기능** (우선순위: 낮음 - 선택)
23. 캐싱 시스템
24. 특정 단계부터 재실행
25. 체인 공유 기능
26. 체인 분석 (통계)

### 우선순위

1. **필수 (MVP)**:
   - Phase 1 (백엔드)
   - Phase 2 (기본 UI)
   - Phase 3 (실행)

2. **중요**:
   - Phase 4 (템플릿)

3. **선택**:
   - Phase 5 (최적화)
   - Phase 6 (고급)

### 예상 개발 시간

- **Phase 1**: 2-3일
- **Phase 2**: 2-3일
- **Phase 3**: 1-2일
- **Phase 4**: 1일
- **Phase 5**: 1-2일
- **Phase 6**: 2-3일

**총 예상 시간**: 9-14일

### 구현 난이도 평가

**난이도 (1-10 척도)**:
- 백엔드 API: 6/10
- 실행 엔진: 8/10 (가장 복잡)
- 실시간 업데이트: 7/10
- UI 컴포넌트: 5/10
- 템플릿 시스템: 4/10
- 테스트: 6/10

**전체 평가**: 7/10 (고급 수준)

### 기술적 도전 과제

1. **비동기 실행 관리**: 백그라운드에서 체인 실행하고 실시간 업데이트
2. **에러 복구**: 중간 단계 실패 시 처리
3. **변수 치환**: 정확하고 안전한 템플릿 변수 처리
4. **비용 추적**: 실시간 비용 계산 및 제한
5. **성능 최적화**: 긴 체인도 빠르게 실행

---

**설계 완료!** 이제 Step 2 (구현)로 넘어갈 준비가 되었습니다.
