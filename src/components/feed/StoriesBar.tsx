import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Story } from '../../types';
import { isVideoSource } from '../../utils/mediaUtils';
import { UserAvatar } from '../common/UserAvatar';
import { Plus, Camera, Film, Music, Clock } from 'lucide-react';

interface StoriesBarProps {
  onOpenCreateStory: () => void;
  onSelectStory: (story: Story) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  oracion: '🙏',
  versiculo: '📖',
  testimonio: '❤️',
  reflexion: '🔥',
  musica: '🎵',
  iglesia: '⛪',
  campamento: '🏕️',
};

export const StoriesBar: React.FC<StoriesBarProps> = ({ onOpenCreateStory, onSelectStory }) => {
  const { currentUser, stories, isStoryExpired } = useApp();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Cronómetro en tiempo real cada 10s para expirar estados exactamente a las 24 horas
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar estados activos: exactamente 24h desde su createdAt
  const activeStories = stories.filter(story => {
    if (!story.expiresAt) return true;
    const exp = new Date(story.expiresAt).getTime();
    if (isNaN(exp)) return true;
    return exp > currentTime;
  });

  return (
    <div className="w-full py-1">
      {/* Title & Action Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white">Estados Espirituales</span>
          <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            <span>24 horas exactas</span>
          </span>
        </div>
        <button
          onClick={onOpenCreateStory}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Camera className="h-3 w-3" />
          <span>Subir Foto/Video</span>
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-1 py-1">
        
        {/* User's Add Story Card */}
        <button
          onClick={onOpenCreateStory}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full p-0.5 border-2 border-dashed border-amber-500/70 group-hover:border-amber-400 transition-colors flex items-center justify-center">
              <UserAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                size="md"
                showBadge={false}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md ring-2 ring-slate-950">
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors truncate max-w-[72px]">
            + Tu Estado
          </span>
        </button>

        {/* Stories List */}
        {activeStories.map((story) => {
          const categoryIcon = CATEGORY_ICONS[story.category] || '🔥';
          const isStoryVideo = isVideoSource(story.mediaUrl, story.mediaType);
          const hasAudio = Boolean(story.audio || story.audioUrl);
          const hasComments = Boolean(story.commentsCount && story.commentsCount > 0);
          const hasReactions = Boolean(story.reactionsCount && story.reactionsCount > 0);

          return (
            <button
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 group-hover:scale-105 transition-transform shadow-md shadow-orange-500/10 flex items-center justify-center">
                  <div className="h-full w-full rounded-full p-0.5 bg-slate-950 flex items-center justify-center">
                    <UserAvatar
                      avatar={story.authorAvatar}
                      name={story.authorName}
                      size="sm"
                      showBadge={false}
                    />
                  </div>
                </div>

                {/* Video Indicator icon */}
                {isStoryVideo ? (
                  <div className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[8px] ring-1 ring-slate-900 shadow-sm" title="Estado de video">
                    <Film className="h-2.5 w-2.5" />
                  </div>
                ) : hasAudio ? (
                  <div className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[8px] ring-1 ring-slate-900 shadow-sm font-bold animate-pulse" title="Estado con música cristiana">
                    <Music className="h-2.5 w-2.5" />
                  </div>
                ) : null}

                {/* Category Icon Badge */}
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-amber-500/40 text-[10px] shadow-sm">
                  {categoryIcon}
                </div>

                {/* Activity badge indicator (Comments or Reactions present) */}
                {(hasComments || hasReactions) && (
                  <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[8px] font-bold ring-1 ring-slate-900 shadow-sm" title="Tiene interacción">
                    💬
                  </div>
                )}
              </div>

              <span className="text-[11px] font-medium text-slate-200 group-hover:text-amber-400 transition-colors truncate max-w-[72px]">
                {story.authorName.split(' ')[0]}
              </span>
            </button>
          );
        })}

        {activeStories.length === 0 && (
          <div className="py-2 px-3 text-xs text-slate-400 italic">
            No hay estados activos ahora. ¡Sé el primero en compartir!
          </div>
        )}

      </div>

    </div>
  );
};
