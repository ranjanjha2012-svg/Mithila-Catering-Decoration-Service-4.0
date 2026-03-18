import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, Trash2, Download } from 'lucide-react';
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

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{ role: 'model', text: 'Namaste! I am Mithila AI Planner. How can I help you plan your special event today?' }]);
    }
  };

  const saveChat = () => {
    const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mithila-event-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          systemInstruction: "You are Mithila AI Planner, a helpful and friendly assistant for Mithila Catering & Decoration Service. You help users plan their events, suggest menus, and provide information about catering services. Mithila Catering serves birthday parties, kitty parties, corporate events, Bhandara, weddings, anniversaries, and bulk orders across India. They also provide Tent & DJ Music services. Be polite, professional, and helpful. Keep responses concise and focused on event planning."
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
    <section id="ai-planner" className="py-20 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Mithila AI Planner</h2>
          <p className="text-orange-100/80">Chat with our AI to plan your perfect menu and event details.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 flex flex-col h-[600px] overflow-hidden">
          <div className="bg-green-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
                  alt="Mithila Logo" 
                  className="h-8 w-8 object-contain bg-white rounded-full p-1"
                />
                <span className="absolute -bottom-1 -right-1 live-indicator border-2 border-green-900"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Mithila AI Planner</h3>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live | Ready to help
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={saveChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Save Chat"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-orange-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-orange-600 text-white rounded-tr-none' 
                    : 'bg-[#8B008B] text-white shadow-sm border border-magenta-900/20 rounded-tl-none'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#8B008B] p-4 rounded-2xl shadow-sm border border-magenta-900/20 rounded-tl-none flex items-center gap-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
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
                className="bg-green-900 text-white px-6 rounded-2xl hover:bg-green-800 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-green-200"
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
