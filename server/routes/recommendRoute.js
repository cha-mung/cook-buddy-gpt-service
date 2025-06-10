// server/routes/recommendRoute.js
import express from "express";
import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

export default function (openai) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(__dirname, "../firebase/serviceAccountKey.json");
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  const db = admin.database();
  const usersRef = db.ref("users");

  router.post("/", async (req, res) => {
  const {
    userId,
    mustHaveIngredients = [],
    ingredients = [], // ✅ 게스트용 재료 직접 입력 받기
  } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId 누락" });
  }

  let fridgeIngredients = [];

  if (userId === "guest") {
    // ✅ 게스트는 재료를 body에서 직접 사용
    fridgeIngredients = ingredients;
    if (!fridgeIngredients.length) {
      return res.json({
        recipes: [{
          title: "재료가 없습니다",
          mainIngredients: [],
          extraIngredients: [],
          steps: ["기본 재료를 전달하지 않아 추천할 수 없습니다."]
        }]
      });
    }
  } else {
    // ✅ 로그인 사용자는 Firebase에서 재료 조회
    try {
      const snapshot = await usersRef.child(userId).child("fridge").once("value");
      fridgeIngredients = snapshot.val() || [];

      if (!fridgeIngredients.length) {
        return res.json({
          recipes: [{
            title: "냉장고에 재료가 없습니다",
            mainIngredients: [],
            extraIngredients: [],
            steps: ["Firebase에서 해당 유저의 재료 정보를 찾을 수 없습니다."]
          }]
        });
      }
    } catch (err) {
      console.error("❌ Firebase 조회 오류:", err);
      return res.status(500).json({
        recipes: [{
          title: "추천 실패",
          mainIngredients: [],
          extraIngredients: [],
          steps: ["Firebase에서 데이터를 불러오지 못했습니다."]
        }]
      });
    }
  }

    // ✅ 로컬 레시피 불러오기
    const dataPath = path.resolve(__dirname, "../data/recipes.json");
    let localRecipes = [];
    try {
      const raw = fs.readFileSync(dataPath, "utf-8");
      localRecipes = JSON.parse(raw);
      console.log("레시피 데이터 불러오기");
    } catch (err) {
      console.error("❌ 로컬 레시피 로딩 실패:", err);
    }

    // ✅ 필터링: mainIngredients는 모두 fridge에 있고, mustHaveIngredients도 모두 포함
    const filtered = localRecipes.filter(recipe => {
      const hasAllMain = recipe.mainIngredients.every(ing => fridgeIngredients.includes(ing));
      const includesMustHave = mustHaveIngredients.every(must =>
        [...recipe.mainIngredients, ...recipe.extraIngredients].includes(must)
      );
      return hasAllMain && includesMustHave; // ✅ 필수 재료 포함 조건 추가됨
    });

    const reference = filtered.slice(0, 3).map((r, i) =>
      `${i + 1}. ${r.title} - main: ${r.mainIngredients.join(", ")}, extra: ${r.extraIngredients.join(", ")}`
    ).join("\n");

    // ✅ GPT 프롬프트 구성 - 필수 재료 포함 조건 명시
    const prompt = `
당신은 1인 가구 자취생을 위한 요리 전문가입니다.

다음은 사용자의 냉장고 재료 목록입니다:
${fridgeIngredients.join(", ")}

사용자가 반드시 포함하고 싶은 재료:
${mustHaveIngredients.length ? mustHaveIngredients.join(", ") : "(없음)"}

아래는 참고 가능한 레시피입니다:
${reference || "(참고 레시피 없음)"}

다음 조건을 반드시 지키세요:

1. 냉장고 재료 목록에 없는 재료는 절대 포함하지 마세요.
2. 반드시 위에서 사용자가 선택한 재료를 포함하세요.
3. 현실적이고 간단한 1인분 레시피 3개를 추천하세요.
4. 3개의 레시피는 가능한 서로 다른 요리 방식으로 구성하세요.
5. JSON 배열 형식으로만 응답하세요. 설명/주석 절대 포함 금지.

형식 예시:
[
  {
    "title": "오이 닭가슴살 볶음",
    "mainIngredients": ["오이", "닭가슴살"],
    "extraIngredients": [],
    "steps": [
      "오이와 닭가슴살을 얇게 썬다.",
      "기름 없이 중불로 5분간 볶는다."
    ]
  }
]
`.trim();

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const message = completion.choices[0].message.content;
      let recipes;
      try {
        const cleaned = message.replace(/```json|```/g, "").trim();
        recipes = JSON.parse(cleaned);
        if (!Array.isArray(recipes)) throw new Error("응답이 배열이 아님");
      } catch (err) {
        console.error("❌ GPT JSON 파싱 실패:", err);
        recipes = [{
          title: "추천 실패",
          mainIngredients: [],
          extraIngredients: [],
          steps: [message]
        }];
      }

      res.json({ recipes });
    } catch (err) {
      console.error("❌ GPT 요청 실패:", err);
      res.status(500).json({
        recipes: [{
          title: "추천 실패",
          mainIngredients: [],
          extraIngredients: [],
          steps: ["GPT 추천 요청 중 오류가 발생했습니다."]
        }]
      });
    }
  });

  return router;
}
