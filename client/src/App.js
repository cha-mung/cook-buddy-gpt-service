// client/src/App.js
import { useState } from "react";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRecipeByIngredients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      setRecipes([{ title: "오류", steps: ["서버 요청에 실패했습니다."] }]);
    }
    setLoading(false);
  };

  const getRecipeByQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipe/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setQueryResult(data.recipe);
    } catch (err) {
      setQueryResult({
        title: "오류",
        steps: ["자연어 요청 실패"],
      });
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Cook Buddy GPT 🍳</h1>

      {/* 재료 기반 입력 */}
      <h2>🥬 재료로 추천받기</h2>
      <input
        type="text"
        placeholder="예: 계란, 대파, 밥"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      <button onClick={getRecipeByIngredients}>재료 기반 추천</button>

      {/* 자연어 기반 입력 */}
      <h2>🗣️ 자연어로 요청하기</h2>
      <input
        type="text"
        placeholder="예: 매콤한 볶음밥 알려줘"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={getRecipeByQuery}>자연어로 요청</button>

      {loading && <p>⏳ 레시피 생성 중...</p>}

      {/* 재료 기반 출력 */}
      {recipes.length > 0 && (
        <div>
          <h3>🔍 재료 기반 추천 결과</h3>
          {recipes.map((r, idx) => (
            <div key={idx}>
              <h4>{r.title}</h4>
              <p><strong>재료:</strong> {r.ingredients.join(", ")}</p>
              <ol>
                {r.steps.map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* 자연어 기반 출력 */}
      {queryResult && (
        <div>
          <h3>💬 자연어 추천 결과</h3>
          <h4>{queryResult.title}</h4>
          <p><strong>재료:</strong> {queryResult.ingredients.join(", ")}</p>
          <ol>
            {queryResult.steps.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;
