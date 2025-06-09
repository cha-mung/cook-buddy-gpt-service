// server/routes/loginRoute.js
import express from "express";
import admin from "../firebase/admin.js"; // 🔄 Firebase 초기화 모듈 import

const router = express.Router();
const db = admin.database();
const usersRef = db.ref("users");

// ✅ 로그인 전용 라우트 (등록된 사용자만 허용)
router.post("/", async (req, res) => {
  console.log("📩 로그인 요청 도착:", req.body);
  const { userId } = req.body;

  if (!userId) {
    console.log("❗ userId 누락됨");
    return res.status(400).json({ success: false, message: "userId 누락" });
  }

  try {
    const snapshot = await usersRef.child(userId).once("value");

    if (snapshot.exists()) {
      return res.json({ success: true, message: "로그인 성공" });
    } else {
      return res.status(404).json({ success: false, message: "존재하지 않는 사용자입니다. 회원가입을 먼저 해주세요." });
    }
  } catch (err) {
    console.error("❌ 로그인 확인 실패:", err);
    res.status(500).json({ success: false, message: "서버 오류로 로그인 실패" });
  }
});

export default router;
