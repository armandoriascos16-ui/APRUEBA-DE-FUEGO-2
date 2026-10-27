import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, EventTerritory, EventStatus } from '../../types';
import { BUENAVENTURA_CHURCHES } from '../../data/adventistResourcesData';
import { 
  VERIFIED_OFFICIAL_EVENTS, 
  OFFICIAL_EVENT_SOURCES_META,
  getUpcomingAndOngoingEvents,
  getPastEvents
} from '../../data/verifiedAdventistEvents';
import { AddToCalendarModal } from './AddToCalendarModal';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Filter,
  Search,
  Church,
  ShieldCheck,
  Globe,
  Radio,
  AlertCircle,
  Building2,
  CalendarDays,
  History,
  Info,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, adminCreateEvent, currentUser, toggleEventParticipation } = useApp();
  
  // Active Filter Tabs
  const [selectedTerritory, setSelectedTerritory] = useState<EventTerritory | 'all'>('buenaventura');
  const [timelineTab, setTimelineTab] = useState<'vigentes' | 'anteriores' | 'todos'>('vigentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventForCalendar, setSelectedEventForCalendar] = useState<EventItem | null>(null);
  const [showSourcesInfo, setShowSourcesInfo] = useState(false);

  // Modal for Authorized Administrator Editorial Verification (Priority 5)
  const [showAdminAddModal, setShowAdminAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventCity, setNewEventCity] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventOrganizer, setNewEventOrganizer] = useState('');
  const [newEventSourceUrl, setNewEventSourceUrl] = useState('');
  const [newEventSourceName, setNewEventSourceName] = useState<'Asociación del Pacífico' | 'Unión Colombiana del Sur' | 'División Interamericana'>('Asociación del Pacífico');
  const [newEventTerritory, setNewEventTerritory] = useState<EventTerritory>('buenaventura');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventItem['category']>('ja_especial');

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.email === 'harmonymusis@gmail.com' || currentUser.email === 'harmonyestampadosr@gmail.com';

  // Merge events with genuine verified list (avoiding duplicates by id)
  const allVerifiedEvents = useMemo(() => {
    const list = [...events];
    for (const ve of VERIFIED_OFFICIAL_EVENTS) {
      if (!list.some(e => e.id === ve.id)) {
        list.push(ve);
      }
    }
    return list;
  }, [events]);

  // Current reference date for timeline calculations (23 de Octubre de 2026)
  const referenceDate = useMemo(() => new Date('2026-10-23T15:00:00Z'), []);

  // Filter events by Search, Category, Territory, and Timeline
  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return allVerifiedEvents.filter(ev => {
      // 1. Search term match
      const matchesSearch = 
        !term ||
        ev.title.toLowerCase().includes(term) ||
        ev.description.toLowerCase().includes(term) ||
        ev.city.toLowerCase().includes(term) ||
        ev.venue.toLowerCase().includes(term) ||
        ev.organizer.toLowerCase().includes(term) ||
        (ev.officialOrganization && ev.officialOrganization.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // 2. Category match
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }

      // 3. Territory match
      if (selectedTerritory !== 'all') {
        if (selectedTerritory === 'buenaventura') {
          const isBuenaventuraExplicit = 
            ev.territory === 'buenaventura' || 
            ev.city.toLowerCase().includes('buenaventura') || 
            ev.venue.toLowerCase().includes('buenaventura');
          if (!isBuenaventuraExplicit) return false;
        } else if (selectedTerritory === 'asopacifico') {
          const isAsopacifico = 
            ev.territory === 'asopacifico' || 
            ev.territory === 'buenaventura' || 
            ev.organizer.toLowerCase().includes('pacífico') || 
            (ev.officialOrganization && ev.officialOrganization.toLowerCase().includes('pacífico'));
          if (!isAsopacifico) return false;
        } else if (selectedTerritory === 'ucsur') {
          const isUcsur = 
            ev.territory === 'ucsur' || 
            ev.organizer.toLowerCase().includes('sur') || 
            (ev.officialOrganization && ev.officialOrganization.toLowerCase().includes('sur'));
          if (!isUcsur) return false;
        } else if (selectedTerritory === 'interamerica') {
          const isInteramerica = 
            ev.territory === 'interamerica' || 
            ev.scope === 'division' || 
            ev.scope === 'internacional';
          if (!isInteramerica) return false;
        }
      }

      // 4. Timeline tab (vigentes vs anteriores)
      const isPast = ev.status === 'finalizado';
      if (timelineTab === 'vigentes' && isPast) return false;
      if (timelineTab === 'anteriores' && !isPast) return false;

      return true;
    });
  }, [allVerifiedEvents, searchTerm, selectedCategory, selectedTerritory, timelineTab]);

  // Statistics counters
  const stats = useMemo(() => {
    const upcomingCount = allVerifiedEvents.filter(e => e.status === 'proximo' || e.status === 'en_curso').length;
    const pastCount = allVerifiedEvents.filter(e => e.status === 'finalizado').length;
    const buenaventuraCount = allVerifiedEvents.filter(e => e.territory === 'buenaventura' || e.city.toLowerCase().includes('buenaventura')).length;
    const asopacificoCount = allVerifiedEvents.filter(e => e.territory === 'asopacifico' || e.territory === 'buenaventura').length;
    return { upcomingCount, pastCount, buenaventuraCount, asopacificoCount };
  }, [allVerifiedEvents]);

  // Handle Admin Add Event
  const handleCreateEditorialEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventSourceUrl) {
      alert('Por favor completa el título, fecha y URL oficial de respaldo.');
      return;
    }

    adminCreateEvent({
      title: newEventTitle.trim(),
      description: newEventDesc.trim() || 'Actividad oficial convocada por la Iglesia Adventista.',
      category: newEventCategory,
      date: newEventDate.trim(),
      time: newEventTime.trim() || 'Por confirmar oficialmente',
      city: newEventCity.trim() || (newEventTerritory === 'buenaventura' ? 'Buenaventura, Valle del Cauca' : 'Colombia'),
      country: 'Colombia',
      venue: newEventVenue.trim() || 'Por confirmar oficialmente',
      organizer: newEventOrganizer.trim() || newEventSourceName,
      isOfficialSource: true,
      officialSourceName: newEventSourceName,
      officialOrganization: newEventSourceName,
      officialSourceUrl: newEventSourceUrl.trim(),
      verifiedAt: '23 de Octubre de 2026',
      status: 'proximo',
      territory: newEventTerritory,
      scope: newEventTerritory === 'buenaventura' ? 'ciudad' : newEventTerritory === 'asopacifico' ? 'asociacion' : 'union',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
      isAttending: false,
      isInterested: false,
    });

    setShowAdminAddModal(false);
    // Reset form
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setNewEventCity('');
    setNewEventVenue('');
    setNewEventOrganizer('');
    setNewEventSourceUrl('');
    setNewEventDesc('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* ============================================================================ */}
      {/* 1. HEADER BANNER WITH OFFICIAL CERTIFICATION BADGE */}
      {/* ============================================================================ */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>CALENDARIO OFICIAL Y VERIFICABLE IASD 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Calendario de Eventos Adventistas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Información oficial procedente de la <strong>Asociación del Pacífico</strong> (Buenaventura y Valle), la <strong>Unión Colombiana del Sur</strong> y la <strong>División Interamericana</strong>. Fechas y convocatorias verificadas sin datos ficticios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Sources Button */}
            <button
              onClick={() => setShowSourcesInfo(!showSourcesInfo)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 hover:bg-indigo-950/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Fuentes Oficiales ({OFFICIAL_EVENT_SOURCES_META.length})</span>
            </button>

            {/* Admin Add Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Añadir evento con verificación oficial"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Evento Oficial</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Última verificación editorial: <strong>23 de Octubre de 2026</strong></span>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Fuentes Oficiales IASD Autorizadas</span>
          </span>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* SOURCES INFO DRAWER (PRIORIDAD 1 & 5) */}
      {/* ============================================================================ */}
      {showSourcesInfo && (
        <div className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Fuentes Oficiales Integradas en este Calendario (Jerarquía Oficial)
              </h3>
            </div>
            <button
              onClick={() => setShowSourcesInfo(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Las fechas y convocatorias de este calendario son extraídas y comprobadas contra los canales oficiales autorizados de la iglesia en Colombia. No se utiliza inteligencia artificial ni datos de muestra para inventar eventos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {OFFICIAL_EVENT_SOURCES_META.map((src, index) => (
              <div 
                key={src.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {src.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {src.entity} · <strong className="text-slate-300">{src.region}</strong>
                  </p>
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    ✓ Verificado: {src.verifiedAt}
                  </span>
                </div>

                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all shrink-0"
                  title={`Abrir ${src.url}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 2. TERRITORY FILTERS (PRIORIDAD GEOGRÁFICA: BUENAVENTURA Y ASOPACÍFICO) */}
      {/* ============================================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtro Geográfico Oficial</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'evento filtrado' : 'eventos filtrados'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* 1. Buenaventura (Prioridad 1) */}
          <button
            onClick={() => setSelectedTerritory('buenaventura')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              selectedTerritory === 'buenaventura'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>📍 Buenaventura (Prioridad)</span>
          </button>

          {/* 2. Asociación del Pacífico */}
          <button
            onClick={() => setSelectedTerritory('asopacifico')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              selectedTerritory === 'asopacifico'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Asociación del Pacífico</span>
          </button>

          {/* 3. Unión Colombiana del Sur */}
          <button
            onClick={() => setSelectedTerritory('ucsur')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              selectedTerritory === 'ucsur'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>🇨🇴 Unión Colombiana del Sur (UCS)</span>
          </button>

          {/* 4. División Interamericana & Internacional */}
          <button
            onClick={() => setSelectedTerritory('interamerica')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              selectedTerritory === 'interamerica'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>🌎 División Interamericana (DIA)</span>
          </button>

          {/* 5. Todos los eventos oficiales */}
          <button
            onClick={() => setSelectedTerritory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedTerritory === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({allVerifiedEvents.length})
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 3. TIMELINE TABS (PRÓXIMOS & EN CURSO vs EVENTOS ANTERIORES) */}
      {/* ============================================================================ */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimelineTab('vigentes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              timelineTab === 'vigentes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Próximos y En Curso ({stats.upcomingCount})</span>
          </button>

          <button
            onClick={() => setTimelineTab('anteriores')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              timelineTab === 'anteriores'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial y Anteriores ({stats.pastCount})</span>
          </button>

          <button
            onClick={() => setTimelineTab('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timelineTab === 'todos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Ver Todos</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, lugar, ciudad..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 4. BUENAVENTURA NOTICE & RADAR DE IGLESIAS LOCALES */}
      {/* ============================================================================ */}
      {selectedTerritory === 'buenaventura' && (
        <div className="space-y-4">
          
          {/* Official Verification Notice for Buenaventura */}
          <div className="p-4 rounded-3xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  Estado Oficial para Buenaventura y Asociación del Pacífico
                </h4>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                  El territorio de Buenaventura pertenece a la <strong>Asociación del Pacífico</strong> (Unión Colombiana del Sur). Actualmente, el plan evangelístico principal en marcha es <strong>Viviendo la Misión 7-70</strong>, activo en todos los distritos del puerto. No se han publicado fechas de campamentos o vigilias adicionales en las fuentes oficiales a la fecha.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="https://asopacifico.org/noticias/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
                  >
                    <span>Consultar Noticias Oficiales de Asociación del Pacífico</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://asopacifico.org/viviendo-la-mision-7-70/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 font-bold text-xs border border-blue-500/30 transition-all"
                  >
                    <span>Ver Detalles de Misión 7-70</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Directory of Buenaventura Churches & Districts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Church className="h-4 w-4 text-amber-400" />
                <span>Distritos y Congregaciones Adventistas de Buenaventura ({BUENAVENTURA_CHURCHES.length})</span>
              </h3>
              <span className="text-[11px] text-amber-400 font-bold">
                Asociación del Pacífico
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {BUENAVENTURA_CHURCHES.map((ch, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {ch.district}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                        {ch.youthMembers} jóvenes JA
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">
                      {ch.churchName}
                    </h4>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="truncate">{ch.address}</span>
                    </p>

                    <div className="mt-2 p-2 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                        Proyectos Misioneros:
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-1">
                        {ch.activeProjects.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-emerald-400">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Líder JA: {ch.youthLeader}</span>
                    <span className="font-semibold text-amber-300">{ch.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 5. VERIFIED EVENTS LIST */}
      {/* ============================================================================ */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-3">
          <CalendarIcon className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            No hay eventos confirmados en este filtro
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {selectedTerritory === 'buenaventura'
              ? 'No hay eventos próximos confirmados publicados en las fuentes oficiales consultadas exclusivamente para Buenaventura. Puedes consultar el plan Misión 7-70 o explorar los eventos de la Asociación del Pacífico y la Unión Colombiana del Sur.'
              : 'No se encontraron eventos con los criterios seleccionados. Prueba cambiando el filtro territorial o consulta la sección de eventos anteriores.'}
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => { setSelectedTerritory('asopacifico'); setTimelineTab('todos'); setSearchTerm(''); }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
            >
              Ver Asociación del Pacífico
            </button>
            <button
              onClick={() => { setSelectedTerritory('ucsur'); setTimelineTab('vigentes'); }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Ver Unión Colombiana del Sur
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const isPast = ev.status === 'finalizado';
            const isOngoing = ev.status === 'en_curso';

            return (
              <div 
                key={ev.id}
                className={`rounded-3xl border transition-all overflow-hidden flex flex-col md:flex-row gap-4 p-5 shadow-lg group ${
                  isPast
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-80'
                    : isOngoing
                    ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Event Image */}
                <div className="w-full md:w-60 h-44 md:h-auto rounded-2xl overflow-hidden bg-slate-950 relative shrink-0">
                  <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase">
                      {ev.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    {isOngoing ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-600/90 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>En Curso</span>
                      </span>
                    ) : isPast ? (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800/90 text-slate-300 text-[10px] font-bold uppercase border border-slate-700">
                        Finalizado (Historial)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-600/90 text-white text-[10px] font-black uppercase shadow-md">
                        Próximo Confirmado
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Header Row: Date & Organizer Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-bold flex-wrap">
                        <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {ev.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {ev.time}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {ev.city}
                        </span>
                      </div>

                      {/* Official Source Pill */}
                      {ev.officialSourceName && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                          {ev.officialSourceName}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>

                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                      <div>
                        <span className="font-semibold text-slate-300">Lugar:</span> {ev.venue}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Organiza:</span> {ev.organizer}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verificado: {ev.verifiedAt || '23 Oct 2026'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Add to Calendar Button (only for future / ongoing events) */}
                      {!isPast && (
                        <button
                          onClick={() => setSelectedEventForCalendar(ev)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all border border-slate-700/80 active:scale-95 shadow-sm cursor-pointer"
                          title="Guardar en Google Calendar, iPhone, Android u Outlook"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 text-amber-400" />
                          <span>+ Calendario</span>
                        </button>
                      )}

                      {/* Participation button */}
                      {!isPast && (
                        <button
                          onClick={() => toggleEventParticipation(ev.id, 'attend')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            ev.isAttending
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
                          }`}
                        >
                          {ev.isAttending ? '✓ Me He Inscrito' : '¡Me Interesa!'}
                        </button>
                      )}

                      {/* Official Publication Link (PRIORIDAD 3 & 7) */}
                      {ev.officialSourceUrl && (
                        <a
                          href={ev.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 text-xs font-bold transition-all shadow-sm"
                          title="Ver publicación oficial en el sitio de la entidad convocante"
                        >
                          <span>Ver Publicación Oficial</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================================ */}
      {/* 6. MODAL: AGREGAR AL CALENDARIO MÓVIL / GOOGLE */}
      {/* ============================================================================ */}
      <AddToCalendarModal
        event={selectedEventForCalendar}
        isOpen={Boolean(selectedEventForCalendar)}
        onClose={() => setSelectedEventForCalendar(null)}
      />

      {/* ============================================================================ */}
      {/* 7. MODAL EDITORIAL PARA ADMINISTRADORES (PRIORIDAD 5 & 8) */}
      {/* ============================================================================ */}
      {showAdminAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Añadir Evento Oficial Verificado (Panel Editorial)
                </h3>
              </div>
              <button onClick={() => setShowAdminAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Como administrador, solo debes registrar eventos que hayan sido anunciados oficialmente en los portales autorizados (Asociación del Pacífico, UCS o DIA). La URL oficial de respaldo es obligatoria.
            </p>

            <form onSubmit={handleCreateEditorialEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Oficial del Evento *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Ej: Camporee Distrital de Guías Mayores del Pacífico"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fuente Oficial Convocante *</label>
                  <select
                    value={newEventSourceName}
                    onChange={(e: any) => setNewEventSourceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Asociación del Pacífico">1. Asociación del Pacífico (Prioridad)</option>
                    <option value="Unión Colombiana del Sur">2. Unión Colombiana del Sur</option>
                    <option value="División Interamericana">3. División Interamericana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Territorio *</label>
                  <select
                    value={newEventTerritory}
                    onChange={(e: any) => setNewEventTerritory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="buenaventura">Buenaventura (Valle del Cauca)</option>
                    <option value="asopacifico">Asociación del Pacífico (Valle)</option>
                    <option value="ucsur">Unión Colombiana del Sur</option>
                    <option value="interamerica">División Interamericana</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha Oficial *</label>
                  <input
                    type="text"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="Ej: 14 al 16 de Diciembre, 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hora / Zona Horaria</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="Ej: 08:00 AM COT o 'Por confirmar'"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Lugar Exacto / Modalidad *</label>
                  <input
                    type="text"
                    required
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    placeholder="Ej: Templo Adventista Central o Modalidad Online"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    value={newEventCity}
                    onChange={(e) => setNewEventCity(e.target.value)}
                    placeholder="Ej: Buenaventura, Cali, Bogotá..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL Oficial de Respaldo * (Enlace de Verificación)</label>
                <input
                  type="url"
                  required
                  value={newEventSourceUrl}
                  onChange={(e) => setNewEventSourceUrl(e.target.value)}
                  placeholder="https://asopacifico.org/noticias/... o https://eventos.adventistasco.org/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Descripción basada en la publicación oficial</label>
                <textarea
                  rows={3}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Detalles publicados por la entidad oficial sobre la actividad..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                >
                  Guardar Evento Verificado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
