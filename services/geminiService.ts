
import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private getAI() {
    const userKey = localStorage.getItem('USER_ARTEDU_API_KEY');
    const apiKey = userKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key không tồn tại. Vui lòng cấu hình trong phần cài đặt.");
    }

    return new GoogleGenAI({ apiKey });
  }

  async generateContent(topic: string, type: InteractionType) {
    const ai = this.getAI();
    // Sử dụng gemini-3-flash-preview để tối ưu tốc độ và hỗ trợ Search Grounding
    const model = 'gemini-3-flash-preview';
    let responseSchema: any;

    const imgDesc = "BẮT BUỘC: Link ảnh trực tiếp (.jpg, .png, .webp) minh họa cho nội dung mĩ thuật này. Tìm kiếm từ Google Search.";

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
              imageUrl: { type: Type.STRING, description: imgDesc }
            },
            required: ["question", "options", "correctAnswer", "explanation", "imageUrl"]
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
              imageUrl: { type: Type.STRING, description: imgDesc }
            },
            required: ["id", "left", "right", "imageUrl"]
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
                  imageUrl: { type: Type.STRING, description: imgDesc }
                },
                required: ["id", "content", "correctCategory", "imageUrl"]
              }
            }
          },
          required: ["categories", "items"]
        };
        break;
    }

    const systemInstruction = `Bạn là chuyên gia Mĩ thuật THCS. 
    NHIỆM VỤ: Thiết kế bài tập tương tác sinh động cho chủ đề "${topic}".
    YÊU CẦU QUAN TRỌNG VỀ HÌNH ẢNH:
    1. Bạn PHẢI sử dụng công cụ Google Search để tìm URL hình ảnh thực tế của các tác phẩm, họa sĩ hoặc phong cách nghệ thuật được nhắc đến.
    2. URL ảnh phải là link trực tiếp (kết thúc bằng .jpg, .png, .webp). Không dùng link trang web chung chung.
    3. Nếu là bài tập về họa sĩ, hãy tìm ảnh chân dung hoặc tác phẩm tiêu biểu của họ.
    4. Trả về kết quả hoàn toàn bằng Tiếng Việt.`;

    const response = await ai.models.generateContent({
      model,
      contents: `Hãy tìm kiếm và thiết kế bài tập ${type} về "${topic}". Đảm bảo mỗi câu hỏi/mục đều có link ảnh minh họa chính xác từ Google Search.`,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        tools: [{ googleSearch: {} }], // Kích hoạt công cụ tìm kiếm để lấy link ảnh thực tế
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
          parts: [{ text: `A professional, colorful educational art header for: ${topic}. High quality, museum style.` }]
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
