import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Cpu, 
  CheckCircle, 
  Compass, 
  HelpCircle, 
  Terminal, 
  Database,
  ArrowRight
} from "lucide-react";
import { Contrato } from "../types";

interface Message {
  role: "user" | "model" | "system";
  text: string;
  toolInvoked?: string;
  toolArguments?: any;
  toolResult?: any;
  source?: string;
}

interface ChatCopilotProps {
  onDatabaseMutation: () => void;
}

export default function ChatCopilot({ onDatabaseMutation }: ChatCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Olá! Sou o assistente de inteligência artificial do **Condo+**. Estou à disposição para auxiliar na análise de inquilinos, faturamentos e contratos das suas locações de forma estrita e segura. Como posso ajudar você hoje?",
      source: "gemini-api"
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    if (!customText) {
      setUserInput("");
    }

    // Append user query block
    const userMsg: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          userMessage: textToSend
        })
      });

      if (response.ok) {
        const json = await response.json();
        const modelMsg: Message = {
          role: "model",
          text: json.responseMessage,
          toolInvoked: json.toolInvoked,
          toolArguments: json.toolArguments,
          toolResult: json.toolResult,
          source: json.source
        };
        setMessages(prev => [...prev, modelMsg]);
        
        // Notify database mutated sync if tool calls updated relation profiles!
        if (json.toolInvoked) {
          onDatabaseMutation();
        }
      } else {
        throw new Error("Erro na solicitação de chat de IA.");
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "model",
        text: `Desculpe, ocorreu uma pane nas conexões de rede do assistente: ${err.message}`,
        source: "local-simulation"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" id="ai-chat-view">
      
      {/* Main interactive Chat console column */}
      <div className="bg-white flex flex-col rounded-xl border border-gray-100 shadow-sm overflow-hidden h-[580px]">
        
        {/* Chat top header bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase">Assistente Inteligente (Mecanismo de IA Condo+)</h3>
              <p className="text-[10px] text-gray-400">Suporte ativo integrado ao seu portfólio imobiliário</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
            Gemini 3.5 Flash
          </span>
        </div>

        {/* Message feed stream window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isModel = m.role === "model";
            return (
              <div key={idx} className={`space-y-2 ${isModel ? "" : "flex flex-col items-end"}`}>
                
                {/* Role header labels */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <span className="uppercase">{m.role === "user" ? "Operador" : "IA Condo+"}</span>
                  {m.source && <span className="font-normal"> — {m.source === "gemini-api" ? "Gemini em Tempo Real" : "Conexão Segura"}</span>}
                </div>

                {/* Bubble card box */}
                <div 
                  className={`p-4 rounded-xl text-xs max-w-xl shadow-xs leading-relaxed space-y-2 ${
                    isModel 
                      ? "bg-slate-50 text-gray-800 border border-gray-100" 
                      : "bg-indigo-600 text-white font-medium"
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />

                {/* Extra tool payload reporting visualizer box */}
                {isModel && m.toolInvoked && (
                  <div className="bg-gray-900 text-gray-300 font-mono text-[11px] p-3 rounded-lg border border-gray-800 max-w-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Terminal className="h-3 w-3" /> Chamada de Função Interceptada
                      </span>
                      <span className="text-[9px] text-gray-500">Alteração de dados com sucesso</span>
                    </div>
                    
                    <div>
                      <span className="block text-[10px] text-indigo-400 font-bold uppercase">Função</span>
                      <code className="text-white font-bold">{m.toolInvoked}(...)</code>
                    </div>

                    <div>
                      <span className="block text-[10px] text-indigo-400 font-bold uppercase">Argumentos</span>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-tight text-[10px]">
                        {JSON.stringify(m.toolArguments, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="block text-[10px] text-indigo-400 font-bold uppercase">Retorno da Execução</span>
                      <pre className="text-gray-200 whitespace-pre-wrap leading-tight text-[10px]">
                        {JSON.stringify(m.toolResult, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-indigo-950/40 p-1.5 rounded text-[10px] text-indigo-300">
                      <Database className="h-3 w-3 shrink-0" />
                      <span>O banco de dados do sistema foi mutado sincronizadamente!</span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
          
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold animate-pulse">
              <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Gemini processando chamadas e orquestrando schemas...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box form */}
        <div className="bg-slate-50 p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Digite comandos de negócio para as ferramentas..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !userInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-lg flex items-center gap-1.5 transition"
            >
              <Send className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
