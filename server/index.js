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

// --- 서버 및 라우트 관련 ---
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// dotenv는 반드시 OpenAI 전에 불러야 함
dotenv.config();

// OpenAI 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 라우트 import (함수 형태)
import ingredientRoute from './routes/ingredientRoute.js';
import queryRoute from './routes/queryRoute.js';
import RecommendRoute from "./routes/recommendRoute.js";
import loginRoute from "./routes/loginRoute.js";
import fridgeRoute from "./routes/fridgeRoute.js";
import authRoute from "./routes/authRoute.js";
import feedbackRoute from "./routes/feedbackRoute.js";

// 앱 초기화
const app = express();
app.use(cors());
app.use(express.json());

// 라우트에 openai 인스턴스 전달
app.use("/api/recipe", ingredientRoute(openai));
app.use("/api/recipe/query", queryRoute(openai));
app.use("/api/recommend", RecommendRoute(openai));
app.use("/api/login", loginRoute); 
app.use("/api/fridge", fridgeRoute());
app.use("/api/auth", authRoute);
app.use("/api/feedback", feedbackRoute);

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
