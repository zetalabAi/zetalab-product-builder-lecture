import { lazy, ComponentType } from 'react';

// Lazy load 페이지 컴포넌트
const Home = lazy(() => import("./pages/Home"));
const IntentClarification = lazy(() => import("./pages/IntentClarification"));
const PromptResult = lazy(() => import("./pages/PromptResult"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail").then(m => ({ default: m.ConversationDetail })));
const Projects = lazy(() => import("./pages/Projects"));
const MyWork = lazy(() => import("./pages/MyWork"));
const PromptVersions = lazy(() => import("./pages/PromptVersions"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Playground = lazy(() => import("./pages/Playground"));
const Templates = lazy(() => import("./pages/Templates"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ChainList = lazy(() => import("./pages/chains").then(m => ({ default: m.ChainList })));
const ChainBuilder = lazy(() => import("./pages/chains").then(m => ({ default: m.ChainBuilder })));
const ChainExecutionPage = lazy(() => import("./pages/chains").then(m => ({ default: m.ChainExecutionPage })));
const TemplatesBrowser = lazy(() => import("./pages/chains").then(m => ({ default: m.TemplatesBrowser })));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Feedback = lazy(() => import("./pages/Feedback"));

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
}

export const routes: RouteConfig[] = [
  { path: "/", component: Home },
  { path: "/intent/:sessionId", component: IntentClarification },
  { path: "/result/:promptId", component: PromptResult },
  { path: "/history/:id", component: ConversationDetail },
  { path: "/history", component: History },
  { path: "/my-work", component: MyWork },
  { path: "/my-work/:assetId", component: PromptVersions },
  { path: "/projects/:id", component: ProjectDetail },
  { path: "/projects", component: Projects },
  { path: "/playground", component: Playground },
  { path: "/templates", component: Templates },
  { path: "/dashboard", component: Dashboard },
  { path: "/courses/:courseId", component: CourseDetail },
  { path: "/courses", component: Courses },
  { path: "/chains/templates", component: TemplatesBrowser },
  { path: "/chains/new", component: ChainBuilder },
  { path: "/chains/:chainId/edit", component: ChainBuilder },
  { path: "/chains/:chainId/execute", component: ChainExecutionPage },
  { path: "/chains", component: ChainList },
  { path: "/settings", component: Settings },
  { path: "/privacy", component: Privacy },
  { path: "/terms", component: Terms },
  { path: "/feedback", component: Feedback },
  { path: "/404", component: NotFound },
];
