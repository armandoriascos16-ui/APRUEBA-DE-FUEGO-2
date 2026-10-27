import React, { useState } from 'react';
import { OFFICIAL_YOUTH_MATERIALS, YouthMaterial } from '../../data/adventistResourcesData';
import { ADVENTIST_CAMP_EVENTS } from '../../data/adventistOfficialData';
import { AdventistCampEvent } from '../../types';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  FileText, 
  Music, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  Search, 
  Sparkles,
  Info,
  Tent,
  Calendar,
  MapPin,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const YouthMaterialsPortal: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'materials' | 'camps'>('materials');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampRegion, setSelectedCampRegion] = useState<string>('all');

  const filteredMaterials = OFFICIAL_YOUTH_MATERIALS.filter(mat => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      mat.title.toLowerCase().includes(term) || 
      mat.description.toLowerCase().includes(term) ||
      mat.authorOrEntity.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'all' || mat.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCamps = ADVENTIST_CAMP_EVENTS.filter(camp => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      camp.title.toLowerCase().includes(term) ||
      camp.description.toLowerCase().includes(term) ||
      camp.location.toLowerCase().includes(term) ||
      camp.organization.toLowerCase().includes(term);

    const matchesRegion = selectedCampRegion === 'all' || camp.region.toLowerCase().includes(selectedCampRegion.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300 mb-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>REPOSITORIO OFICIAL IASD COLOMBIA & INTERAMÉRICA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Materiales, Campamentos & Boletines
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Descarga manuales oficiales de Guías Mayores, folletos de Escuela Sabática universitaria, himnarios y accede a la sección oficial de camporees, congresos y boletines de inscripción.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-blue-500/30 shrink-0">
            <button
              onClick={() => setActiveMainTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'materials'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Materiales ({OFFICIAL_YOUTH_MATERIALS.length})</span>
            </button>
            <button
              onClick={() => setActiveMainTab('camps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'camps'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tent className="w-4 h-4" />
              <span>Campamentos & Eventos ({ADVENTIST_CAMP_EVENTS.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Materiales Juveniles */}
      {activeMainTab === 'materials' && (
        <div className="space-y-6">
          {/* Guide Box */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-400" />
              <span>¿Cómo acceder a los materiales juveniles adventistas?</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-bold text-blue-400 block">1. Descarga Directa Digital:</span>
                <p className="text-slate-300 leading-relaxed">
                  Haz clic en "Descargar / Acceder" en cada recurso para abrir el PDF o archivo comprimido oficial sin costo.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-bold text-emerald-400 block">2. Librerías IADPA Oficiales:</span>
                <p className="text-slate-300 leading-relaxed">
                  Para versiones impresas en papel y pañuelos oficiales, acude a la librería de la Asociación Sur Occidental o Unión Colombiana.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-bold text-amber-400 block">3. Apps Oficiales Móviles:</span>
                <p className="text-slate-300 leading-relaxed">
                  Descarga en Google Play / App Store las aplicaciones: "Himnario Adventista", "Escuela Sabática" y "EGW Writings".
                </p>
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar manual, himno o estudio..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedCategory('manuales_oficiales')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'manuales_oficiales'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Manuales
              </button>
              <button
                onClick={() => setSelectedCategory('himnarios_musica')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'himnarios_musica'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Música
              </button>
              <button
                onClick={() => setSelectedCategory('escuela_sabatica')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'escuela_sabatica'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                inVerse
              </button>
            </div>
          </div>

          {/* Materials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                      {mat.format} · {mat.size}
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {mat.authorOrEntity}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{mat.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <span className="font-bold text-slate-300 block">¿Cómo acceder a este material?</span>
                    <p>{mat.howToAccess}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Recurso 100% Oficial IASD
                  </span>

                  <a
                    href={mat.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span>Descargar / Acceder</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab 2: Campamentos y Eventos Adventistas */}
      {activeMainTab === 'camps' && (
        <div className="space-y-6">
          {/* Section banner */}
          <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300">
                <Tent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  Campamentos y Eventos Adventistas
                </h2>
                <p className="text-xs text-slate-300">
                  Boletines informativos oficiales, fechas límites, requisitos de inscripción y costos certificados por la Iglesia Adventista en Colombia.
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-xs text-amber-400 font-bold block">Unión Colombiana</span>
              <span className="text-[10px] text-slate-400">Ministerios Juveniles</span>
            </div>
          </div>

          {/* Camp Cards */}
          <div className="space-y-5">
            {filteredCamps.map((camp) => (
              <div
                key={camp.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 overflow-hidden shadow-xl transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  
                  {/* Image column */}
                  <div className="relative h-56 md:h-full bg-slate-950">
                    <img
                      src={camp.imageUrl}
                      alt={camp.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                      {camp.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Content column */}
                  <div className="md:col-span-2 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{camp.organization}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{camp.location}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white font-heading mb-2">
                        {camp.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {camp.description}
                      </p>

                      {/* Dates and Cost */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Fechas:</span>
                          <span className="text-slate-200 font-semibold">{camp.startDate} al {camp.endDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Costo Oficial:</span>
                          <span className="text-emerald-400 font-bold">{camp.officialCost}</span>
                        </div>
                      </div>

                      {/* Requirements List */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Requisitos de Inscripción:
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {camp.requirements.map((req, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions and Bulletin */}
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[10px] text-slate-400">
                        Límite: <strong className="text-white">{camp.registrationDeadline}</strong> · Verif: {camp.lastVerifiedDate}
                      </div>

                      <div className="flex items-center gap-2">
                        {camp.bulletinPdfUrl && (
                          <a
                            href={camp.bulletinPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>Descargar Boletín</span>
                          </a>
                        )}

                        <a
                          href={camp.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                          <span>Inscripción Oficial</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
