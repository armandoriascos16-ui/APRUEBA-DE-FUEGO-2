import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Story, StoryAudioMeta, ChristianSticker } from '../../types';
import { isVideoSource } from '../../utils/mediaUtils';
import { 
  X, 
  Heart, 
  Eye, 
  Flame, 
  Share2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Send, 
  Sparkles,
  Music,
  MessageCircle,
  Clock,
  AlertCircle,
  CornerDownRight
} from 'lucide-react';
import { StoryAudioPlayerBadge } from '../audioStories/StoryAudioPlayerBadge';
import { NORMAL_EMOJI_REACTIONS } from './christianStickersCatalog';
import { ChristianStickersModal } from './ChristianStickersModal';
import { StoryCommentsModal } from './StoryCommentsModal';
import { StoryViewersModal } from './StoryViewersModal';
import { UserAvatar } from '../common/UserAvatar';

interface StoryViewerModalProps {
  story: Story;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ 
  story, 
  onClose, 
  onNext, 
  onPrev 
}) => {
  const { 
    currentUser, 
    getStoryComments, 
    getStoryReactions, 
    getStoryViews,
    addStoryComment,
    toggleStoryReaction,
    recordStoryView,
    toggleLikeStoryComment,
    isStoryExpired
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [quickSticker, setQuickSticker] = useState<ChristianSticker | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersModalTab, setViewersModalTab] = useState<'views' | 'reactions'>('views');

  // Exact 24-hour remaining countdown
  const [timeRemainingText, setTimeRemainingText] = useState<string>('');
  const [expiredNow, setExpiredNow] = useState<boolean>(() => isStoryExpired(story));

  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = isVideoSource(story.mediaUrl, story.mediaType);

  // Retrieve current subcollections for this story
  const comments = getStoryComments(story.id);
  const reactions = getStoryReactions(story.id);
  const views = getStoryViews(story.id);

  // Check current user's reaction
  const userReaction = reactions.find(r => r.userId === currentUser.id);

  // Record view on story open:
  // Rule 6: Do not count owner
  // Rule 4: Maximum 1 view per authenticated user
  useEffect(() => {
    recordStoryView(story.id).catch(() => {});
  }, [story.id]);

  // Live 24-hour countdown calculator
  useEffect(() => {
    const updateCountdown = () => {
      if (!story.expiresAt) {
        setTimeRemainingText('24h restantes');
        return;
      }
      const exp = new Date(story.expiresAt).getTime();
      const now = Date.now();
      const diffMs = exp - now;

      if (diffMs <= 0) {
        setExpiredNow(true);
        setTimeRemainingText('Expirado (24h)');
        return;
      }

      setExpiredNow(false);
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hours > 0) {
        setTimeRemainingText(`${hours}h ${mins}m restantes`);
      } else if (mins > 0) {
        setTimeRemainingText(`${mins}m ${secs}s restantes`);
      } else {
        setTimeRemainingText(`${secs}s restantes`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [story.expiresAt]);

  // Parse attached audio metadata if available
  const storyAudio: StoryAudioMeta | undefined = story.audio || (story.audioUrl ? {
    audioUrl: story.audioUrl,
    title: story.audioTitle || 'Música Cristiana',
    artist: story.audioArtist || 'A Prueba de Fuego',
    type: story.audioType || 'catalog',
    duration: story.audioDuration || 30,
    license: story.audioLicense || 'Dominio Público',
    attribution: story.audioAttribution || 'Himnario Cristiano',
  } : undefined);

  // Story Progress Timer
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);

    if (isVideo) {
      return;
    }

    const durationMs = storyAudio?.duration 
      ? Math.max(4000, Math.min(30, storyAudio.duration) * 1000) 
      : 7000;
    const intervalTime = 60;
    const increment = (intervalTime / durationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Pause timer if paused or if comments/stickers modal is open
        if (isPaused || showCommentsModal || showStickersModal || showViewersModal) return prev;
        if (prev >= 100) {
          clearInterval(interval);
          if (onNext) onNext();
          else onClose();
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [story.id, onNext, onClose, isVideo, isPaused, storyAudio?.duration, showCommentsModal, showStickersModal, showViewersModal]);

  // Video Autoplay policy handler with muted fallback
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented or video loading:', err);
          if (videoRef.current && !isMuted) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [story.id, isVideo]);

  // Video Time Update listener
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !isVideo) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 6;
    const pct = Math.min(100, (cur / dur) * 100);
    setProgress(pct);
  };

  const handleVideoEnded = () => {
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handleTogglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Normal emoji reaction click handler
  const handleReactionClick = async (reactionKey: string, emoji: string, label: string) => {
    if (expiredNow) {
      setFeedbackMsg('Este estado ya cumplió 24h y no admite reacciones.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    try {
      await toggleStoryReaction(story.id, reactionKey, 'emoji', emoji, label);
      if (userReaction?.reactionKey === reactionKey) {
        setFeedbackMsg('Reacción retirada');
      } else {
        setFeedbackMsg(`¡Reaccionaste con ${emoji} ${label}!`);
      }
      setTimeout(() => setFeedbackMsg(null), 2000);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Error al guardar reacción.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Sticker reaction click handler
  const handleStickerSelected = async (sticker: ChristianSticker) => {
    if (expiredNow) {
      setFeedbackMsg('Este estado ya cumplió 24h y no admite reacciones.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    try {
      await toggleStoryReaction(story.id, sticker.id, 'sticker', sticker.emoji, sticker.title, sticker);
      setFeedbackMsg(`¡Sticker «${sticker.title}» publicado!`);
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Error al guardar sticker.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Send quick comment
  const handleSendQuickComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expiredNow) {
      setFeedbackMsg('Este estado ha cumplido 24 horas y no admite comentarios.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }
    if (!quickComment.trim() && !quickSticker) return;

    try {
      await addStoryComment(story.id, quickComment.trim(), quickSticker || undefined);
      setQuickComment('');
      setQuickSticker(null);
      setFeedbackMsg('¡Comentario de fe publicado con éxito!');
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'No se pudo enviar el comentario.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Recent 2 visible comments for the overlay preview
  const recentComments = comments.slice(-2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-1 sm:p-4 select-none">
      <div 
        className="relative flex flex-col w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl"
      >
        
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Header Overlay */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <UserAvatar
              avatar={story.authorAvatar}
              name={story.authorName}
              size="sm"
            />
            <div>
              <p className="text-xs font-bold leading-tight drop-shadow-md text-white truncate max-w-[140px]">
                {story.authorName}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 drop-shadow-sm font-semibold">
                <span className="capitalize">{story.category}</span>
                <span>·</span>
                {/* 24-hour remaining indicator */}
                <span className={`flex items-center gap-0.5 ${expiredNow ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                  <Clock className="h-2.5 w-2.5" />
                  <span>{timeRemainingText}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isVideo && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}

            <button 
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Media or Visual Content Display */}
        <div 
          onClick={handleTogglePlayPause}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        >
          {isVideo && story.mediaUrl ? (
            <video
              ref={videoRef}
              src={story.mediaUrl}
              autoPlay
              playsInline
              preload="auto"
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              className="h-full w-full object-cover"
            />
          ) : story.mediaUrl ? (
            <img
              src={story.mediaUrl}
              alt="Estado Espiritual"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-900/60 via-slate-900 to-slate-950 p-6 flex flex-col justify-center items-center text-center">
              <Flame className="h-12 w-12 text-amber-500 mb-4 animate-bounce" />
            </div>
          )}

          {/* Pause Indicator overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-20">
              <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
                <Pause className="h-8 w-8 fill-white" />
              </div>
            </div>
          )}

          {/* Navigation Tap Zones (Left: Prev, Right: Next) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (onPrev) onPrev();
            }}
            className="absolute left-0 top-16 bottom-36 w-1/4 z-10" 
          />
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (onNext) onNext();
              else onClose();
            }}
            className="absolute right-0 top-16 bottom-36 w-1/4 z-10" 
          />

          {/* Floating Audio Player Badge */}
          {storyAudio && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="absolute top-20 left-3 right-3 z-20 pointer-events-auto"
            >
              <StoryAudioPlayerBadge audio={storyAudio} isStoryPaused={isPaused} />
            </div>
          )}

          {/* Expired Status Alert */}
          {expiredNow && (
            <div className="absolute top-28 inset-x-4 z-20 pointer-events-auto p-3 rounded-2xl bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-white text-center shadow-xl space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>Estado Vencido (24 Horas Cumplidas)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Este estado ha cumplido su duración reglamentaria de 24 horas y se encuentra cerrado.
              </p>
            </div>
          )}

          {/* Floating Feedback Toast */}
          {feedbackMsg && (
            <div className="absolute top-28 inset-x-6 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-bold text-center shadow-2xl backdrop-blur-md flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{feedbackMsg}</span>
              </div>
            </div>
          )}

          {/* Text, Scripture & VISIBLE COMMENTS OVERLAY */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-4 pt-12 pointer-events-none z-20 space-y-2">
            
            {story.bibleVerse && (
              <div className="p-2.5 rounded-xl bg-amber-500/25 border border-amber-500/50 backdrop-blur-md pointer-events-auto shadow-md">
                <p className="text-xs font-bold text-amber-300 drop-shadow">📖 {story.bibleVerse}</p>
              </div>
            )}
            
            {story.textContent && (
              <p className="text-xs sm:text-sm font-medium text-white leading-relaxed drop-shadow-lg">
                {story.textContent}
              </p>
            )}

            {/* SECCIÓN 3: Comentarios Visibles debajo del estado */}
            {comments.length > 0 && (
              <div className="space-y-1.5 pt-1 pointer-events-auto">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-amber-400" />
                    <span>Comentarios ({comments.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommentsModal(true);
                    }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Ver todos ({comments.length})
                  </button>
                </div>

                {/* Latest Comments Card Preview */}
                <div className="space-y-1">
                  {recentComments.map((c) => (
                    <div 
                      key={c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCommentsModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md flex items-center gap-2 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <UserAvatar
                        avatar={c.authorAvatar}
                        name={c.authorName}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-white truncate">
                            {c.authorName.split(' ')[0]}
                          </span>
                          {c.stickerData && (
                            <span className="text-[10px] text-amber-300 font-semibold truncate">
                              {c.stickerData.emoji} {c.stickerData.title}
                            </span>
                          )}
                        </div>
                        {c.content && (
                          <p className="text-[10px] text-slate-300 line-clamp-1">
                            {c.content}
                          </p>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {c.likes > 0 ? `❤️ ${c.likes}` : 'Responder'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics & Indicator Bar (Clickable views & reactions lists) */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-white/15 pointer-events-auto">
              
              {/* Clickable Views button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewersModalTab('views');
                  setShowViewersModal(true);
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-amber-400 transition-colors"
                title="Ver quiénes vieron este estado"
              >
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold text-white">{views.length || story.viewsCount || 0}</span>
                <span>vistas</span>
              </button>

              {/* Clickable Reactions summary button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewersModalTab('reactions');
                  setShowViewersModal(true);
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-rose-400 transition-colors"
                title="Ver lista de personas que reaccionaron"
              >
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-bold text-white">{reactions.length}</span>
                <span>reacciones</span>
              </button>

              {/* Open full comments modal button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentsModal(true);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 ml-auto"
              >
                <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>{comments.length}</span>
              </button>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION BAR: NORMAL EMOJIS, CHRISTIAN STICKERS & QUICK COMMENT */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2.5 z-30">
          
          {/* SECCIÓN 4: Emojis Normales y Acceso a Stickers Cristianos */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            
            {/* 6 Normal Emojis */}
            <div className="flex items-center gap-1.5 flex-1">
              {NORMAL_EMOJI_REACTIONS.map((emojiObj) => {
                const isSelected = userReaction?.reactionKey === emojiObj.key;

                return (
                  <button
                    key={emojiObj.key}
                    type="button"
                    disabled={expiredNow}
                    onClick={() => handleReactionClick(emojiObj.key, emojiObj.emoji, emojiObj.label)}
                    className={`flex items-center justify-center h-8 flex-1 rounded-full text-base transition-all active:scale-90 ${
                      isSelected
                        ? `${emojiObj.badgeBg} border-2 ${emojiObj.borderColor} scale-110 shadow-md shadow-amber-500/20`
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:scale-105'
                    }`}
                    title={emojiObj.label}
                  >
                    <span>{emojiObj.emoji}</span>
                  </button>
                );
              })}
            </div>

            {/* SECCIÓN 4.B: Botón para Colección de Stickers Cristianos */}
            <button
              type="button"
              disabled={expiredNow}
              onClick={() => setShowStickersModal(true)}
              className="flex items-center gap-1 px-3 h-8 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:from-amber-500/30 hover:to-orange-500/30 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Abrir Colección de Stickers Cristianos"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Stickers JA</span>
            </button>
          </div>

          {/* Quick Comment Input Form */}
          <form onSubmit={handleSendQuickComment} className="flex items-center gap-2">
            
            <div className="relative flex-1">
              <input
                type="text"
                disabled={expiredNow}
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
                placeholder={
                  expiredNow 
                    ? 'Estado expirado (24h completadas)' 
                    : 'Responder al estado con fe...'
                }
                className="w-full pl-3.5 pr-8 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />

              <button
                type="button"
                disabled={expiredNow}
                onClick={() => setShowStickersModal(true)}
                className="absolute right-2.5 top-2 text-amber-400 hover:text-amber-300 disabled:opacity-50"
                title="Adjuntar Sticker Cristiano"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>

            {quickComment.trim() ? (
              <button
                type="submit"
                disabled={expiredNow}
                className="p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors disabled:opacity-50 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCommentsModal(true)}
                className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Ver y publicar comentarios"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}

            <button 
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ 
                    title: `Estado de ${story.authorName}`, 
                    text: story.textContent || '', 
                    url: window.location.href 
                  }).catch(() => {});
                } else {
                  setFeedbackMsg('¡Enlace del estado copiado con bendición!');
                  setTimeout(() => setFeedbackMsg(null), 2500);
                }
              }}
              className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Compartir estado"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

      {/* FULL COMMENTS MODAL */}
      <StoryCommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        story={story}
        currentUser={currentUser}
        comments={comments}
        onAddComment={(content, stickerData, parentId, replyToUsername, replyToUserId) =>
          addStoryComment(story.id, content, stickerData, parentId, replyToUsername, replyToUserId)
        }
        onToggleLikeComment={(commentId, parentId) => toggleLikeStoryComment(story.id, commentId, parentId)}
        isExpired={expiredNow}
      />

      {/* CHRISTIAN STICKERS MODAL */}
      <ChristianStickersModal
        isOpen={showStickersModal}
        onClose={() => setShowStickersModal(false)}
        onSelectSticker={handleStickerSelected}
        selectedStickerId={userReaction?.stickerId}
        title="Reaccionar con Sticker Cristiano"
      />

      {/* STORY VIEWERS & REACTIONS MODAL */}
      <StoryViewersModal
        isOpen={showViewersModal}
        onClose={() => setShowViewersModal(false)}
        story={story}
        views={views}
        reactions={reactions}
        initialTab={viewersModalTab}
      />

    </div>
  );
};
