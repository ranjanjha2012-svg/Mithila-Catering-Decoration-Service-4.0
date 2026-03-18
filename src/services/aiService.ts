import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIPlannerResponse = async (message: string, chatHistory: { role: "user" | "model"; parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Mithila AI Planner, a helpful assistant for Mithila Catering & Decoration Service. You help users plan their events, suggest menus, and provide information about catering services. Mithila Catering serves birthday parties, kitty parties, corporate events, Bhandara, weddings, anniversaries, and bulk orders across India. They also provide Tent & DJ Music services. Be polite, professional, and helpful."
    },
    history: chatHistory,
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};
