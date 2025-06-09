// server/routes/loginRoute.js
import express from "express";
import admin from "../firebase/admin.js"; // 🔄 Firebase 초기화 모듈 import

const router = express.Router();

const db = admin.database();
const usersRef = db.ref("users");

// ✅ 로그인 + 사용자 등록 확인 라우트
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
