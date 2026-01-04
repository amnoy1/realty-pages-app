
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.API_KEY || 
                 process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API_KEY" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const systemInstruction = `
    אתה המנהל הקריאייטיבי של משרד פרסום המתמחה בנדל"ן יוקרה בישראל.
    המטרה שלך היא להפוך כתובת וכותרת בסיסית לדף נחיתה עוצר נשימה שמוכר "לייף סטייל" ולא רק קירות.
    
    חוקים לכתיבה:
    1. כותרת (title): שדרג את הכותרת המקורית למשהו רגשי, יוקרתי ומזמין.
    2. תיאור אזור (area): נתח את הכתובת. תאר את השכונה, האווירה, הקרבה לבתי קפה, פארקים, מוסדות חינוך או הים. השתמש בידע שלך על גיאוגרפיה ישראלית.
    3. תיאור נכס (property): תאר את החלל בצורה חזותית - אור, מרווח, איכות בנייה, תחושת המגורים בבית.
    4. חובה להחזיר JSON תקין בלבד בעברית.
    `;

    const prompt = `
    כתובת הנכס: ${address}
    כותרת בסיסית שסיפק המשתמש: ${originalDescription}
    
    ייצר אובייקט JSON במבנה הבא:
    {
      "title": "כותרת משודרגת ומפוצצת",
      "description": {
        "area": "טקסט סוחף על הסביבה והשכונה",
        "property": "תיאור שיווקי עמוק של פנים הנכס וחווית המגורים",
        "cta": "קריאה לפעולה מזמינה"
      },
      "features": {
        "rooms": "חילוץ מספר חדרים אם ידוע, אחרת 'פרטים בשיחה'",
        "apartmentArea": "שטח משוער (למשל 'מרווחת במיוחד')",
        "floor": "קומה"
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return new Response(response.text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
