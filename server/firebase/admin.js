// firebase/admin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, "./serviceAccountKey.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cook-buddy-3c414-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

export default admin;
