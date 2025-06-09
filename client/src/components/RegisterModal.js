import React, { useState } from "react";
import "./RegisterModal.css";

function RegisterModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!email.includes("@") || !userId.trim()) {
      setMessage("올바른 이메일과 아이디를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ 회원가입 성공! 로그인 해주세요.");
        setEmail("");
        setUserId("");
      } else {
        setMessage("❌ " + (data.message || "회원가입 실패"));
      }
    } catch (err) {
      console.error("❌ 회원가입 요청 실패:", err);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>🆕 회원가입</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="login-input"
        />
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="사용할 닉네임"
          className="login-input"
        />
        <button onClick={handleRegister} className="login-button">회원가입</button>
        <button onClick={onClose} className="modal-close-button">닫기</button>
        {message && <p className="login-error">{message}</p>}
      </div>
    </div>
  );
}

export default RegisterModal;
