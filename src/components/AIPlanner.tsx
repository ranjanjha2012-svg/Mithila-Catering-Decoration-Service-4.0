import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIPlanner() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! I am Mithila AI Planner. How can I help you plan your special event today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are Mithila AI Planner, a helpful assistant for Mithila Catering & Decoration Service. You help users plan their events, suggest menus, and provide information about catering services. Mithila Catering serves birthday parties, kitty parties, corporate events, Bhandara, weddings, anniversaries, and bulk orders across India. They also provide Tent & DJ Music services. Be polite, professional, and helpful. Keep responses concise and focused on event planning."
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });

      const result = await chat.sendMessage({ message: userMessage });
      const responseText = result.text;
      
      setMessages(prev => [...prev, { role: 'model', text: responseText || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I encountered an error. Please try again or contact our helpdesk.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-planner" className="py-20 bg-white/20 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mithila AI Planner</h2>
          <p className="text-gray-600">Chat with our AI to plan your perfect menu and event details.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 flex flex-col h-[600px] overflow-hidden">
          <div className="bg-orange-600 p-6 text-white flex items-center gap-3">
            <Bot size={24} />
            <div>
              <h3 className="font-bold text-lg">Event Planning Assistant</h3>
              <p className="text-xs text-orange-100">Online | Ready to help</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-orange-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-orange-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-orange-100 rounded-tl-none'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 rounded-tl-none">
                  <Loader2 size={24} className="animate-spin text-orange-600" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-orange-100 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your event requirements here..."
                className="flex-1 border border-orange-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base shadow-inner"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-orange-600 text-white px-6 rounded-2xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-orange-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
