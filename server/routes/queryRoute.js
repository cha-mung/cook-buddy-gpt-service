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
            content: `당신은 요리 초보자를 위한 자취 요리 전문가입니다. 사용자의 요청을 바탕으로 다음 조건을 만족하는 **3가지 간단한 1인분 요리**를 JSON 배열로 작성하세요:

- 각 요리는 mainIngredients (필수 재료)와 extraIngredients (있으면 좋은 재료)로 나누어 작성하세요.
- JSON 형식으로 답변하며, 각 요리 단계는 구체적이고 친절하게 설명합니다.
- 각 단계에서 필요한 조리도구, 불 세기, 시간 등의 정보를 포함해 주세요.
- 형식은 다음과 같습니다:

\`\`\`json
[
  {
    "title": "계란볶음밥",
    "mainIngredients": ["밥", "계란"],
    "extraIngredients": ["대파", "간장", "참기름"],
    "steps": [
      "1. 프라이팬을 중불로 달군 후 식용유를 두르고 대파를 볶아 향을 냅니다.",
      "2. 계란을 넣고 스크램블한 뒤 밥을 넣고 함께 볶습니다.",
      "3. 간장으로 간을 하고 마지막에 참기름을 한 바퀴 둘러 마무리합니다."
    ]
  },
  ...
]
\`\`\`

요청: ${query}`
          }
        ]
      });

      const message = completion.choices[0].message.content;
      console.log("📦 자연어 응답 원문:", message);

      let recipes = [];
      try {
        const cleaned = message.replace(/```json|```/g, "").trim();
        recipes = JSON.parse(cleaned);
        if (!Array.isArray(recipes)) throw new Error("배열 형식이 아님");
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
