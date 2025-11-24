
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyPlan, Module, QuizQuestion, MultimediaContent, Language, LabContent } from "../types";

// Helper to get client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const getLanguageInstruction = (lang: Language) => {
  switch (lang) {
    case Language.EN: return "Output strictly in English.";
    case Language.ES: return "Output strictly in Spanish.";
    case Language.ZH: return "Output strictly in Simplified Chinese (Mandarin).";
    default: return "Output strictly in Portuguese.";
  }
};

export const generateStudyPlan = async (subject: string, timeAvailable: string, language: Language): Promise<StudyPlan> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      totalDurationPrediction: { type: Type.STRING, description: "Estimated time to complete (e.g. '3 weeks', '2 months')" },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING, description: "Short summary" },
            estimatedHours: { type: Type.NUMBER }
          },
          required: ["title", "description", "estimatedHours"]
        }
      }
    },
    required: ["totalDurationPrediction", "modules"]
  };

  const prompt = `
    Act as an expert teacher. Create a structured study plan to learn: "${subject}".
    Availability: "${timeAvailable}" per day.
    Split into logical modules.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getLanguageInstruction(language)
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    const modules: Module[] = (data.modules || []).map((m: any, index: number) => ({
      ...m,
      id: `mod-${index}-${Date.now()}`,
      isCompleted: false
    }));

    return {
      subject,
      dailyTime: timeAvailable,
      totalDurationPrediction: data.totalDurationPrediction || "...",
      modules,
      startDate: new Date().toISOString(),
      language,
      totalSecondsStudied: 0
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate plan.");
  }
};

export const generateModuleContent = async (subject: string, moduleTitle: string, language: Language): Promise<MultimediaContent> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      markdownContent: { type: Type.STRING, description: "Educational text in Markdown." },
      youtubeQueries: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3 search queries for YouTube." 
      },
      infographicDescription: { type: Type.STRING, description: "Visual description of a diagram." }
    },
    required: ["markdownContent", "youtubeQueries", "infographicDescription"]
  };

  const prompt = `
    Create educational material for module: "${moduleTitle}" of course "${subject}".
    1. markdownContent: Detailed explanation, rich formatting.
    2. youtubeQueries: 3 specific search terms.
    3. infographicDescription: Describe a visual infographic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getLanguageInstruction(language)
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      markdownContent: data.markdownContent || "Content unavailable.",
      youtubeQueries: data.youtubeQueries || [],
      infographicDescription: data.infographicDescription || "No visual description."
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Error loading content.");
  }
};

export const generateLabContent = async (subject: string, moduleTitle: string, language: Language): Promise<LabContent> => {
  const ai = getAiClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      svgCode: { type: Type.STRING, description: "Raw SVG code string (no markdown ticks) to visualize the concept. Use simple shapes, paths, and clear colors. Viewbox 0 0 400 300." },
      experimentSteps: { type: Type.STRING, description: "Explanation of what is happening in the SVG and how it applies to the concept." }
    },
    required: ["svgCode", "experimentSteps"]
  };

  const prompt = `
    Create a 'Virtual Lab' visualization for: "${moduleTitle}" in "${subject}".
    Generate a simple, illustrative SVG code that explains the concept visually (e.g., if Math, show a graph/integral area; if Biology, a cell diagram; if History, a timeline).
    Also provide a text explaining this 'experiment'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getLanguageInstruction(language)
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
     console.error("Error generating lab:", error);
     throw new Error("Error generating lab.");
  }
};

export const generateQuiz = async (subject: string, moduleTitle: string, language: Language): Promise<QuizQuestion[]> => {
  const ai = getAiClient();

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }
        },
        correctIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctIndex", "explanation"]
    }
  };

  const prompt = `
    Create a 5-question multiple choice quiz for: "${moduleTitle}" in "${subject}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getLanguageInstruction(language)
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Error generating quiz.");
  }
};
