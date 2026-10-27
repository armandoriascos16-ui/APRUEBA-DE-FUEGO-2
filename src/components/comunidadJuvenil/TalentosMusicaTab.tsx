import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  Trash2, 
  X, 
  BookOpen, 
  Image, 
  Video, 
  FileText, 
  Globe, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { CreativeProject, CreativeCategory } from './types';

const CREATIVE_CATEGORIES: { id: CreativeCategory; label: string; icon: string }[] = [
  { id: 'musica_canto', label: 'Música y canto', icon: '🎵' },
  { id: 'coros_vocales', label: 'Coros y grupos vocales', icon: '🎶' },
  { id: 'composicion', label: 'Composición musical', icon: '🎼' },
  { id: 'diseno_arte', label: 'Diseño y arte', icon: '🎨' },
  { id: 'fotografia_video', label: 'Fotografía y video', icon: '📷' },
  { id: 'teatro_expresion', label: 'Teatro y expresión', icon: '🎭' },
  { id: 'escritura_reflexion', label: 'Escritura y reflexiones', icon: '✍️' },
  { id: 'servicio', label: 'Proyectos de servicio', icon: '🤝' },
  { id: 'tecnologia_digital', label: 'Tecnología y medios', icon: '💻' },
];

export const TalentosMusicaTab: React.FC = () => {
  const { currentUser } = useApp();
  const [projects, setProjects] = useState<CreativeProject[]>(comunidadStorage.getProjects());
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CreativeCategory>('musica_canto');
  const [newDesc, setNewDesc] = useState('');
  const [newMediaType, setNewMediaType] = useState<'audio' | 'image' | 'video' | 'text'>('audio');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setProjects(comunidadStorage.getProjects());
    });
    return unsub;
  }, []);

  const handlePlayToggle = (id: string) => {
    setCurrentlyPlayingId(currentlyPlayingId === id ? null : id);
  };

  const handleToggleLike = (id: string) => {
    comunidadStorage.toggleProjectLike(id, currentUser.id);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const catObj = CREATIVE_CATEGORIES.find(c => c.id === newCategory) || CREATIVE_CATEGORIES[0];

    comunidadStorage.createProject({
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catObj.label,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      authorDistrict: currentUser.district || 'Distrito Central',
      description: newDesc.trim(),
      mediaType: newMediaType,
      mediaUrl: newMediaUrl.trim() || undefined,
      lyricsOrText: newLyrics.trim() || undefined,
      isPublic: newIsPublic
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewMediaUrl('');
    setNewLyrics('');
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    comunidadStorage.deleteProject(deletingId, currentUser.id);
    setDeletingId(null);
  };

  const filteredProjects = projects.filter(p => {
    if (selectedCategory !== 'todos') {
      return p.category === selectedCategory;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-950/50 via-slate-900 to-slate-950 border border-orange-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Music className="h-4 w-4" />
            <span>FUNCIÓN REAL H · TALENTOS Y PROYECTOS CREATIVOS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Dones al Servicio del Creador
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Comparte alabanzas, coros, composiciones sacras, diseño gráfico, poesía y proyectos audiovisuales. 
            Permisos de autor protegidos: solo el propietario puede modificar o eliminar su proyecto.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 self-start sm:self-auto transition-transform active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Compartir Proyecto</span>
        </button>
      </div>

      {/* Selector de Categorías Creativas */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategory === 'todos' ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todos ({projects.length})
        </button>
        {CREATIVE_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedCategory === c.id ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProjects.map(proj => {
          const isOwner = proj.authorId === currentUser.id;
          const hasLiked = proj.likedUserIds.includes(currentUser.id);
          const isPlaying = currentlyPlayingId === proj.id;

          return (
            <div
              key={proj.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 transition-all shadow-md p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold">
                      {proj.categoryLabel}
                    </span>
                    {proj.isPublic ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Público
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Comunidad
                      </span>
                    )}
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setDeletingId(proj.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Eliminar mi proyecto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-tight">
                  {proj.title}
                </h3>
                <span className="text-xs text-orange-400 font-semibold block mt-0.5">
                  Por: {proj.authorName} ({proj.authorDistrict})
                </span>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                  {proj.description}
                </p>

                {/* Letra o Texto */}
                {proj.lyricsOrText && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-serif italic max-h-36 overflow-y-auto">
                    {proj.lyricsOrText}
                  </div>
                )}

                {/* Imagen si aplica */}
                {proj.mediaType === 'image' && proj.mediaUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden max-h-48 border border-slate-800">
                    <img src={proj.mediaUrl} alt={proj.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Botón de Reproducción y Likes */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {proj.mediaType === 'audio' && (
                  <button
                    onClick={() => handlePlayToggle(proj.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isPlaying
                        ? 'bg-orange-500 text-slate-950 font-black animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-750 text-orange-300'
                    }`}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-orange-300" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </button>
                )}

                {proj.mediaType !== 'audio' && <span className="text-[11px] text-slate-500">{proj.createdAt}</span>}

                <button
                  onClick={() => handleToggleLike(proj.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hasLiked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-850'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{proj.likesCount} me inspiró</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="sm:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Music className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No hay proyectos en esta categoría</p>
          </div>
        )}
      </div>

      {/* Modal Crear Proyecto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Compartir Talento o Proyecto</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título del Proyecto: *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: «En la Cruz» — Solo de Violín"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoría:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CreativeCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    {CREATIVE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de formato:</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="audio">Audio / Alabanza</option>
                    <option value="text">Texto / Poesía</option>
                    <option value="image">Imagen / Ilustración</option>
                    <option value="video">Video (Enlace)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descripción del Proyecto:</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe cómo surgió esta composición o proyecto creativo..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {(newMediaType === 'audio' || newMediaType === 'image' || newMediaType === 'video') && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">URL de Audio / Multimedia:</label>
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://archive.org/... o https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Letra o Texto Completo (opcional):</label>
                <textarea
                  value={newLyrics}
                  onChange={(e) => setNewLyrics(e.target.value)}
                  placeholder="Escribe la letra, poema o reflexión..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none font-serif resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancelar
                </button>
                <button type="submit" disabled={!newTitle.trim()} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold disabled:opacity-50">
                  Publicar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-white">¿Eliminar este proyecto?</h3>
            <p className="text-xs text-slate-400">Esta acción removerá tu creación del catálogo de talentos.</p>
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
