import React, { useState } from 'react';
import { Story, StoryComment, User, ChristianSticker } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { ChristianStickersModal } from './ChristianStickersModal';
import { 
  X, 
  Send, 
  MessageCircle, 
  Heart, 
  Sparkles, 
  CornerDownRight, 
  Clock, 
  AlertCircle,
  Loader2,
  Smile
} from 'lucide-react';

interface StoryCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  currentUser: User;
  comments: StoryComment[];
  onAddComment: (
    content: string, 
    stickerData?: ChristianSticker, 
    parentId?: string | null, 
    replyToUsername?: string,
    replyToUserId?: string
  ) => Promise<void> | void;
  onToggleLikeComment: (commentId: string, parentId?: string | null) => void;
  isExpired: boolean;
}

export const StoryCommentsModal: React.FC<StoryCommentsModalProps> = ({
  isOpen,
  onClose,
  story,
  currentUser,
  comments,
  onAddComment,
  onToggleLikeComment,
  isExpired,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<ChristianSticker | null>(null);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    authorName: string;
    authorUsername: string;
    authorId: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Organizar comentarios en árbol (padres e hijos)
  const commentMap = new Map<string, StoryComment>();
  const rootComments: StoryComment[] = [];

  comments.forEach(c => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  comments.forEach(c => {
    const item = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      const parent = commentMap.get(c.parentId)!;
      if (!parent.replies) parent.replies = [];
      parent.replies.push(item);
    } else {
      rootComments.push(item);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setErrorMsg('Este estado ha cumplido 24 horas y no admite nuevos comentarios.');
      return;
    }
    if (!inputText.trim() && !selectedSticker) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onAddComment(
        inputText.trim(),
        selectedSticker || undefined,
        replyingTo?.commentId || null,
        replyingTo?.authorUsername,
        replyingTo?.authorId
      );
      setInputText('');
      setSelectedSticker(null);
      setReplyingTo(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo publicar el comentario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentDate = (isoOrText: string) => {
    if (!isoOrText) return 'Reciente';
    const parsed = new Date(isoOrText).getTime();
    if (isNaN(parsed)) return isoOrText;

    const diffMs = Date.now() - parsed;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return new Date(parsed).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl h-[88vh] sm:h-[82vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Comentarios del Estado
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                  {comments.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Estado de <strong className="text-slate-200">{story.authorName}</strong></span>
                {isExpired && (
                  <span className="text-rose-400 font-bold">· Expirado</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-2.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 px-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Este estado cumplió exactamente 24 horas y ha finalizado su ciclo. Ya no admite nuevos comentarios.</span>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rootComments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <MessageCircle className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Aún no hay comentarios</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Sé el primero en bendecir al autor de este estado con una palabra de fe, oración o ánimo fraternal.
                </p>
              </div>
            </div>
          ) : (
            rootComments.map((comment) => {
              const hasLiked = comment.likedUserIds?.includes(currentUser.id);

              return (
                <div key={comment.id} className="space-y-2.5">
                  
                  {/* Root Comment Box */}
                  <div className="flex items-start gap-3 group">
                    <UserAvatar
                      avatar={comment.authorAvatar}
                      name={comment.authorName}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="rounded-2xl bg-slate-950 border border-slate-800/90 p-3 space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-bold text-white truncate">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              @{comment.authorUsername}
                            </span>
                            {comment.authorChurch && (
                              <span className="text-[10px] text-amber-400/80 truncate hidden sm:inline">
                                · {comment.authorChurch}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>

                        {/* Comment Text */}
                        {comment.content && (
                          <p className="text-xs text-slate-200 leading-relaxed break-words">
                            {comment.content}
                          </p>
                        )}

                        {/* Christian Sticker if attached */}
                        {comment.stickerData && (
                          <div className={`mt-2 p-2 rounded-xl border max-w-xs flex items-center gap-2 bg-gradient-to-r ${comment.stickerData.gradient} ${comment.stickerData.borderColor}`}>
                            <span className="text-2xl drop-shadow">{comment.stickerData.emoji}</span>
                            <div className="min-w-0">
                              <span className={`text-xs font-bold block truncate ${comment.stickerData.textColor}`}>
                                {comment.stickerData.title}
                              </span>
                              <span className="text-[10px] text-slate-300 block truncate">
                                {comment.stickerData.shortPhrase}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comment Actions Bar */}
                      <div className="flex items-center gap-4 px-2 pt-1 text-[11px] text-slate-400 font-medium">
                        <button
                          type="button"
                          onClick={() => onToggleLikeComment(comment.id)}
                          className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                            hasLiked ? 'text-rose-400 font-bold' : ''
                          }`}
                        >
                          <Heart className={`h-3 w-3 ${hasLiked ? 'fill-rose-400' : ''}`} />
                          <span>{comment.likes || 0} Amén</span>
                        </button>

                        {!isExpired && (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo({
                                commentId: comment.id,
                                authorName: comment.authorName,
                                authorUsername: comment.authorUsername,
                                authorId: comment.authorId,
                              });
                            }}
                            className="flex items-center gap-1 hover:text-amber-400 transition-colors text-slate-300 font-semibold"
                          >
                            <CornerDownRight className="h-3 w-3" />
                            <span>Responder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-9 sm:pl-11 space-y-2 border-l-2 border-slate-800 ml-4 sm:ml-5">
                      {comment.replies.map((reply) => {
                        const replyHasLiked = reply.likedUserIds?.includes(currentUser.id);

                        return (
                          <div key={reply.id} className="flex items-start gap-2.5">
                            <UserAvatar
                              avatar={reply.authorAvatar}
                              name={reply.authorName}
                              size="xs"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-2.5 space-y-1 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1 truncate">
                                    <span className="text-[11px] font-bold text-white truncate">
                                      {reply.authorName}
                                    </span>
                                    {reply.replyToUsername && (
                                      <span className="text-[10px] text-amber-400 font-semibold truncate">
                                        @{reply.replyToUsername}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-500 shrink-0">
                                    {formatCommentDate(reply.createdAt)}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-200 leading-snug break-words">
                                  {reply.content}
                                </p>

                                {reply.stickerData && (
                                  <div className={`mt-1.5 p-1.5 rounded-lg border max-w-xs flex items-center gap-2 bg-gradient-to-r ${reply.stickerData.gradient} ${reply.stickerData.borderColor}`}>
                                    <span className="text-lg">{reply.stickerData.emoji}</span>
                                    <span className={`text-[10px] font-bold truncate ${reply.stickerData.textColor}`}>
                                      {reply.stickerData.title}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 px-2 pt-0.5 text-[10px] text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => onToggleLikeComment(reply.id, comment.id)}
                                  className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                                    replyHasLiked ? 'text-rose-400 font-bold' : ''
                                  }`}
                                >
                                  <Heart className={`h-2.5 w-2.5 ${replyHasLiked ? 'fill-rose-400' : ''}`} />
                                  <span>{reply.likes || 0}</span>
                                </button>

                                {!isExpired && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingTo({
                                        commentId: comment.id,
                                        authorName: reply.authorName,
                                        authorUsername: reply.authorUsername,
                                        authorId: reply.authorId,
                                      });
                                    }}
                                    className="hover:text-amber-400 transition-colors"
                                  >
                                    Responder
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          
          {/* Replying banner */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <CornerDownRight className="h-3.5 w-3.5" />
                <span>Respondiendo a <strong>@{replyingTo.authorUsername}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-amber-400 hover:text-white p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Selected sticker preview */}
          {selectedSticker && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xl">{selectedSticker.emoji}</span>
                <span className="text-amber-300 font-bold truncate">{selectedSticker.title}</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">({selectedSticker.shortPhrase})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSticker(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 px-1 font-medium">{errorMsg}</p>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <UserAvatar
              avatar={currentUser.avatar}
              name={currentUser.name}
              size="sm"
            />

            <div className="relative flex-1">
              <input
                type="text"
                disabled={isExpired || isSubmitting}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isExpired 
                    ? 'Estado expirado (24h transcurridas)' 
                    : replyingTo 
                      ? `Respondiendo a @${replyingTo.authorUsername}...` 
                      : 'Escribe un comentario de fe...'
                }
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />

              <button
                type="button"
                disabled={isExpired}
                onClick={() => setShowStickersModal(true)}
                className="absolute right-2 top-2 p-1 text-amber-400 hover:text-amber-300 disabled:opacity-50"
                title="Adjuntar Sticker Cristiano"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedSticker) || isExpired || isSubmitting}
              className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

        </div>

      </div>

      {/* Stickers Modal */}
      <ChristianStickersModal
        isOpen={showStickersModal}
        onClose={() => setShowStickersModal(false)}
        onSelectSticker={(sticker) => setSelectedSticker(sticker)}
        title="Elegir Sticker para tu Comentario"
      />
    </div>
  );
};
