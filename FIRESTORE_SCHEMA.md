# Firestore Schema Design

Drizzle ORM + MySQL에서 Firestore로 마이그레이션한 스키마입니다.

## Collections

### 1. users (컬렉션)
사용자 정보를 저장합니다. Firebase Auth UID를 문서 ID로 사용합니다.

```
users/{userId}
  - uid: string (Firebase Auth UID)
  - openId: string (기존 Manus OAuth ID, 마이그레이션용)
  - name: string
  - email: string
  - loginMethod: string (google, email, etc.)
  - role: "user" | "admin"
  - manusLinked: boolean
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastSignedIn: timestamp
```

### 2. promptTemplates (컬렉션)
사용자가 저장하고 재사용할 수 있는 프롬프트 템플릿입니다.

```
promptTemplates/{templateId}
  - userId: string (users 문서 ID)
  - title: string
  - description: string
  - templateContent: string
  - category: string
  - tags: string[] (배열)
  - isPublic: boolean
  - usageCount: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 3. promptAssets (컬렉션)
사용자가 저장한 프롬프트 자산을 관리합니다.

```
promptAssets/{assetId}
  - userId: string
  - name: string
  - description: string
  - originalQuestion: string
  - currentVersionId: string (promptVersions 서브컬렉션 문서 ID)
  - versionCount: number
  - lastUsedAt: timestamp
  - lastModifiedAt: timestamp
  - successStatus: number (0=미평가, 1=성공, -1=실패)
  - projectId: string (optional, projects 문서 ID)
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### 서브컬렉션: promptVersions
프롬프트 자산의 버전들을 저장합니다.

```
promptAssets/{assetId}/versions/{versionId}
  - userId: string
  - versionNumber: number
  - generatedPrompt: string
  - editedPrompt: string
  - intentAnswers: object (JSON 객체)
  - usedLLM: string
  - suggestedServices: object (JSON 객체)
  - notes: string
  - successStatus: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 4. conversations (컬렉션)
프롬프트 히스토리 (기존 promptHistory)를 대화 형태로 저장합니다.

```
conversations/{conversationId}
  - userId: string
  - sessionId: string
  - originalQuestion: string
  - intentAnswers: object
  - generatedPrompt: string
  - editedPrompt: string
  - usedLLM: string
  - suggestedServices: object
  - isPinned: boolean
  - projectId: string (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 5. intentTemplates (컬렉션)
카테고리별 의도 질문 템플릿입니다.

```
intentTemplates/{templateId}
  - category: string
  - keywords: string[]
  - questions: string[]
  - defaultAnswers: object
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 6. projects (컬렉션)
대화를 폴더로 구성하기 위한 프로젝트입니다.

```
projects/{projectId}
  - userId: string
  - name: string
  - description: string
  - color: string (Hex color code)
  - icon: string
  - conversationIds: string[] (대화 ID 배열)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## 인덱스 (firestore.indexes.json)

Firestore는 복합 쿼리를 위해 인덱스가 필요합니다.

1. **userId + createdAt**: 사용자별 최신 항목 조회
2. **userId + projectId + createdAt**: 프로젝트별 대화 조회
3. **category**: 카테고리별 템플릿 조회

## 주요 변경사항

### MySQL → Firestore 마이그레이션

| MySQL | Firestore |
|-------|-----------|
| AUTO_INCREMENT id | 자동 생성 문서 ID |
| Foreign Key (userId) | 문서 ID 참조 |
| JSON 텍스트 필드 | Native Object/Array |
| Junction Table (projectConversations) | conversationIds 배열 |
| timestamp with onUpdateNow | 수동 업데이트 필요 |

### 트랜잭션 고려사항

Firestore에서는 다음 작업 시 트랜잭션 사용:
- 버전 생성 + versionCount 증가
- 프로젝트에 대화 추가 + conversationIds 업데이트
- 사용자 생성 시 중복 확인

### 데이터 검증

Firestore Security Rules에서 다음을 검증:
- userId가 현재 인증된 사용자와 일치
- 필수 필드 존재 여부
- 데이터 타입 검증
- 문자열 길이 제한
