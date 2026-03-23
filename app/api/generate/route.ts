
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[Server] Received request for /api/generate (v2.1)");
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in server environment variables.");
    return NextResponse.json(
      { error: "מפתח ה-API של Gemini חסר בשרת. אנא הגדר את GEMINI_API_KEY ב-Vercel." },
      { status: 500 }
    );
  }

  try {
    const { originalDescription, address, targetAudience = [] } = await req.json();

    const genAI = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const prompt = `
      אתה מומחה לשיווק נדל"ן ישראלי. המטרה שלך היא להפוך תיאור נכס גולמי לדף נחיתה שיווקי, מרשים ומניע לפעולה.
      
      לפני שאתה כותב, בצע מחקר מעמיק על הכתובת והשכונה: ${address}.
      עליך לחלץ מידע אמיתי ומדויק על:
      - נגישות ותחבורה (צירים ראשיים, רכבת, אוטובוסים).
      - מוסדות חינוך (בתי ספר וגנים מובילים).
      - תרבות ופנאי (פארקים, מרכזים קהילתיים).
      - מסחר (מרכזי קניות, רחובות מסחריים).
      - אפיון האוכלוסייה בשכונה (משפחות, צעירים, וכו').
      
      פרטי הנכס הנוספים:
      תיאור גולמי: ${originalDescription}
      קהל יעד: ${targetAudience.join(", ")}
      
      עליך להחזיר אובייקט JSON הכולל:
      1. title: כותרת שיווקית קצרה וקולעת (עד 10 מילים) המותאמת לקהל היעד.
      2. propertyType: סוג הנכס (דירה, פנטהאוז, בית פרטי וכו').
      3. description: אובייקט עם 4 חלקים:
         - area: תיאור מפורט, מקצועי ומרשים של האזור והשכונה (4-6 משפטים). הדגש את היתרונות שמצאת במחקר (נגישות, חינוך, מסחר, אוכלוסייה).
         - property: תיאור מפורט ומלהיב של הנכס עצמו (4-6 משפטים).
         - audienceBenefits: פסקה ממוקדת (3-4 משפטים) המסבירה בצורה מתוחכמת מדוע הנכס הזה הוא ההזדמנות המושלמת ספציפית עבור ${targetAudience.join(", ")}. התמקד ביתרונות שחשובים להם (תשואה למשקיעים, ביטחון למשפחות, יוקרה למשפרי דיור וכו').
         - cta: משפט הנעה לפעולה חזק המותאם לקהל היעד.
      4. features: אובייקט עם מאפייני הנכס (שטח דירה, שטח מגרש, מרפסת, חדרים, קומה, ממ"ד, חניה, מחסן, כיווני אוויר, מעלית). השתמש בערכים מהתיאור הגולמי אם קיימים.
      
      החזר את התשובה בפורמט JSON בלבד, בעברית. אל תוסיף טקסט הסברי לפני או אחרי ה-JSON.
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        tools: [{ googleSearch: {} }],
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
                audienceBenefits: { type: Type.STRING },
                cta: { type: Type.STRING },
              },
              required: ["area", "property", "audienceBenefits", "cta"],
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
      return NextResponse.json({ error: "ה-AI לא החזיר תשובה." }, { status: 500 });
    }
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error (Server):", error);
    return NextResponse.json(
      { error: error.message || "שגיאה בתקשורת עם ה-AI" },
      { status: 500 }
    );
  }
}
