import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLocationsWithAI = async (prompt: string): Promise<string[]> => {
  try {
    const model = 'gemini-2.5-flash-latest';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `Bạn là một chuyên gia quản lý kho hàng. Hãy tạo ra danh sách các mã vị trí kho dựa trên mô tả sau đây. 
      Trả về kết quả dưới dạng JSON thuần túy là một danh sách (array) các chuỗi ký tự (string codes).
      Không thêm bất kỳ giải thích nào.
      
      Mô tả của người dùng: "${prompt}"
      
      Ví dụ input: "Kệ A có 3 tầng, mỗi tầng 2 ngăn"
      Ví dụ output: ["A.1.1", "A.1.2", "A.2.1", "A.2.2", "A.3.1", "A.3.2"]
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      if (Array.isArray(data)) {
        return data;
      }
    }
    return [];
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Không thể tạo mã từ AI. Vui lòng thử lại.");
  }
};