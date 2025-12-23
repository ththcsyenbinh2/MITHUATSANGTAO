
import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(topic: string, type: InteractionType) {
    const ai = this.getAI();
    // Sử dụng model Flash - Tối ưu nhất cho tài khoản Free
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
              imageUrl: { type: Type.STRING, description: "Link ảnh trực tiếp minh họa từ internet." }
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

    const systemInstruction = `Bạn là trợ lý giáo dục mĩ thuật THCS. 
    Nhiệm vụ: Thiết kế bài tập tương tác cho chủ đề: "${topic}".
    Yêu cầu: Sử dụng Google Search để lấy link ảnh minh họa thực tế (.jpg, .png).
    Nội dung ngắn gọn, súc tích, phù hợp trình độ học sinh lớp 6-9.`;

    const response = await ai.models.generateContent({
      model,
      contents: `Thiết kế bài tập ${type} về "${topic}". Chèn link ảnh minh họa nếu tìm được.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        thinkingConfig: { thinkingBudget: 0 }, // Tắt thinking để tiết kiệm token trên bản Free
        tools: [{ googleSearch: {} }] 
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
          parts: [{ text: `A clean, artistic educational illustration for ${topic}.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Cover image error", e);
    }
    return null;
  }
}
