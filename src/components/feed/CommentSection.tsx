import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Comment } from '../../types';
import { buildCommentsTree } from '../../firebase/db';
import { 
  Heart, 
  CornerDownRight, 
  Send, 
  X, 
  Sparkles, 
  Smile, 
  MessageCircle,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const CHRISTIAN_STICKERS = [
  { id: 'amen', emoji: '🙏', text: '¡Amén!' },
  { id: 'aleluya', emoji: '🙌', text: '¡Aleluya!' },
  { id: 'gloria', emoji: '🕊️', text: 'Gloria a Dios' },
  { id: 'bendiciones', emoji: '✨', text: 'Muchas bendiciones' },
  { id: 'dios_bueno', emoji: '❤️', text: 'Dios es bueno' },
  { id: 'orando', emoji: '🕯️', text: 'Orando por ti' },
];

export interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
  className?: string;
  showStickersBar?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments: propComments,
  className = '',
  showStickersBar = true,
}) => {
  const { currentUser, posts, addComment, toggleLikeComment } = useApp();

  // Determine comments source: prop or from global posts state
  const targetPost = posts.find(p => p.id === postId);
  const rawComments = propComments || targetPost?.comments || [];
  
  // Transform flat list into nested tree structure
  const commentsTree = buildCommentsTree(rawComments);

  // Component State
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    authorUsername: string;
    authorName: string;
  } | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const toggleThread = (commentId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: prev[commentId] === false ? true : false
    }));
  };

  const handleStartReply = (comment: Comment) => {
    setReplyingTo({
      commentId: comment.id,
      authorUsername: comment.authorUsername,
      authorName: comment.authorName,
    });
    // Expand thread so the reply will be visible
    setExpandedThreads(prev => ({ ...prev, [comment.id]: true }));
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (replyingTo) {
      addComment(
        postId, 
        commentText.trim(), 
        undefined, 
        replyingTo.commentId, 
        replyingTo.authorUsername
      );
      setFeedbackToast(`Respuesta enviada a @${replyingTo.authorUsername}`);
    } else {
      addComment(postId, commentText.trim());
      setFeedbackToast('Comentario publicado');
    }

    setCommentText('');
    setReplyingTo(null);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleStickerClick = (stickerText: string) => {
    if (replyingTo) {
      addComment(
        postId, 
        '', 
        stickerText, 
        replyingTo.commentId, 
        replyingTo.authorUsername
      );
      setFeedbackToast(`Sticker enviado a @${replyingTo.authorUsername}`);
      setReplyingTo(null);
    } else {
      addComment(postId, '', stickerText);
      setFeedbackToast('Sticker publicado');
    }
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold animate-fade-in w-fit">
          <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Quick Christian Stickers Bar */}
      {showStickersBar && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Stickers:</span>
          {CHRISTIAN_STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStickerClick(s.text)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-white hover:border-amber-400 shrink-0 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span>{s.emoji}</span>
              <span className="text-slate-200">{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Replying-To Active Indicator Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs animate-slide-up">
          <div className="flex items-center gap-1.5">
            <CornerDownRight className="h-3.5 w-3.5 text-blue-400" />
            <span>
              Respondiendo a <strong className="font-bold text-white">@{replyingTo.authorUsername}</strong> ({replyingTo.authorName})
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelReply}
            className="p-1 rounded-md text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors"
            title="Cancelar respuesta"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* New Comment / Reply Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <UserAvatar
          avatar={currentUser.avatar}
          name={currentUser.name}
          size="sm"
          showBadge={false}
        />
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              replyingTo 
                ? `Escribe una respuesta para @${replyingTo.authorUsername}...` 
                : 'Escribe un mensaje de edificación, ánimo o fe...'
            }
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-20 shadow-inner"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 shadow-sm"
          >
            <span>{replyingTo ? 'Responder' : 'Publicar'}</span>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>

      {/* Nested Comments Tree List */}
      <div className="space-y-3 pt-1">
        {commentsTree.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-2xl bg-slate-950/40 border border-slate-850">
            <MessageCircle className="h-6 w-6 text-slate-600 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">
              Aún no hay comentarios en esta publicación.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ¡Sé el primero en animar y bendecir a tu hermano en la fe!
            </p>
          </div>
        ) : (
          commentsTree.map((rootComment) => (
            <CommentThreadItem
              key={rootComment.id}
              postId={postId}
              comment={rootComment}
              currentUserId={currentUser.id}
              isExpanded={expandedThreads[rootComment.id] !== false}
              onToggleExpand={() => toggleThread(rootComment.id)}
              onReply={handleStartReply}
              onLike={(commentId) => toggleLikeComment(postId, commentId)}
            />
          ))
        )}
      </div>

    </div>
  );
};

