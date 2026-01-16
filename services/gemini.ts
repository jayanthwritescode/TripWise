
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TripDetails, Itinerary, SearchResult, FlightInfo, HeroImage } from "../types";

const getAi = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("TripWise: API Key is missing. Check your .env file.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * Helper to handle and format API errors
 */
const handleApiError = (error: any): never => {
  const msg = error?.message || "";
  if (msg.includes("429") || msg.toLowerCase().includes("exhausted") || msg.toLowerCase().includes("rate limit")) {
    throw new Error("API_RATE_LIMIT");
  }
  if (msg.includes("API_KEY_INVALID")) {
    throw new Error("API_KEY_ERROR");
  }
  throw new Error("SERVICE_UNAVAILABLE");
};

/**
 * Autocomplete: Fast suggestions for location input.
 */
export const getDestinationSuggestions = async (input: string): Promise<string[]> => {
  if (!input || input.trim().length < 2) return [];
  const ai = getAi();
  
  const prompt = `Task: Provide exactly 5 real-world travel destinations (City, Country) that start with or closely match: "${input}". 
  Format: JSON array of strings only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text?.trim();
    if (!text) return [];
    const results = JSON.parse(text);
    return Array.isArray(results) ? results.slice(0, 5) : [];
  } catch (error) {
    console.warn("Autocomplete failed:", error);
    return [];
  }
};

/**
 * Illustration Generation: High-res travel photography.
 */
export const generateDestinationIllustration = async (destination: string, heroSearchTerm?: string): Promise<HeroImage | undefined> => {
  const ai = getAi();
  
  const prompt = `A professional, ultra-high resolution travel photography image of ${destination}. 
  Style: Cinematic, professional photography, stunning lighting, wide angle, vibrant colors. 
  Context: ${heroSearchTerm || 'scenic vista'}. No text, no logos, no watermarks.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            url: `data:image/png;base64,${part.inlineData.data}`,
            photographerName: "TripWise AI Artist",
            photographerUrl: "#"
          };
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    return {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      photographerName: "Travel Collection",
      photographerUrl: "#"
    };
  }
};

/**
 * Itinerary Generation.
 */
export const generateItinerary = async (details: TripDetails): Promise<Itinerary> => {
  const ai = getAi();
  
  const prompt = `Create a bespoke travel itinerary for a ${details.days}-day trip to ${details.destination} starting on ${details.startDate}. 
  Objective: ${details.objective}. 
  Detailed Plan: Include title, summary, heroSearchTerm (3 tags), and daily theme with weather and activities.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            heroSearchTerm: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  weather: {
                    type: Type.OBJECT,
                    properties: {
                      condition: { type: Type.STRING },
                      tempHigh: { type: Type.NUMBER },
                      tempLow: { type: Type.NUMBER }
                    }
                  },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const json = response.text?.trim();
    if (!json) throw new Error("Empty response");
    return JSON.parse(json);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Robust Search Discovery.
 */
export const searchTravelData = async (query: string, isFlight: boolean = false, useGrounding: boolean = true): Promise<SearchResult> => {
  const ai = getAi();
  
  const structuralRules = isFlight 
    ? `Provide 3 current flight options. Use this format:
       [OPTION_START]
       NAME: [Airline]
       DURATION: [h/m]
       STOPS: [Stops]
       TIMES: [Window]
       LAYOVERS: [Cities/None]
       PRICE: [Cost]
       TAG: [Label]
       REASONING: [Why]
       [OPTION_END]
       ---`
    : `Provide 3 real hotel options. Use this format:
       [OPTION_START]
       NAME: [Name]
       RATING: [Score]
       PRICE: [Rate]
       TAG: [Label]
       REASONING: [Why]
       CONTEXT: [Atmosphere]
       [OPTION_END]
       ---`;

  const prompt = `Task: ${query}.
  Requirement: Return ONLY 3 structured blocks using the format provided. 
  ${useGrounding ? 'Use real-time search data.' : 'Use your internal knowledge if live search is limited.'}
  
  ${structuralRules}`;

  try {
    const config: any = {
      maxOutputTokens: 2000,
      thinkingConfig: { thinkingBudget: 0 }
    };

    if (useGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: config,
    });

    const text = response.text || "";
    
    if (text.length < 50 || !text.includes('NAME:')) {
      if (useGrounding) throw new Error("Grounded search failed format check");
    }

    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];

    return {
      text: text,
      sources: chunks
    };
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.includes("429") || msg.toLowerCase().includes("exhausted") || msg.toLowerCase().includes("rate limit")) {
      throw new Error("API_RATE_LIMIT");
    }

    if (useGrounding) {
      console.warn("Retrying search without grounding tool...");
      return searchTravelData(query, isFlight, false);
    }
    
    return handleApiError(error);
  }
};
