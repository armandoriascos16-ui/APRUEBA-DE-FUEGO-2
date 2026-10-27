import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CHRISTIAN_STICKERS } from '../../data/seedData';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Send, 
  Smile, 
  Mic, 
  Image, 
  Users, 
  MoreVertical, 
  ArrowLeft, 
  Flame, 
  Search,
  CheckCheck
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    messages, 
    sendMessage, 
    activeConversationId, 
    setActiveConversationId 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConv ? (messages[activeConv.id] || []) : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputMessage.trim());
    setInputMessage('');
    setShowStickers(false);
  };

  const handleSendSticker = (stickerText: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.id, stickerText, stickerText);
    setShowStickers(false);
  };

  const handleSimulateVoiceNote = () => {
    if (!activeConv) return;
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      sendMessage(activeConv.id, 'Nota de voz (0:18)', undefined, true);
    }, 1500);
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 h-[calc(100vh-8rem)]">
      <div className="h-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Column: Conversations List (Hidden on mobile when conversation is active) */}
        <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col h-full bg-slate-950/60 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-black text-white font-heading">Mensajes y Grupos JA</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              En línea
            </span>
          </div>

          {/* Search bar */}
          <div className="p-2 border-b border-slate-800/80">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar chats o grupos..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-amber-500/15 border-l-4 border-amber-500' : 'hover:bg-slate-900/80'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      avatar={conv.avatar}
                      name={conv.name}
                      size="md"
                      showBadge={false}
                    />
                    {conv.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{conv.name}</span>
                      <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-slate-950">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Chat View */}
        {activeConv ? (
          <div className={`flex-1 flex flex-col h-full bg-slate-900/50 ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Top Bar of Active Conversation */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <UserAvatar
                  avatar={activeConv.avatar}
                  name={activeConv.name}
                  size="sm"
                  showBadge={false}
                />

                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-xs">{activeConv.name}</h3>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    {activeConv.isGroup ? 'Grupo de confraternización JA' : 'En línea'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <UserAvatar
                        avatar={msg.senderAvatar}
                        name={msg.senderName}
                        size="xs"
                        showBadge={false}
                      />
                    )}

                    <div className={`max-w-[78%] sm:max-w-md rounded-2xl p-3 text-xs ${
                      isMe 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-medium rounded-br-none shadow-md' 
                        : 'bg-slate-800 text-white rounded-bl-none border border-slate-700'
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-bold text-amber-400 mb-1">{msg.senderName}</p>
                      )}

                      {msg.isVoiceNote ? (
                        <div className="flex items-center gap-2 py-1">
                          <Mic className="h-4 w-4 text-slate-950 animate-pulse" />
                          <span className="font-bold">Mensaje de audio ({msg.voiceDuration || '0:18'})</span>
                        </div>
                      ) : msg.sticker ? (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-950/40 border border-black/20 text-xs font-black">
                          {msg.sticker}
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isMe ? 'text-slate-900/80' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticker Tray Drawer */}
            {showStickers && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">Stickers:</span>
                {CHRISTIAN_STICKERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSendSticker(s.text)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:border-amber-400 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>{s.emoji}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStickers(!showStickers)}
                className={`p-2 rounded-xl border transition-colors ${
                  showStickers ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Stickers Cristianos"
              >
                <Smile className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleSimulateVoiceNote}
                className={`p-2 rounded-xl border transition-colors ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Grabar nota de voz"
              >
                <Mic className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje de edificación..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-6 text-center text-slate-400">
            <p className="text-xs">Selecciona una conversación para chatear con tus hermanos en la fe.</p>
          </div>
        )}

      </div>
    </div>
  );
};
