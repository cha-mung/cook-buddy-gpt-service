import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import FridgePanel from "./components/FridgePanel";
import RecipePanel from "./components/RecipePanel";
import "./App.css";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [mustHave, setMustHave] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

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
    setMustHave([]);
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
        setMustHave((prev) => prev.filter((ing) => ing !== item));
        setStatus(`🗑️ '${item}' 재료가 삭제되었습니다.`);
      }
    } catch (err) {
      console.error("❌ 재료 삭제 실패", err);
    }
  };

  const toggleMustHave = (item) => {
    setMustHave((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : prev.length >= 3
        ? (alert("최대 3개까지만 선택할 수 있습니다."), prev)
        : [...prev, item]
    );
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
        body: JSON.stringify({ userId, mustHaveIngredients: mustHave }),
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
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">🍽️ Cook Buddy</h1>
      </header>

      {!userId ? (
        <main className="App-loginSection">
          <Login onLogin={handleLogin} />
        </main>
      ) : (
        <main className="App-main">
          <div className="App-userBar">
            <span><b>👤 사용자:</b> {userId}</span>
            <button onClick={handleLogout}>로그아웃</button>
          </div>

          <section className="App-panels">
            <FridgePanel
              ingredientInput={ingredientInput}
              setIngredientInput={setIngredientInput}
              ingredients={ingredients}
              mustHave={mustHave}
              toggleMustHave={toggleMustHave}
              handleAddIngredient={handleAddIngredient}
              handleRemoveIngredient={handleRemoveIngredient}
              status={status}
            />
            <RecipePanel
              handleFridgeRecommend={handleFridgeRecommend}
              loading={loading}
              error={error}
              recipes={recipes}
            />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;