interface CommentThreadItemProps {
  postId: string;
  comment: Comment;
  currentUserId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
}

const CommentThreadItem: React.FC<CommentThreadItemProps> = ({
  postId,
  comment,
  currentUserId,
  isExpanded,
  onToggleExpand,
  onReply,
  onLike,
}) => {
  const hasLiked = comment.likedUserIds?.includes(currentUserId) || false;
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;

  return (
    <div className="space-y-2">
      {/* Root Comment Card */}
      <div className="flex items-start gap-2.5 bg-slate-950/70 hover:bg-slate-950 p-3 rounded-2xl border border-slate-800/80 transition-colors group">
        <UserAvatar
          avatar={comment.authorAvatar}
          name={comment.authorName}
          size="xs"
          showBadge={false}
        />
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white leading-tight">
                {comment.authorName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                @{comment.authorUsername}
              </span>
              {comment.authorChurch && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 hidden xs:inline">
                  {comment.authorChurch}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 shrink-0">
              {comment.createdAt}
            </span>
          </div>

          {/* Content Body */}
          {comment.sticker ? (
            <div className="inline-block mt-1 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/40 text-xs font-extrabold text-amber-300 shadow-sm">
              {comment.sticker}
            </div>
          ) : (
            <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line break-words">
              {comment.content}
            </p>
          )}

          {/* Comment Footer: Likes & Reply trigger */}
          <div className="flex items-center gap-4 mt-2 pt-1 text-[11px] text-slate-400">
            {/* Like button */}
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 transition-colors ${
                hasLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{comment.likes > 0 ? comment.likes : 'Me gusta'}</span>
            </button>

            {/* Reply button */}
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 hover:text-amber-400 font-semibold transition-colors"
            >
              <CornerDownRight className="h-3 w-3" />
              <span>Responder</span>
            </button>

            {/* Toggle replies dropdown if there are child replies */}
            {hasReplies && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="flex items-center gap-1 text-amber-400/90 hover:text-amber-300 font-bold ml-auto"
              >
                <span>{replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies Branch (Indented with connector line) */}
      {hasReplies && isExpanded && (
        <div className="pl-4 sm:pl-6 ml-3 sm:ml-4 border-l-2 border-slate-800 space-y-2 pt-1 animate-fade-in">
          {replies.map((reply) => {
            const replyLiked = reply.likedUserIds?.includes(currentUserId) || false;
            return (
              <div 
                key={reply.id} 
                className="flex items-start gap-2.5 bg-slate-950/50 hover:bg-slate-950/80 p-2.5 rounded-2xl border border-slate-850/80 transition-colors"
              >
                <img
                  src={reply.authorAvatar}
                  alt={reply.authorName}
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-800 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{reply.authorName}</span>
                      <span className="text-[10px] text-slate-400">@{reply.authorUsername}</span>
                      {reply.replyToUsername && (
                        <span className="text-[10px] text-blue-400 font-semibold">
                          ↳ @{reply.replyToUsername}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{reply.createdAt}</span>
                  </div>

                  {reply.sticker ? (
                    <div className="inline-block mt-1 px-2.5 py-0.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                      {reply.sticker}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                      {reply.content}
                    </p>
                  )}

                  <div className="flex items-center gap-3.5 mt-1.5 text-[10px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => onLike(reply.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        replyLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${replyLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{reply.likes > 0 ? reply.likes : 'Me gusta'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onReply(reply)}
                      className="flex items-center gap-1 hover:text-amber-400 font-semibold transition-colors"
                    >
                      <CornerDownRight className="h-3 w-3" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
