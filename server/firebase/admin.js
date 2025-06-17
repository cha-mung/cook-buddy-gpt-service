// firebase/admin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// env 에 JSON.stringify된 서비스 계정 키가 들어 있어야 합니다.
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
} catch (err) {
  console.error("❌ FIREBASE_ADMIN_KEY 파싱 실패:", err);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  
}

export default admin;
