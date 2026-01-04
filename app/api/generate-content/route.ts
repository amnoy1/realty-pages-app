import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API_KEY" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address, useAsIs } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // הנחיות מערכת קפדניות ומקצועיות
    const systemInstruction = `
    אתה מומחה קופירייטינג לנדל"ן ומשווק דיגיטלי מוביל, כותב בעברית שיווקית, חדה ומניעה לפעולה.
    
    המשימה שלך: לקחת את המידע הגולמי שהמשתמש מזין (כותרת והערות) ולהפוך אותו לדף נחיתה יוקרתי.
    
    חוקי עבודה בהתאם לבחירת המשתמש (${useAsIs ? 'שימוש בטקסט מקור כפי שהוא' : 'שדרוג AI משמעותי'}):
    
    1. ${useAsIs ? 'שמור על הניסוח המדויק של המשתמש. אל תשנה מילים, אל תשפר סגנון. פשוט חלק את הטקסט שלו לסקציות הנדרשות ב-JSON.' : 'כתוב מחדש באופן שיווקי ומרגש. השתמש בתועלות רגשיות ובשפה עשירה.'}
    2. כותרת הדף (title): ${useAsIs ? 'השתמש בדיוק בכותרת שהזין המשתמש.' : 'חייבת להיות מבוססת תועלת רגשית. אל תכתוב "דירה למכירה".'}
    3. סקציית האזור (description.area): ${useAsIs ? 'חלץ את החלק מהטקסט של המשתמש שמתייחס לסביבה. אל תשנה את המילים.' : 'כתוב פסקה עשירה (4-5 משפטים) על הסביבה והלייף-סטייל.'}
    4. סקציית הנכס (description.property): ${useAsIs ? 'חלץ את החלק מהטקסט שמתייחס לנכס עצמו. אל תשנה את המילים.' : 'כתוב פסקה עשירה ומרגשת על הדירה וחוויית המגורים בה.'}
    5. קריאה לפעולה (cta): ${useAsIs ? 'השתמש במשפט הנעה לפעולה סטנדרטי או מה שצוין בטקסט.' : 'צור תחושת דחיפות חזקה.'}
    6. שפה: עברית תקנית. ללא סימני Markdown.
    7. חילוץ מאפיינים: תמיד חלץ את הנתונים הטכניים (חניה, קומה וכו\') לאובייקט ה-features, גם אם בחרנו "כפי שהוא" בטקסט התיאור.
    `;

    const prompt = `
    נתח את פרטי הנכס הבאים:
    
    כתובת: ${address}
    מידע גולמי (כותרת והערות): "${originalDescription}"

    החזר את התוצאה במבנה JSON הבא בלבד:
    {
      "title": "כותרת",
      "description": {
        "area": "תיאור אזור",
        "property": "תיאור נכס",
        "cta": "קריאה לפעולה"
      },
      "features": {
        "rooms": "מספר בלבד או ריק",
        "apartmentArea": "מספר בלבד או ריק",
        "balconyArea": "מספר בלבד או ריק",
        "floor": "מספר בלבד או ריק",
        "parking": "מספר או 'יש' או ריק",
        "elevator": "'יש' או ריק",
        "safeRoom": "'ממ\"ד' או ריק",
        "storage": "'יש' או ריק",
        "airDirections": "כיווני אוויר אם צוינו"
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