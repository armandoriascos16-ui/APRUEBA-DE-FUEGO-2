import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoriesBar } from './StoriesBar';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';
import { QuickAccessBar } from './QuickAccessBar';
import { UserAvatar } from '../common/UserAvatar';
import { Story, Comment } from '../../types';
import { addPostComment } from '../../firebase/db';
import { 
  Sparkles, 
  Flame, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Image, 
  Film,
  Send,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const { 
    currentUser, 
    posts, 
    challenges, 
    events, 
    setActiveTab,
    addComment
  } = useApp();

  const [activeFeedTab, setActiveFeedTab] = useState<'para_ti' | 'siguiendo' | 'oficiales'>('para_ti');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostMediaType, setCreatePostMediaType] = useState<'photo' | 'video'>('photo');

  /**
   * Función para que los usuarios puedan comentar en publicaciones existentes,
   * guardando los comentarios en la subcolección 'comments' dentro del documento de la publicación en Firestore.
   * Ruta en Firestore: /posts/{postId}/comments/{commentId}
   */
  const handleCommentOnPost = async (postId: string, content: string, sticker?: string): Promise<void> => {
    if (!content.trim() && !sticker) return;

    const commentId = `c_${Date.now()}`;
    const newComment: Comment = {
      id: commentId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      sticker,
      createdAt: 'Hace un momento',
      likes: 0,
    };

    // 1. Guardar en la subcolección 'comments' dentro del documento de 'posts' en Firestore
    try {
      await addPostComment(postId, newComment);
      console.log(`Comentario guardado con éxito en la subcolección posts/${postId}/comments/${commentId}`);
    } catch (err) {
      console.warn(`Error al guardar en subcolección posts/${postId}/comments:`, err);
    }

    // 2. Actualizar estado optimista en el feed
    addComment(postId, content.trim(), sticker);
  };

  // Algorithm filtering
  const filteredPosts = posts.filter(post => {
    if (activeFeedTab === 'oficiales') {
      return post.isOfficial;
    }
    if (activeFeedTab === 'siguiendo') {
      return currentUser.followingIds.includes(post.authorId) || post.authorId === currentUser.id;
    }
    // "Para ti": returns all posts, with priority recommendation
    return true;
  });

  const featuredChallenge = challenges[0];
  const featuredEvent = events[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      
      {/* 1. Stories / Estados Espirituales (Section 10 & 16) */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-2 sm:p-3 shadow-md">
        <StoriesBar
          onOpenCreateStory={() => setShowCreateStory(true)}
          onSelectStory={(story) => setSelectedStory(story)}
        />
      </section>

      {/* 2. Quick Access Bar (Section 34) */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800/80 px-3 py-2 shadow-sm">
        <QuickAccessBar />
      </section>

      {/* 3. Create Post Quick Box */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-3.5 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatar={currentUser.avatar}
            name={`${currentUser.name} ${currentUser.lastName}`}
            size="md"
            role={currentUser.role}
            isOfficial={currentUser.isOfficialVerified}
          />
          <button
            onClick={() => {
              setCreatePostMediaType('photo');
              setShowCreatePost(true);
            }}
            className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:border-amber-500/40 hover:text-slate-200 transition-all flex items-center justify-between"
          >
            <span>¿Qué puso Dios en tu corazón hoy, {currentUser.name}?</span>
            <PlusCircle className="h-4 w-4 text-amber-500" />
          </button>
        </div>

        {/* Quick Media Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-1">
          <button
            onClick={() => {
              setCreatePostMediaType('photo');
              setShowCreatePost(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all border border-amber-500/20"
          >
            <Image className="h-3.5 w-3.5 text-amber-400" />
            <span>📷 Foto de Galería</span>
          </button>

          <button
            onClick={() => {
              setCreatePostMediaType('video');
              setShowCreatePost(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all border border-purple-500/20"
          >
            <Film className="h-3.5 w-3.5 text-purple-400" />
            <span>🎥 Video de Galería</span>
          </button>

          <button
            onClick={() => {
              setCreatePostMediaType('photo');
              setShowCreatePost(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-all border border-blue-500/20"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <span>📖 Versículo</span>
          </button>
        </div>
      </section>

      {/* 4. Recommendation Algorithm Tabs (Section 15 & 39) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveFeedTab('para_ti')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFeedTab === 'para_ti'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>✨ Para Ti</span>
        </button>

        <button
          onClick={() => setActiveFeedTab('siguiendo')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFeedTab === 'siguiendo'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Siguiendo</span>
        </button>

        <button
          onClick={() => setActiveFeedTab('oficiales')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFeedTab === 'oficiales'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Oficiales IASD</span>
        </button>
      </div>

      {/* 5. Recommended Event Spotlight Card */}
      {featuredEvent && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-600/20 via-orange-950/40 to-slate-950 border border-amber-500/30 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 border border-amber-500/30">
              <img src={featuredEvent.imageUrl} alt={featuredEvent.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Evento Recomendado para Ti · {featuredEvent.scope}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {featuredEvent.title}
              </h3>
              <p className="text-[11px] text-slate-300">
                {featuredEvent.date} · {featuredEvent.city}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('eventos')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-colors flex items-center gap-1 shrink-0 self-end sm:self-center"
          >
            <span>Ver Evento</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 6. Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post, idx) => (
          <React.Fragment key={post.id}>
            <PostCard 
              post={post} 
              onComment={handleCommentOnPost}
            />

            {/* Interleaved Challenge Card after 2nd post */}
            {idx === 1 && featuredChallenge && (
              <div className="my-4 rounded-3xl bg-gradient-to-r from-orange-600/20 to-red-950/40 border border-orange-500/30 p-4 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    {featuredChallenge.icon}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                      Reto Destacado de la Semana (+{featuredChallenge.points} pts)
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {featuredChallenge.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('retos')}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-slate-950 text-xs font-black hover:bg-orange-400 transition-colors shrink-0"
                >
                  Participar
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Modals */}
      {selectedStory && (
        <StoryViewerModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {showCreatePost && (
        <CreatePostModal
          defaultMediaType={createPostMediaType}
          onClose={() => setShowCreatePost(false)}
        />
      )}

    </div>
  );
};
