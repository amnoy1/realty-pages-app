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

    // System instruction to force strict data extraction
    const systemInstruction = `
    You are a specialized Real Estate Data Extraction Engine.
    Your goal is to extract specific property features from a description text with 100% accuracy.
    
    RULES:
    1. DO NOT HALLUCINATE. If a feature is not explicitly mentioned, return an empty string "".
    2. Exact Numbers: If the text says "3 rooms", return "3". If it says "parking", but no number, return "1".
    3. Output JSON only.
    `;

    const prompt = `
    Analyze the following property description and address. Extract the data exactly as written.

    Address: ${address}
    Description: "${originalDescription}"

    Required Output JSON Format:
    {
      "title": "A catchy marketing title in Hebrew based on the data (e.g. 'דירת 4 חדרים מדהימה בתל אביב')",
      "description": {
        "area": "Marketing text about the location/address in Hebrew",
        "property": "Marketing text about the specific apartment features in Hebrew",
        "cta": "Call to action text in Hebrew"
      },
      "features": {
        "rooms": "The number of rooms (e.g. '3', '4.5', '5'). Empty if not found.",
        "apartmentArea": "Built square meters (numbers only). Empty if not found.",
        "balconyArea": "Balcony square meters (numbers only). Empty if not found.",
        "floor": "Floor number. Empty if not found.",
        "parking": "Number of parking spots. Return '1' if mentioned without number. Empty if not found.",
        "elevator": "Return 'יש' if mentioned, otherwise empty string.",
        "safeRoom": "Return 'ממ\"ד' if mentioned (mamad/shelter), otherwise empty string.",
        "storage": "Return 'יש' if mentioned, otherwise empty string.",
        "airDirections": "List of directions (e.g. 'צפון, דרום') if mentioned, otherwise empty string."
      }
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // We do not use strict schema validation enum here to allow flexibility in extracted text,
        // but the prompt enforces the structure.
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