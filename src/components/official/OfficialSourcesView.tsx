import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Church, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Calendar, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const OfficialSourcesView: React.FC = () => {
  const { officialSources, events } = useApp();

  const officialEvents = events.filter(e => e.isOfficialSource);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>VERIFICACIÓN Y TRANSPARENCIA INSTITUCIONAL</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Páginas Oficiales de la Iglesia Adventista
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
          En "A Prueba de Fuego" toda la información de eventos y noticias eclesiásticas proviene de portales oficiales y divisiones de la Iglesia Adventista del Séptimo Día. No difundimos rumores ni eventos no certificados.
        </p>
      </div>

      {/* Directory of Official Portals */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Organizaciones y Sedes Administrativas Verificadas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {officialSources.map((src) => (
            <div
              key={src.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 hover:border-emerald-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      {src.logo}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {src.name}
                        </h3>
                        {src.verified && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                        {src.region}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-3">
                  {src.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400">
                  Actualizado: {src.lastUpdated}
                </span>

                <a
                  href={src.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 hover:text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <span>Portal Oficial</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events directly from Official Sources */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Convocatorias y Camporees Certificados ({officialEvents.length})
          </h2>
          <span className="text-xs text-emerald-400 font-semibold">
            ✓ Verificados 100%
          </span>
        </div>

        <div className="space-y-3">
          {officialEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    Fuente Oficial
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white">{ev.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Organización: <strong className="text-slate-200">{ev.officialOrganization}</strong> · {ev.date}
                </p>
              </div>

              <a
                href={ev.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <span>Ver Convocatoria</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
