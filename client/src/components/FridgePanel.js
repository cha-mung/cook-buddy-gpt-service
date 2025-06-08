import React from "react";
import "./FridgePanel.css";

function FridgePanel({
  ingredientInput,
  setIngredientInput,
  ingredients,
  mustHave,
  toggleMustHave,
  handleAddIngredient,
  handleRemoveIngredient,
  status,
}) {
  return (
    <div className="fridge-container">
      <h2>🧊 내 냉장고</h2>

      <div className="fridge-input">
        <input
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          placeholder="예: 계란, 양파"
        />
        <button onClick={handleAddIngredient}>추가</button>
        <p>{status}</p>
      </div>

      <div className="fridge-grid">
        {ingredients.map((ing, i) => {
          const isSelected = mustHave.includes(ing);
          return (
            <div
              key={i}
              className={`fridge-box ${isSelected ? "selected" : ""}`}
              onClick={() => toggleMustHave(ing)}
            >
              {isSelected && <span className="star">⭐</span>}
              <span>{ing}</span>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveIngredient(ing);
                }}
              >
                ❌
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FridgePanel;
