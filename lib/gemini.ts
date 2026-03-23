
import { GoogleGenAI, Type } from "@google/genai";
import { PropertyFeatures, EnhancedDescription } from "../types";

export async function generatePropertyContent(
  originalDescription: string,
  address: string,
  targetAudience: string[] = []
) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API Key is missing in environment variables.");
    throw new Error("מפתח ה-API של Gemini חסר. אנא הגדר את NEXT_PUBLIC_GEMINI_API_KEY בהגדרות המערכת.");
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const prompt = `
      אתה מומחה לשיווק נדל"ן ישראלי. המטרה שלך היא להפוך תיאור נכס גולמי לדף נחיתה שיווקי, מרשים ומניע לפעולה.
      
      פרטי הנכס:
      כתובת: ${address}
      תיאור גולמי: ${originalDescription}
      קהל יעד: ${targetAudience.join(", ")}
      
      עליך להחזיר אובייקט JSON הכולל:
      1. title: כותרת שיווקית קצרה וקולעת (עד 10 מילים).
      2. propertyType: סוג הנכס (דירה, פנטהאוז, בית פרטי וכו').
      3. description: אובייקט עם 3 חלקים:
         - area: תיאור קצר של האזור והשכונה (2-3 משפטים).
         - property: תיאור מפורט ומלהיב של הנכס עצמו (4-6 משפטים).
         - cta: משפט הנעה לפעולה חזק.
      4. features: אובייקט עם מאפייני הנכס (שטח דירה, שטח מגרש, מרפסת, חדרים, קומה, ממ"ד, חניה, מחסן, כיווני אוויר, מעלית). השתמש בערכים מהתיאור הגולמי אם קיימים.
      
      החזר את התשובה בפורמט JSON בלבד, בעברית.
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            propertyType: { type: Type.STRING },
            description: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING },
                property: { type: Type.STRING },
                cta: { type: Type.STRING },
              },
              required: ["area", "property", "cta"],
            },
            features: {
              type: Type.OBJECT,
              properties: {
                apartmentArea: { type: Type.STRING },
                lotArea: { type: Type.STRING },
                balconyArea: { type: Type.STRING },
                rooms: { type: Type.STRING },
                floor: { type: Type.STRING },
                safeRoom: { type: Type.STRING },
                parking: { type: Type.STRING },
                storage: { type: Type.STRING },
                airDirections: { type: Type.STRING },
                elevator: { type: Type.STRING },
              },
            },
          },
          required: ["title", "propertyType", "description", "features"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      console.error("Gemini returned an empty response.");
      throw new Error("ה-AI לא החזיר תשובה. אנא נסה שנית.");
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("שגיאה בעיבוד נתוני ה-AI. אנא נסה שנית.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("מפתח ה-API של Gemini אינו תקין. אנא בדוק את ההגדרות.");
    }
    if (error.message?.includes("quota")) {
      throw new Error("חריגה ממכסת ה-API של Gemini. אנא נסה שנית מאוחר יותר.");
    }
    throw new Error(error.message || "שגיאה בתקשורת עם ה-AI");
  }
}
