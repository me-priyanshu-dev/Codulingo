import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTutorHelp = async (questionPrompt: string, userContext: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are "Duo-Code", a friendly, energetic, and encouraging coding tutor. 
    You speak like a game character (short, punchy, enthusiastic sentences). 
    Your goal is to explain HTML/Coding concepts simply to a novice.
    Avoid jargon unless you explain it. Use emojis. Keep responses under 3 sentences.`;

    const response = await ai.models.generateContent({
      model,
      contents: `The user is stuck on this question: "${questionPrompt}". 
      Context/User's confusion: ${userContext}. 
      Give a hint, not the answer.`,
      config: {
        systemInstruction,
      }
    });

    return response.text || "Hoot! I'm having trouble connecting to the nest. Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hoot! My connection is a bit fuzzy. Can you check your internet?";
  }
};

export const chatWithTutor = async (messages: { role: 'user' | 'model', text: string }[]): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const systemInstruction = `You are Duo-Code, a gamified coding tutor. 
        You are helpful, encouraging, and use simple analogies.
        Always answer coding questions specifically. If the user asks something else, gently steer them back to coding.
        Keep answers concise (max 2 paragraphs). Use markdown for code blocks.`;

        // Convert simple message format to API format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const lastMessage = messages[messages.length - 1].text;

        const chat = ai.chats.create({
            model,
            config: { systemInstruction },
            history: history
        });

        const result = await chat.sendMessage({ message: lastMessage });
        return result.text;
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "System error. Please try asking again.";
    }
};

export const generateLevelContent = async (topic: string, description: string, userXP: number): Promise<any> => {
  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert curriculum designer for a gamified coding app called "Codulingo".
    Create a JSON lesson for the HTML topic: "${topic}".
    The lesson MUST have 10-12 segments to ensure deep learning.
    Alternate between "EXPLANATION" and "CHALLENGE" segments.
    
    CHARACTERS TO USE:
    - owl: Friendly intros, general concepts (Duo-Code).
    - robot: Technical definitions, syntax rules (Byte_Bot).
    - cat: Visual concepts, design analogies (Pixel).
    - bug: Common mistakes, errors, debugging (Glitch).

    QUESTION TYPES:
    - MULTIPLE_CHOICE: simple options
    - FILL_BLANK: codeSnippet with '___'
    - REARRANGE: array of strings to order
    - MATCHING: pairs of definitions (e.g., Tag -> Definition)

    IMPORTANT:
    - For EXPLANATION segments:
      - Use "content" for the text (simple, bullet points).
      - ONLY use "codeSnippet" field if you want to trigger the Visual Code Preview Box (e.g. for complex examples). Do not put code in "content" if you use "codeSnippet".
    - Ensure explanations are extremely simple, bullet-pointed, and beginner-friendly.
    - Focus ONLY on HTML. Do not teach CSS or JS yet.
    - Use specific, real HTML examples.

    Return strictly valid JSON matching the LessonSegment[] interface.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: `Generate a comprehensive beginner HTML lesson for "${topic}: ${description}". 
        Make it fun, interactive, and deep.
        Format: JSON.`,
        config: {
            systemInstruction,
            responseMimeType: "application/json"
        }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    // Attempt to parse strictly
    const data = JSON.parse(text);
    // Handle if wrapped in array or object
    if (Array.isArray(data)) return data;
    if (data.segments) return data.segments;
    return [];

  } catch (error) {
      console.error("AI Generation Error:", error);
      return [];
  }
};