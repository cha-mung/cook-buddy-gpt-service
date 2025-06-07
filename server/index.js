// --- 전역 fetch/Headers/FormData polyfill ---
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as BlobModule from 'fetch-blob';
import { FormData, File, Blob as FormBlob } from 'formdata-node';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = BlobModule.Blob || FormBlob; // 둘 다 커버
globalThis.FormData = FormData;
globalThis.File = File;

// --- 서버 세팅 ---
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- OpenAI 클라이언트 인스턴스 ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- API 라우팅 ---
app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "당신은 자취생 요리 전문가입니다. 입력된 재료로 간단하고 현실적인 1인분 요리법을 추천하세요. 요리 이름과 간단한 설명, 조리법 순서로 구성하세요.",
        },
        {
          role: "user",
          content: `재료: ${ingredients}`,
        },
      ],
      temperature: 0.7,
    });

    const message = completion.choices[0].message.content;
    res.json({ recipe: message });
  } catch (err) {
    console.error("❌ GPT API 오류:", err);
    res.status(500).json({ recipe: "레시피 추천에 실패했어요." });
  }
});

// --- 서버 시작 ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
