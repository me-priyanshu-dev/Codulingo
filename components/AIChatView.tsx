import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { chatWithTutor } from '../services/geminiService';
import { Button } from './Button';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Greetings, Cadet! 🦉 I am ready to decipher your queries. What HTML mystery shall we solve today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const replyText = await chatWithTutor([...messages, userMsg]);
    
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: replyText };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] bg-duo-bg animate-in fade-in pb-20 relative overflow-hidden transition-colors">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>

      {/* Character Display */}
      <div className="flex-shrink-0 p-4 flex justify-center items-center z-10 mt-2">
        <div className="relative group">
            <div className="text-8xl animate-float filter drop-shadow-xl">🦉</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/5 rounded-[100%] blur-sm"></div>
        </div>
      </div>
      
      <div className="text-center z-10 mb-2">
         <div className="inline-block bg-duo-card border-2 border-duo-gray px-4 py-1 rounded-2xl text-duo-text-sub font-bold text-xs uppercase tracking-widest">
             Tutor Online
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full border-2 border-duo-gray bg-white flex items-center justify-center mr-2 mt-1 shrink-0 text-sm">
                    🦉
                </div>
            )}
            
            <div className={`
              max-w-[85%] p-4 text-base font-medium leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-duo-blue-accent text-white border-b-4 border-duo-blue-dark rounded-2xl rounded-tr-none' 
                : 'bg-duo-card border-2 border-duo-gray text-duo-text rounded-2xl rounded-tl-none'}
            `}>
              {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-duo-card border-2 border-duo-gray p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <div className="w-2 h-2 bg-duo-text-sub rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-duo-text-sub rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-duo-text-sub rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Console */}
      <div className="p-4 bg-duo-bg border-t-2 border-duo-gray z-20">
        <div className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..." 
                className="flex-1 bg-duo-gray-light border-2 border-duo-gray focus:border-duo-gray focus:bg-white rounded-2xl px-4 py-3 text-duo-text font-bold outline-none transition-all placeholder:text-duo-text-sub"
                disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} variant="primary" className="px-4 rounded-2xl">
                <Send size={20} />
            </Button>
        </div>
      </div>
    </div>
  );
};