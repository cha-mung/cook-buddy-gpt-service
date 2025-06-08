// src/App.js
import React, { useState } from "react";
import Login from "./components/Login";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId("");
    setRecipes([]);
    setError("");
  };

  const handleFridgeRecommend = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fridge-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setRecipes(data.recipes);
    } catch (err) {
      console.error("❌ 레시피 추천 실패", err);
      setError("레시피 추천에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>🍽️ Cook Buddy - 냉장고 레시피 추천</h1>

      {!userId ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <span><b>👤 사용자:</b> {userId}</span>
            <button style={{ marginLeft: "10px" }} onClick={handleLogout}>로그아웃</button>
          </div>

          <button onClick={handleFridgeRecommend} disabled={loading}>
            🧊 냉장고 재료로 추천받기
          </button>
        </>
      )}

      {loading && <p>⏳ 추천 중입니다...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {recipes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>추천된 레시피</h2>
          {recipes.map((r, idx) => (
            <div key={idx} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
              <h3>{r.title}</h3>
              <p><b>Main:</b> {r.mainIngredients.join(", ")}</p>
              <p><b>Extra:</b> {r.extraIngredients.join(", ")}</p>
              <ol>
                {r.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
