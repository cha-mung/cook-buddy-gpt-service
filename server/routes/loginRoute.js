// server/routes/loginRoute.js (또는 router 파일 중 하나)
import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// __dirname 대체 (ES 모듈 환경 지원)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Firebase 초기화 (readFileSync 방식 사용)
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, "../firebase/serviceAccountKey.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cook-buddy-3c414-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

const db = admin.database();
const usersRef = db.ref("users");

// ✅ 사용자 등록 라우트
router.post("/", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId 누락" });
  }

  try {
    const snapshot = await usersRef.child(userId).once("value");

    if (snapshot.exists()) {
      return res.json({ success: true, message: "이미 존재하는 사용자" });
    }

    await usersRef.child(userId).set({
      createdAt: new Date().toISOString(),
      fridge: [],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Firebase 저장 실패:", err);
    res.status(500).json({ success: false, message: "Firebase 저장 실패" });
  }
});

export default router;
