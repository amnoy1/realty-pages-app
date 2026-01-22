
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.API_KEY || 
                 process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address, propertyTitle, targetAudience } = await request.json();
    
    const audienceString = targetAudience && targetAudience.length > 0 && !targetAudience.includes("לא רלבנטי") 
        ? targetAudience.join(", ") 
        : "רוכשי נדל\"ן ומשקיעים פרטיים";

    const systemInstruction = `
    אתה פועל כמומחה SEO עולמי לנדל"ן. המשימה שלך היא לייצר תוכן לדף נחיתה עבור הנכס בכתובת: ${address}.
    
    דרישות היררכיה (קריטי):
    1. seoH1: כותרת H1 "משעממת" ומדויקת. פורמט: "דירה למכירה ב[כתובת מלאה], [עיר]" או "נכס למכירה ב[כתובת מלאה] | [עיר]".
    2. marketingH2: כותרת שיווקית חזקה ומושכת (H2).
    `;

    const prompt = `
    צור תוכן SEO עבור נכס בכתובת: ${address}
    כותרת משתמש (אם קיימת): ${propertyTitle || ""}
    תיאור חופשי: ${originalDescription || ""}
    קהל יעד: ${audienceString}

    החזר JSON במבנה:
    {
      "seoH1": "דירה למכירה ב...",
      "marketingH2": "הכותרת השיווקית המושכת",
      "description": {
        "area": "תיאור השכונה והסביבה (כ-60 מילים)",
        "property": "תיאור הנכס והפוטנציאל (כ-80 מילים)",
        "cta": "תיאום סיור בנכס עכשיו"
      },
      "features": {
        "rooms": "מספר חדרים",
        "apartmentArea": "שטח במר",
        "floor": "קומה",
        "elevator": "יש/אין",
        "safeRoom": "יש/אין",
        "parking": "חנייה"
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    
    return new Response(JSON.stringify({
      title: result.marketingH2, // נשמור על תאימות לאחור בשם השדה
      generatedTitle: result.marketingH2,
      seoH1: result.seoH1,
      marketingH2: result.marketingH2,
      description: result.description,
      features: result.features
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate SEO content" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
