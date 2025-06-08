import React from "react";
import "./RecipePanel.css";

function RecipePanel({ handleFridgeRecommend, loading, error, recipes }) {
  return (
    <div className="recipe-container">
      <h2>🍳 레시피 추천</h2>
      <button onClick={handleFridgeRecommend} disabled={loading}>
        냉털 레시피 추천받기
      </button>
      {loading && <p>⏳ 추천 중입니다...</p>}
      {error && <p className="recipe-error">{error}</p>}

      {recipes.length > 0 && (
        <div className="recipe-list">
          {recipes.map((r, idx) => (
            <div key={idx} className="recipe-card">
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
  );
}

export default RecipePanel;
