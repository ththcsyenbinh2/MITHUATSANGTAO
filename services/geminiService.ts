
import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private getAI() {
    // Luôn tạo instance mới để đảm bảo sử dụng API Key mới nhất từ process.env.API_KEY
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(topic: string, type: InteractionType) {
    const ai = this.getAI();
    // Sử dụng gemini-3-pro-preview để tối ưu khả năng tìm kiếm và xử lý dữ liệu phức tạp
    const model = 'gemini-3-pro-preview';
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
              imageUrl: { type: Type.STRING, description: "BẮT BUỘC: Link ảnh trực tiếp (.jpg, .png) minh họa cho nội dung mĩ thuật." }
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
              imageUrl: { type: Type.STRING, description: "Link ảnh minh họa trực tiếp." }
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

    const systemInstruction = `Bạn là một chuyên gia mĩ thuật THCS. 
    Nhiệm vụ: Thiết kế bài tập giáo dục mĩ thuật cho chủ đề: "${topic}".
    YÊU CẦU QUAN TRỌNG:
    1. Sử dụng công cụ Google Search để tìm URL ẢNH THỰC TẾ (phải là link trực tiếp đến file ảnh .jpg, .png, .webp).
    2. Ưu tiên các nguồn: Wikimedia Commons, các trang bảo tàng nghệ thuật chính thống.
    3. Trả về bài tập dưới dạng Tiếng Việt chuyên sâu, hấp dẫn.`;

    const response = await ai.models.generateContent({
      model,
      contents: `Tạo bài tập mĩ thuật chủ đề "${topic}" hình thức ${type}. Chèn các link ảnh thực tế minh họa tác phẩm hoặc họa sĩ liên quan.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
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
          parts: [{ text: `A professional, inspiring header for an art lesson about ${topic}. High resolution, artistic mood.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Cover image gen failed", e);
    }
    return null;
  }
}
