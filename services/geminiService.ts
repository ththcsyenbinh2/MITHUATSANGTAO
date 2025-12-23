import { GoogleGenAI, SchemaType } from "@google/genai";
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

  /**
   * Hàm tạo URL ảnh từ từ khóa.
   * Sử dụng dịch vụ Pollinations.ai để tạo ảnh minh họa nghệ thuật dựa trên mô tả.
   */
  private generateSafeImageUrl(keyword: string): string {
    if (!keyword) return "";
    // Thêm các từ khóa phụ để định hướng phong cách ảnh đẹp hơn
    const prompt = encodeURIComponent(`${keyword}, artistic style, high quality, educational illustration`);
    // nologo=true để bỏ logo, seed ngẫu nhiên để ảnh đổi mới mỗi lần
    const randomSeed = Math.floor(Math.random() * 1000);
    return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${randomSeed}`;
  }

  /**
   * Hàm đệ quy để duyệt qua object JSON trả về.
   * Nếu tìm thấy trường 'imageKeyword', nó sẽ tạo thêm trường 'imageUrl'.
   */
  private enrichDataWithImages(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.enrichDataWithImages(item));
    } else if (typeof data === 'object' && data !== null) {
      // Nếu có từ khóa ảnh, tạo link ảnh thật
      if (data.imageKeyword) {
        data.imageUrl = this.generateSafeImageUrl(data.imageKeyword);
      }
      
      // Duyệt tiếp các thuộc tính con
      for (const key in data) {
        if (typeof data[key] === 'object') {
          data[key] = this.enrichDataWithImages(data[key]);
        }
      }
    }
    return data;
  }

  async generateContent(topic: string, type: InteractionType) {
    const ai = this.getAI();
    // Sử dụng model ổn định 1.5 Flash (bản 3 preview thường chưa ổn định public)
    const model = 'gemini-1.5-flash'; 
    
    // Định nghĩa Schema chung cho thuộc tính hình ảnh
    // Thay vì xin URL, ta xin TỪ KHÓA (keyword)
    const imageKeywordSchema = { 
      type: SchemaType.STRING, 
      description: "Từ khóa tiếng Anh ngắn gọn mô tả hình ảnh minh họa (ví dụ: 'Renaissance Mona Lisa painting')." 
    };

    let responseSchema: any;

    switch (type) {
      case InteractionType.QUIZ:
        responseSchema = {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              correctAnswer: { type: SchemaType.INTEGER },
              explanation: { type: SchemaType.STRING },
              imageKeyword: imageKeywordSchema // Xin từ khóa thay vì link
            },
            required: ["question", "options", "correctAnswer", "explanation", "imageKeyword"]
          }
        };
        break;

      case InteractionType.MATCHING:
      case InteractionType.PAIRING:
        responseSchema = {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              left: { type: SchemaType.STRING },
              right: { type: SchemaType.STRING },
              imageKeyword: imageKeywordSchema
            },
            required: ["id", "left", "right", "imageKeyword"]
          }
        };
        break;

      case InteractionType.IMAGE_DRAG:
      case InteractionType.WORD_DRAG:
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            categories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  content: { type: SchemaType.STRING },
                  correctCategory: { type: SchemaType.STRING },
                  imageKeyword: imageKeywordSchema
                },
                required: ["id", "content", "correctCategory", "imageKeyword"]
              }
            }
          },
          required: ["categories", "items"]
        };
        break;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Đóng vai giáo viên mĩ thuật. Tạo bài tập ${type} về chủ đề "${topic}".
        QUAN TRỌNG: 
        1. Nội dung tiếng Việt.
        2. Trường 'imageKeyword': Phải viết bằng TIẾNG ANH, mô tả cụ thể chủ thể cần minh họa để AI vẽ hình.`,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        }
      });

      // Lấy text JSON thô
      const rawText = response.text();
      if (!rawText) throw new Error("Không nhận được phản hồi từ AI");

      // Parse JSON
      let parsedData = JSON.parse(rawText);

      // Tự động điền link ảnh vào dữ liệu dựa trên keyword
      parsedData = this.enrichDataWithImages(parsedData);

      return {
        data: parsedData,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };

    } catch (error) {
      console.error("Lỗi khi sinh nội dung:", error);
      throw error; // Ném lỗi để UI xử lý
    }
  }

  async generateIllustrativeImage(topic: string) {
    try {
      const ai = this.getAI();
      // Sử dụng model Imagen 3 (nếu tài khoản hỗ trợ) hoặc model vision phù hợp
      // Lưu ý: gemini-2.5-flash-image có thể chưa khả dụng với mọi key, fallback về prompt url nếu cần
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash', // Dùng flash để lấy prompt mô tả ảnh bìa
        contents: `Mô tả một bức tranh nghệ thuật đẹp về chủ đề: ${topic}. Chỉ trả về nội dung mô tả bằng tiếng Anh, không giải thích gì thêm.`,
      });
      
      const prompt = response.text();
      // Dùng chung cơ chế Pollinations để tạo ảnh bìa (nhanh và đẹp)
      return this.generateSafeImageUrl(prompt || topic);

    } catch (e) {
      console.error("Cover generation failed", e);
      // Fallback: Tạo ảnh đơn giản từ tên topic
      return this.generateSafeImageUrl(topic);
    }
  }
}
