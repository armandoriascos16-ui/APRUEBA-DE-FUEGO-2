import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search, 
  X, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  ChevronRight,
  Flame,
  UserMinus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { MinistryGroup, YouthMinistryCategory } from './types';

const MINISTRY_CATEGORIES: { id: YouthMinistryCategory; label: string; icon: string; gradient: string }[] = [
  { id: 'musica_coros', label: 'Música y coros', icon: '🎵', gradient: 'from-amber-500 to-orange-600' },
  { id: 'alabanza_adoracion', label: 'Alabanza y adoración', icon: '🎸', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'jovenes_misioneros', label: 'Jóvenes misioneros', icon: '🔥', gradient: 'from-rose-600 to-red-700' },
  { id: 'estudio_biblico', label: 'Estudio bíblico', icon: '📖', gradient: 'from-emerald-600 to-teal-700' },
  { id: 'oracion', label: 'Oración', icon: '🙏', gradient: 'from-purple-600 to-pink-600' },
  { id: 'evangelismo', label: 'Evangelismo', icon: '📢', gradient: 'from-blue-600 to-indigo-700' },
  { id: 'servicio_comunitario', label: 'Servicio comunitario', icon: '🤝', gradient: 'from-teal-600 to-cyan-700' },
  { id: 'medios_tecnologia', label: 'Medios y tecnología', icon: '📹', gradient: 'from-cyan-600 to-blue-700' },
  { id: 'arte_creatividad', label: 'Arte y creatividad', icon: '🎨', gradient: 'from-pink-600 to-rose-700' },
  { id: 'liderazgo_juvenil', label: 'Liderazgo juvenil', icon: '👑', gradient: 'from-amber-600 to-yellow-700' },
  { id: 'talentos', label: 'Desarrollo de talentos', icon: '⭐', gradient: 'from-orange-500 to-red-600' },
  { id: 'actividades_iglesia', label: 'Actividades de iglesia', icon: '⛪', gradient: 'from-indigo-600 to-purple-700' },
];

