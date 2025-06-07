import express from "express";

export default function(openai) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { query } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `당신은 자취생 요리 전문가입니다. 사용자가 자연어로 요청한 요리를 가능한 간단하고 현실적인 1인분 기준 JSON 형식으로 작성하세요.
형식:
{
  "title": "요리 이름",
  "ingredients": ["재료1", "재료2"],
  "steps": ["1단계 설명", "2단계 설명"]
}`
          },
          {
            role: "user",
            content: query
          }
        ]
      });

      const message = completion.choices[0].message.content;
      console.log("📦 자연어 응답 원문:", message);

      let recipe;
      try {
        const cleaned = message.replace(/```json|```/g, "").trim();
        recipe = JSON.parse(cleaned);
        if (!recipe.title || !recipe.ingredients || !recipe.steps) throw new Error("형식 오류");
      } catch (err) {
        console.error("❌ JSON 파싱 실패:", err);
        recipe = {
          title: "추천 실패",
          ingredients: [],
          steps: [message]
        };
      }

      res.json({ recipe });
    } catch (err) {
      console.error("❌ GPT API 오류:", err);
      res.status(500).json({
        recipe: {
          title: "레시피 추천 실패",
          ingredients: [],
          steps: ["GPT API 오류가 발생했습니다."]
        }
      });
    }
  });

  return router;
}
