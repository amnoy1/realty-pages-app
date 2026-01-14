
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error: API_KEY is missing." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address, targetAudience } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing originalDescription or address" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const audienceString = targetAudience && targetAudience.length > 0 && !targetAudience.includes("לא רלבנטי") 
        ? targetAudience.join(", ") 
        : "קהל כללי";

    // System instruction updated for target audience focus
    const systemInstruction = `
    You are an Expert Real Estate Marketing Strategist and Copywriter, writing in Hebrew.
    
    CRITICAL TASK: Customize the marketing copy for the following Target Audience: [${audienceString}].
    
    COPYWRITING STRATEGY PER AUDIENCE:
    - Families: Focus on safety, community, schools, parks, rooms, and space.
    - Investors: Focus on ROI, yield, demand, location potential, and ease of management.
    - Upgraders (משפרי דיור): Focus on luxury, size, premium features, balcony, and status.
    - Adults/Downsizers: Focus on accessibility, elevator, convenience, quietness, and maintenance.
    
    COPYWRITING RULES:
    1. **Headline (Title):** Create a powerful hook specifically for [${audienceString}].
    2. **Language:** Professional, emotional, and persuasive.
    3. **Tone:** High-end boutique agency style.
    4. **CLEAN TEXT ONLY:** Do NOT use Markdown formatting.
    
    DATA EXTRACTION:
    Extract all features accurately. If a value is missing, return empty string "".
    `;

    const prompt = `
    Analyze this property.
    Target Audience: ${audienceString}
    Address: ${address}
    User Description: "${originalDescription}"

    Output JSON structure:
    {
      "title": "Marketing Headline for ${audienceString}",
      "description": {
        "area": "Area marketing copy focused on benefits for ${audienceString} (60 words).",
        "property": "Property marketing copy highlighting features attractive to ${audienceString} (60 words).",
        "cta": "Compelling call to action"
      },
      "features": {
        "rooms": "Number",
        "apartmentArea": "Number",
        "lotArea": "Number",
        "balconyArea": "Number",
        "floor": "Number",
        "parking": "Number",
        "elevator": "יש/אין",
        "safeRoom": "ממ\"ד/אין",
        "storage": "יש/אין",
        "airDirections": "Directions"
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro for better reasoning on audience customization
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
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
