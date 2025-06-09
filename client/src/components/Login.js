import React, { useState } from "react";
import "./Login.css"; // 스타일 파일 추가

function Login({ onLogin }) {
  const [inputUserId, setInputUserId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!inputUserId.trim()) {
      setError("유저 ID를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: inputUserId.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("userId", inputUserId.trim());
        onLogin(inputUserId.trim());
        setError("");
        setInputUserId("");
      } else {
        setError(data.message || "로그인 실패");
      }
    } catch (err) {
      console.error("❌ 로그인 요청 실패:", err);
      setError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login-container">
      <input
        type="text"
        value={inputUserId}
        onChange={(e) => setInputUserId(e.target.value)}
        placeholder="User ID를 입력하세요"
        className="login-input"
      />
      <button onClick={handleSubmit} className="login-button">
        로그인
      </button>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}

export default Login;
