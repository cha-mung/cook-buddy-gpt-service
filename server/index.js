// --- 전역 fetch/Headers/FormData polyfill ---
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as BlobModule from 'fetch-blob';
import { FormData, File, Blob as FormBlob } from 'formdata-node';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = BlobModule.Blob || FormBlob;
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
          content: `당신은 자취생 요리 전문가입니다. 아래 형식에 맞춰 JSON 배열로 3가지 1인분 요리를 추천하세요.
[
  {
    "title": "요리 이름",
    "ingredients": ["재료1", "재료2"],
    "steps": ["1단계 설명", "2단계 설명"]
  },
  ...
]`
        },
        {
          role: "user",
          content: `재료: ${ingredients}`
        },
      ]
    });

    const message = completion.choices[0].message.content;
    console.log("📦 GPT 응답 원문:", message); // <-- 응답 확인용 로그

    let recipes;
    try {
      // 마크다운 ```json ``` 제거
      const cleaned = message
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // 여러 배열이 붙어 있는 경우 처리: ][ → ,
      const merged = cleaned.replace(/]\s*\[/g, ',');

      // 전체를 하나의 배열로 묶기
      const fixed = `[${merged.replace(/^\[|\]$/g, '')}]`;

      recipes = JSON.parse(fixed);
      if (!Array.isArray(recipes)) throw new Error("응답이 배열이 아님");
    } catch (err) {
      console.error("❌ JSON 파싱 실패:", err);
      recipes = [
        {
          title: "추천 실패",
          ingredients: [],
          steps: [message]
        }
      ];
    }

    res.json({ recipes });
  } catch (err) {
    console.error("❌ GPT API 오류:", err);
    res.status(500).json({
      recipes: [
        {
          title: "레시피 추천 실패",
          ingredients: [],
          steps: ["GPT API 오류가 발생했습니다."]
        }
      ]
    });
  }
});

// --- 서버 시작 ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
