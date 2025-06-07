// client/src/App.js
import { useState } from "react";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");

  const getRecipe = async () => {
    const res = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
    const data = await res.json();
    setRecipe(data.recipe);
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
      <button onClick={getRecipe}>레시피 추천</button>
      <pre>{recipe}</pre>
    </div>
  );
}

export default App;
