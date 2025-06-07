// client/src/App.js
import { useState } from "react";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecipe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();

      console.log(data.recipes);
      if (Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
      } else {
        // fallback이 문자열일 경우
        setRecipes([
          {
            title: "추천 실패",
            ingredients: [],
            steps: [data.recipe],
          },
        ]);
      }
    } catch (err) {
      console.error("요청 실패:", err);
      setRecipes([
        {
          title: "요청 실패",
          ingredients: [],
          steps: ["서버 요청 중 오류가 발생했습니다."],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Cook Buddy GPT 🍳</h1>
      <input
        type="text"
        placeholder="예: 계란, 대파, 밥"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      <button onClick={getRecipe} disabled={loading}>
        {loading ? (
          <>
            레시피 생성 중... <span className="spinner"></span>
          </>
        ) : (
          "레시피 추천"
        )}
      </button>

      {recipes.map((r, i) => (
        <div key={i} className="recipe-card">
          <h2>{r.title}</h2>
          {r.ingredients.length > 0 && (
            <p><strong>재료:</strong> {r.ingredients.join(", ")}</p>
          )}
          <ol>
            {r.steps.map((s, j) => (
              <li key={j}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default App;
