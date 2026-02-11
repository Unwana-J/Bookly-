
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, Product } from "../types";

// Lazy initialization to prevent crash on startup if key is missing
const getAI = () => {
  const key = process.env.API_KEY || '';
  if (!key) {
    console.warn("Bookly: No Gemini API Key found. AI features will be disabled.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) cleaned = match[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

export const analyzeIntentAndExtract = async (
  inputs: { text?: string; imageBase64?: string }[],
  inventory: Product[]
): Promise<ExtractionResult | null> => {
  const inventoryList = inventory.map(p => `"${p.name}" (Price:${p.price}, Stock:${p.stock})`).join(", ");

  const systemInstruction = `You are the Bookly AI Engine. Analyze business inputs and return structured JSON.

INTENT CATEGORIES:
1. "sale": Customer buying/ordering items.
2. "expense": Business costs (rent, logistics, delivery fees).
3. "product": New inventory items.
4. "inquiry": Customer asking for info (delivery cost, account details, availability).

INSTRUCTIONS:
- Match products to this list: ${inventoryList}.
- If "inquiry" is detected, provide "suggestedActions" (e.g., "Send Account Details", "Calculate Shipping").
- Look for delivery or shipping fees in sales dialogue and extract into "deliveryFee".
- "confidence": "high", "medium", or "low".
- Return ONLY valid JSON.`;

  const parts: any[] = [{ text: systemInstruction }];
  inputs.forEach(input => {
    if (input.text) parts.push({ text: `INPUT:\n${input.text}` });
    if (input.imageBase64) {
      const data = input.imageBase64.includes(',') ? input.imageBase64.split(',')[1] : input.imageBase64;
      parts.push({ inlineData: { mimeType: "image/jpeg", data } });
    }
  });

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['sale', 'product', 'expense', 'inquiry'] },
            confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            orderType: { type: Type.STRING, enum: ['single', 'batch'] },
            customers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  handle: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  deliveryFee: { type: Type.NUMBER },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        productName: { type: Type.STRING },
                        quantity: { type: Type.INTEGER },
                        variant: { type: Type.STRING },
                        unitPrice: { type: Type.NUMBER }
                      }
                    }
                  },
                  orderTotal: { type: Type.NUMBER },
                  address: { type: Type.STRING }
                }
              }
            },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            costPrice: { type: Type.NUMBER },
            stock: { type: Type.INTEGER },
            category: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["intent", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    const json = JSON.parse(cleanJsonResponse(text));

    if (json.intent === 'sale' && json.customers) {
      json.customers = json.customers.map((c: any) => ({
        ...c,
        orderTotal: c.orderTotal || c.items?.reduce((acc: number, item: any) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0
      }));
    }

    return json;
  } catch (e) {
    console.error("Extraction Failed:", e);
    return null;
  }
};
