
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API_KEY missing" }), { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address, targetAudience } = await request.json();
    const audienceStr = targetAudience?.join(", ") || "קהל כללי";

    const systemInstruction = `
    You are an Expert Real Estate Marketing Copywriter in Hebrew.
    Focus the copy on the following target audience: [${audienceStr}].
    
    RULES:
    1. Title: Benefit-driven headline.
    2. Description: Focus on location benefits and property features relevant to ${audienceStr}.
    3. Features: Extract rooms, apartmentArea, lotArea (שטח מגרש), floor, parking, safeRoom, elevator.
    4. Clean text only, no markdown.
    `;

    const prompt = `
    Analyze this property for ${audienceStr}.
    Address: ${address}
    Text: "${originalDescription}"

    JSON Output:
    {
      "title": "Headline",
      "description": { "area": "60 words", "property": "60 words", "cta": "CTA" },
      "features": { "rooms": "", "apartmentArea": "", "lotArea": "", "floor": "", "parking": "", "elevator": "", "safeRoom": "" }
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

    return new Response(response.text, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
}
