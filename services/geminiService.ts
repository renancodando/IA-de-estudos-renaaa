import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyPlan, Module, QuizQuestion, MultimediaContent } from "../types";

// Helper to get client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateStudyPlan = async (subject: string, timeAvailable: string): Promise<StudyPlan> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      totalDurationPrediction: { type: Type.STRING, description: "Estimated time to complete the whole course (e.g. '3 semanas', '2 meses')" },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING, description: "Short summary of what will be learned" },
            estimatedHours: { type: Type.NUMBER, description: "Hours needed for this module" }
          },
          required: ["title", "description", "estimatedHours"]
        }
      }
    },
    required: ["totalDurationPrediction", "modules"]
  };

  const prompt = `
    Atue como um professor especialista e mentor de estudos.
    Crie um plano de estudos estruturado para aprender: "${subject}".
    O aluno tem disponibilidade de: "${timeAvailable}" por dia.
    
    O plano deve ser dividido em módulos lógicos e progressivos.
    Estime a duração total do curso.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a helpful educational planner. Output strictly in Portuguese."
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Add client-side IDs and default states
    const modules: Module[] = (data.modules || []).map((m: any, index: number) => ({
      ...m,
      id: `mod-${index}-${Date.now()}`,
      isCompleted: false
    }));

    return {
      subject,
      dailyTime: timeAvailable,
      totalDurationPrediction: data.totalDurationPrediction || "Duração indefinida",
      modules,
      startDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Falha ao criar o plano de estudos. Tente novamente.");
  }
};

export const generateModuleContent = async (subject: string, moduleTitle: string): Promise<MultimediaContent> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      markdownContent: { type: Type.STRING, description: "The main educational text in Markdown format." },
      youtubeQueries: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3 specific search queries to find good video tutorials on YouTube for this topic." 
      },
      infographicDescription: { type: Type.STRING, description: "A detailed textual description of a visual infographic or diagram that would explain the core concept." }
    },
    required: ["markdownContent", "youtubeQueries", "infographicDescription"]
  };

  const prompt = `
    Crie um material didático completo para o módulo: "${moduleTitle}" do curso de "${subject}".
    
    1. markdownContent: Explicação detalhada, introdução, conceitos, exemplos e resumo. Use formatação rica (negrito, listas, títulos).
    2. youtubeQueries: Sugira 3 termos de busca exatos para encontrar vídeos bons sobre isso.
    3. infographicDescription: Descreva como seria um infográfico ideal para explicar este tópico visualmente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      markdownContent: data.markdownContent || "Conteúdo indisponível.",
      youtubeQueries: data.youtubeQueries || [],
      infographicDescription: data.infographicDescription || "Sem descrição visual."
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Erro ao carregar o conteúdo.");
  }
};

export const generateQuiz = async (subject: string, moduleTitle: string): Promise<QuizQuestion[]> => {
  const ai = getAiClient();

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Array of 4 possible answers"
        },
        correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
        explanation: { type: Type.STRING, description: "Why this is the correct answer" }
      },
      required: ["question", "options", "correctIndex", "explanation"]
    }
  };

  const prompt = `
    Crie um quiz de 5 perguntas de múltipla escolha para testar o conhecimento sobre: "${moduleTitle}" dentro do contexto de "${subject}".
    As perguntas devem verificar o entendimento real do aluno.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Erro ao gerar o quiz.");
  }
};