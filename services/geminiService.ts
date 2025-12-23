
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string) => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("Vui lòng cấu hình API Key trong phần cài đặt!");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      systemInstruction: "Bạn là một giáo viên Mĩ thuật bậc THCS tại Việt Nam. Hãy trả lời học sinh một cách truyền cảm hứng, ngắn gọn và giàu hình ảnh."
    }
  });

  return response.text;
};

export const generateQuizFromTopic = async (topic: string) => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo 3 câu hỏi trắc nghiệm về chủ đề mĩ thuật: ${topic}. Trả lời dưới dạng JSON array.`,
        config: {
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text || "[]");
}
