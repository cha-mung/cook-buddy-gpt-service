import express from "express";

export default function(openai) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { ingredients } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `당신은 자취생 요리 전문가입니다. 아래 형식에 맞춰 JSON 배열로 3가지 1인분 요리를 추천하세요.
[
  {
    "title": "요리 이름",
    "ingredients": ["재료1", "재료2"],
    "steps": ["1단계 설명", "2단계 설명"]
  },
  ...
]`
          },
          {
            role: "user",
            content: `재료: ${ingredients}`
          }
        ]
      });

      const message = completion.choices[0].message.content;
      console.log("📦 GPT 응답 원문:", message);

      let recipes;
      try {
        const cleaned = message.replace(/```json|```/g, "").trim();
        const merged = cleaned.replace(/]\s*\[/g, ",");
        const fixed = `[${merged.replace(/^\[|\]$/g, "")}]`;

        recipes = JSON.parse(fixed);
        if (!Array.isArray(recipes)) throw new Error("응답이 배열이 아님");
      } catch (err) {
        console.error("❌ JSON 파싱 실패:", err);
        recipes = [
          {
            title: "추천 실패",
            ingredients: [],
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
            ingredients: [],
            steps: ["GPT API 오류가 발생했습니다."]
          }
        ]
      });
    }
  });

  return router;
}
