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
              explanation: { type: Type.STRING }
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
              left: { type: Type.STRING, description: "Vế A (VD: Tên họa sĩ, Khái niệm)" },
              right: { type: Type.STRING, description: "Vế B tương ứng (VD: Tác phẩm, Định nghĩa)" }
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
                  correctCategory: { type: Type.STRING }
                },
                required: ["id", "content", "correctCategory"]
              }
            }
          },
          required: ["categories", "items"]
        };
        break;
    }

    const systemInstruction = `Bạn là chuyên gia giáo dục Mỹ thuật bậc THCS. 
    Hãy tạo nội dung bài tập chất lượng cao, mang tính giáo dục và thẩm mỹ. 
    Chủ đề: ${topic}. Hình thức: ${type}.
    Yêu cầu: 
    - Nội dung phải chính xác về kiến thức Mỹ thuật (màu sắc, bố cục, lịch sử).
    - Các phương án sai phải có tính gây nhiễu cao.
    - Ngôn ngữ: Tiếng Việt chuẩn mực.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: `Tạo bài tập chi tiết cho chủ đề: ${topic}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    return JSON.parse(response.text);
  }

  async generateIllustrativeImage(topic: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A beautiful, high-quality artistic cover illustration for a middle school art lesson about: ${topic}. Vibrant colors, professional art style, clean composition.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Image gen failed", e);
    }
    return null;
  }
}
