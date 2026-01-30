
import { GoogleGenAI } from "@google/genai";
import { Property, MapSearchResult, Stats } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePropertyDescription = async (
  title: string,
  features: string[],
  type: string
): Promise<string> => {
  if (!apiKey) return "AI description unavailable (Missing API Key).";
  try {
    const prompt = `Write a compelling, professional real estate listing description for a ${type}.
    Title: ${title}
    Key Features: ${features.join(', ')}.
    Keep it under 150 words. Highlight the lifestyle benefits.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    return "Error generating description.";
  }
};

export const askPropertyAssistant = async (
  property: Property,
  question: string
): Promise<string> => {
  if (!apiKey) return "AI Assistant unavailable.";
  try {
    const context = `
      You are a helpful virtual leasing agent for the property "${property.title}".
      Details:
      - Price: ₹${property.price}/month
      - Address: ${property.address}
      - Size: ${property.sqft} sqft, ${property.bedrooms} Beds
      - Amenities: ${property.amenities.join(', ')}
      - Description: ${property.description}
      User Question: "${question}"
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: context,
    });
    return response.text || "I'm not sure, please contact the owner.";
  } catch (error) {
    return "I'm having trouble connecting right now.";
  }
};

// --- MAPS INTEGRATION ---
export const searchLocationWithMaps = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<MapSearchResult> => {
  if (!apiKey) return { text: "AI Maps unavailable.", mapLinks: [] };

  try {
    // Force specific map query behavior
    const adjustedQuery = `${query} location details and nearby amenities on Google Maps`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: adjustedQuery,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        } : undefined,
        systemInstruction: `Provide a structured summary of the location.
        Always conclude with a list of direct Google Maps links for key landmarks nearby.`
      },
    });

    const text = response.text || "No insights found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapLinks = chunks
      .filter((c: any) => c.maps && c.maps.uri)
      .map((c: any) => ({
        title: c.maps.title || "View on Google Maps",
        uri: c.maps.uri
      }));

    return { text, mapLinks };
  } catch (error) {
    return { text: "Unable to retrieve location data.", mapLinks: [] };
  }
};

// --- NEW AI FEATURES ---

// 1. Negotiation Bot
export const draftNegotiationMessage = async (
  propertyTitle: string,
  listingPrice: number,
  targetPrice: number,
  reason: string
): Promise<string> => {
  if (!apiKey) return "Negotiation tool unavailable.";
  try {
    const prompt = `Draft a polite but persuasive message to a landlord to negotiate rent.
    Property: ${propertyTitle}
    Listing Price: ₹${listingPrice}
    Target Price: ₹${targetPrice}
    Reason: ${reason}
    Keep it professional, respectful, and under 100 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not draft message.";
  } catch (e) {
    return "Error drafting message.";
  }
};

// 2. Legal Guardian (Lease Review)
export const reviewLeaseTerms = async (contractText: string): Promise<string> => {
  if (!apiKey) return "Legal tool unavailable.";
  try {
    const prompt = `Review this lease clause for red flags or unusual terms for a tenant in India:
    "${contractText}"
    Identify any risks politely. If safe, say "Looks standard."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Could not review terms.";
  } catch (e) {
    return "Error reviewing terms.";
  }
};

export const editPropertyImage = async (imageSrc: string, prompt: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const base64Data = imageSrc.split(',')[1];
    if (!base64Data) return null;
    const mimeType = imageSrc.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const searchRentalTrends = async (query: string): Promise<{text: string, sources: {title: string, uri: string}[]}> => {
  if (!apiKey) return { text: "Search unavailable.", sources: [] };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const text = response.text || "No results found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter(Boolean) || [];
    return { text, sources };
  } catch (error) {
    return { text: "Error fetching trends.", sources: [] };
  }
};

export const askRealEstateAdvisor = async (query: string): Promise<string> => {
  if (!apiKey) return "Advisor unavailable.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "I couldn't generate a detailed analysis.";
  } catch (error) {
    return "Expert Advisor is currently taking a break.";
  }
};

export const analyzePropertyImage = async (imageSrc: string): Promise<string> => {
  if (!apiKey) return "Analysis unavailable.";
  try {
    const base64Data = imageSrc.split(',')[1];
    if (!base64Data) return "Invalid image data";
    const mimeType = imageSrc.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Analyze this image. Identify room type, style, and 3 key features." }
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    return "Error analyzing image.";
  }
};

export const analyzeOwnerStats = async (stats: Stats): Promise<string> => {
  if (!apiKey) return "Insights unavailable.";
  try {
    const prompt = `Analyze these rental business stats:
    Revenue: ₹${stats.totalRevenue}, Occupancy: ${stats.occupancyRate}%.
    Provide 3 strategic insights (Performance, Attention, Action).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis incomplete.";
  } catch (error) {
    return "Unable to generate insights.";
  }
};

export const genAIClient = ai;
