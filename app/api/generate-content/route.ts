
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  // Use exclusively process.env.API_KEY as per guidelines.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error: API_KEY is missing." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize client with named parameter apiKey.
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

    const systemInstruction = `
    You are an Expert Real Estate Marketing Strategist and Copywriter, writing in Hebrew.
    
    CRITICAL TASK: Customize the marketing copy for the following Target Audience: [${audienceString}].
    
    COPYWRITING STRATEGY PER AUDIENCE:
    - Families: Focus on safety, community, schools, parks, rooms, and space.
    - Investors: Focus on ROI, yield, demand, location potential, and ease of management.
    - Upgraders (משפרי דיור): Focus on luxury, size, premium features, balcony, and status.
    - Adults/Downsizers: Focus on accessibility, elevator, convenience, quietness, and maintenance.
    
    COPYWRITING RULES:
    1. **Property Type Identification:** Identify if the property is a "דירה", "בית פרטי", "פנטהאוז", "מגרש", "קרקע", "דו-משפחתי", etc., based on the description.
    2. **Headline (Title):** Create a powerful hook specifically for [${audienceString}].
    3. **Property Features (Strict Rule):** You MUST extract only the features explicitly mentioned in the text. 
       - If a feature (rooms, area, parking, elevator, etc.) is NOT mentioned, return null or an empty string for it.
       - DO NOT assume or hallucinate features that are not in the source text.
       - "אין" or "ללא" mentions should also be treated as empty/null if they are not explicitly part of a marketing point.
    4. **Language:** Professional, emotional, and persuasive.
    5. **Tone:** High-end boutique agency style.
    6. **CLEAN TEXT ONLY:** Do NOT use Markdown formatting.
    `;

    const prompt = `
    Analyze this property.
    Target Audience: ${audienceString}
    Address: ${address}
    User Description: "${originalDescription}"

    Output JSON structure:
    {
      "propertyType": "Type of property in Hebrew (e.g., דירה / בית פרטי / פנטהאוז / מגרש)",
      "title": "Marketing Headline for ${audienceString}",
      "description": {
        "area": "Area marketing copy focused on benefits for ${audienceString} (60 words).",
        "property": "Property marketing copy highlighting features attractive to ${audienceString} (60 words).",
        "cta": "Compelling call to action"
      },
      "features": {
        "rooms": "string or null",
        "apartmentArea": "string or null",
        "lotArea": "string or null",
        "balconyArea": "string or null",
        "floor": "string or null",
        "parking": "string or null",
        "elevator": "string or null",
        "safeRoom": "string or null",
        "storage": "string or null",
        "airDirections": "string or null"
      }
    }
    `;

    // Use ai.models.generateContent with model name and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    // Access .text property directly (correct usage).
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
