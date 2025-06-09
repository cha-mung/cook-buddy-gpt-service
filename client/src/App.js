import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import FridgePanel from "./components/FridgePanel";
import RecipePanel from "./components/RecipePanel";
import { logVisitor } from "./utils/visitorLogger";
import serviceImage from "./image/service-image.png";

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

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchFridge(userId);
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.ip && window.ip !== "null") {
        logVisitor(window.ip);
        clearInterval(interval); // 한 번만 실행
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
    fetchFridge(id);
    setStatus("");
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
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://cook-buddy-gpt-service.onrender.com");
      const res = await fetch(`${API_URL}/api/fridge/${uid}`);
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
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://cook-buddy-gpt-service.onrender.com");
      const res = await fetch(`${API_URL}/api/fridge/add`, {
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
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://cook-buddy-gpt-service.onrender.com");
      const res = await fetch(`${API_URL}/api/fridge/remove`, {
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
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://cook-buddy-gpt-service.onrender.com");

      const res = await fetch(`${API_URL}/api/recommend`, {
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

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://cook-buddy-gpt-service.onrender.com");

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, feedback: feedbackText }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackSent(true);
        setFeedbackText("");
        setTimeout(() => setFeedbackSent(false), 3000);
      }
    } catch (err) {
      console.error("❌ 피드백 전송 실패", err);
    }
  };

  return (
    <div className="App-wrapper">
      <div className="App-background" />
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">🍽️ Cook Buddy</h1>
          <p className="App-subtitle">
            냉장고엔 재료가 있는데, 요리는 떠오르지 않을 때? <br />
            Cook Buddy가 메뉴 고민을 끝내드립니다!
          </p>
        </header>

        {!userId ? (
          <main className="App-loginSection">
            <Login onLogin={handleLogin} />
            <div className="App-description">
              <h2>Cook Buddy란?</h2>
              <p>
                자취생을 위한 맞춤형 요리 레시피 추천 서비스입니다. <br />
                냉장고 속 재료를 기반으로 가능한 레시피를 추천해드려요. <br />
                오늘 어떤 요리를 할지 고민이라면, 지금 시작해보세요!
              </p>
              <div className="App-exampleImageWrapper">
                <img
                  src={serviceImage}
                  alt="Cook Buddy 예시 화면"
                  className="App-exampleImage"
                />
                <p className="App-imageCaption">예시 화면: 냉장고 재료 기반 추천 결과</p>
              </div>
            </div>
          </main>
        ) : (
          <main className="App-main">
            <div className="App-userBar">
              <span><b>👤 사용자:</b> {userId}</span>
              <button onClick={() => setShowFeedback(!showFeedback)}>피드백</button>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
            {showFeedback && (
              <div className="App-feedbackForm">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="서비스에 대한 피드백을 남겨주세요!"
                />
                <div className="App-feedbackButtons">
                  <button onClick={handleSendFeedback}>제출</button>
                  <button onClick={() => setShowFeedback(false)} className="App-closeButton">닫기</button>
                </div>
                {feedbackSent && <p className="App-feedbackSuccess">감사합니다! 피드백이 전송되었습니다.</p>}
              </div>
            )}


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
    </div>
  );
}

export default App;
