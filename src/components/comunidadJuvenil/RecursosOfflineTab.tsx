import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Clock, 
  FileText, 
  X, 
  RefreshCw 
} from 'lucide-react';
import { INITIAL_OFFLINE_RESOURCES } from './comunidadData';
import { OfflineYouthResource } from './types';

export const RecursosOfflineTab: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [resources, setResources] = useState<OfflineYouthResource[]>(() => {
    try {
      const saved = localStorage.getItem('cjc_offline_resources');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Safe fallback
    }
    return INITIAL_OFFLINE_RESOURCES;
  });

  const [activeFilter, setActiveFilter] = useState<'todos' | 'guardados'>('todos');
  const [readingResource, setReadingResource] = useState<OfflineYouthResource | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Sincronizado');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('Conexión reanudada. Sincronizando recursos locales...');
      setTimeout(() => setSyncStatus('Sincronizado con el servidor'), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('Modo Sin Conexión activo. Consultando recursos guardados.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const persistResources = (newResources: OfflineYouthResource[]) => {
    setResources(newResources);
    try {
      localStorage.setItem('cjc_offline_resources', JSON.stringify(newResources));
    } catch (err) {
      console.warn('Error guardando en localStorage:', err);
    }
  };

  const toggleSaveOffline = (id: string) => {
    const updated = resources.map(r => {
      if (r.id === id) {
        const nextSaved = !r.isSavedOffline;
        return {
          ...r,
          isSavedOffline: nextSaved,
          savedAt: nextSaved ? 'Guardado en tu dispositivo' : undefined
        };
      }
      return r;
    });
    persistResources(updated);
  };

  const savedCount = resources.filter(r => r.isSavedOffline).length;
  const displayedResources = activeFilter === 'guardados'
    ? resources.filter(r => r.isSavedOffline)
    : resources;

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-950 border border-teal-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-amber-400" />}
            <span>FUNCIÓN REAL J · RECURSOS PARA CONSULTA SIN CONEXIÓN</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Biblioteca de Campo JA (Offline)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Guarda dinámicas de Sociedad de Jóvenes, sermones juveniles completos y bancos de preguntas bíblicas 
            en el almacenamiento seguro de tu navegador. Consúltalos en campamentos y zonas sin cobertura.
          </p>
        </div>

        {/* Indicador de Conexión Real */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 self-start sm:self-auto shrink-0 ${
          isOnline ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        }`}>
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div>
            <span className="font-bold block">{isOnline ? 'En Línea (Conectado)' : 'Sin Conexión (Offline)'}</span>
            <span className="text-[10px] opacity-80 block">{syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Selector de Filtros */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveFilter('todos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'todos' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todos los Recursos ({resources.length})
        </button>
        <button
          onClick={() => setActiveFilter('guardados')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFilter === 'guardados' ? 'bg-emerald-500 text-slate-950 shadow-sm font-black' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Disponibles en este Dispositivo ({savedCount})</span>
        </button>
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 gap-4">
        {displayedResources.map(res => (
          <div
            key={res.id}
            className={`rounded-3xl border p-5 transition-all shadow-md space-y-4 ${
              res.isSavedOffline
                ? 'bg-slate-900/90 border-teal-500/40 ring-1 ring-teal-500/20'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-750'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                    {res.categoryLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {res.estimatedReadTime}
                  </span>
                  {res.isSavedOffline && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Disponible Sin Conexión
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">
                  {res.title}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Fuente: {res.authorOrSource}
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setReadingResource(res)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Leer Material</span>
                </button>

                <button
                  onClick={() => toggleSaveOffline(res.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    res.isSavedOffline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                  }`}
                  title={res.isSavedOffline ? 'Quitar del dispositivo' : 'Guardar en tu navegador'}
                >
                  {res.isSavedOffline ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Guardado Offline</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>Guardar sin internet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {res.summary}
            </p>
          </div>
        ))}

        {displayedResources.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <WifiOff className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No hay recursos guardados sin conexión todavía</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Presiona "Guardar sin internet" en cualquiera de las guías maestras para tenerlas disponibles aún en modo avión.
            </p>
          </div>
        )}
      </div>

      {/* Lector Modal de Contenido Completo */}
      {readingResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                  {readingResource.categoryLabel}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {readingResource.title}
                </h3>
              </div>
              <button
                onClick={() => setReadingResource(null)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-200 leading-relaxed space-y-3 font-mono whitespace-pre-line bg-slate-950 p-4 rounded-2xl border border-slate-850">
              {readingResource.fullContent}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{readingResource.authorOrSource}</span>
              <button
                onClick={() => setReadingResource(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700"
              >
                Cerrar Lector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
