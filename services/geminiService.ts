
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIAnalysis, IssueType, Severity, IssueReport } from "../types";

export const analyzeIssue = async (
  description: string,
  location: { lat: number, lng: number },
  existingReports: IssueReport[],
  imageUri?: string
): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contextReports = existingReports
    .slice(0, 15)
    .map(r => ({
      id: r.id,
      type: r.analysis?.issueType,
      desc: r.description.substring(0, 50),
      lat: r.location.lat,
      lng: r.location.lng,
      status: r.status
    }));

  const prompt = `
    Analyze this community issue report and compare it with the list of existing reports to detect duplicates.
    
    NEW REPORT:
    Description: "${description}"
    Location: Lat ${location.lat}, Lng ${location.lng}
    
    EXISTING REPORTS (Context):
    ${JSON.stringify(contextReports)}
    
    TASK:
    1. Classify the issue into one of: ${Object.values(IssueType).join(', ')}.
    2. Determine severity based on public safety risk.
    3. Generate a priority score (0-100).
    4. DUPLICATE DETECTION: If within ~50 meters and similar description, it's a duplicate.
    5. Provide a citizen-friendly summary and an authority-ready action insight.
  `;

  const parts: any[] = [{ text: prompt }];
  if (imageUri) {
    const base64Data = imageUri.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issueType: { type: Type.STRING },
          severity: { type: Type.STRING },
          priorityScore: { type: Type.NUMBER },
          citizenSummary: { type: Type.STRING },
          authorityAction: { type: Type.STRING },
          detectedDuplicatesCount: { type: Type.NUMBER },
          likelyDuplicateId: { type: Type.STRING }
        },
        required: ["issueType", "severity", "priorityScore", "citizenSummary", "authorityAction", "detectedDuplicatesCount"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return {
    ...result,
    issueType: Object.values(IssueType).includes(result.issueType) ? result.issueType : IssueType.OTHER,
    severity: Object.values(Severity).includes(result.severity) ? result.severity : Severity.MEDIUM,
  };
};

/**
 * Generates an AI illustration of the issue for context.
 */
export const generateIssueIllustration = async (description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A realistic documentary-style photo showing this urban issue: "${description}". The scene is a city street, high detail, clear lighting, realistic textures.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

/**
 * Uses Gemini 3 Pro with Thinking Mode to generate a strategic urban plan
 */
export const getStrategicUrbanPlan = async (clusterReports: IssueReport[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const reportsContext = clusterReports.map(r => ({
    type: r.analysis?.issueType,
    location: r.location,
    severity: r.analysis?.severity
  }));

  const prompt = `
    As a Senior Urban Planner and Data Scientist, analyze this cluster of municipal issues:
    ${JSON.stringify(reportsContext)}
    
    Provide a DEEP STRATEGIC ACTION PLAN (approx 300 words).
    Your response should include:
    1. Root Cause Analysis (e.g., aging infrastructure, climate factors).
    2. A 6-month prioritized budget allocation strategy.
    3. Expected social and environmental ROI after resolution.
    4. Use professional, authority-ready language.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text || "Strategic analysis unavailable.";
};

/**
 * Citizen Support Chatbot
 */
export const getChatbotResponse = async (query: string, history: {role: string, content: string}[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chatContext = history.map(h => `${h.role}: ${h.content}`).join('\n');
  
  const prompt = `
    You are CivicPulse AI, a friendly and professional civic-tech assistant. 
    A citizen is asking: "${query}"
    
    History:
    ${chatContext}
    
    Guidance: 
    - Keep answers under 60 words.
    - Be helpful and encouraging about civic engagement.
    - If they ask about status, tell them reports are processed in real-time by municipal AI.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || "I'm sorry, I'm having trouble connecting to city services right now.";
};
