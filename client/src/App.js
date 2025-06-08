import React, { useState, useEffect } from "react"; // ✅ useEffect 추가됨
import Login from "./components/Login";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [mustHave, setMustHave] = useState([]); // ✅ 선택된 필수 재료
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // ✅ 페이지 로드시 userId가 있으면 냉장고 재료 불러오기
  useEffect(() => {
    if (userId) {
      fetchFridge(userId);
    }
  }, [userId]);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
    fetchFridge(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId("");
    setIngredients([]);
    setMustHave([]); // ✅ 필수 재료 초기화
    setRecipes([]);
    setError("");
  };

  const fetchFridge = async (uid) => {
    try {
      const res = await fetch(`/api/fridge/${uid}`);
      const data = await res.json();
      setIngredients(data.ingredients || []);
    } catch (err) {
      console.error("❌ 냉장고 재료 조회 실패", err);
    }
  };

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

  const handleRemoveIngredient = async (item) => {
    try {
      const res = await fetch("/api/fridge/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ingredient: item }),
      });
      const data = await res.json();
      if (data.success) {
        setIngredients(data.fridge);
        setMustHave((prev) => prev.filter((ing) => ing !== item)); // ✅ 삭제 시 mustHave에서도 제거
        setStatus(`🗑️ '${item}' 재료가 삭제되었습니다.`);
      }
    } catch (err) {
      console.error("❌ 재료 삭제 실패", err);
    }
  };

  // ✅ 필수 재료 선택 토글
  const toggleMustHave = (item) => {
    setMustHave((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        if (prev.length >= 3) {
          alert("최대 3개까지만 선택할 수 있습니다.");
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  const handleFridgeRecommend = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mustHaveIngredients: mustHave }), // ✅ 필수 재료 전송
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
                {ingredients.map((ing, i) => {
                  const isSelected = mustHave.includes(ing);
                  return (
                    <li key={i} style={{ cursor: "pointer" }}>
                      <span
                        onClick={() => toggleMustHave(ing)}
                        style={{
                          fontWeight: isSelected ? "bold" : "normal",
                          color: isSelected ? "#2a75f3" : "black",
                        }}
                      >
                        {isSelected ? "⭐ " : ""}{ing}
                      </span>
                      <button
                        style={{ marginLeft: "10px", color: "red" }}
                        onClick={() => handleRemoveIngredient(ing)}
                      >
                        ❌
                      </button>
                    </li>
                  );
                })}
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
                냉털 레시피 추천받기
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
                        {r.steps.map((s, i) => <p key={i}>{s}</p>)}
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
