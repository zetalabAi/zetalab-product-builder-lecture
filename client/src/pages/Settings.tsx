import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Settings() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // /settings 페이지로 직접 접근 시 홈으로 리다이렉트하고 모달 열기
    navigate("/?openSettings=true");
  }, [navigate]);

  return null;
}
