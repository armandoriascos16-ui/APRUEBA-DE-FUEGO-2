import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  MessageCircle, 
  Sparkles, 
  PlusCircle, 
  BookOpen, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  Bookmark, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Flag, 
  Image, 
  Video, 
  X, 
  ArrowUpDown, 
  Check, 
  CornerDownRight, 
  Building2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { CommunityPost } from './types';

export const FeedComunidadTab: React.FC = () => {
  const { currentUser } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>(comunidadStorage.getPosts());
  const [sortOrder, setSortOrder] = useState<'recientes' | 'actividad'>('recientes');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // New post states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'reflexion' | 'testimonio' | 'oracion' | 'actividad' | 'general' | 'estudio'>('reflexion');
  const [newVerse, setNewVerse] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');

  // Comment & reply states
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Edit modal
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Delete confirm modal
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Report modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Share feedback
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  const userCommunities = comunidadStorage.getCommunities().filter(c => 
    c.members.some(m => m.userId === currentUser.id)
  );

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setPosts(comunidadStorage.getPosts());
    });
    return unsub;
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const commObj = userCommunities.find(c => c.id === selectedCommunityId);

    comunidadStorage.createPost({
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorDistrict: currentUser.district || 'Distrito Central',
      communityId: commObj?.id,
      communityName: commObj?.name,
      title: newTitle.trim() || undefined,
      content: newContent.trim(),
      category: newCategory,
      bibleVerse: newVerse.trim() || undefined,
      mediaType: newMediaType !== 'none' ? newMediaType : undefined,
      mediaUrl: newMediaUrl.trim() || undefined
    });

    setNewTitle('');
    setNewContent('');
    setNewVerse('');
    setNewMediaUrl('');
    setNewMediaType('none');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editContent.trim()) return;

    comunidadStorage.updatePost(editingPost.id, currentUser.id, editContent.trim(), editTitle.trim());
    setEditingPost(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingPostId) return;
    comunidadStorage.deletePost(deletingPostId, currentUser.id);
    setDeletingPostId(null);
  };

  const handleReaction = (postId: string, reactionType: 'amen' | 'aleluya' | 'gloriaDios' | 'diosEsBueno') => {
    comunidadStorage.toggleReaction(postId, currentUser.id, reactionType);
  };

  const handleToggleFavorite = (postId: string) => {
    comunidadStorage.toggleFavoritePost(postId, currentUser.id);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    comunidadStorage.addComment(
      postId,
      currentUser.id,
      `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      currentUser.avatar,
      commentText.trim()
    );
    setCommentText('');
  };

  const handleAddReply = (postId: string, commentId: string) => {
    if (!replyText.trim()) return;
    comunidadStorage.addReplyToComment(
      postId,
      commentId,
      currentUser.id,
      `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      currentUser.avatar,
      replyText.trim()
    );
    setReplyText('');
    setReplyingToCommentId(null);
  };

  const handleShare = async (post: CommunityPost) => {
    const textToShare = `«${post.title ? post.title + ' — ' : ''}${post.content}»\nPublicado en A Prueba de Fuego (Comunidad Juvenil Cristiana)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Publicación en Comunidad Cristiana',
          text: textToShare,
          url: window.location.href
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setShareSuccessId(post.id);
      setTimeout(() => setShareSuccessId(null), 2500);
    } catch {
      // Ignored
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    comunidadStorage.addReport({
      reporterId: currentUser.id,
      reporterName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      contentType: 'post',
      contentId: reportingPostId,
      reason: reportReason.trim()
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingPostId(null);
      setReportReason('');
    }, 2000);
  };

  // Filter and sort
  const filteredPosts = posts
    .filter(p => categoryFilter === 'todos' || p.category === categoryFilter)
    .sort((a, b) => {
      if (sortOrder === 'actividad') {
        const actA = a.comments.length + Object.values(a.reactions).reduce((sum, n) => sum + n, 0);
        const actB = b.comments.length + Object.values(b.reactions).reduce((sum, n) => sum + n, 0);
        return actB - actA;
      }
      return 0; // default order in storage is recent-first
    });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-950 border border-blue-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>FUNCIÓN REAL C · MURO DE PUBLICACIONES COMUNITARIO</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Muro Sagrado de la Juventud Adventista
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Publicaciones exclusivas con imágenes, versículos y categorías. Comentarios, respuestas anidadas, 
            reacciones cristianas (Amén 🙏, Aleluya 🔥, Gloria a Dios ❤️, Dios es Bueno 🙌), favoritos y moderación.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Ordenar:</span>
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none"
          >
            <option value="recientes">Más Recientes</option>
            <option value="actividad">Mayor Actividad</option>
          </select>
        </div>
      </div>

      {/* Caja de Creación de Publicación con Formulario Completo */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <PlusCircle className="h-4 w-4 text-blue-400" />
          <span>Escribir en el Muro Comunitario</span>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título de la publicación (opcional)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
          />

          <textarea
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="¿Qué puso Dios en tu corazón hoy? Comparte una reflexión, testimonio o motivo espiritual..."
            rows={3}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Categoría:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              >
                <option value="reflexion">Reflexión Espiritual</option>
                <option value="testimonio">Testimonio de Fe</option>
                <option value="oracion">Motivo de Oración</option>
                <option value="actividad">Actividad / Invitación</option>
                <option value="estudio">Estudio Bíblico</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Citar Versículo Bíblico:</label>
              <input
                type="text"
                value={newVerse}
                onChange={(e) => setNewVerse(e.target.value)}
                placeholder="Ej: Salmos 119:105"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Comunidad Destino:</label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              >
                <option value="">General (Toda la Juventud)</option>
                {userCommunities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adjuntar Multimedia */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setNewMediaType(newMediaType === 'image' ? 'none' : 'image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                newMediaType === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Image className="h-3.5 w-3.5" />
              <span>Adjuntar Imagen</span>
            </button>

            <button
              type="button"
              onClick={() => setNewMediaType(newMediaType === 'video' ? 'none' : 'video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                newMediaType === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Adjuntar Video (URL)</span>
            </button>

            {newMediaType !== 'none' && (
              <input
                type="url"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder={newMediaType === 'image' ? 'URL de imagen (https://...)' : 'URL de video (https://...)'}
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none text-xs"
              />
            )}

            <button
              type="submit"
              disabled={!newContent.trim()}
              className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filtro por Categorías */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['todos', 'reflexion', 'testimonio', 'oracion', 'actividad', 'estudio'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat === 'todos' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de Publicaciones */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const isOwner = post.authorId === currentUser.id;
          const isFav = post.isFavoritedByUsers.includes(currentUser.id);
          const hasLiked = post.likedUserIds.includes(currentUser.id);

          return (
            <div
              key={post.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-md space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="h-10 w-10 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{post.authorName}</span>
                      <span className="px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        {post.category.toUpperCase()}
                      </span>
                      {post.isEdited && (
                        <span className="text-[10px] text-slate-500 italic">(editado)</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      {post.communityName ? `${post.communityName} · ` : ''}{post.authorDistrict} · {post.createdAt}
                    </span>
                  </div>
                </div>

                {/* Dropdown / Actions: Edit, Delete, Report */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleFavorite(post.id)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      isFav ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  >
                    <Bookmark className={`h-4 w-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setEditTitle(post.title || '');
                          setEditContent(post.content);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                        title="Editar mi publicación"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingPostId(post.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar mi publicación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => setReportingPostId(post.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Reportar contenido inapropiado"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Título si existe */}
              {post.title && (
                <h3 className="text-base font-bold text-white leading-snug">
                  {post.title}
                </h3>
              )}

              {/* Contenido */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Versículo si existe */}
              {post.bibleVerse && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-amber-300 italic flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{post.bibleVerse}</span>
                </div>
              )}

              {/* Multimedia si existe */}
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-80">
                  {post.mediaType === 'image' ? (
                    <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-4 text-center">
                      <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs flex items-center justify-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>Ver video adjunto</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Reacciones Cristianas */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleReaction(post.id, 'amen')}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>🙏 Amén</span>
                    <span className="font-bold text-amber-400">{post.reactions.amen}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, 'aleluya')}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>🔥 Aleluya</span>
                    <span className="font-bold text-orange-400">{post.reactions.aleluya}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, 'gloriaDios')}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>❤️ Gloria a Dios</span>
                    <span className="font-bold text-rose-400">{post.reactions.gloriaDios}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, 'diosEsBueno')}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>🙌 Dios es Bueno</span>
                    <span className="font-bold text-emerald-400">{post.reactions.diosEsBueno}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(post)}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white flex items-center gap-1 transition-all"
                    title="Compartir publicación"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{shareSuccessId === post.id ? '¡Copiado!' : 'Compartir'}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{post.comments.length} comentarios</span>
                  </button>
                </div>
              </div>

              {/* Sección de Comentarios y Respuestas */}
              {activeCommentPostId === post.id && (
                <div className="pt-3 border-t border-slate-850 space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    {post.comments.map(c => (
                      <div key={c.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <img src={c.authorAvatar} alt={c.authorName} className="h-6 w-6 rounded-lg object-cover ring-1 ring-slate-800" />
                            <div>
                              <span className="font-bold text-white block">{c.authorName}</span>
                              <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id)}
                            className="text-[10px] text-blue-400 hover:underline font-semibold"
                          >
                            Responder
                          </button>
                        </div>

                        <p className="text-slate-300 pl-8">{c.text}</p>

                        {/* Respuestas anidadas */}
                        {c.replies && c.replies.length > 0 && (
                          <div className="pl-8 space-y-2 pt-1 border-t border-slate-850/60">
                            {c.replies.map(rep => (
                              <div key={rep.id} className="flex items-start gap-2 text-[11px] bg-slate-900/60 p-2 rounded-xl">
                                <CornerDownRight className="h-3 w-3 text-slate-500 shrink-0 mt-1" />
                                <div>
                                  <span className="font-bold text-slate-200 block">{rep.authorName}</span>
                                  <p className="text-slate-300">{rep.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Formulario de respuesta */}
                        {replyingToCommentId === c.id && (
                          <div className="flex items-center gap-2 pl-8 pt-1">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Responder a ${c.authorName}...`}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleAddReply(post.id, c.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                            >
                              Enviar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input nuevo comentario */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escribe un comentario o palabra de edificación..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Editar Publicación */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Editar Publicación</h3>
              <button onClick={() => setEditingPost(null)} className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contenido: *</label>
                <textarea
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editContent.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar publicación?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Esta acción es irreversible y eliminará tu publicación y sus comentarios de la comunidad.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reportar Contenido */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reportar Publicación</h3>
              </div>
              <button onClick={() => setReportingPostId(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs text-center font-bold">
                ✓ Reporte recibido. Los administradores revisarán el contenido.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Indica el motivo del reporte (lenguaje irrespetuoso, doctrina errónea, spam o quebrantamiento de reglas):
                </p>
                <textarea
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe la razón del reporte..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold"
                  >
                    Enviar Reporte
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
