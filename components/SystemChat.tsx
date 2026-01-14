import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Terminal, Cpu } from 'lucide-react';
import { chatWithSystem } from '../services/geminiService';

interface SystemChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const SystemChat: React.FC<SystemChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-system-panel border-t-2 md:border-2 md:rounded-lg border-system-border/50 backdrop-blur-sm overflow-hidden shadow-[0_0_20px_rgba(0,168,204,0.2)]">
      <div className="bg-gray-900/80 p-3 border-b border-system-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Terminal className="w-4 h-4 text-system-blue" />
           <span className="font-orbitron text-sm text-system-blue tracking-wider">SYSTEM LOG</span>
        </div>
        <Cpu className={`w-4 h-4 text-system-blue ${isLoading ? 'animate-pulse' : ''}`} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm" ref={scrollRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] p-3 rounded-lg border
                ${msg.sender === 'USER' 
                  ? 'bg-blue-900/20 border-blue-500/30 text-blue-100 rounded-br-none' 
                  : 'bg-gray-900/60 border-gray-600/30 text-gray-300 rounded-bl-none shadow-[0_0_5px_rgba(0,240,255,0.1)]'
                }
              `}
            >
              {msg.sender === 'SYSTEM' && (
                <div className="text-xs text-system-blue mb-1 font-bold tracking-wider">SYSTEM ALERT</div>
              )}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900/60 p-3 rounded-lg rounded-bl-none border border-gray-600/30">
               <span className="flex gap-1">
                 <span className="w-1.5 h-1.5 bg-system-blue rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-system-blue rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-system-blue rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
               </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-gray-900/80 border-t border-system-border/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 bg-black/40 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-system-blue transition-colors font-rajdhani"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-system-blue/10 border border-system-blue/50 text-system-blue rounded hover:bg-system-blue hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
