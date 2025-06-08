import { useState } from "react";
import "./App.css";

function App() {
  const [mainIngredients, setMainIngredients] = useState("");
  const [extraIngredients, setExtraIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecipeByIngredients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainIngredients: mainIngredients.split(",").map(i => i.trim()),
          extraIngredients: extraIngredients.split(",").map(i => i.trim()),
        }),
      });
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      setRecipes([{ title: "오류", steps: ["서버 요청에 실패했습니다."] }]);
    }
    setLoading(false);
  };

  // 자연어 부분 동일
  const getRecipeByQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipe/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setQueryResult(data.recipes || []);
    } catch (err) {
      setQueryResult([
        {
          title: "오류",
          ingredients: [],
          steps: ["자연어 요청 실패"],
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Cook Buddy 🍳</h1>

      {/* 재료 기반 입력 */}
      <h2>🥬 재료로 추천받기</h2>
      <input
        type="text"
        placeholder="꼭 필요한 재료 (예: 계란, 밥)"
        value={mainIngredients}
        onChange={(e) => setMainIngredients(e.target.value)}
      />
      <input
        type="text"
        placeholder="있으면 좋은 재료 (예: 김치, 참기름)"
        value={extraIngredients}
        onChange={(e) => setExtraIngredients(e.target.value)}
      />
      <button onClick={getRecipeByIngredients}>재료 기반 추천</button>

      {/* 자연어 입력 동일 */}
      {/* <h2>🗣️ 자연어로 요청하기</h2>
      <input
        type="text"
        placeholder="예: 간단한 김치볶음밥 알려줘"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={getRecipeByQuery}>자연어로 요청</button> */}

      {loading && <p>⏳ 레시피 생성 중...</p>}

      {/* 재료 기반 출력 */}
      {recipes.length > 0 && (
        <div>
          <h3>🔍 재료 기반 추천 결과</h3>
          {recipes.map((r, idx) => (
            <div key={idx}>
              <h4>{r.title}</h4>
              <p><strong>Main:</strong> {r.mainIngredients.join(", ")}</p>
              <p><strong>Extra:</strong> {r.extraIngredients.join(", ")}</p>
              <ol>
                {(r.steps || []).map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* 자연어 기반 출력 */}
      {/* {queryResult.length > 0 && (
        <div>
          <h3>💬 자연어 추천 결과</h3>
          {queryResult.map((r, idx) => (
             <div key={idx}>
              <h4>{r.title}</h4>
              <p><strong>Main:</strong> {(r.mainIngredients || []).join(", ")}</p>
              {r.extraIngredients && r.extraIngredients.length > 0 ? (
                <p><strong>Extra:</strong> {r.extraIngredients.join(", ")}</p>
              ) : (
                <p><strong>Extra:</strong> 없음</p>
              )}
              <ol>
                {(r.steps || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}

export default App;
