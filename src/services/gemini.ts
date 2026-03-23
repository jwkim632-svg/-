import { GoogleGenAI, Type } from "@google/genai";

export interface Quote {
  text: string;
  author: string;
  category: string;
  explanation: string;
}

const getAiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using fallback data.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "dummy-key" });
};

export async function generateDailyQuote(): Promise<Quote> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      text: "어제보다 나은 내일이 아닌, 오늘보다 행복한 지금을 사세요.",
      author: "인생의 지혜",
      category: "행복",
      explanation: "미래를 위해 현재를 희생하기보다 지금 이 순간의 소중함을 깨닫는 것이 진정한 행복의 시작입니다."
    };
  }

  const ai = getAiInstance();
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

export async function generateQuoteImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a minimalist, atmospheric, and artistic background image for a quote. 
            Theme: ${prompt}. 
            Style: Cinematic, soft lighting, deep shadows, high quality, 4k, abstract or nature-inspired. 
            No text in the image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
