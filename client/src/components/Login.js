import React, { useState } from "react";
import RegisterModal from "./RegisterModal";
import "./Login.css";

function Login({ onLogin, onRegisterClick }) {
  const [inputUserId, setInputUserId] = useState("");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async () => {
    if (!inputUserId.trim()) {
      setError("유저 닉네임을 입력해주세요.");
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
    <div>
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
      {/* 👇 회원가입 링크 추가 */}
      <div className="login-register-link">
        아직 아이디가 없나요?{" "}
        <button onClick={() => setShowRegister(true)} className="register-button">
          회원가입
        </button>
      </div>
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

export default Login;
