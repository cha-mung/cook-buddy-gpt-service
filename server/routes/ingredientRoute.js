import express from "express";
import fs from "fs";
import path from "path";

export default function (openai) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { mainIngredients, extraIngredients } = req.body;

    // 🔹 1. 로컬 레시피 데이터 불러오기
    const dataPath = path.join(process.cwd(), "server", "data", "recipes.json");
    let localRecipes = [];
    try {
      const rawData = fs.readFileSync(dataPath, "utf-8");
      localRecipes = JSON.parse(rawData);
    } catch (err) {
      console.error("❌ 레시피 데이터 로딩 실패:", err);
    }

    // 🔹 2. 사용자 재료와 일치하는 로컬 레시피 추출
    const filtered = localRecipes.filter((recipe) => {
      return recipe.mainIngredients.every(ing => mainIngredients.includes(ing));
    });

    // 🔹 3. 프롬프트 구성 (최대 3개 레시피 포함)
    const reference = filtered.slice(0, 3).map((r, i) =>
      `${i + 1}. ${r.title} - main: ${r.mainIngredients.join(", ")}, extra: ${r.extraIngredients.join(", ")}`
    ).join("\n");

    const prompt = `당신은 1인 가구 자취생을 위한 요리 전문가입니다.\n
다음은 실제 요리 데이터에서 추출한 참고 레시피입니다.\n${reference ? `\n참고 레시피:\n${reference}` : "(참고 레시피 없음)"}\n
이제 사용자 재료에 기반한 새로운 레시피 3가지를 JSON 배열 형식으로 추천하세요.\n
- 응답은 반드시 JSON 배열만 포함하며, 설명 문장이나 번호는 붙이지 마세요.\n- 각 요리는 다음 형식을 따릅니다:
\n\`\`\`json\n[
  {
    "title": "요리 이름",
    "mainIngredients": ["필수 재료1", "재료2"],
    "extraIngredients": ["있으면 좋은 재료1", "재료2"],
    "steps": [
      "1. 조리 도구와 재료를 준비합니다.",
      "2. 중불로 조리하고 불 세기/시간 등을 명확히 안내합니다."
    ]
  },
  ...
]\n\`\`\`\n
사용자 재료:\n- mainIngredients: ${mainIngredients.join(", ")}\n- extraIngredients: ${extraIngredients.join(", ")}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const message = completion.choices[0].message.content;
      console.log("📦 GPT 응답 원문:", message);

      let recipes;
      try {
        const cleaned = message.replace(/```json|```/g, "").trim();
        recipes = JSON.parse(cleaned);
        if (!Array.isArray(recipes)) throw new Error("응답이 배열이 아님");
      } catch (err) {
        console.error("❌ JSON 파싱 실패:", err);
        recipes = [
          {
            title: "추천 실패",
            mainIngredients: [],
            extraIngredients: [],
            steps: [message]
          }
        ];
      }

      res.json({ recipes });
    } catch (err) {
      console.error("❌ GPT API 오류:", err);
      res.status(500).json({
        recipes: [
          {
            title: "레시피 추천 실패",
            mainIngredients: [],
            extraIngredients: [],
            steps: ["GPT API 오류가 발생했습니다."]
          }
        ]
      });
    }
  });

  return router;
}
