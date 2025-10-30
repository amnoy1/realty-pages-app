import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

interface GeneratedContent {
    title: string;
    description: {
        area: string;
        property: string;
        cta: string;
    };
    features: {
        apartmentArea?: string;
        balconyArea?: string;
        rooms?: string;
        floor?: string;
        safeRoom?: string;
        parking?: string;
        storage?: string;
        airDirections?: string;
        elevator?: string;
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generatePropertyContent = async (originalDescription: string, address: string): Promise<GeneratedContent> => {
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
    -   **חשוב מאוד: אל תשתמש בסימני כוכביות (* או **) לעיצוב טקסט.**
    -   השתמש במילים "יוקרתי" או "יוקרתית" רק אם הן מופיעות במפורש בתיאור המקורי מהסוכן.
    -   כל התוכן חייב להיות בעברית.
    **פרטי הנכס לעיבוד:**
    -   **כתובת (לניתוח סביבה):** ${address}
    -   **תיאור מקורי מהסוכן:** ${originalDescription}
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
                        properties: { area: { type: Type.STRING }, property: { type: Type.STRING }, cta: { type: Type.STRING } },
                        required: ["area", "property", "cta"],
                    },
                    features: {
                        type: Type.OBJECT,
                        properties: {
                            apartmentArea: { type: Type.STRING }, balconyArea: { type: Type.STRING },
                            rooms: { type: Type.STRING }, floor: { type: Type.STRING },
                            safeRoom: { type: Type.STRING }, parking: { type: Type.STRING },
                            storage: { type: Type.STRING }, airDirections: { type: Type.STRING },
                            elevator: { type: Type.STRING },
                        }
                    }
                },
                required: ["title", "description", "features"],
            },
        },
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await ai.models.generateContent(modelConfig);
            return JSON.parse(response.text);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (!msg.includes('503') || attempt === 3) throw error;
            await sleep(Math.pow(2, attempt) * 1000);
        }
    }
    throw new Error("Failed after multiple retries.");
};
