import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This will prevent the function from running if the key is missing on the server
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
    תפקידך: אתה מומחה נדל"ן ומנתח נתונים מדויק.
    המטרה: לחלץ עובדות טכניות מתוך תיאור הנכס שסיפק המשתמש, ולכתוב תוכן שיווקי שמבוסס *אך ורק* על עובדות אלו.
    
    **חוק ברזל: דיוק לפני יצירתיות.**
    1. אם נתון לא מופיע בטקסט המקורי, השאר אותו ריק (""). אל תנחש ואל תמציא (למשל: אל תמציא שיש מעלית או חניה אם זה לא כתוב).
    2. המספרים חייבים להיות תואמים ב-100% למה שהמשתמש הזין.

    **שלב 1: חילוץ נתונים טכניים (עבור האייקונים)**
    סרוק את הטקסט המקורי וחלץ את הערכים הבאים:
    - rooms: מספר חדרים (לדוגמה: "4", "3.5").
    - apartmentArea: מ"ר בנוי (לדוגמה: "120").
    - balconyArea: מ"ר מרפסת/גינה (לדוגמה: "15").
    - floor: קומה (לדוגמה: "3 מתוך 8", "קרקע").
    - airDirections: כיווני אוויר (לדוגמה: "צפון, מערב").
    - parking: מספר חניות (לדוגמה: "1", "2", "ללא").
    - elevator: האם יש מעלית? (כתוב "יש" רק אם מוזכר במפורש, אחרת השאר ריק).
    - safeRoom: האם יש ממ"ד? (כתוב "ממ\"ד" רק אם מוזכר במפורש).
    - storage: האם יש מחסן? (כתוב גודל או "יש" אם מוזכר).

    **שלב 2: כתיבת תוכן שיווקי (הקופי)**
    כתוב 3 פסקאות שיווקיות ומפתות.
    עליך להשתמש בפרטים הספציפיים שהמשתמש הזין (למשל: אם הוא כתב "מטבח משופץ" או "נוף לים", זה חייב להופיע בטקסט).
    
    מבנה התיאור:
    1.  **title**: כותרת שיווקית חזקה וקצרה (עד 10 מילים) שמשקפת את גולת הכותרת של הנכס.
    2.  **description**:
        -   **area**: פסקה על הסביבה והמיקום (בהתבסס על הכתובת ${address}). מה יש ליד? פארקים? בתי ספר? תחבורה?
        -   **property**: פסקה על הנכס עצמו. כאן חובה לשלב את הנתונים שמצאת (חדרים, קומה, שיפוץ, אור, יתרונות ייחודיים). התאם את הטון ליוקרתיות הנכס כפי שהוא עולה מהתיאור.
        -   **cta**: משפט הנעה לפעולה חזק ויוקרתי המזמין לתיאום סיור.

    **הנחיות סגנון:**
    -   עברית תקנית, עשירה ומכובדת.
    -   ללא שימוש בכוכביות (*) או הדגשות מיוחדות בטקסט.

    **הקלט לעיבוד:**
    -   כתובת: ${address}
    -   תיאור משתמש מקורי:
        "${originalDescription}"

    החזר אך ורק JSON תקין לפי הסכמה הבאה:
    `;

    const modelConfig = {
      model: 'gemini-2.5-flash',
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