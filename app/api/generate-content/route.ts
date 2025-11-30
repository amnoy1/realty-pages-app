import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("CRITICAL: API_KEY environment variable is not set on the server.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function POST(request: Request) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server is not configured with an API key." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { originalDescription, address } = await request.json();
    
    if (!originalDescription || !address) {
        return new Response(JSON.stringify({ error: "Missing originalDescription or address in request body" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // System instruction: Hybrid role - Creative Copywriter + Strict Data Analyst
    const systemInstruction = `
    You are an Expert Real Estate Copywriter and a Strict Data Analyst.
    
    TASK 1: CREATIVE COPYWRITING (For 'title' and 'description' fields)
    Transform the user's input into high-converting Hebrew marketing copy.
    
    COPYWRITING RULES:
    1.  **Headline (Title):** Do NOT write generic titles like "Apartment for sale". Start with a specific BENEFIT or emotional hook (e.g., "Open view to the sea," "Kibbutz atmosphere in the city center").
    2.  **Specifics over Generics:** Avoid fluffy phrases like "One of the most impressive properties." Instead, describe exactly *why* it's impressive based on the data.
    3.  **Action Verbs:** Use words like "Discover," "Wake up to," "Host," "Fall in love" (גלו, הרגישו, תתאהבו).
    4.  **Location:** Don't just list the street. Explain the *lifestyle benefit* of the location (e.g., "Coffee shops just steps away," "Quiet street that feels like a village").
    5.  **Structure:** Break text into short, punchy paragraphs.
    6.  **Urgency (CTA):** The call to action must create urgency (e.g., "Rare opportunity – viewings this week only").
    7.  **CLEAN TEXT ONLY:** Do NOT use Markdown formatting. Do NOT use asterisks (*, **, ***) for bolding. Do NOT use bullet points or hash signs (#). Return clean, plain text.
    
    TASK 2: STRICT DATA EXTRACTION (For 'features' object)
    1.  **NO HALLUCINATIONS:** If a feature (parking, balcony, elevator) is not explicitly written in the text, return an empty string "".
    2.  **Exact Numbers:** If text says "3 rooms", return "3". If text says "parking" without a number, return "1".
    
    OUTPUT FORMAT: JSON ONLY.
    `;

    const prompt = `
    Analyze the following property description and address. 
    
    Address: ${address}
    Description: "${originalDescription}"

    Required Output JSON Format:
    {
      "title": "A Benefit-Driven Title in Hebrew (e.g., 'הפנינה של גבעת טל - שקט פסטורלי דקות מהמרכז')",
      "description": {
        "area": "Marketing text about the location benefits in Hebrew (Use emotion: 'Feel the community...', 'Enjoy the convenience...')",
        "property": "Main marketing copy about the apartment. Use action verbs. Break into short concepts.",
        "cta": "Urgent Call to Action in Hebrew (e.g., 'הזדמנות נדירה - תיאומים השבוע בלבד')"
      },
      "features": {
        "rooms": "Number only. Empty if not found.",
        "apartmentArea": "Number only. Empty if not found.",
        "balconyArea": "Number only. Empty if not found.",
        "floor": "Number only. Empty if not found.",
        "parking": "Number only. Return '1' if mentioned without number. Empty if not found.",
        "elevator": "Return 'יש' if mentioned, otherwise empty string.",
        "safeRoom": "Return 'ממ\"ד' if mentioned, otherwise empty string.",
        "storage": "Return 'יש' if mentioned, otherwise empty string.",
        "airDirections": "List directions if mentioned, otherwise empty string."
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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