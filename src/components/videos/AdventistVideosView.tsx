import React, { useState } from 'react';
import { ADVENTIST_VIDEOS } from '../../data/adventistVideosData';
import { AdventistVideo } from '../../types';
import { 
  Play, 
  Tv, 
  ExternalLink, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Share2,
  Maximize2
} from 'lucide-react';

export const AdventistVideosView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideo, setActiveVideo] = useState<AdventistVideo | null>(null);
  const [sortByRecent, setSortByRecent] = useState<boolean>(true);

  const categories = [
    { id: 'all', label: 'Todos los Videos' },
    { id: 'musica', label: 'Música' },
    { id: 'predicacion', label: 'Predicación' },
    { id: 'testimonios', label: 'Testimonios' },
    { id: 'estudios_biblicos', label: 'Estudios Bíblicos' },
    { id: 'jovenes', label: 'Jóvenes' },
    { id: 'evangelismo', label: 'Evangelismo' },
    { id: 'eventos', label: 'Eventos' },
  ];

  const filteredVideos = ADVENTIST_VIDEOS.filter(v => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      v.title.toLowerCase().includes(term) ||
      v.channelName.toLowerCase().includes(term) ||
      v.description.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortByRecent) {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    }
    return 0;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'musica': return 'Música';
      case 'predicacion': return 'Predicación';
      case 'testimonios': return 'Testimonios';
      case 'estudios_biblicos': return 'Estudios Bíblicos';
      case 'jovenes': return 'Jóvenes';
      case 'evangelismo': return 'Evangelismo';
      case 'eventos': return 'Eventos';
      default: return cat;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950 border border-red-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-bold text-red-300 mb-2">
              <Tv className="h-4 w-4 text-red-400" />
              <span>GALERÍA DE VIDEOS ADVENTISTAS VERIFICADOS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Videos Adventistas en la Aplicación
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Reproduce contenido oficial de Hope Channel, Feliz7Play, Escrito Está, Unión Colombiana y ministerios juveniles verificados. Con reproductor integrado en la app y enlace a fuentes auténticas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/30 text-center min-w-[130px] shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catálogo Oficial</span>
            <span className="text-2xl font-black text-red-400">{ADVENTIST_VIDEOS.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Videos Verificados</span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="space-y-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-md">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, canal oficial o tema bíblico..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortByRecent(!sortByRecent)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 border transition-all flex items-center gap-1.5 ${
              sortByRecent 
                ? 'bg-red-600/20 border-red-500/40 text-red-300' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{sortByRecent ? '📅 Más Recientes' : '⭐ Destacados'}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-3">
          <Tv className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No se encontraron videos con ese criterio</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Prueba cambiando el filtro de categoría o buscando otros términos como alabanza, sermón o campamento.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="group flex flex-col rounded-3xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-all overflow-hidden shadow-lg hover:shadow-red-500/10"
            >
              {/* Thumbnail with Play Overlay */}
              <div 
                className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Duration Badge */}
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 border border-slate-800 text-[10px] font-bold text-slate-200">
                  {video.duration}
                </span>

                {/* Category Pill */}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                  {getCategoryLabel(video.category)}
                </span>

                {/* Big Play Button Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:bg-slate-950/30 transition-all">
                  <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 
                    onClick={() => setActiveVideo(video)}
                    className="text-xs sm:text-sm font-bold text-white group-hover:text-red-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 truncate">{video.channelName}</span>
                    {video.isOfficialChannel && (
                      <span title="Canal Oficial Verificado">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/30"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Reproducir</span>
                  </button>

                  <a
                    href={video.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 flex items-center gap-1 text-[11px]"
                    title="Abrir video original en YouTube"
                  >
                    <span>Fuente</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="p-1.5 rounded-lg bg-red-600 text-white shrink-0">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    {activeVideo.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeVideo.channelName} · {getCategoryLabel(activeVideo.category)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                title="Cerrar reproductor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player (Responsive 16:9 Iframe) */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Details & Fallback Option */}
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold">
                    {getCategoryLabel(activeVideo.category)}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {activeVideo.duration}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {activeVideo.publishedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeVideo.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                  >
                    <span>Abrir en YouTube Original</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeVideo.description}
              </p>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Video verificado de canal oficial adventista. Si la reproducción integrada está restringida por tu navegador o red corporativa, utiliza el botón "Abrir en YouTube Original".
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
