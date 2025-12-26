import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure it is configured.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const explainWordWithAI = async (word: string) => {
  const ai = getAI();
  const prompt = `你是一个小学语文助教，请为词语“${word}”提供拼音和大白话解释。
  要求：
  1. 解释要通俗、生动，多用比喻，适合5岁孩子听。
  请严格以 JSON 格式返回：
  {"pinyin": "拼音内容", "explanation": "解释内容"}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("JSON 解析失败:", e);
    return { pinyin: "", explanation: response.text };
  }
};

export const generateVisualInspiration = async (promptText: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A simple cartoon or sketch for a primary school student to reference: ${promptText}. Simple lines, easy to draw.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateScriptAI = async (topic: string, style: 'humorous' | 'classic' = 'classic') => {
  const ai = getAI();
  const prompt = `基于《牛郎织女》的故事，创作一段适合家长和孩子表演的简短剧本。
  场景：${topic}
  风格：${style === 'humorous' ? '幽默诙谐' : '经典还原'}
  角色：家长（织女/王母）、学生（牛郎）。
  字数限制：200字以内。`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};