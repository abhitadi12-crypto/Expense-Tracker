import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini AI service for parsing text and generating insights
 */
export const geminiService = {
  /**
   * Parse speech/text into expense details
   */
  parseExpense: async (text) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured in the environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Extract expense details from this text: "${text}". 
        If the text is not an expense (e.g., a question, a greeting, or irrelevant), return an object with "is_expense": false.
        If it IS an expense, return a JSON object with: 
        "is_expense": true,
        "item": string, 
        "amount": number, 
        "category": one of (Food, Transport, Shopping, Bills, Entertainment, Health, Other), 
        "date": YYYY-MM-DD format (assume today is ${new Date().toISOString().split('T')[0]} if not specified).` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_expense: { type: Type.BOOLEAN },
              item: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["is_expense"],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from AI model");
      }

      let jsonText = resultText.trim();
      // Clean up markdown code blocks if present
      if (jsonText.includes("```")) {
        jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      
      try {
        return JSON.parse(jsonText);
      } catch (parseErr) {
        console.error("JSON Parse Error. Raw text:", jsonText);
        // Fallback: try to find JSON-like structure if parsing failed
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw parseErr;
      }
    } catch (err) {
      console.error("Gemini Parsing Error:", err);
      throw err;
    }
  },

  /**
   * Generate financial insights based on expense history
   */
  generateInsights: async (expenses) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these expenses: ${JSON.stringify(expenses)}, provide 3 short, actionable financial insights or observations. Return them as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      console.error("Gemini Insights Error:", err);
      throw err;
    }
  }
};
