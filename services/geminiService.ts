
import { GoogleGenAI } from "@google/genai";
import { Coordinate } from "../types";
import { config } from "../config";

// Fallback data
const getFallbackData = (distance: number) => ({
  name: "Zona " + Math.floor(Math.random() * 999),
  description: "Área urbana não mapeada. Conquista registrada localmente.",
  strategicValue: Math.floor(distance * 100) + 50
});

export const generateTerritoryInfo = async (
  path: Coordinate[],
  distance: number
): Promise<{ name: string; description: string; strategicValue: number }> => {
  
  // Verifica configuração antes de tentar qualquer coisa
  if (!config.hasAiKey()) {
    return getFallbackData(distance);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    
    // Amostragem para reduzir tamanho do prompt
    const sampledPath = path
      .filter((_, index) => index % 10 === 0)
      .map(p => `(${p.lat.toFixed(3)}, ${p.lng.toFixed(3)})`)
      .join(' ');

    const prompt = `
      Jogo: Territory Run (Cyberpunk).
      Distância: ${distance.toFixed(1)}km.
      Gere JSON: { "name": "Nome Curto (Ex: Setor Alpha)", "description": "Frase tática curta", "strategicValue": (inteiro 100-500) }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("[AI] Erro:", error);
    return getFallbackData(distance);
  }
};

export const generateRivalName = async (): Promise<string> => {
    if (!config.hasAiKey()) return "Rival Sombra";
    
    try {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Gere 1 nickname cyberpunk. Ex: 'NeonBlade'. Apenas o nome.",
        });
        return response.text?.trim() || "Rival Sombra";
    } catch (e) {
        return "Rival Sombra";
    }
}
