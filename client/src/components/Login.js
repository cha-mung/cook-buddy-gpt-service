import React, { useState } from "react";

function Login({ onLogin }) {
  const [inputUserId, setInputUserId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!inputUserId.trim()) {
      setError("유저 ID를 입력해주세요.");
      return;
    }

    try {
      // 백엔드로 ID 전송하여 Google Sheets에 저장 요청
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
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        value={inputUserId}
        onChange={(e) => setInputUserId(e.target.value)}
        placeholder="User ID를 입력하세요"
        style={{ padding: "8px", marginRight: "10px" }}
      />
      <button onClick={handleSubmit}>로그인</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
