import { GoogleGenAI, Type } from "@google/genai";
import { InteractionType } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization using process.env.API_KEY as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(topic: string, type: InteractionType) {
    const model = 'gemini-3-flash-preview';
    let responseSchema: any;

    // Define schema based on interaction type
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
              imageUrl: { type: Type.STRING, description: "Link ảnh minh họa thực tế tìm được từ Google Search" }
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
              left: { type: Type.STRING, description: "Nội dung cột trái (Ví dụ: Tên tác phẩm)" },
              right: { type: Type.STRING, description: "Nội dung cột phải tương ứng (Ví dụ: Tên họa sĩ)" },
              imageUrl: { type: Type.STRING, description: "Link ảnh minh họa cho mục này nếu có" }
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

    const systemInstruction = `Bạn là chuyên gia giáo dục Mỹ thuật THCS. 
    Nhiệm vụ: Tạo bài tập bài bản về chủ đề "${topic}".
    Yêu cầu ĐẶC BIỆT: Sử dụng Google Search để tìm link hình ảnh (URL) THỰC TẾ của các tác phẩm nghệ thuật, tranh vẽ, chân dung họa sĩ liên quan đến câu hỏi.
    Nếu không tìm được link chính xác, hãy bỏ trống trường imageUrl.
    Nội dung bằng Tiếng Việt, chuyên sâu, thẩm mỹ.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: `Hãy tạo bài tập hình thức ${type} cho chủ đề: ${topic}. Hãy tìm và chèn link ảnh thực tế cho các câu hỏi nếu cần minh họa.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        tools: [{ googleSearch: {} }] 
      }
    });

    // Return the generated data and grounding chunks (mandatory when using googleSearch)
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
          parts: [{ text: `A vibrant, professional artistic cover for an art education lesson about: ${topic}. Fine art style, clean, educational.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      // Correctly iterate through parts to find the image as per guidelines
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    } catch (e) {
      console.error("Cover image generation failed", e);
    }
    return null;
  }
}
