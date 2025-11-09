import { GoogleGenAI, Type } from "@google/genai";

// This log is crucial for debugging. If the build fails, check if this line appears in the Vercel logs.
console.log("--- RUNNING LATEST geminiClient.ts v2 ---");

// Aligned with Gemini API guidelines to exclusively use process.env.API_KEY.
const apiKey = process.env.API_KEY;

// New debug log to check the key's status
console.log(`API_KEY found: ${!!apiKey}`);


if (!apiKey) {
  // This error will stop the build process if the API key is not set in Vercel.
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
                        }
                    }
                },
                required: ["title", "description", "features"],
            },
        },
    };

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent(modelConfig);
            
            // This is the critical fix that solves the TypeScript error.
            const responseText = response.text;
            if (!responseText) {
                throw new Error(`Gemini API returned an empty text response on attempt ${attempt}.`);
            }

            // If we have text, parse it.
            const parsed = JSON.parse(responseText);
            return parsed; // Success
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isRetriable = errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('overloaded');

            console.error(`Gemini API call attempt ${attempt} failed:`, errorMessage);

            if (!isRetriable || attempt === maxRetries) {
                // Not a retriable error, or we've exhausted retries. Throw the original error.
                throw error;
            }

            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Retrying in ${delay / 1000}s...`);
            await sleep(delay);
        }
    }
    
    // This part should only be reached if all retries fail.
    throw new Error("Failed to generate content after multiple retries.");
};
