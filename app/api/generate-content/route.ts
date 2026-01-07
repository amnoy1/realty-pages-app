
import { GoogleGenAI } from "@google/genai";

// We strictly read the API key inside the handler to avoid build-time caching issues
export async function POST(request: Request) {
  // Try multiple naming conventions to be helpful to the user
  const apiKey = process.env.API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL ERROR: API_KEY is missing from server environment variables.");
    return new Response(JSON.stringify({ 
        error: "Server configuration error: API_KEY is missing." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize client per request to ensure it uses the current key
  const ai = new GoogleGenAI({ apiKey });

  try {
    const { originalDescription, address } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing originalDescription or address in request body" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // System instruction
    const systemInstruction = `
    You are an Expert Real Estate Copywriter and a Strict Data Analyst, writing in Hebrew.
    
    TASK 1: CREATIVE COPYWRITING (For 'title' and 'description' fields)
    Transform the user's input into high-converting Hebrew marketing copy.
    
    COPYWRITING RULES:
    1.  **Headline (Title):** Start with a specific BENEFIT or emotional hook.
    2.  **Specifics over Generics:** Avoid fluffy phrases.
    3.  **Action Verbs:** Use words like "Discover," "Wake up to," "Host," "Fall in love".
    4.  **CLEAN TEXT ONLY:** Do NOT use Markdown formatting. Return clean, plain text.
    
    TASK 2: STRICT DATA EXTRACTION (For 'features' object)
    1.  **NO HALLUCINATIONS:** If a feature is not explicitly written in the text, return an empty string "".
    2.  **Exact Numbers:** Extract numbers accurately.
    3.  **Lot Area:** Specifically look for mentions of "שטח מגרש" or land area.
    
    OUTPUT FORMAT: JSON ONLY.
    `;

    const prompt = `
    Analyze the following property description and address. 
    
    Address: ${address}
    Description: "${originalDescription}"

    Required Output JSON Format:
    {
      "title": "A Benefit-Driven Title in Hebrew",
      "description": {
        "area": "Detailed marketing text about the location benefits (approx 50-60 words).",
        "property": "Detailed marketing copy about the apartment/house (approx 50-60 words).",
        "cta": "Urgent Call to Action in Hebrew"
      },
      "features": {
        "rooms": "Number only.",
        "apartmentArea": "Number only (built area).",
        "lotArea": "Number only (land/lot area).",
        "balconyArea": "Number only.",
        "floor": "Number only.",
        "parking": "Number only.",
        "elevator": "Return 'יש' or empty.",
        "safeRoom": "Return 'ממ\"ד' or empty.",
        "storage": "Return 'יש' or empty.",
        "airDirections": "Directions if mentioned."
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

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Gemini API returned an empty text response.");
    }
    
    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
