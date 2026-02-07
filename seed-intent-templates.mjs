import { drizzle } from "drizzle-orm/mysql2";
import { intentTemplate } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const templates = [
  {
    category: "콘텐츠 작성",
    keywords: JSON.stringify(["블로그", "글쓰기", "콘텐츠", "기사", "포스트", "작성"]),
    questions: JSON.stringify([
      "어떤 주제에 대해 작성하시나요?",
      "타겟 독자는 누구인가요?",
      "글의 톤앤매너는 어떻게 하시겠어요? (전문적/친근한/유머러스 등)",
      "글의 길이는 어느 정도를 원하시나요?",
      "특별히 포함하고 싶은 키워드나 내용이 있나요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "일반적인 주제",
      "question_1": "일반 대중",
      "question_2": "전문적이면서도 이해하기 쉬운 톤",
      "question_3": "중간 길이 (1000-1500자)",
      "question_4": "없음"
    })
  },
  {
    category: "마케팅 전략",
    keywords: JSON.stringify(["마케팅", "광고", "캠페인", "프로모션", "전략", "이메일"]),
    questions: JSON.stringify([
      "타겟 고객층은 누구인가요?",
      "현재 보유한 마케팅 채널은 무엇인가요?",
      "마케팅 목표는 무엇인가요? (인지도/전환/리텐션 등)",
      "예산 규모는 어느 정도인가요?",
      "경쟁사 대비 차별점은 무엇인가요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "일반 소비자",
      "question_1": "소셜 미디어, 이메일",
      "question_2": "브랜드 인지도 향상",
      "question_3": "중소 규모 예산",
      "question_4": "아직 정의되지 않음"
    })
  },
  {
    category: "데이터 분석",
    keywords: JSON.stringify(["데이터", "분석", "통계", "인사이트", "리포트", "시각화"]),
    questions: JSON.stringify([
      "어떤 종류의 데이터를 분석하시나요?",
      "분석의 목적은 무엇인가요?",
      "데이터의 규모는 어느 정도인가요?",
      "어떤 형식으로 결과를 받고 싶으신가요?",
      "특정 분석 방법론이나 도구를 선호하시나요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "일반적인 비즈니스 데이터",
      "question_1": "인사이트 도출 및 의사결정 지원",
      "question_2": "중간 규모",
      "question_3": "시각화 차트 및 요약 리포트",
      "question_4": "없음"
    })
  },
  {
    category: "코딩 및 개발",
    keywords: JSON.stringify(["코드", "프로그래밍", "개발", "앱", "웹", "소프트웨어", "버그"]),
    questions: JSON.stringify([
      "어떤 프로그래밍 언어를 사용하시나요?",
      "프로젝트의 목적은 무엇인가요?",
      "현재 직면한 기술적 문제가 있나요?",
      "사용하는 프레임워크나 라이브러리가 있나요?",
      "배포 환경은 어디인가요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "JavaScript/Python",
      "question_1": "웹 애플리케이션 개발",
      "question_2": "없음",
      "question_3": "React, Node.js",
      "question_4": "클라우드 환경"
    })
  },
  {
    category: "비즈니스 기획",
    keywords: JSON.stringify(["기획", "사업", "비즈니스", "계획", "전략", "제안서"]),
    questions: JSON.stringify([
      "어떤 산업 분야인가요?",
      "사업의 목표는 무엇인가요?",
      "타겟 시장은 어디인가요?",
      "현재 보유한 리소스는 무엇인가요?",
      "예상되는 주요 도전 과제는 무엇인가요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "IT/테크",
      "question_1": "수익 창출 및 시장 점유율 확대",
      "question_2": "국내 시장",
      "question_3": "소규모 팀 및 제한된 예산",
      "question_4": "경쟁 심화 및 자금 조달"
    })
  },
  {
    category: "일반 질문",
    keywords: JSON.stringify(["기타", "일반", "질문", "도움", "조언"]),
    questions: JSON.stringify([
      "구체적으로 어떤 도움이 필요하신가요?",
      "이 작업의 최종 목표는 무엇인가요?",
      "현재 어떤 단계에 있나요?",
      "특별히 고려해야 할 제약사항이 있나요?",
      "결과물의 형식은 어떻게 받고 싶으신가요?"
    ]),
    defaultAnswers: JSON.stringify({
      "question_0": "명확한 가이드라인",
      "question_1": "문제 해결",
      "question_2": "초기 단계",
      "question_3": "없음",
      "question_4": "텍스트 형식"
    })
  }
];

async function seed() {
  console.log("Seeding intent templates...");
  
  for (const template of templates) {
    await db.insert(intentTemplate).values(template);
    console.log(`✓ Inserted template: ${template.category}`);
  }
  
  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
