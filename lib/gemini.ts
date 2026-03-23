
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { PropertyFeatures, EnhancedDescription } from "../types";

export async function generatePropertyContent(
  originalDescription: string,
  address: string,
  targetAudience: string[] = []
) {
  console.log("[Client] Calling /api/generate (v2.1)");
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalDescription,
        address,
        targetAudience,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "שגיאה ביצירת התוכן");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini API Error (Client):", error);
    throw new Error(error.message || "שגיאה בתקשורת עם ה-AI");
  }
}
