// src/App.js
import React, { useState } from "react";
import Login from "./components/Login";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
    setIngredients([]); // 초기화
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId("");
    setIngredients([]);
    setRecipes([]);
    setError("");
  };

  // ✅ 냉장고 재료 추가
  const handleAddIngredient = async () => {
    setStatus("");
    const newItems = ingredientInput.split(",").map((i) => i.trim()).filter(Boolean);
    if (!newItems.length) {
      setStatus("재료를 입력하세요.");
      return;
    }

    try {
      const res = await fetch("/api/fridge/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ingredients: newItems }),
      });
      const data = await res.json();
      if (data.success) {
        setIngredients(data.fridge);
        setStatus("✅ 재료가 추가되었습니다.");
      } else {
        setStatus("❌ 실패: " + data.message);
      }
    } catch (err) {
      console.error("❌ 재료 추가 실패", err);
      setStatus("❌ 서버 오류 발생");
    }

    setIngredientInput("");
  };

  // ✅ 레시피 추천
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
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🍽️ Cook Buddy</h1>

      {!userId ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <b>👤 사용자:</b> {userId}
            <button style={{ marginLeft: "10px" }} onClick={handleLogout}>로그아웃</button>
          </div>

          <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
            {/* 냉장고 왼쪽 */}
            <div style={{ flex: 1, background: "#f4faff", padding: "20px", borderRadius: "8px" }}>
              <h2>🧊 내 냉장고</h2>
              <ul>
                {ingredients.map((ing, i) => <li key={i}> {ing}</li>)}
              </ul>
              <input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="예: 계란, 양파"
                style={{ width: "80%", padding: "8px", marginRight: "10px" }}
              />
              <button onClick={handleAddIngredient}>추가</button>
              <p style={{ color: "green", marginTop: "8px" }}>{status}</p>
            </div>

            {/* 레시피 추천 오른쪽 */}
            <div style={{ flex: 2, background: "#fff7eb", padding: "20px", borderRadius: "8px" }}>
              <h2>🍳 레시피 추천</h2>
              <button onClick={handleFridgeRecommend} disabled={loading}>
                GPT로 레시피 추천받기
              </button>
              {loading && <p>⏳ 추천 중입니다...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}

              {recipes.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  {recipes.map((r, idx) => (
                    <div key={idx} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "16px" }}>
                      <h3>{idx + 1}. {r.title}</h3>
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
          </div>
        </>
      )}
    </div>
  );
}

export default App;
