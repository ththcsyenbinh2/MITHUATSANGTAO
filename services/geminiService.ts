
import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateContent(topic: string, type: InteractionType) {
    const model = 'gemini-3-flash-preview';
    
    let responseSchema: any;
    let systemInstruction = "Bạn là một chuyên gia giáo dục mĩ thuật bậc THCS tại Việt Nam. Nhiệm vụ của bạn là tạo ra nội dung học tập sáng tạo, chính xác và phù hợp với lứa tuổi.";

    switch (type) {
      case InteractionType.QUIZ:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" }
            },
            required: ["question", "options", "correctAnswer"]
          }
        };
        break;
      case InteractionType.MATCHING:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              left: { type: Type.STRING, description: "Khái niệm hoặc hình ảnh" },
              right: { type: Type.STRING, description: "Định nghĩa hoặc tên gọi tương ứng" }
            },
            required: ["left", "right"]
          }
        };
        break;
      case InteractionType.WORD_DRAG:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              content: { type: Type.STRING, description: "Từ hoặc cụm từ cần kéo" },
              category: { type: Type.STRING, description: "Nhóm phân loại (ví dụ: Màu nóng, Màu lạnh)" }
            },
            required: ["id", "content", "category"]
          }
        };
        break;
      default:
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING }
          }
        };
    }

    const prompt = `Hãy tạo nội dung bài tập cho chủ đề: "${topic}". Hình thức tương tác là: ${type}. 
    Yêu cầu: Nội dung phải mang tính thẩm mĩ, kiến thức chuẩn xác về mĩ thuật Việt Nam và thế giới. 
    Nếu là trắc nghiệm, tạo 5 câu hỏi. Nếu là ghép đôi hoặc phân loại, tạo ít nhất 6 mục.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    return JSON.parse(response.text);
  }

  async generateIllustrativeImage(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional artistic illustration for secondary school art education about: ${prompt}. High quality, vibrant colors, educational style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
}