export const GruposMinisteriosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [groups, setGroups] = useState<MinistryGroup[]>(comunidadStorage.getMinistryGroups());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedGroup, setSelectedGroup] = useState<MinistryGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<YouthMinistryCategory>('musica_coros');
  const [formDesc, setFormDesc] = useState('');
  const [formSchedule, setFormSchedule] = useState('Sábados 5:00 PM');
  const [formVerse, setFormVerse] = useState('');
  const [formRules, setFormRules] = useState('1. Puntualidad en reuniones.\n2. Reverencia y espíritu de servicio.');

  // Activity modal inside group detail
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDate, setNewActivityDate] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setGroups(comunidadStorage.getMinistryGroups());
      if (selectedGroup) {
        const refreshed = comunidadStorage.getMinistryGroups().find(g => g.id === selectedGroup.id);
        if (refreshed) setSelectedGroup(refreshed);
      }
    });
    return unsub;
  }, [selectedGroup]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const catObj = MINISTRY_CATEGORIES.find(c => c.id === formCategory) || MINISTRY_CATEGORIES[0];
    const rulesArr = formRules.split('\n').filter(r => r.trim().length > 0);

    const created = comunidadStorage.createMinistryGroup({
      name: formName.trim(),
      category: formCategory,
      categoryLabel: catObj.label,
      description: formDesc.trim(),
      leaderName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      meetingSchedule: formSchedule.trim(),
      rules: rulesArr,
      verseAnchor: formVerse.trim() || 'Colosenses 3:23 — Y todo lo que hagáis, hacedlo de corazón, como para el Señor.',
      icon: catObj.icon,
      gradient: catObj.gradient,
      isPrivate: false
    }, currentUser.id);

    setShowCreateModal(false);
    setSelectedGroup(created);
    setFormName('');
    setFormDesc('');
  };

  const handleToggleJoin = (groupId: string) => {
    comunidadStorage.toggleJoinGroup(groupId, currentUser.id);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newActivityTitle.trim()) return;

    const all = comunidadStorage.getMinistryGroups();
    const grp = all.find(g => g.id === selectedGroup.id);
    if (!grp) return;

    grp.activities.push({
      id: `act_${Date.now()}`,
      title: newActivityTitle.trim(),
      date: newActivityDate.trim() || 'Próximo sábado',
      description: newActivityDesc.trim()
    });

    localStorage.setItem('cjc_groups', JSON.stringify(all));
    setNewActivityTitle('');
    setNewActivityDate('');
    setNewActivityDesc('');
    setSelectedGroup({ ...grp });
  };

  const filteredGroups = groups.filter(g => {
    const term = searchTerm.toLowerCase();
    const matchSearch = g.name.toLowerCase().includes(term) ||
                        g.description.toLowerCase().includes(term) ||
                        g.categoryLabel.toLowerCase().includes(term);
    if (!matchSearch) return false;

    if (selectedCategory !== 'todos') {
      return g.category === selectedCategory;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>FUNCIÓN REAL B · GRUPOS POR INTERESES Y MINISTERIOS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            12 Ministerios & Grupos Vocacionales JA
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Descubre y crea grupos con reglas, actividades programadas y miembros reales 
            en música, evangelismo, medios, servicio solidario y liderazgo.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 self-start sm:self-auto transition-transform active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Crear Grupo Ministerial</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros de las 12 Categorías */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar grupo por nombre, ministerio o tema..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'todos'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({groups.length})
          </button>
          {MINISTRY_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Grupos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map(grp => {
          const isMember = grp.members.includes(currentUser.id);
          const isLeader = grp.creatorId === currentUser.id;

          return (
            <div
              key={grp.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all shadow-md p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${grp.gradient} flex items-center justify-center text-xl shadow-md shrink-0`}>
                      {grp.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 leading-tight">
                        {grp.name}
                      </h3>
                      <span className="text-[11px] text-purple-400 font-semibold block mt-0.5">
                        {grp.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold shrink-0">
                    {grp.members.length} {grp.members.length === 1 ? 'miembro' : 'miembros'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-2.5">
                  {grp.description}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span>Horario:</span>
                    </span>
                    <span className="text-white font-medium">{grp.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-400" />
                      <span>Coordinación:</span>
                    </span>
                    <span className="text-slate-200">{grp.leaderName}</span>
                  </div>
                </div>

                {grp.activities.length > 0 && (
                  <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{grp.activities.length} actividad(es) programada(s)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setSelectedGroup(grp)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ver Actividades</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleToggleJoin(grp.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isMember
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  }`}
                >
                  {isMember ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Unido</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Unirme</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detalle de Grupo: Reglas, Actividades y Miembros */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${selectedGroup.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                  {selectedGroup.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{selectedGroup.name}</h3>
                  <span className="text-xs text-purple-400 font-medium">{selectedGroup.categoryLabel} · Coordinador: {selectedGroup.leaderName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedGroup.description}
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-amber-400/90 italic font-serif">
              {selectedGroup.verseAnchor}
            </div>

            {/* Reglas del Grupo */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] block">
                Reglas y Compromisos del Ministerio:
              </span>
              <ul className="space-y-1">
                {selectedGroup.rules.map((r, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actividades Programadas */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Actividades Programadas ({selectedGroup.activities.length}):
                </span>
              </div>

              {selectedGroup.activities.length > 0 ? (
                <div className="space-y-2">
                  {selectedGroup.activities.map(act => (
                    <div key={act.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{act.title}</span>
                        <span className="text-[10px] text-amber-400 font-bold">{act.date}</span>
                      </div>
                      <p className="text-slate-300">{act.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No hay actividades registradas aún.</p>
              )}

              {/* Formulario para agregar actividad si es miembro/creador */}
              {selectedGroup.members.includes(currentUser.id) && (
                <form onSubmit={handleAddActivity} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs mt-3">
                  <span className="font-bold text-slate-300 block text-[11px]">Publicar nueva actividad para el grupo:</span>
                  <input
                    type="text"
                    required
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    placeholder="Título de la actividad (ej: Ensayo especial de vigilia)..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newActivityDate}
                      onChange={(e) => setNewActivityDate(e.target.value)}
                      placeholder="Fecha y hora (ej: Sábado 4:00 PM)..."
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={newActivityDesc}
                      onChange={(e) => setNewActivityDesc(e.target.value)}
                      placeholder="Lugar o descripción corta..."
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newActivityTitle.trim()}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                  >
                    + Registrar Actividad
                  </button>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedGroup.members.length} jóvenes miembros registrados
              </span>
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Grupo Ministerial */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Crear Grupo Ministerial</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nombre del Grupo: *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Coro Juvenil Bahía de la Cruz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Categoría del Ministerio (12 opciones oficiales):</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as YouthMinistryCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                >
                  {MINISTRY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descripción del Grupo y Objetivo:</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe qué hace este grupo y cómo sirve a Dios..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Horario y Días de Reunión:</label>
                  <input
                    type="text"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    placeholder="Ej: Sábados 5:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Versículo Ancla:</label>
                  <input
                    type="text"
                    value={formVerse}
                    onChange={(e) => setFormVerse(e.target.value)}
                    placeholder="Ej: 1 Timoteo 4:12"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reglas del Grupo (una por línea):</label>
                <textarea
                  value={formRules}
                  onChange={(e) => setFormRules(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                >
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
