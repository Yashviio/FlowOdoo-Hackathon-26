import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "👋 Hi! I'm your GlobeTrotter AI Copilot. Ask me for destination recommendations, packing tips, or how to optimize your travel budget!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('tokyo') || q.includes('japan')) {
      return "🇯🇵 **Tokyo Recommendations**:\n- **Sightseeing**: *teamLab Planets* (mind-blowing digital museum) and *Shinjuku Gyoen* for serenity.\n- **Food**: Visit *Tsukiji Outer Market* in the morning for fresh sushi.\n- **Budget Tip**: Buy a 72-hour Tokyo Subway Ticket for unlimited travel!";
    }
    if (q.includes('paris') || q.includes('france')) {
      return "🇫🇷 **Paris Recommendations**:\n- **Must-Do**: Pre-book *Eiffel Tower Summit* evening tickets to see the sparkling lights.\n- **Activity**: Take a croissant-baking class in Saint-Germain.\n- **Savings**: Many museums (like the Louvre) are free on the first Sunday of the month!";
    }
    if (q.includes('rome') || q.includes('italy')) {
      return "🇮🇹 **Rome Recommendations**:\n- **Sightseeing**: The *Colosseum & Roman Forum* tour is essential. Walk through the Gladiator entrance!\n- **Food**: Learn to roll handmade pasta near Piazza Navona.\n- **Local Rule**: Avoid eating sitting down at tourist piazzas—stand at the bar to pay local prices!";
    }
    if (q.includes('sydney') || q.includes('australia')) {
      return "🇦🇺 **Sydney Recommendations**:\n- **Adventure**: Catch the sunset on the *Sydney Harbour Bridge Climb* or take a surf lesson at Bondi.\n- **Sightseeing**: Take a behind-the-scenes tour of the Opera House.\n- **Local secret**: Take the public ferry to Manly Beach for spectacular harbor views at a fraction of the cruise price!";
    }
    if (q.includes('budget') || q.includes('cost') || q.includes('save') || q.includes('money')) {
      return "💰 **Smart Budget Optimization Secrets**:\n1. **Categorize Transit**: Group train/flight costs early in your itinerary builder to visualize major fixed expenses.\n2. **Daily Buffer**: Keep 15% of your daily limit for unexpected entry fees or dining.\n3. **Local Cuisine**: Street food in Bangkok or local Izakayas in Tokyo are extremely cost-effective and delicious!";
    }
    if (q.includes('pack') || q.includes('packing') || q.includes('checklist')) {
      return "🎒 **Essential Travel Packing Rules**:\n1. **Universal Adapter**: Get one with multiple USB ports.\n2. **Important docs**: Save digital copies of passports, visas, and hotel bookings offline on your phone.\n3. **Layer Up**: Pack versatile clothing that can be layered rather than bulky single-purpose coats.";
    }
    if (q.includes('cairo') || q.includes('egypt')) {
      return "🇪🇬 **Cairo Recommendations**:\n- **Must-Do**: Giza Pyramids and Sphinx guided camel trek.\n- **Shopping**: Bargain for glass lanterns at Khan El-Khalili Bazaar (aim for 50% of the initial quote).\n- **Culture**: Visit the grand Egyptian Museum!";
    }
    
    return "💡 That sounds like a wonderful plan! Allocating 3-4 days per city is generally the sweet spot for multi-city travel. Make sure to log accommodation costs under your Stop activities to monitor budget trends. Ask me about Tokyo, Paris, Rome, Sydney, or budgeting tips!";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and typing delay
    setTimeout(() => {
      const aiResponseText = getAIResponse(userMessage.text);
      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-50">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative group hover:scale-110 transition duration-300 border border-primary-500/30 cursor-pointer"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
          <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            🤖 Ask AI Copilot
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden animate-fade-in relative z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-indigo-700 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">AI Travel Copilot</h3>
                <span className="text-[10px] text-sky-200 font-bold block">Online & ready to advise</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Panel */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${msg.sender === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[75%] shadow-sm leading-relaxed border ${msg.sender === 'user' ? 'bg-primary-600 text-white border-primary-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                  <span className={`text-[8px] mt-1 block text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                  <Bot className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-100 p-2.5 rounded-2xl rounded-tl-none flex items-center space-x-1 shadow-sm">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. recommend Tokyo)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
            />
            <button
              type="submit"
              disabled={input.trim() === '' || isTyping}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
