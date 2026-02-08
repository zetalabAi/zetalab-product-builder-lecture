export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Firebase Authentication을 사용하므로 별도의 로그인 URL이 필요 없음
// LoginModal 컴포넌트에서 Firebase Google Sign-In을 처리
export const getLoginUrl = () => {
  // Firebase는 클라이언트 사이드 모달을 통해 로그인하므로
  // 리다이렉트 URL 대신 홈으로 돌아감
  return "/";
};
