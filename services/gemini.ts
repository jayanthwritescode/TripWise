
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TripDetails, Itinerary, SearchResult, FlightInfo, HeroImage } from "../types";

const getAi = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("TripWise: API Key is missing. Check your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * Universal Error Handler
 * Categorizes any API or network failure into user-friendly states.
 */
const handleAnyApiError = (error: any): never => {
  const msg = (error?.message || error?.toString() || "").toLowerCase();
  console.error("Gemini API Error details:", error);

  if (msg.includes("429") || msg.includes("quota") || msg.includes("limit")) {
    throw new Error("ERR_RATE_LIMIT");
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    throw new Error("ERR_NETWORK");
  }
  if (msg.includes("key") || msg.includes("403") || msg.includes("401")) {
    throw new Error("ERR_AUTH");
  }
  if (msg.includes("safety") || msg.includes("blocked")) {
    throw new Error("ERR_SAFETY");
  }
  
  throw new Error("ERR_SERVICE_DOWN");
};

/**
 * Autocomplete: Fast suggestions for location input.
 */
export const getDestinationSuggestions = async (input: string): Promise<string[]> => {
  if (!input || input.trim().length < 2) return [];
  const ai = getAi();
  
  const prompt = `Task: Provide exactly 5 real-world travel destinations (City, Country) starting with: "${input}". 
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
        }
      }
    });

    const text = response.text?.trim();
    return text ? JSON.parse(text) : [];
  } catch (error) {
    // Autocomplete should fail silently to not interrupt typing
    return [];
  }
};

/**
 * Illustration Generation: High-res travel photography.
 * Always returns a valid HeroImage even on error.
 */
export const generateDestinationIllustration = async (destination: string, heroSearchTerm?: string): Promise<HeroImage> => {
  const fallback: HeroImage = {
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    photographerName: "TripWise Collection",
    photographerUrl: "#"
  };

  try {
    const ai = getAi();
    const prompt = `Professional travel photography: ${destination}, ${heroSearchTerm || 'scenic vista'}. Ultra-high res, cinematic lighting, wide angle.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return {
            url: `data:image/png;base64,${part.inlineData.data}`,
            photographerName: "AI Artist",
            photographerUrl: "#"
          };
        }
      }
    }
    return fallback;
  } catch (error) {
    console.warn("Visual generation skipped, using fallback.");
    return fallback;
  }
};

/**
 * Itinerary Generation.
 */
export const generateItinerary = async (details: TripDetails): Promise<Itinerary> => {
  try {
    const ai = getAi();
    const prompt = `Create a bespoke travel itinerary for a ${details.days}-day trip to ${details.destination} starting on ${details.startDate}. Objective: ${details.objective}. Include title, summary, heroSearchTerm, and daily theme with weather and activities.`;

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
        }
      }
    });

    const json = response.text?.trim();
    if (!json) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(json);
  } catch (error) {
    return handleAnyApiError(error);
  }
};

/**
 * Robust Search Discovery.
 */
export const searchTravelData = async (query: string, isFlight: boolean = false, useGrounding: boolean = true): Promise<SearchResult> => {
  try {
    const ai = getAi();
    const structuralRules = isFlight 
      ? `Provide 3 flight options. Format: [OPTION_START] NAME: [Airline] PRICE: [Cost] DURATION: [Time] STOPS: [Stops] [OPTION_END] ---`
      : `Provide 3 hotel options. Format: [OPTION_START] NAME: [Hotel] PRICE: [Rate] RATING: [Score] [OPTION_END] ---`;

    const config: any = { maxOutputTokens: 2000 };
    if (useGrounding) config.tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: ${query}. Rules: Return ONLY structured blocks. ${structuralRules}`,
      config
    });

    const text = response.text || "";
    if (text.length < 50) {
      if (useGrounding) throw new Error("FALLBACK_TRIGGER");
    }

    return {
      text: text,
      sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || []
    };
  } catch (error: any) {
    if (useGrounding) {
      return searchTravelData(query, isFlight, false);
    }
    return handleAnyApiError(error);
  }
};
