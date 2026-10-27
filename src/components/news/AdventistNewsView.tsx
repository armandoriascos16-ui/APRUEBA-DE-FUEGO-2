import React, { useState, useEffect } from 'react';
import { NewsItem, NewsCategory } from '../../types';
import { newsService } from '../../services/newsService';
import { 
  Newspaper, 
  ExternalLink, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Sparkles,
  ChevronRight,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  Building2,
  Users,
  Flame,
  Heart,
  BookOpen,
  Music,
  Share2
} from 'lucide-react';

export const AdventistNewsView: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(() => newsService.getStoredNews());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [lastSyncText, setLastSyncText] = useState<string>(() => newsService.getFormattedLastSync());

  // Categorías de noticias solicitadas
  const categories: { id: string; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'Todas las Noticias', icon: Newspaper },
    { id: 'nacionales_internacionales', label: 'Nacionales e Internacionales', icon: Globe },
    { id: 'juvenil', label: 'Juventud JA', icon: Flame },
    { id: 'iglesias_comunidades', label: 'Iglesias & Distritos', icon: Building2 },
    { id: 'evangelismo_misiones', label: 'Evangelismo & Misiones', icon: Users },
    { id: 'educacion_formacion', label: 'Educación & Formación', icon: BookOpen },
    { id: 'musica_eventos', label: 'Música & Eventos', icon: Music },
    { id: 'salud_familia_servicio', label: 'Salud, Familia & Servicio', icon: Heart },
  ];

  // Auto-sincronización al montar el componente
  useEffect(() => {
    let isMounted = true;
    const performInitialSync = async () => {
      const res = await newsService.syncNews(false);
      if (isMounted) {
        setNews(res.items);
        setUpdateError(res.error);
        setLastSyncText(newsService.getFormattedLastSync());
      }
    };
    performInitialSync();
    return () => { isMounted = false; };
  }, []);

  // Manejo de actualización manual
  const handleManualRefresh = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await newsService.syncNews(true);
      setNews(res.items);
      setUpdateError(res.error);
      setLastSyncText(newsService.getFormattedLastSync());
    } catch (err: any) {
      setUpdateError('Error al contactar los servidores de noticias adventistas.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtrado y búsqueda
  const filteredNews = news.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      item.title.toLowerCase().includes(term) ||
      item.summary.toLowerCase().includes(term) ||
      item.sourceName.toLowerCase().includes(term);

    const matchesCategory = 
      selectedCategory === 'all' || 
      item.category === selectedCategory ||
      (selectedCategory === 'nacionales_internacionales' && (item.category === 'institucional' || item.category === 'internacional')) ||
      (selectedCategory === 'evangelismo_misiones' && item.category === 'mision') ||
      (selectedCategory === 'juvenil' && item.category === 'campamentos');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>NOTICIAS ADVENTISTAS OFICIALES Y VERIFICADAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Actualidad, Misión y Juventud
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Información auténtica procedente de la Conferencia General (ANN), División Interamericana (IAD), 
              Unión Colombiana, Asociación del Pacífico y ADRA. Publicaciones reales ordenadas cronológicamente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            {/* Botón de Actualizar Noticias */}
            <button
              onClick={handleManualRefresh}
              disabled={isUpdating}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Actualizando...' : 'Actualizar noticias'}</span>
            </button>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Última Sincronización</span>
              <span className="text-xs font-black text-emerald-300 block mt-0.5">{lastSyncText}</span>
            </div>
          </div>
        </div>

        {/* Indicador de error / modo offline */}
        {updateError && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{updateError}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar noticias oficiales por título, resumen o fuente..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-[11px] font-semibold text-slate-400 self-center sm:self-auto px-2">
            Mostrando <strong className="text-emerald-400">{filteredNews.length}</strong> noticias
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map(item => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-lg overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      Oficial IASD
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      <span>{item.publishedAt}</span>
                    </span>
                  </div>

                  <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-slate-300 line-clamp-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                    {item.sourceName}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/60 mt-3 pt-3">
                <button
                  onClick={() => setActiveArticle(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Leer Resumen</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 transition-colors shrink-0"
                    title={`Abrir artículo en ${item.sourceName}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Newspaper className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No se encontraron noticias con los filtros seleccionados</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba a buscar con otros términos o pulsa «Todas las Noticias».
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Modal / Visor de Noticia Completa */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {activeArticle.sourceName}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {activeArticle.publishedAt}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                  {activeArticle.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cover Image in Modal */}
            {activeArticle.imageUrl && (
              <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Resumen */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed font-medium">
              <span className="font-bold text-emerald-300 block mb-1">Resumen del Artículo:</span>
              {activeArticle.summary}
            </div>

            {/* Contenido / Cuerpo */}
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
              <p>{activeArticle.content}</p>
            </div>

            {/* Modal Footer with External Link */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Fuente oficial verificada: <strong className="text-slate-300">{activeArticle.sourceName}</strong>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
                >
                  Cerrar
                </button>

                {activeArticle.sourceUrl && (
                  <a
                    href={activeArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-transform active:scale-95"
                  >
                    <span>Abrir noticia completa en el sitio oficial</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
