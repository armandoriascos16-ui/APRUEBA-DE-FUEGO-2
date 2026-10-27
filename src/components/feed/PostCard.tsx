import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Post, Comment, REACTION_CONFIGS, ReactionType } from '../../types';
import { CHRISTIAN_STICKERS } from '../../data/seedData';
import { subscribePostComments } from '../../firebase/db';
import { CommentSection } from './CommentSection';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Flame, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Eye, 
  MoreHorizontal, 
  CheckCircle2, 
  Send, 
  Smile, 
  Sparkles,
  ExternalLink,
  Flag,
  UserPlus,
  UserCheck,
  Camera,
  Film,
  Maximize2,
  X
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onComment?: (postId: string, content: string, sticker?: string) => Promise<void> | void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onComment }) => {
  const { 
    currentUser, 
    toggleReaction, 
    addComment, 
    incrementPostViews,
    followUser,
    savePost,
    reportPost,
    setSelectedUserId,
    setActiveTab
  } = useApp();

  const [showReactionsTray, setShowReactionsTray] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liveComments, setLiveComments] = useState<Comment[]>([]);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const userReactions = (post.userReactions && currentUser?.id) ? (post.userReactions[currentUser.id] || []) : [];
  const isFollowing = (currentUser?.followingIds || []).includes(post.authorId);
  const isSaved = (currentUser?.savedPostIds || []).includes(post.id);

  // Escuchar en tiempo real la subcolección 'comments' de Firestore cuando se abre la sección de comentarios
  useEffect(() => {
    if (!showComments) return;
    const unsubscribe = subscribePostComments(post.id, (comments) => {
      if (comments && comments.length > 0) {
        setLiveComments(comments);
      }
    });
    return () => unsubscribe();
  }, [showComments, post.id]);

  // Combinar comentarios locales con los obtenidos de la subcolección en Firestore evitando duplicados
  const commentsMap = new Map<string, Comment>();
  post.comments.forEach((c: Comment) => commentsMap.set(c.id, c));
  liveComments.forEach((c: Comment) => commentsMap.set(c.id, c));
  const displayComments = Array.from(commentsMap.values());

  // Compute total reactions
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  // Formateador amigable de fecha
  const formattedCreatedAt = (() => {
    if (!post.createdAt) return 'Reciente';
    if (typeof post.createdAt === 'string') {
      const parsed = Date.parse(post.createdAt);
      if (!isNaN(parsed) && post.createdAt.includes('-')) {
        const diffSec = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
        if (diffSec < 60) return 'Justo ahora';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `Hace ${diffH} h`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return `Hace ${diffD} d`;
        return new Date(parsed).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }
      return post.createdAt;
    }
    return 'Reciente';
  })();

  const handleCardClick = () => {
    incrementPostViews(post.id);
  };

  return (
    <article 
      onClick={handleCardClick}
      className={`w-full rounded-3xl p-4 sm:p-5 shadow-lg transition-all mb-4 relative ${
        post.isOfficial 
          ? 'bg-gradient-to-b from-amber-500/[0.05] via-slate-900/95 to-slate-900 border-2 border-amber-500/40 ring-1 ring-amber-500/20 shadow-amber-500/10' 
          : 'bg-slate-900/90 border border-slate-800 hover:border-slate-750'
      }`}
    >
      {/* Official Announcement Banner */}
      {post.isOfficial && (
        <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black mb-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-[10px]">
              ✓
            </span>
            <span className="tracking-wide">COMUNICADO OFICIAL JA</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-500/15">
            Oficial
          </span>
        </div>
      )}

      {/* Recommendation Header if present */}
      {post.recommendationReason && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mb-3 pb-2 border-b border-slate-800/80">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{post.recommendationReason}</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedUserId(post.authorId);
              setActiveTab('perfil');
            }}
            className="relative shrink-0 focus:outline-none"
          >
            <UserAvatar
              avatar={post.authorAvatar}
              name={post.authorName}
              size="md"
              isOfficial={post.authorIsOfficial || post.isOfficial}
              showBadge={true}
            />
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setSelectedUserId(post.authorId);
                  setActiveTab('perfil');
                }}
                className="text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>{post.authorName}</span>
                {post.isOfficial && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/40">
                    Oficial
                  </span>
                )}
              </button>
              
              {/* Player Rating Points Display next to name */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                <Flame className="h-3 w-3 text-orange-400 fill-orange-400" />
                <span className="tabular-nums">{post.authorPoints.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
              <span>@{post.authorUsername}</span>
              <span>·</span>
              <span>{formattedCreatedAt}</span>
              {post.authorChurch && (
                <>
                  <span>·</span>
                  <span className="text-slate-400 truncate max-w-[160px] sm:max-w-xs">{post.authorChurch}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu & Follow */}
        <div className="flex items-center gap-1 relative">
          {post.authorId !== currentUser.id && (
            <button
              onClick={() => followUser(post.authorId)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                isFollowing 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {isFollowing ? 'Siguiendo' : '+ Seguir'}
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-1.5 z-20">
              <button
                onClick={() => {
                  savePost(post.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                <span>{isSaved ? 'Quitar de guardados' : 'Guardar publicación'}</span>
              </button>
              <button
                onClick={() => {
                  reportPost(post.id, 'Contenido inapropiado');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Reportar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Text */}
      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line mb-3 font-normal">
        {post.content}
      </p>

      {/* Bible Verse Card */}
      {post.bibleVerse && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-200">
          <p className="text-xs font-semibold italic leading-relaxed">
            {post.bibleVerse}
          </p>
        </div>
      )}

      {/* Official Source Link Banner */}
      {post.isOfficial && post.officialSource && (
        <div className="mb-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white truncate">{post.officialSource.organization}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              Fuente Oficial
            </span>
          </div>
          <a
            href={post.officialSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline shrink-0 font-medium"
          >
            <span>Ver fuente</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Attached Media (Photo or Video) */}
      {post.imageUrl && (
        <div className="relative rounded-2xl overflow-hidden mb-3 max-h-[480px] bg-slate-950 group border border-slate-800/80">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            referrerPolicy="no-referrer"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageLightbox(true);
            }}
            className="w-full h-auto object-cover max-h-[480px] cursor-pointer group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-white/10 pointer-events-none">
            <Camera className="h-3 w-3 text-amber-400" />
            <span>Foto de Galería</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageLightbox(true);
            }}
            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Ampliar foto"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {post.videoUrl && (
        <div className="relative rounded-2xl overflow-hidden mb-3 max-h-[480px] bg-black border border-purple-500/30">
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] text-purple-300 font-bold border border-white/10 pointer-events-none">
            <Film className="h-3 w-3 text-purple-400" />
            <span>Video de Galería</span>
          </div>
          <video
            src={post.videoUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto max-h-[480px] rounded-2xl bg-black"
          />
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageLightbox && post.imageUrl && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowImageLightbox(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={post.imageUrl}
              alt="Full preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            />
            <div className="mt-2 text-xs text-slate-300 font-medium">
              Publicado por {post.authorName}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[11px] font-medium text-amber-400/80 hover:text-amber-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats Bar (Views & Reactions summary) */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          {/* Reaction badges summary */}
          <div className="flex items-center -space-x-1">
            {REACTION_CONFIGS.slice(0, 3).map((r) => {
              if ((post.reactions[r.type] || 0) > 0) {
                return (
                  <span key={r.type} className="inline-block text-xs drop-shadow-sm">
                    {r.emoji}
                  </span>
                );
              }
              return null;
            })}
          </div>
          <span className="font-medium text-slate-300">
            {totalReactions > 0 ? `${totalReactions} reacciones` : 'Sé el primero en reaccionar'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums">{post.viewsCount.toLocaleString()} vistas</span>
          </span>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-slate-200"
          >
            {post.comments.length} comentarios
          </button>
        </div>
      </div>

      {/* Action Buttons: Christian Reactions, Comment, Share */}
      <div className="relative flex items-center justify-between pt-1">
        
        {/* Christian Reactions Button with Hover / Click Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactionsTray(!showReactionsTray)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              userReactions.length > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-base">
              {userReactions.length > 0 
                ? REACTION_CONFIGS.find(r => r.type === userReactions[0])?.emoji || '🔥' 
                : '🙏'}
            </span>
            <span>
              {userReactions.length > 0 
                ? REACTION_CONFIGS.find(r => r.type === userReactions[0])?.label 
                : 'Reaccionar'}
            </span>
          </button>

          {/* Christian Reactions Popover Tray */}
          {showReactionsTray && (
            <div className="absolute bottom-10 left-0 flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
              {REACTION_CONFIGS.map((r) => {
                const isSelected = userReactions.includes(r.type);
                const count = post.reactions[r.type] || 0;
                return (
                  <button
                    key={r.type}
                    onClick={() => {
                      toggleReaction(post.id, r.type);
                      setShowReactionsTray(false);
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-xl transition-all transform hover:scale-125 ${
                      isSelected ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'hover:bg-slate-800'
                    }`}
                    title={r.label}
                  >
                    <span className="text-lg leading-none">{r.emoji}</span>
                    <span className="text-[9px] font-bold text-slate-300 mt-1 whitespace-nowrap">
                      {r.label}
                    </span>
                    {count > 0 && (
                      <span className="text-[8px] text-amber-400 font-extrabold">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment Trigger */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Comentar</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.authorName, text: post.content, url: window.location.href });
            } else {
              alert('¡Enlace de la publicación copiado al portapapeles!');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </button>

        {/* Save Bookmark */}
        <button
          onClick={() => savePost(post.id)}
          className={`p-1.5 rounded-xl transition-colors ${isSaved ? 'text-amber-400 bg-amber-500/15' : 'text-slate-400 hover:text-white'}`}
          title="Guardar"
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Expanded Comments Section with Nested Comments & Replies */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <CommentSection
            postId={post.id}
            comments={displayComments}
          />
        </div>
      )}
    </article>
  );
};
