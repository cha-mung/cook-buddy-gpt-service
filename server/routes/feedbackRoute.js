import express from "express";
import admin from "../firebase/admin.js";

const router = express.Router();
const db = admin.database();
const feedbackRef = db.ref("feedbacks");

router.post("/", async (req, res) => {
  const { userId, feedback } = req.body;

  if (!userId || !feedback) {
    return res.status(400).json({ success: false, message: "userId 또는 feedback 누락" });
  }

  try {
    const timestamp = new Date().toISOString();
    const newFeedbackRef = feedbackRef.push(); // 새 피드백 노드 생성
    await newFeedbackRef.set({
      userId,
      feedback,
      timestamp,
    });

    console.log(`📬 [${userId}] 피드백 저장됨`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ 피드백 저장 실패:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

export default router;
