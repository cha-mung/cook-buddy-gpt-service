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
      <h2>냉장고 속 재료</h2>

      <div className="fridge-input">
        <p className="input-explain">재료를 입력하세요. <br/>
        재료를 누르면 필수재료로 선택됩니다</p>
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
