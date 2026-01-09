
import { GoogleGenAI, Type } from "@google/genai";
import { ParticleParams, ParticleMode } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const interpretUserRequest = async (prompt: string, currentParams: ParticleParams): Promise<Partial<ParticleParams>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current state: ${JSON.stringify(currentParams)}. User wants: "${prompt}". Translate this into a new configuration for a 3D particle system.`,
      config: {
        systemInstruction: `You are an expert creative technologist. Convert user natural language requests into JSON parameters for a Three.js particle system. 
        Available modes: 'orbit', 'flow', 'vortex', 'chaos', 'expand', 'galaxy'. 
        Colors should be hex codes. Speed is 0.1 to 5.0. Size is 0.01 to 0.2. Count is 1000 to 100000. Complexity is 0 to 1. Brightness is 0.1 to 2.0.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            color1: { type: Type.STRING },
            color2: { type: Type.STRING },
            size: { type: Type.NUMBER },
            speed: { type: Type.NUMBER },
            count: { type: Type.NUMBER },
            mode: { 
              type: Type.STRING,
              description: "Must be one of: orbit, flow, vortex, chaos, expand, galaxy"
            },
            complexity: { type: Type.NUMBER },
            brightness: { type: Type.NUMBER }
          }
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini interpretation failed:", error);
    throw error;
  }
};
