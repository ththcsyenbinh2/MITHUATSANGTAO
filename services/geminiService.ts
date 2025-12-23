
import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private getAI() {
    // Ưu tiên lấy key từ trình duyệt người dùng đã nhập
    const userKey = localStorage.getItem('USER_ARTEDU_API_KEY');
    const apiKey = userKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key không tồn tại. Vui lòng cấu hình trong phần cài đặt.");
    }

    return new GoogleGenAI({ apiKey });
  }

  async generateContent(topic: string, type: InteractionType) {
    const ai = this.getAI();
    const model = 'gemini-3-flash-preview';
    let responseSchema: any;

    switch (type) {
      case InteractionType.QUIZ:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              imageUrl: { type: Type.STRING, description: "URL ảnh minh họa trực tiếp." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        };
        break;
      case InteractionType.MATCHING:
      case InteractionType.PAIRING:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              left: { type: Type.STRING },
              right: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["id", "left", "right"]
          }
        };
        break;
      case InteractionType.IMAGE_DRAG:
      case InteractionType.WORD_DRAG:
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  content: { type: Type.STRING },
                  correctCategory: { type: Type.STRING },
                  imageUrl: { type: Type.STRING }
                },
                required: ["id", "content", "correctCategory"]
              }
            }
          },
          required: ["categories", "items"]
        };
        break;
    }

    const response = await ai.models.generateContent({
      model,
      contents: `Hãy đóng vai một giáo viên mĩ thuật chuyên nghiệp. Thiết kế bài tập tương tác ${type} về chủ đề "${topic}" phù hợp học sinh trung học. Tìm link ảnh minh họa thực tế nếu có thể.`,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return {
      data: JSON.parse(response.text),
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  }

  async generateIllustrativeImage(topic: string) {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A vibrant artistic education cover for ${topic}` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Cover generation failed", e);
    }
    return null;
  }
}
