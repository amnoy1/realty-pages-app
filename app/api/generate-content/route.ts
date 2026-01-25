
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
        : "רוכשי נדל\"ן ומשקיעים";

    const systemInstruction = `
    אתה פועל כמומחה SEO עולמי לנדל"ן ומערכות SaaS, עם ניסיון בהבאת דפי נחיתה לדירוגים 1–3 בגוגל בישראל.
    המטרה: לייצר דף נחיתה בעברית עבור הכתובת: ${address}.
    
    דרישות SEO מחייבות:
    1. כותרת H1 ייחודית הכוללת את הרחוב, המספר והעיר.
    2. Meta Title (55-60 תווים) ו-Meta Description (140-160 תווים).
    3. תוכן באורך מינימום 900 מילים, מחולק ל-H2 ו-H3, הכולל: תיאור הסביבה, ביקוש באזור, סוגי נכסים, יתרונות ו-FAQ.
    4. מבנה FAQ של 5 שאלות מותאמות ל-Featured Snippets. כל תשובה באורך 40-60 מילים, עונה ישירות על השאלה בראשיתה.
    5. כתיבה אנושית, אמינה, ללא חזרתיות.
    6. השתמש ב-Google Search כדי למצוא פרטים אמיתיים על השכונה, מוסדות חינוך קרובים, פארקים ותחבורה בכתובת המצוינת.
    
    אין להזכיר AI, מודל שפה או אוטומציה.
    `;

    const prompt = `
    צור דף נחיתה SEO מלא עבור הנכס הבא:
    כותרת המשתמש: ${propertyTitle || "נכס למכירה"}
    כתובת: ${address}
    מידע נוסף: ${originalDescription || ""}
    קהל יעד: ${audienceString}

    החזר JSON במבנה הבא בלבד:
    {
      "title": "H1 Title",
      "metaTitle": "SEO Meta Title",
      "metaDescription": "SEO Meta Description",
      "seoSlug": "hebrew-friendly-slug",
      "description": {
        "area": "Short summary of area (60 words)",
        "property": "Short summary of property (60 words)",
        "cta": "Call to action text",
        "longSeoContent": "The full 900+ words SEO article with H2/H3 markers (use <h2> and <h3> tags)",
        "faq": [
          {"question": "Question 1", "answer": "Answer 1"},
          {"question": "Question 2", "answer": "Answer 2"},
          {"question": "Question 3", "answer": "Answer 3"},
          {"question": "Question 4", "answer": "Answer 4"},
          {"question": "Question 5", "answer": "Answer 5"}
        ]
      },
      "features": {
        "rooms": "Value",
        "apartmentArea": "Value",
        "floor": "Value",
        "elevator": "יש/אין",
        "safeRoom": "יש/אין",
        "parking": "Value"
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No text content returned from Gemini");
    }

    const result = JSON.parse(responseText);
    
    // Flatten the response to match the client expectation
    return new Response(JSON.stringify({
      title: result.title,
      description: {
        area: result.description.area,
        property: result.description.property,
        cta: result.description.cta,
        longSeoContent: result.description.longSeoContent,
        faq: result.description.faq
      },
      features: result.features,
      metaTitle: result.metaTitle,
      metaDescription: result.metaDescription,
      seoSlug: result.seoSlug
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
