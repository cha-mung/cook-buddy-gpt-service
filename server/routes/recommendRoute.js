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
  // __dirname 설정 (ESM)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Firebase 초기화
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
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId 누락" });
    }

    // ✅ Firebase에서 냉장고 재료 불러오기
    let fridgeIngredients = [];
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

    // ✅ 로컬 레시피 불러오기
    const dataPath = path.join(process.cwd(), "server", "data", "recipes.json");
    let localRecipes = [];
    try {
      const raw = fs.readFileSync(dataPath, "utf-8");
      localRecipes = JSON.parse(raw);
    } catch (err) {
      console.error("❌ 로컬 레시피 로딩 실패:", err);
    }

    // ✅ 필터링: mainIngredients가 fridgeIngredients에 모두 포함
    const filtered = localRecipes.filter(recipe =>
      recipe.mainIngredients.every(ing => fridgeIngredients.includes(ing))
    );

    // ✅ GPT 프롬프트 구성
    const reference = filtered.slice(0, 3).map((r, i) =>
      `${i + 1}. ${r.title} - main: ${r.mainIngredients.join(", ")}, extra: ${r.extraIngredients.join(", ")}`
    ).join("\n");

    const prompt = `
당신은 1인 가구 자취생을 위한 요리 전문가입니다.

다음은 사용자의 냉장고 재료 목록입니다:
${fridgeIngredients.join(", ")}

아래는 참고 가능한 레시피입니다:
${reference || "(참고 레시피 없음)"}

이 재료들을 기반으로 현실적이고 간단한 레시피 3가지를 JSON 배열로 추천하세요.

응답 형식:
[
  {
    "title": "요리 이름",
    "mainIngredients": ["필수 재료1", "재료2"],
    "extraIngredients": ["있으면 좋은 재료1", "재료2"],
    "steps": [
      "1. 조리 도구와 재료를 준비합니다.",
      "2. 중불로 조리하고 불 세기/시간 등을 명확히 안내합니다."
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
