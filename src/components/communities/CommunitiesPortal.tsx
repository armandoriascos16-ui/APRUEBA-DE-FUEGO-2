import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Community, CommunityCategory } from '../../types';
import { CommunityDiscussion } from '../../data/communitiesData';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Users, 
  Flame, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Compass, 
  BookOpen, 
  ShieldCheck, 
  Calendar, 
  Heart, 
  Share2, 
  ArrowRight, 
  Filter,
  Search,
  Music,
  GraduationCap,
  Tent,
  Radio,
  Globe,
  X,
  Send,
  Building2
} from 'lucide-react';

const CATEGORY_ICONS: Record<CommunityCategory, React.FC<{ className?: string }>> = {
  jovenes: Flame,
  conquistadores: Tent,
  musica: Music,
  evangelismo: Radio,
  mision: Globe,
  estudiantes_universitarios: GraduationCap,
};

export const CommunitiesPortal: React.FC = () => {
  const { 
    currentUser, 
    communities, 
    discussions, 
    toggleJoinCommunity, 
    createDiscussion, 
    likeDiscussion,
    setActiveTab 
  } = useApp();

  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('com_jovenes');
  const [filterType, setFilterType] = useState<'all' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabSub, setActiveTabSub] = useState<'discusiones' | 'actividades' | 'reglas' | 'liderazgo'>('discusiones');
  
  // Create Discussion Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('ComunidadJA');

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];
  const isJoinedCurrent = selectedCommunity?.memberIds?.includes(currentUser.id) || false;

  // Filtered communities list
  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'joined') {
      return c.memberIds?.includes(currentUser.id);
    }
    return true;
  });

  // Discussions for current community
  const communityDiscussions = discussions.filter(d => d.communityId === selectedCommunity.id);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    createDiscussion({
      communityId: selectedCommunity.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
    });

    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const IconComponent = CATEGORY_ICONS[selectedCommunity.category] || Users;

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-3 space-y-5 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Flame className="h-3.5 w-3.5 fill-amber-500" />
              <span>Ministerios Juveniles Adventistas</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Comunidades de Fe y Acción
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Únete a los espacios temáticos oficiales: Jóvenes, Conquistadores, Música, Evangelismo, Misión y Universitarios. Comparte ideas, dinámicas y proyectos con jóvenes de toda la región.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Crear Tema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Red Eclesial por Iglesias y Distritos Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Comunidades por Iglesia y Distrito</h4>
            <p className="text-[11px] text-slate-300">
              5 Distritos oficiales de Buenaventura: Central, Emanuel, Alfa y Omega, Manantial y Bajo Calima con reuniones y avisos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('comunidad_juvenil')}
          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 transition-all self-start sm:self-auto shrink-0"
        >
          <span>Ir a Red de Distritos</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({communities.length})
            </button>
            <button
              onClick={() => setFilterType('joined')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'joined'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mis Comunidades ({communities.filter(c => c.memberIds?.includes(currentUser.id)).length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar comunidad..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* 6 Official Communities Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {filteredCommunities.map((c) => {
            const isSelected = c.id === selectedCommunity.id;
            const isJoined = c.memberIds?.includes(currentUser.id);
            const CIco = CATEGORY_ICONS[c.category] || Users;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCommunityId(c.id)}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                )}

                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl mb-2 border transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 group-hover:text-amber-400'
                }`}>
                  <CIco className="h-5 w-5" />
                </div>

                <h4 className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                  {c.name.replace('Sociedad de ', '').replace(' & Guías Mayores', '')}
                </h4>

                <span className="text-[10px] text-slate-400 mt-0.5">
                  {c.membersCount.toLocaleString()} miembros
                </span>

                {isJoined && (
                  <span className="mt-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>Unido</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Community Active Space */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-0">
        
        {/* Banner with Cover Image */}
        <div className="relative h-44 sm:h-56 w-full bg-slate-950 overflow-hidden">
          <img
            src={selectedCommunity.bannerUrl}
            alt={selectedCommunity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />
          
          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-slate-950/90 border-2 border-amber-500 p-1 shadow-xl shrink-0 overflow-hidden">
                <img
                  src={selectedCommunity.avatar}
                  alt={selectedCommunity.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-white">
                <h2 className="text-base sm:text-xl font-black drop-shadow-md flex items-center gap-2">
                  <span>{selectedCommunity.name}</span>
                </h2>
                <p className="text-xs text-amber-300/90 font-medium drop-shadow-sm line-clamp-1">
                  {selectedCommunity.tagline}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
                  <span>👥 {selectedCommunity.membersCount.toLocaleString()} miembros</span>
                  <span>·</span>
                  <span>💬 {selectedCommunity.topicsCount} publicaciones</span>
                </div>
              </div>
            </div>

            {/* Join / Leave Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleJoinCommunity(selectedCommunity.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 ${
                  isJoinedCurrent
                    ? 'bg-slate-800 hover:bg-red-500/20 text-emerald-300 hover:text-red-300 border border-emerald-500/40 hover:border-red-500/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {isJoinedCurrent ? '✓ Eres Miembro' : '+ Unirme a Comunidad'}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Scripture Banner */}
        <div className="bg-amber-500/10 border-y border-amber-500/20 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-300">
          <BookOpen className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="italic line-clamp-2">{selectedCommunity.featuredVerse}</span>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'discusiones', label: 'Muro & Temas', count: communityDiscussions.length },
            { id: 'actividades', label: 'Actividades', count: selectedCommunity.activities.length },
            { id: 'reglas', label: 'Reglas y Principios', count: selectedCommunity.rules.length },
            { id: 'liderazgo', label: 'Moderadores', count: selectedCommunity.moderators.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabSub(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTabSub === tab.id
                  ? 'border-amber-500 text-amber-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTabSub === tab.id ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Discusiones & Muro */}
        {activeTabSub === 'discusiones' && (
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Quick Post Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  avatar={currentUser.avatar}
                  name={currentUser.name}
                  size="xs"
                  showBadge={false}
                />
                <span className="text-xs text-slate-400">
                  ¿Qué tienes para compartir con {selectedCommunity.name}?
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
              >
                + Publicar Tema
              </button>
            </div>

            {communityDiscussions.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-950/40 border border-slate-850 p-6 space-y-2">
                <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Aún no hay discusiones en esta comunidad</h4>
                <p className="text-xs text-slate-400">Sé el primero en iniciar un tema de edificación para la juventud.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Iniciar primer tema
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {communityDiscussions.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-750 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          avatar={d.authorAvatar}
                          name={d.authorName}
                          size="xs"
                          showBadge={false}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{d.authorName}</span>
                            {d.isPinned && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                Fijado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {d.authorChurch} · {d.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{d.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {d.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {d.tags && d.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {d.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-amber-300 font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => likeDiscussion(d.id)}
                          className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          <Flame className="h-4 w-4 text-orange-400" />
                          <span>{d.likesCount} inspirados</span>
                        </button>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{d.commentsCount} respuestas</span>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText?.(`${d.title} - Comunidad JA`);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Compartir"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Actividades */}
        {activeTabSub === 'actividades' && (
          <div className="p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Actividades y Proyectos del Ministerio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedCommunity.activities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{act}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coordinado en iglesias y distritos de la región
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('eventos')}
                className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
              >
                <span>Ver todos los eventos oficiales en el Radar JA</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Reglas */}
        {activeTabSub === 'reglas' && (
          <div className="p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reglas y Principios Cristianos de la Comunidad
            </h4>
            <div className="space-y-2">
              {selectedCommunity.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-start gap-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-amber-400 text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Liderazgo */}
        {activeTabSub === 'liderazgo' && (
          <div className="p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Líderes y Moderadores Oficiales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCommunity.moderators.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3"
                >
                  <UserAvatar
                    avatar={m.avatar}
                    name={m.name}
                    size="md"
                    showBadge={false}
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    </h5>
                    <p className="text-[10px] text-slate-400">Moderador Oficial de Comunidad</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal para Crear Nuevo Tema / Discusión */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Nuevo Tema de Edificación</h3>
                  <p className="text-[11px] text-slate-400">Publicando en: {selectedCommunity.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Título del tema:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Ideas para dinámicas de Escuela Sabática o Culto Joven"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Contenido / Reflexión / Pregunta:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escribe tu reflexión, propuesta o pregunta para la comunidad..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Etiquetas (separadas por coma):
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Juventud, Alabanza, Campamento"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publicar en Comunidad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
