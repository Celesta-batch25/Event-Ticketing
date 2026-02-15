import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBadgePersona = async (name: string, role: string, ticketType: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Tech Enthusiast";

  try {
    const prompt = `
      Create a short, cool, and slightly futuristic "Badge Persona" or "Callsign" (max 3-4 words) for an event attendee.
      Attendee Name: ${name}
      Job Role: ${role}
      Ticket Type: ${ticketType}
      
      Examples: 
      - "Code Ninja"
      - "Visionary Architect"
      - "Quantum Explorer"
      - "VIP Neural Linker"
      
      Return ONLY the persona string. No quotes.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Future Walker";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Future Walker"; // Fallback
  }
};

export const getWelcomeMessage = async (name: string, persona: string): Promise<string> => {
  const client = getClient();
  if (!client) return `Welcome, ${name}! Ready for the event?`;

  try {
    const prompt = `
      Write a very short (one sentence), high-energy welcome message for an event app dashboard.
      User: ${name}
      Persona: ${persona}
      Tone: Cyberpunk, excitement, professional but fun.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || `Welcome to the future, ${name}.`;
  } catch (error) {
    return `Welcome to the future, ${name}.`;
  }
};
