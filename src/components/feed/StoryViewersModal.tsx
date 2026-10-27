import React, { useState } from 'react';
import { Story, StoryView, StoryReaction } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { NORMAL_EMOJI_REACTIONS } from './christianStickersCatalog';
import { 
  X, 
  Eye, 
  Heart, 
  Clock, 
  Church, 
  Sparkles, 
  ShieldCheck, 
  Filter
} from 'lucide-react';

interface StoryViewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  views: StoryView[];
  reactions: StoryReaction[];
  initialTab?: 'views' | 'reactions';
}

export const StoryViewersModal: React.FC<StoryViewersModalProps> = ({
  isOpen,
  onClose,
  story,
  views,
  reactions,
  initialTab = 'views',
}) => {
  const [activeTab, setActiveTab] = useState<'views' | 'reactions'>(initialTab);
  const [reactionFilter, setReactionFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredReactions = reactions.filter(r => {
    if (reactionFilter === 'all') return true;
    if (reactionFilter === 'stickers') return r.type === 'sticker';
    return r.reactionKey === reactionFilter || r.emoji === reactionFilter;
  });

  const formatTime = (isoOrText: string) => {
    if (!isoOrText) return 'Reciente';
    const parsed = new Date(isoOrText).getTime();
    if (isNaN(parsed)) return isoOrText;

    const diffMs = Date.now() - parsed;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Hace instantes';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return new Date(parsed).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md h-[80vh] sm:h-[75vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Actividad del Estado
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualizaciones y reacciones registradas en tiempo real
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('views')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'views'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Vistas ({views.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reactions')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reactions'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Reacciones ({reactions.length})</span>
          </button>
        </div>

        {/* Reactions Filter Bar (if tab is reactions) */}
        {activeTab === 'reactions' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 bg-slate-950/60 border-b border-slate-800 text-xs">
            <button
              onClick={() => setReactionFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                reactionFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos ({reactions.length})
            </button>
            {NORMAL_EMOJI_REACTIONS.map((emojiObj) => {
              const count = reactions.filter(r => r.reactionKey === emojiObj.key || r.emoji === emojiObj.emoji).length;
              if (count === 0) return null;

              return (
                <button
                  key={emojiObj.key}
                  onClick={() => setReactionFilter(emojiObj.key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all ${
                    reactionFilter === emojiObj.key
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{emojiObj.emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
            {reactions.some(r => r.type === 'sticker') && (
              <button
                onClick={() => setReactionFilter('stickers')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all ${
                  reactionFilter === 'stickers'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>✨ Stickers</span>
                <span>({reactions.filter(r => r.type === 'sticker').length})</span>
              </button>
            )}
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-800/60">
          
          {/* TAB 1: VIEWS LIST */}
          {activeTab === 'views' && (
            views.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Eye className="h-10 w-10 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">Sin visualizaciones registradas todavía</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Las visualizaciones se contabilizan una sola vez por cada hermano o amigo registrado que abra el estado.
                </p>
              </div>
            ) : (
              views.map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      avatar={v.viewerAvatar}
                      name={v.viewerName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {v.viewerName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <span>@{v.viewerUsername}</span>
                        {v.viewerChurch && (
                          <span>· {v.viewerChurch}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                    {formatTime(v.viewedAt)}
                  </span>
                </div>
              ))
            )
          )}

          {/* TAB 2: REACTIONS LIST */}
          {activeTab === 'reactions' && (
            filteredReactions.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Heart className="h-10 w-10 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">No hay reacciones para este filtro</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Sé el primero en bendecir con una reacción fraternal o sticker cristiano.
                </p>
              </div>
            ) : (
              filteredReactions.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      avatar={r.userAvatar}
                      name={r.userName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {r.userName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <span>@{r.userUsername}</span>
                        {r.userChurch && (
                          <span>· {r.userChurch}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reaction badge indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    {r.type === 'emoji' ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs shadow-sm">
                        <span className="text-base">{r.emoji}</span>
                        {r.label && (
                          <span className="text-[10px] text-slate-300 font-semibold">{r.label}</span>
                        )}
                      </div>
                    ) : r.stickerData ? (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-gradient-to-r ${r.stickerData.gradient} ${r.stickerData.borderColor}`}>
                        <span className="text-base">{r.stickerData.emoji}</span>
                        <span className={`text-[10px] font-bold ${r.stickerData.textColor}`}>{r.stickerData.title}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
                        <span>✨ Sticker</span>
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 hidden sm:inline">
                      {formatTime(r.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Datos protegidos y verificados</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
