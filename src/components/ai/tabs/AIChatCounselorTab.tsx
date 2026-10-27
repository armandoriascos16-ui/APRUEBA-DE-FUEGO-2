import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  User, 
  RefreshCw, 
  BookOpen, 
  Brain, 
  Zap, 
  History, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ScrollText, 
  Sun, 
  HeartHandshake, 
  Library, 
  MessageSquare,
  X
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  toolMode?: string;
}

export interface StoredConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  model: 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
}

export type BiblicalToolMode = 'general' | 'exegesis' | 'sermon' | 'devotional' | 'prayer' | 'topical';

const BIBLICAL_TOOLS: Array<{
  id: BiblicalToolMode;
  name: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  placeholder: string;
  samplePrompt: string;
}> = [
  {
    id: 'general',
    name: 'Consejería Pastoral',
    desc: 'Diálogo espiritual abierto y dudas de fe',
    icon: Bot,
    placeholder: 'Escribe tu consulta bíblica o pastoral...',
    samplePrompt: '¿Cómo mantener mi fe firme en la universidad o el trabajo?',
  },
  {
    id: 'exegesis',
    name: 'Exégesis & Contexto',
    desc: 'Análisis histórico, léxico y aplicación',
    icon: BookOpen,
    placeholder: 'Introduce el pasaje bíblico (ej: Romanos 8:28 o Daniel 8:14)...',
    samplePrompt: 'Explícame el contexto histórico y significado de Daniel 8:14',
  },
  {
    id: 'sermon',
    name: 'Bosquejo de Sermón JA',
    desc: 'Homilética para culto joven o predicación',
    icon: ScrollText,
    placeholder: 'Indica el tema o texto para el sermón (ej: Josué 1:9 valentía)...',
    samplePrompt: 'Prepara un bosquejo homilético sobre la parábola del hijo pródigo para culto joven',
  },
  {
    id: 'devotional',
    name: 'Devocional Juvenil',
    desc: 'Historia reflexiva, lema y reto diario',
    icon: Sun,
    placeholder: 'Tema para el devocional (ej: confianza, perdón, perseverancia)...',
    samplePrompt: 'Escribe un devocional juvenil sobre vencer la ansiedad con Dios',
  },
  {
    id: 'prayer',
    name: 'Oración & Consuelo',
    desc: 'Clamor pastoral basado en promesas',
    icon: HeartHandshake,
    placeholder: 'Motivo de oración o dificultad por la que estás pasando...',
    samplePrompt: 'Ayúdame con una oración pastoral para un momento de duelo y tristeza',
  },
  {
    id: 'topical',
    name: 'Estudio Temático',
    desc: 'Cadena de referencias bíblicas comparadas',
    icon: Library,
    placeholder: 'Tema doctrinal a estudiar (ej: sábado, estado de los muertos)...',
    samplePrompt: 'Cadena de textos bíblicos comparados sobre el reposo en el sábado bíblico',
  },
];

