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
    let systemInstruction = `Bạn là một chuyên gia giáo dục mĩ thuật bậc THCS tại Việt Nam. 
    Nhiệm vụ của bạn là tạo ra nội dung bài tập tương tác sáng tạo, chính xác. 
    Ngôn ngữ sử dụng: Tiếng Việt. 
    Nội dung phải bám sát chương trình giáo dục phổ thông mới của Việt Nam.`;

    switch (type) {
      case InteractionType.QUIZ:
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Chỉ số câu trả lời đúng (0-3)" }
            },
            required: ["question", "options", "correctAnswer"]
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
              left: { type: Type.STRING, description: "Khái niệm, tác giả hoặc tên tác phẩm" },
              right: { type: Type.STRING, description: "Định nghĩa, năm sáng tác hoặc đặc điểm tương ứng" }
            },
            required: ["left", "right"]
          }
        };
        break;
      case InteractionType.WORD_DRAG:
      case InteractionType.IMAGE_DRAG:
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            categories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Tên các nhóm phân loại (ví dụ: 'Màu nóng', 'Màu lạnh')" 
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  content: { type: Type.STRING, description: "Từ ngữ hoặc mô tả hình ảnh cần kéo" },
                  targetCategory: { type: Type.STRING, description: "Tên nhóm đúng cho mục này" }
                },
                required: ["id", "content", "targetCategory"]
              }
            }
          },
          required: ["categories", "items"]
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

    const prompt = `Hãy tạo nội dung bài tập cho chủ đề mĩ thuật: "${topic}". 
    Hình thức tương tác: ${type}.
    Yêu cầu:
    - Nội dung chuyên sâu về mĩ thuật (bố cục, đường nét, màu sắc, lịch sử mĩ thuật).
    - Phù hợp với học sinh trung học cơ sở.
    - Tạo ít nhất 5-6 mục dữ liệu để đảm bảo tính thử thách.`;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
        }
      });

      let text = response.text || '';
      // Cleanup common AI output wrapping
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json/, '').replace(/```$/, '');
      }
      
      return JSON.parse(text);
    } catch (err) {
      console.error("Gemini Content Error:", err);
      throw err;
    }
  }

  async generateIllustrativeImage(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality, professional artistic illustration for Vietnamese secondary school students about art education: ${prompt}. Educational, vibrant, clear artistic elements.` }]
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
    } catch (err) {
      console.warn("Image Generation Error (Non-fatal):", err);
      return null;
    }
    return null;
  }
}
