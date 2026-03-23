import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Quote {
  text: string;
  author: string;
  category: string;
  explanation: string;
}

export async function generateDailyQuote(): Promise<Quote> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a deeply inspiring and meaningful "Life Quote" in Korean. 
  The quote should be one sentence long. 
  Provide an author (if it's an original AI quote, say "AI Wisdom"), a category, and a brief 1-2 sentence explanation of why this quote is meaningful.
  
  Return the result in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            author: { type: Type.STRING },
            category: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["text", "author", "category", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as Quote;
  } catch (error) {
    console.error("Error generating quote:", error);
    return {
      text: "어제보다 나은 내일이 아닌, 오늘보다 행복한 지금을 사세요.",
      author: "인생의 지혜",
      category: "행복",
      explanation: "미래를 위해 현재를 희생하기보다 지금 이 순간의 소중함을 깨닫는 것이 진정한 행복의 시작입니다."
    };
  }
}