export const AIChatCounselorTab: React.FC = () => {
  const { currentUser } = useApp();
  const userId = currentUser?.id || 'invitado_apdf';
  const storageKey = `apdf_ai_conversations_${userId}`;

  // Conversations state with multi-conversation support
  const [conversations, setConversations] = useState<StoredConversation[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read AI conversations from storage:', e);
    }

    // Default first conversation
    const defaultConv: StoredConversation = {
      id: `conv_${Date.now()}`,
      title: 'Consejería Pastoral Inicial',
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      updatedAt: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      messages: [
        {
          id: 'welcome',
          role: 'model',
          content: `¡La gracia y la paz del Señor sean contigo, ${currentUser?.name || 'hermano'}! Soy tu Mentor Bíblico y Consejero Pastoral en «A PRUEBA DE FUEGO».

¿En qué pasaje bíblico, dilema juvenil, preparación de sermón o inquietud espiritual te puedo acompañar hoy? Puedes elegir una de las herramientas de estudio arriba para comenzar.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.8-flash',
        },
      ],
    };
    return [defaultConv];
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => conversations[0]?.id || `conv_${Date.now()}`);
  const [activeTool, setActiveTool] = useState<BiblicalToolMode>('general');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConversation?.messages || [];

  // Persist conversations on every state change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch (e) {
      console.warn('LocalStorage save error for AI conversations:', e);
    }
  }, [conversations, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleStartNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: StoredConversation = {
      id: newId,
      title: 'Nueva Consulta Bíblica',
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      updatedAt: new Date().toISOString(),
      model: selectedModel,
      messages: [
        {
          id: `welcome_${Date.now()}`,
          role: 'model',
          content: `¡Bienvenido a una nueva sesión espiritual! ¿Qué tema, inquietud o pasaje bíblico deseas estudiar o consultar hoy?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ],
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newId);
    setErrorMsg(null);
    setInputPrompt('');
    setShowHistoryDrawer(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleDeleteConversation = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      // Si es la única, simplemente reiniciamos sus mensajes
      handleStartNewConversation();
      setConversations(prev => prev.filter(c => c.id !== idToDelete));
      return;
    }

    const updated = conversations.filter(c => c.id !== idToDelete);
    setConversations(updated);
    if (activeConvId === idToDelete) {
      setActiveConvId(updated[0].id);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolMode: activeTool,
    };

    // Auto-update conversation title if it's the first user question
    const isFirstUserMsg = !activeConversation.messages.some(m => m.role === 'user');
    const autoTitle = isFirstUserMsg 
      ? (text.length > 36 ? text.substring(0, 36) + '...' : text)
      : activeConversation.title;

    // Append user message immediately
    const updatedMessagesWithUser = [...activeConversation.messages, userMessage];
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          title: autoTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessagesWithUser,
        };
      }
      return c;
    }));

    setInputPrompt('');
    setIsLoading(true);

    try {
      const history = updatedMessagesWithUser
        .filter(m => !m.id.startsWith('welcome'))
        .slice(-8) // Contexto de los últimos mensajes para coherencia multi-turno
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history,
          model: selectedModel,
          toolMode: activeTool,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo de conexión con el servicio.`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
        toolMode: activeTool,
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [...updatedMessagesWithUser, botMessage],
          };
        }
        return c;
      }));
    } catch (err: any) {
      console.error('Error in chat request:', err);
      setErrorMsg(err.message || 'No fue posible conectar con el asistente de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const activeToolConfig = BIBLICAL_TOOLS.find(t => t.id === activeTool) || BIBLICAL_TOOLS[0];

  return (
    <div className="relative flex flex-col h-[720px] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* 1. Top Header with Actions */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Bot Identity & Active Conversation Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm truncate">
                {activeConversation.title}
              </h3>
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono shrink-0">
                Biblia & JA
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {activeToolConfig.desc}
            </p>
          </div>
        </div>

        {/* Right: History, New Chat & Model Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          
          {/* History Button */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            title="Ver historial de conversaciones guardadas"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Historial</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">{conversations.length}</span>
          </button>

          {/* New Conversation Button */}
          <button
            onClick={handleStartNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition"
            title="Comenzar una nueva conversación limpia"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Consulta</span>
          </button>

          {/* Model Selector Pill */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setSelectedModel('gemini-4-argon')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg font-medium transition ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-4-argon: Razonamiento profundo y exégesis teológica"
            >
              <Brain className="w-3 h-3" />
              <span>Argon</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg font-medium transition ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.8-flash: Uso general equilibrado"
            >
              <Sparkles className="w-3 h-3" />
              <span>Flash</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg font-medium transition ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.1-flash-lite: Respuestas rápidas y versículos"
            >
              <Zap className="w-3 h-3" />
              <span>Lite</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Biblical Tools Bar (Fase 5: Herramientas Especiales) */}
      <div className="bg-slate-950/60 border-b border-slate-800/60 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-400" />
          Herramienta:
        </span>
        {BIBLICAL_TOOLS.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                setErrorMsg(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-600 text-slate-950'
                    : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isUser ? (
                  currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-850/95 text-slate-100 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Footer of message */}
                <div className={`flex items-center justify-between gap-3 mt-2 pt-1 border-t text-[10px] ${
                  isUser ? 'border-amber-600/30 text-slate-950/70' : 'border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-1.5 font-mono">
                    {msg.modelUsed && <span>{msg.modelUsed}</span>}
                    {msg.toolMode && (
                      <span className="capitalize opacity-80">• {msg.toolMode}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition hover:text-amber-300 cursor-pointer p-0.5"
                        title="Copiar respuesta bíblica"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2.5 text-slate-200">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Examinando las Sagradas Escrituras y reflexionando con {selectedModel}...</span>
            </div>
          </div>
        )}

        {/* Error Message with direct retry */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <p className="font-semibold text-rose-200">Aviso del servicio</p>
              <p>{errorMsg}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                  if (lastUserMsg) {
                    handleSendMessage(lastUserMsg.content);
                  }
                }}
                className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Suggested Prompt Pill */}
      <div className="bg-slate-950/50 border-t border-slate-800/60 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Sugerencia:</span>
        <button
          onClick={() => handleSendMessage(activeToolConfig.samplePrompt)}
          disabled={isLoading}
          className="text-xs bg-slate-900 hover:bg-slate-800 text-amber-300/90 hover:text-amber-200 border border-slate-800 px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer disabled:opacity-40"
        >
          {activeToolConfig.samplePrompt}
        </button>
      </div>

      {/* 5. Message Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-slate-950 border-t border-slate-800 p-3 sm:p-4 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          placeholder={activeToolConfig.placeholder}
          className="flex-1 bg-slate-900 border border-slate-700/70 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>

      {/* 6. Sliding History Drawer (Fase 6: Historial Persistente) */}
      {showHistoryDrawer && (
        <div className="absolute inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-30 flex flex-col p-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Historial de Consultas</h4>
            </div>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat in drawer */}
          <button
            onClick={handleStartNewConversation}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Conversación
          </button>

          {/* List of saved conversations */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
            {conversations.map(conv => {
              const isCurrent = conv.id === activeConvId;
              const msgCount = conv.messages.length;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setShowHistoryDrawer(false);
                  }}
                  className={`group flex items-start justify-between gap-2 p-3 rounded-xl cursor-pointer border transition ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <p className="text-xs font-semibold truncate text-white">
                        {conv.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>{conv.createdAt}</span>
                      <span>•</span>
                      <span>{msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}</span>
                    </div>
                  </div>

                  <button
                    onClick={e => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 p-1 rounded transition"
                    title="Eliminar esta conversación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
            Tus consultas se guardan de forma privada y segura en tu dispositivo.
          </div>
        </div>
      )}

    </div>
  );
};
