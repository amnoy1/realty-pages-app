import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("CRITICAL: API_KEY environment variable is not set on the server.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function POST(request: Request) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server is not configured with an API key." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { originalDescription, address } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing originalDescription or address in request body" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const prompt = `
    אתה קופירייטר בכיר המתמחה בשיווק נדל"ן יוקרתי. המשימה שלך היא לקחת נתונים גולמיים על נכס ולהפוך אותם לדף נחיתה שעושה חשק לקנות, בפורמט JSON.

    **שלב 1: ניתוח וחילוץ נתונים**
    עבור על התיאור המקורי וחלץ את הנתונים הבאים. אם נתון חסר, השאר ריק ("").
    - apartmentArea: מ"ר בנוי (לדוגמה: "120 מ\"ר")
    - balconyArea: מ"ר מרפסת/גינה
    - rooms: מספר חדרים (רק מספר, לדוגמה: "4")
    - floor: קומה
    - safeRoom: האם יש ממ"ד? (כתוב "ממ\"ד" אם כן)
    - parking: מספר חניות (לדוגמה: "2")
    - storage: מחסן (לדוגמה: "יש" או גודל)
    - airDirections: כיווני אוויר
    - elevator: מעלית (לדוגמה: "יש")

    **שלב 2: קופירייטינג שיווקי (Gemini 3 Pro)**
    כתוב תוכן שיווקי שמדבר לרגש ולדמיון של הקונה הפוטנציאלי.
    1.  **title**: כותרת ראשית מפוצצת, קצרה ויוקרתית (עד 10 מילים).
    2.  **description (אובייקט):**
        -   **area**: תאר את הלייף-סטייל בסביבה של ${address}. בתי קפה, פארקים, חינוך, אווירה.
        -   **property**: תאר את הנכס עצמו בצורה חושית (אור, מרחב, עיצוב). אל תהיה טכני מדי ("יש מטבח"), אלא שיווקי ("מטבח שף רחב ידיים המזמין לאירוח").
        -   **cta**: הנעה לפעולה דחופה אך אלגנטית.

    **הנחיות קריטיות:**
    -   שפה: עברית תקנית, זורמת ומשכנעת.
    -   ללא סימני עיצוב (כמו כוכביות).
    -   אורך כולל: עד 400 מילים.

    **קלט:**
    כתובת: ${address}
    תיאור: ${originalDescription}
    `;

    const modelConfig = {
      // Explicitly using Gemini 3 Pro per user request
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
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
          required: ["title", "description", "features"],
        },
      },
    };

    const response = await ai.models.generateContent(modelConfig);
    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Gemini API returned an empty text response.");
    }
    
    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}