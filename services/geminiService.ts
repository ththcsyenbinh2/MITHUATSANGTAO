import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(topic: string, type: InteractionType) {
    // Sử dụng gemini-3-pro-preview cho các tác vụ phức tạp cần tìm kiếm thông tin chính xác
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
              imageUrl: { type: Type.STRING, description: "BẮT BUỘC: Link ảnh trực tiếp (.jpg, .png) từ Wikimedia, Pinterest hoặc bảo tàng minh họa cho tác phẩm/họa sĩ được nhắc đến." }
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
              left: { type: Type.STRING, description: "Cột A: Tên tác phẩm hoặc đặc điểm" },
              right: { type: Type.STRING, description: "Cột B: Tên họa sĩ hoặc định nghĩa tương ứng" },
              imageUrl: { type: Type.STRING, description: "Link ảnh minh họa trực tiếp cho cặp này." }
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
                  imageUrl: { type: Type.STRING, description: "Link ảnh minh họa trực tiếp." }
                },
                required: ["id", "content", "correctCategory"]
              }
            }
          },
          required: ["categories", "items"]
        };
        break;
    }

    const systemInstruction = `Bạn là một chuyên gia mĩ thuật hàng đầu. 
    Nhiệm vụ: Thiết kế bài tập giáo dục mĩ thuật THCS cho chủ đề: "${topic}".
    YÊU CẦU QUAN TRỌNG VỀ HÌNH ẢNH:
    1. Sử dụng công cụ Google Search để tìm URL ẢNH TRỰC TIẾP (kết thúc bằng .jpg, .png, .webp).
    2. Ưu tiên các nguồn: Wikimedia Commons, các bảo tàng lớn (Louvre, Met), Pinterest (link ảnh gốc).
    3. Đảm bảo ảnh phản ánh đúng tác phẩm hoặc họa sĩ được nhắc tới.
    4. Nếu là bài tập trắc nghiệm về phong cách, hãy tìm ảnh tiêu biểu cho phong cách đó.
    5. Nội dung bài tập phải mang tính chuyên môn cao, ngôn ngữ Tiếng Việt chuẩn mực.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: `Tạo bài tập mĩ thuật chuyên sâu chủ đề "${topic}" dưới dạng ${type}. Hãy tìm và chèn ít nhất 3-5 link ảnh thực tế chất lượng cao.`,
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
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality, professional artistic banner image for a middle school art lesson about: ${topic}. Soft lighting, artistic materials, vibrant colors, educational and inspirational.` }]
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
