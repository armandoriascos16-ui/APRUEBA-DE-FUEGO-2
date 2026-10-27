import React, { useState } from 'react';
import { OFFICIAL_ADVENTIST_HYMNS } from '../../data/adventistOfficialData';
import { AdventistHymn } from '../../types';
import { 
  Music, 
  Search, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Info,
  ChevronRight,
  X,
  Volume2
} from 'lucide-react';

export const AdventistHymnalPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHymn, setSelectedHymn] = useState<AdventistHymn | null>(null);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'Alabanza y Adoración', label: 'Alabanza & Adoración' },
    { id: 'Jesucristo y Gracia', label: 'Jesucristo & Gracia' },
    { id: 'Sábado y Descanso', label: 'Sábado & Descanso' },
    { id: 'Misión y Servicio', label: 'Misión & Servicio' },
    { id: 'Consagración', label: 'Consagración' },
  ];

  const filteredHymns = OFFICIAL_ADVENTIST_HYMNS.filter(hymn => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      hymn.number.toString().includes(term) ||
      hymn.title.toLowerCase().includes(term) ||
      hymn.biblicalTheme.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'all' || hymn.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 mb-2">
              <Music className="h-4 w-4 text-amber-400" />
              <span>HIMNARIO ADVENTISTA NUEVO EDICIÓN OFICIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Himnos Cristianos & Alabanza Sagrada
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Consulta las letras y fundamentos bíblicos del Himnario Adventista oficial editado por IADPA. Busca por número de himno o tema para enriquecer los cultos jóvenes y momentos devocionales.
            </p>
          </div>

          <a
            href="https://iadpa.org/himnario-adventista"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>Librería Oficial IADPA</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Official Access Guide Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-slate-300 leading-relaxed">
          <strong>Aviso institucional:</strong> El Himnario Adventista en formato físico y las aplicaciones móviles oficiales cuentan con derechos editoriales de IADPA / ACES. En esta sección puedes consultar himnos de dominio público y acceder a los enlaces autorizados de adquisición digital e impresa.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número (ej: 1, 370) o título..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hymns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredHymns.map((hymn) => (
          <div
            key={hymn.number}
            onClick={() => setSelectedHymn(hymn)}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 transition-all cursor-pointer shadow-md flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                #{hymn.number}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {hymn.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="text-amber-400 font-medium">{hymn.category}</span>
                  <span>·</span>
                  <span>{hymn.biblicalTheme}</span>
                  {hymn.key && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{hymn.key}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        ))}
      </div>

      {/* Hymn Lyrics Modal */}
      {selectedHymn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Top Toolbar */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs">
                  Himno #{selectedHymn.number}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white font-heading">
                    {selectedHymn.title}
                  </h2>
                  <span className="text-xs text-amber-400 font-semibold block">
                    {selectedHymn.biblicalTheme} {selectedHymn.key ? `· Tono: ${selectedHymn.key}` : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedHymn(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lyrics Body */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-center">
              {selectedHymn.stanzas.map((stanza, sIdx) => (
                <div key={sIdx} className="space-y-1.5 max-w-lg mx-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Estrofa {sIdx + 1}
                  </span>
                  {stanza.map((line, lIdx) => (
                    <p key={lIdx} className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif">
                      {line}
                    </p>
                  ))}

                  {/* Chorus after each stanza if exists */}
                  {selectedHymn.chorus && sIdx === 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                        Coro
                      </span>
                      {selectedHymn.chorus.map((cLine, cIdx) => (
                        <p key={cIdx} className="text-sm font-semibold italic">
                          {cLine}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer with official source */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edición autorizada IADPA</span>
              </span>

              <a
                href={selectedHymn.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Descarga / Adquisición Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
