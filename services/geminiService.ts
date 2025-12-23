import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { InteractionType } from "../types";

// Tên key lưu trong LocalStorage
const STORAGE_KEY = 'USER_ARTEDU_API_KEY';

export class GeminiService {
  
  /**
   * 1. HÀM CẬP NHẬT API KEY
   * Gọi hàm này khi người dùng nhập Key mới vào ô Input ở giao diện
   */
  updateApiKey(newKey: string): boolean {
    if (newKey && newKey.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY, newKey.trim());
      return true;
    }
    return false;
  }

  /**
   * 2. HÀM LẤY INSTANCE AI
   * Tự động ưu tiên Key người dùng nhập -> Key biến môi trường
   */
  private getAIModel() {
    const userKey = localStorage.getItem(STORAGE_KEY);
    const apiKey = userKey || process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key không tồn tại. Vui lòng nhập Key trong cài đặt.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng model Flash 1.5 ổn định nhất hiện nay
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * 3. HÀM TẠO URL ẢNH TỪ TỪ KHÓA (KHẮC PHỤC LỖI ẢNH CHẾT)
   * Thay vì để AI bịa link, ta dùng service tạo ảnh từ keyword
   */
  private generateSafeImageUrl(keyword: string): string {
    if (!keyword) return "";
    // Thêm prompt phụ để ảnh đẹp và nghệ thuật hơn
    const prompt = encodeURIComponent(`${keyword}, artistic style, educational illustration, high quality, 4k`);
    // Random seed để mỗi lần sinh ra ảnh khác nhau một chút
    const seed = Math.floor(Math.random() * 10000);
    return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;
  }

  /**
   * 4. HÀM XỬ LÝ HẬU KỲ JSON
   * Duyệt qua dữ liệu AI trả về, tìm 'imageKeyword' để tạo 'imageUrl'
   */
  private enrichDataWithImages(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.enrichDataWithImages(item));
    } else if (typeof data === 'object' && data !== null) {
      // Logic chính: Nếu có keyword ảnh -> Tạo link ảnh thật
      if (data.imageKeyword) {
        data.imageUrl = this.generateSafeImageUrl(data.imageKeyword);
      }
      
      // Đệ quy cho các thuộc tính con
      for (const key in data) {
        if (typeof data[key] === 'object') {
          data[key] = this.enrichDataWithImages(data[key]);
        }
      }
    }
    return data;
  }

  /**
   * 5. HÀM CHÍNH: SINH NỘI DUNG BÀI TẬP
   */
  async generateContent(topic: string, type: InteractionType) {
    let model;
    try {
      model = this.getAIModel();
    } catch (e: any) {
      throw new Error("Vui lòng nhập API Key để bắt đầu sử dụng.");
    }

    // Định nghĩa Schema chung cho trường hình ảnh (Xin từ khóa thay vì xin URL)
    const imageKeywordSchema = { 
      type: SchemaType.STRING, 
      description: "Từ khóa tiếng Anh ngắn gọn mô tả hình ảnh minh họa (ví dụ: 'Van Gogh Starry Night painting')." 
    };

    let responseSchema: any;

    // Cấu hình Schema dựa trên loại bài tập
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
              imageKeyword: imageKeywordSchema // <--- Lưu ý: Dùng keyword
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
      // Gọi AI
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: `Đóng vai giáo viên mĩ thuật chuyên nghiệp. Thiết kế bài tập tương tác ${type} về chủ đề "${topic}" phù hợp học sinh trung học.
          
          QUAN TRỌNG:
          1. Nội dung câu hỏi/đáp án: Tiếng Việt.
          2. Trường 'imageKeyword': Bắt buộc viết bằng TIẾNG ANH, mô tả cụ thể chủ thể (ví dụ: "Renaissance sculpture David").` }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      // Xử lý kết quả
      const responseText = result.response.text();
      let parsedData = JSON.parse(responseText);

      // Điền link ảnh vào dữ liệu
      parsedData = this.enrichDataWithImages(parsedData);

      return {
        data: parsedData,
        // Metadata nếu cần (tuỳ version SDK trả về)
        groundingChunks: [] 
      };

    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      // Xử lý thông báo lỗi thân thiện
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("Quota") || msg.includes("Exhausted")) {
        throw new Error("Hệ thống đang quá tải (Hết Quota miễn phí). Vui lòng nhập API Key cá nhân mới để tiếp tục.");
      }
      if (msg.includes("API key not valid") || msg.includes("400")) {
        localStorage.removeItem(STORAGE_KEY); // Xóa key lỗi
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại.");
      }
      
      throw new Error("Có lỗi khi tạo bài tập. Vui lòng thử lại.");
    }
  }

  /**
   * 6. HÀM TẠO ẢNH BÌA (Dùng chung logic an toàn)
   */
  async generateIllustrativeImage(topic: string) {
    try {
      const model = this.getAIModel();
      // Bước 1: Xin AI prompt tiếng Anh
      const result = await model.generateContent(`Viết một prompt ngắn (tiếng Anh) để vẽ một bức tranh nghệ thuật đẹp làm ảnh bìa cho chủ đề: "${topic}". Chỉ trả về nội dung prompt.`);
      const prompt = result.response.text();
      
      // Bước 2: Dùng prompt tạo link ảnh
      return this.generateSafeImageUrl(prompt || topic);
    } catch (e) {
      // Fallback nếu lỗi: dùng chính tên topic làm prompt
      console.warn("Lỗi sinh prompt ảnh bìa, dùng fallback:", e);
      return this.generateSafeImageUrl(topic);
    }
  }
}
