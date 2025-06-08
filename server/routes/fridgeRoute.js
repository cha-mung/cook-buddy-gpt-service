// server/routes/fridgeRoute.js
import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export default function () {
  const router = express.Router();

  // __dirname 계산
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Firebase 초기화 (sync 방식으로 JSON 로드)
  if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(__dirname, "../firebase/serviceAccountKey.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  const db = admin.database();
  const usersRef = db.ref("users");

  // ✅ 냉장고에 재료 추가
  router.post("/add", async (req, res) => {
    const { userId, ingredients } = req.body;

    if (!userId || !Array.isArray(ingredients)) {
        return res.status(400).json({
        success: false,
        message: "userId와 재료 배열이 필요합니다."
        });
    }

    try {
      const userRef = usersRef.child(userId);
      const snapshot = await userRef.once("value");
      const existingData = snapshot.val() || {};
      const existingIngredients = Array.isArray(existingData.fridge) ? existingData.fridge : [];

      const newIngredients = [...new Set([...existingIngredients, ...ingredients])];

      await userRef.update({ fridge: newIngredients });

      res.json({
        success: true,
        fridge: newIngredients,
        message: "재료가 냉장고에 추가되었습니다."
        });
    } catch (error) {
      console.error("❌ Firebase 저장 실패:", error);
              return res.status(500).json({
                success: false,
                message: "Firebase에 재료 추가 실패."
                });
    }
  });

  // ✅ 냉장고 재료 조회
  router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
      const snapshot = await usersRef.child(userId).child("fridge").once("value");
      const ingredients = snapshot.val() || [];

      res.json({ ingredients });
    } catch (error) {
      console.error("❌ Firebase 조회 실패:", error);
      res.status(500).json({ message: "재료 조회 실패" });
    }
  });
    // ✅ 냉장고 재료 삭제
    router.post("/remove", async (req, res) => {
    const { userId, ingredient } = req.body;

    if (!userId || !ingredient) {
        return res.status(400).json({
        success: false,
        message: "userId와 삭제할 ingredient가 필요합니다."
        });
    }

    try {
        const userRef = usersRef.child(userId);
        const snapshot = await userRef.once("value");
        const existingData = snapshot.val() || {};
        const existingIngredients = Array.isArray(existingData.fridge) ? existingData.fridge : [];

        const updatedIngredients = existingIngredients.filter(item => item !== ingredient);

        await userRef.update({ fridge: updatedIngredients });

        res.json({
        success: true,
        fridge: updatedIngredients,
        message: "재료가 삭제되었습니다."
        });
    } catch (error) {
        console.error("❌ Firebase 삭제 실패:", error);
        res.status(500).json({
        success: false,
        message: "Firebase에서 재료 삭제 실패."
        });
    }
    });
  return router;
}
