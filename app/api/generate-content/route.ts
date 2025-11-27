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
    אתה AI מומחה לניתוח ושכתוב תוכן נדל"ן. המשימה שלך היא לעבד תיאור נכס גולמי ולהפוך אותו לתוכן שיווקי מובנה עבור דף נחיתה, בפורמט JSON.

    **שלב 1: חילוץ נתונים טכניים**
    קרא בעיון את התיאור המקורי של הסוכן וחלץ את הנתונים הבאים. אם נתון לא קיים, השאר את הערך כשדה ריק ("").
    - apartmentArea: שטח הדירה (למשל, "120 מ\"ר")
    - balconyArea: שטח המרפסת (למשל, "15 מ\"ר")
    - rooms: מספר חדרים. החזר רק את המספר (למשל, "5")
    - floor: קומה (למשל, "3 מתוך 7")
    - safeRoom: ממ"ד. אם קיים, החזר את הטקסט "ממ\\"ד".
    - parking: חניה. החזר רק את מספר החניות בספרה (למשל, "2").
    - storage: מחסן. החזר רק את שטח המחסן (למשל, "6 מ\"ר").
    - airDirections: כיווני אוויר (למשל, "צפון, מערב")
    - elevator: מעלית. אם קיימת, החזר את הטקסט "יש".

    **שלב 2: יצירת תוכן שיווקי**
    לאחר שחילצת את הנתונים, כתוב את התוכן השיווקי. **חשוב: אל תכלול את הנתונים הטכניים שחילצת בתוך פסקאות התיאור.**
    1.  **title**: כותרת ראשית קצרה, ממירה, ותופסת תשומת לב (עד 10 מילים).
    2.  **description (אובייקט עם 3 פסקאות):**
        -   **area**: פסקה ראשונה המתמקדת בסביבה, בקהילה ובדמוגרפיה, בהתבסס על הכתובת. הדגש את יתרונות המיקום.
        -   **property**: פסקה שניה המתארת את הנכס עצמו בצורה חוויתית ורגשית. התמקד בתועלות ובאווירה.
        -   **cta**: פסקה שלישית ואחרונה שהיא קריאה ברורה לפעולה, המניעה את הקורא ליצור קשר.

    **הנחיות כלליות לתוכן:**
    -   השתמש בשפה עשירה ומעוררת רגש.
    -   הדגש תועלות ולא רק נתונים.
    -   **חשוב מאוד: אל תשתמש בסימני כוכביות (* או **) לעיצוב טקסט. כל הטקסט צריך להיות ללא עיצוב מיוחד.**
    -   השתמש במילים "יוקרתי" או "יוקרתית" רק אם הן מופיעות במפורש בתיאור המקורי מהסוכן.
    -   כל התוכן חייב להיות בעברית.
    -   סך כל התיאור לא יעלה על 450 מילים.

    **פרטי הנכס לעיבוד:**
    -   **כתובת (לניתוח סביבה):** ${address}
    -   **תיאור מקורי מהסוכן:**
        ---
        ${originalDescription}
        ---

    החזר אך ורק את אובייקט ה-JSON במבנה המדויק שנדרש.
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
    
    // The response from the model is already a JSON string because of responseMimeType
    // We can return it directly.
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
