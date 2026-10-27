import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Plus, 
  Lock, 
  Globe, 
  X, 
  AlertCircle, 
  ChevronRight,
  UserCheck,
  UserMinus,
  Sparkles,
  Calendar,
  Clock,
  Video,
  ArrowLeft,
  Settings,
  Edit3,
  BookOpen,
  Megaphone,
  Check,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { 
  ChurchCommunity, 
  CommunityMember, 
  CommunityRole,
  CommunityMeeting,
  AttendanceResponse,
  CommunityAnnouncement
} from './types';
import { CreateOrEditCommunityModal } from './CreateOrEditCommunityModal';
import { CommunityAdminPanel } from './CommunityAdminPanel';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { UserProfileDetailModal } from './UserProfileDetailModal';
import { UserAvatar } from '../common/UserAvatar';

export const ComunidadesDistritosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [communities, setCommunities] = useState<ChurchCommunity[]>(comunidadStorage.getCommunities());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>('todos');
  const [activePrivacyFilter, setActivePrivacyFilter] = useState<'todas' | 'mis_comunidades' | 'publicas' | 'privadas'>('todas');
  
  // Selected community view
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [communityTab, setCommunityTab] = useState<'inicio' | 'reuniones' | 'avisos' | 'miembros'>('inicio');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityToEdit, setCommunityToEdit] = useState<ChurchCommunity | null>(null);
  const [adminPanelCommunity, setAdminPanelCommunity] = useState<ChurchCommunity | null>(null);
  const [scheduleMeetingCommunity, setScheduleMeetingCommunity] = useState<ChurchCommunity | null>(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  
  // Join Request with personal presentation message modal
  const [joinModalCommunity, setJoinModalCommunity] = useState<ChurchCommunity | null>(null);
  const [joinPresentationMsg, setJoinPresentationMsg] = useState('');

  // Leave Confirmation
  const [communityToLeave, setCommunityToLeave] = useState<ChurchCommunity | null>(null);

  // Sync state with storage
  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setCommunities(comunidadStorage.getCommunities());
    });
    return unsub;
  }, []);

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId) || null;

  const currentMemberObj: CommunityMember = {
    userId: currentUser.id,
    name: `${currentUser.name} ${currentUser.lastName || ''}`.trim() || currentUser.username,
    avatar: currentUser.avatar,
    role: 'miembro',
    joinedAt: 'Hoy',
    district: currentUser.district,
    church: currentUser.church
  };

  const handleDirectJoin = (comm: ChurchCommunity) => {
    if (comm.isPrivate) {
      setJoinModalCommunity(comm);
      setJoinPresentationMsg('');
    } else {
      comunidadStorage.joinCommunity(comm.id, currentMemberObj);
    }
  };

  const submitJoinRequest = () => {
    if (!joinModalCommunity) return;
    comunidadStorage.joinCommunity(joinModalCommunity.id, currentMemberObj, joinPresentationMsg.trim());
    setJoinModalCommunity(null);
    setJoinPresentationMsg('');
  };

  const handleLeaveConfirm = () => {
    if (!communityToLeave) return;
    comunidadStorage.leaveCommunity(communityToLeave.id, currentUser.id);
    if (selectedCommunityId === communityToLeave.id) {
      // keep current community view or close it
    }
    setCommunityToLeave(null);
  };

  const handleAttendance = (meetingId: string, response: AttendanceResponse) => {
    comunidadStorage.setAttendance(
      meetingId,
      currentUser.id,
      response,
      `${currentUser.name} ${currentUser.lastName || ''}`.trim() || currentUser.username,
      currentUser.avatar,
      currentUser.district,
      currentUser.church
    );
  };

  // Filter and search
  const filteredCommunities = communities.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      c.name.toLowerCase().includes(term) ||
      c.church.toLowerCase().includes(term) ||
      c.district.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.theme.toLowerCase().includes(term);

    if (!matchSearch) return false;

    if (activeDistrictFilter !== 'todos' && c.district !== activeDistrictFilter) {
      return false;
    }

    if (activePrivacyFilter === 'mis_comunidades') {
      return c.members.some(m => m.userId === currentUser.id);
    }
    if (activePrivacyFilter === 'publicas') {
      return !c.isPrivate;
    }
    if (activePrivacyFilter === 'privadas') {
      return c.isPrivate;
    }
    return true;
  });

  const districtsList = [
    'Distrito Central',
    'Distrito Emanuel',
    'Distrito Alfa y Omega',
    'Distrito Manantial',
    'Distrito Bajo Calima'
  ];

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* CASE A: FULL COMMUNITY DETAIL VIEW */}
      {/* ------------------------------------------------------------- */}
      {selectedCommunity ? (
        (() => {
          const isMember = selectedCommunity.members.some(m => m.userId === currentUser.id);
          const memberRole = selectedCommunity.members.find(m => m.userId === currentUser.id)?.role;
          const isCreator = selectedCommunity.creatorId === currentUser.id || memberRole === 'creador';
          const isAdmin = isCreator || memberRole === 'administrador';
          const isPending = selectedCommunity.pendingRequests.some(r => r.userId === currentUser.id);

          const meetings = comunidadStorage.getMeetings(selectedCommunity.id);
          const upcomingMeetings = meetings.filter(m => m.status === 'programada');
          const pastMeetings = meetings.filter(m => m.status === 'finalizada' || m.status === 'cancelada');
          const nextMeeting = upcomingMeetings[0] || null;

          const announcements = comunidadStorage.getAnnouncements(selectedCommunity.id);
          const pinnedAnnouncement = announcements.find(a => a.pinned) || announcements[0];

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Top Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedCommunityId(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a Comunidades</span>
                </button>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setCommunityToEdit(selectedCommunity)}
                        className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Editar datos de la comunidad"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => setAdminPanelCommunity(selectedCommunity)}
                        className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>Panel de Administración</span>
                        {selectedCommunity.pendingRequests.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                            {selectedCommunity.pendingRequests.length}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  {isMember && !isCreator && (
                    <button
                      onClick={() => setCommunityToLeave(selectedCommunity)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/40 text-xs font-bold transition-colors"
                    >
                      Salir
                    </button>
                  )}
                </div>
              </div>

              {/* Cover Card */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
                <div className="h-48 sm:h-64 w-full relative">
                  <img 
                    src={selectedCommunity.imageUrl} 
                    alt={selectedCommunity.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  
                  {/* Badges on cover */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                      selectedCommunity.isPrivate 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {selectedCommunity.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {selectedCommunity.isPrivate ? 'Comunidad Privada' : 'Comunidad Abierta'}
                    </span>

                    {selectedCommunity.themeCategory && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                        {selectedCommunity.themeCategory === 'otra' && selectedCommunity.customThemeCategory
                          ? selectedCommunity.customThemeCategory.toUpperCase()
                          : selectedCommunity.themeCategory.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-1">
                      <h1 className="text-xl sm:text-2xl font-black text-white font-heading leading-tight drop-shadow-md">
                        {selectedCommunity.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1 text-blue-300 font-semibold">
                          <Building2 className="h-3.5 w-3.5" />
                          {selectedCommunity.church}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedCommunity.district} · {selectedCommunity.city}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isMember ? (
                        <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Miembro ({memberRole?.toUpperCase()})</span>
                        </div>
                      ) : isPending ? (
                        <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span>Solicitud Pendiente</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDirectJoin(selectedCommunity)}
                          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex items-center gap-1.5"
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                          <span>{selectedCommunity.isPrivate ? 'Solicitar Ingreso' : 'Unirme Ahora'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Community Shield for Non-Members */}
              {selectedCommunity.isPrivate && !isMember && (
                <div className="rounded-3xl bg-amber-950/30 border border-amber-500/30 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-300">Contenido Reservado para Miembros</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Esta comunidad adventista es privada. Las reuniones programadas, enlaces de conexión, avisos 
                        y la lista de miembros se reservan a miembros aceptados por el liderazgo.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Información General</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedCommunity.description}</p>
                    
                    {selectedCommunity.rules && selectedCommunity.rules.length > 0 && (
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block">Pautas de Convivencia Cristiana:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                          {selectedCommunity.rules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {!isPending && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDirectJoin(selectedCommunity)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Presentar Solicitud de Ingreso</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tabs for Members or Public Communities */}
              {(!selectedCommunity.isPrivate || isMember) && (
                <div className="space-y-5">
                  <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                    <button
                      onClick={() => setCommunityTab('inicio')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        communityTab === 'inicio'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Inicio & Visión</span>
                    </button>

                    <button
                      onClick={() => setCommunityTab('reuniones')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        communityTab === 'reuniones'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Reuniones & Asistencia</span>
                      {upcomingMeetings.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-200 text-[10px]">
                          {upcomingMeetings.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setCommunityTab('avisos')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        communityTab === 'avisos'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      <span>Avisos</span>
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-200 text-[10px]">
                          {announcements.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setCommunityTab('miembros')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        communityTab === 'miembros'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Miembros ({selectedCommunity.members.length})</span>
                    </button>
                  </div>

                  {/* TAB 1: INICIO & VISIÓN */}
                  {communityTab === 'inicio' && (
                    <div className="space-y-4">
                      {/* Highlight Next Meeting Quick Card */}
                      {nextMeeting && (
                        <div className="rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-5 shadow-lg space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Próxima Reunión
                              </span>
                              <span className="text-xs text-slate-400 font-semibold">
                                {nextMeeting.date} · {nextMeeting.startTime}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-amber-400 uppercase">
                              {nextMeeting.modality}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-white">{nextMeeting.title}</h3>
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {nextMeeting.description}
                            </p>
                          </div>

                          {/* Quick RSVP buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">
                                ✓ {(nextMeeting.attendees || []).filter(a => a.response === 'asistire').length} confirmados
                              </span>
                              <span>•</span>
                              <span className="text-slate-400">
                                {(nextMeeting.attendees || []).length} respuestas
                              </span>
                            </div>

                            {isMember && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleAttendance(nextMeeting.id, 'asistire')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                    (nextMeeting.attendees || []).find(a => a.userId === currentUser.id)?.response === 'asistire'
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Voy a asistir</span>
                                </button>

                                <button
                                  onClick={() => handleAttendance(nextMeeting.id, 'no_asistire')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    (nextMeeting.attendees || []).find(a => a.userId === currentUser.id)?.response === 'no_asistire'
                                      ? 'bg-rose-900 text-rose-200'
                                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                  }`}
                                >
                                  No asistiré
                                </button>

                                <button
                                  onClick={() => handleAttendance(nextMeeting.id, 'quizas')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    (nextMeeting.attendees || []).find(a => a.userId === currentUser.id)?.response === 'quizas'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                  }`}
                                >
                                  Duda
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pinned Announcement */}
                      {pinnedAnnouncement && (
                        <div className="rounded-3xl bg-slate-900/90 border border-amber-500/30 p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Megaphone className="h-3 w-3" />
                              Comunicado Destacado
                            </span>
                            <span className="text-[10px] text-slate-400">{pinnedAnnouncement.date || pinnedAnnouncement.createdAt}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{pinnedAnnouncement.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{pinnedAnnouncement.content}</p>
                        </div>
                      )}

                      {/* General Information Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span>Propósito y Misión</span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedCommunity.description}
                          </p>
                          {selectedCommunity.purpose && (
                            <p className="text-xs text-blue-300/90 italic border-l-2 border-blue-500 pl-3 py-1">
                              "{selectedCommunity.purpose}"
                            </p>
                          )}
                          {selectedCommunity.verse && (
                            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Versículo Lema:</span>
                              <span className="text-slate-200 italic mt-0.5 block">{selectedCommunity.verse}</span>
                            </div>
                          )}
                        </div>

                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span>Horario y Convivencia</span>
                          </h4>

                          {(selectedCommunity.meetingDays || selectedCommunity.meetingTime) && (
                            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 space-y-1">
                              <span className="font-bold text-blue-400 text-[11px] block">Reunión Habitual:</span>
                              <p className="font-medium text-white">
                                {selectedCommunity.meetingDays || 'Día por coordinar'} a las {selectedCommunity.meetingTime || 'Horario por coordinar'}
                              </p>
                            </div>
                          )}

                          {selectedCommunity.requiredMaterials && selectedCommunity.requiredMaterials.length > 0 && (
                            <div className="text-xs text-slate-400">
                              <span className="font-bold text-slate-300 block mb-0.5">Qué traer:</span>
                              <p className="text-slate-300">{selectedCommunity.requiredMaterials.join(', ')}</p>
                            </div>
                          )}

                          {selectedCommunity.rules && selectedCommunity.rules.length > 0 && (
                            <div className="space-y-1.5 text-xs">
                              <span className="font-bold text-slate-400 block">Pautas Cristianas:</span>
                              <ul className="space-y-1 text-slate-300 text-[11px]">
                                {selectedCommunity.rules.map((r, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: REUNIONES & ASISTENCIA */}
                  {communityTab === 'reuniones' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">Reuniones Programadas</h3>
                          <p className="text-xs text-slate-400">
                            Confirma tu asistencia anticipada para organizar materiales y refrigerios.
                          </p>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => setScheduleMeetingCommunity(selectedCommunity)}
                            className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-transform active:scale-95 self-start sm:self-auto"
                          >
                            <Plus className="h-4 w-4 stroke-[3]" />
                            <span>Programar Nueva Reunión</span>
                          </button>
                        )}
                      </div>

                      {/* Upcoming Meetings List */}
                      {upcomingMeetings.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingMeetings.map(meeting => {
                            const attendees = meeting.attendees || [];
                            const userAttendance = attendees.find(a => a.userId === currentUser.id);
                            const attendingCount = attendees.filter(a => a.response === 'asistire').length;
                            const declinedCount = attendees.filter(a => a.response === 'no_asistire').length;
                            const unsureCount = attendees.filter(a => a.response === 'quizas' || a.response === 'tal_vez').length;
                            const confirmedAttendees = attendees.filter(a => a.response === 'asistire');

                            return (
                              <div 
                                key={meeting.id}
                                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                        {meeting.modality.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                                        {meeting.date}
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                                        {meeting.startTime} {meeting.endTime ? `- ${meeting.endTime}` : ''}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-white">{meeting.title}</h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{meeting.description}</p>
                                  </div>

                                  <div className="flex items-center gap-2 self-start">
                                    <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                      <Users className="h-3.5 w-3.5" />
                                      <span>{attendingCount} confirmados</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Meeting Details Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  {meeting.location && (
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lugar Presencial:</span>
                                        <span className="text-slate-200">{meeting.location}</span>
                                      </div>
                                    </div>
                                  )}

                                  {meeting.virtualMeetingUrl && (
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 flex items-start gap-2">
                                      <Video className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                      <div className="overflow-hidden">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enlace Virtual:</span>
                                        <a 
                                          href={meeting.virtualMeetingUrl} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="text-blue-400 hover:text-blue-300 underline truncate block"
                                        >
                                          {meeting.virtualMeetingUrl}
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {meeting.bibleVerse && (
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 sm:col-span-2">
                                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Lectura Bíblica:</span>
                                      <span className="text-slate-300 italic">{meeting.bibleVerse}</span>
                                    </div>
                                  )}

                                  {meeting.materialsNeeded && meeting.materialsNeeded.length > 0 && (
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 sm:col-span-2 text-slate-300">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materiales / Qué llevar:</span>
                                      <span>{meeting.materialsNeeded.join(', ')}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Confirmed attendees list */}
                                {confirmedAttendees.length > 0 && (
                                  <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Jóvenes que confirmaron asistencia ({confirmedAttendees.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {confirmedAttendees.map(att => (
                                        <button
                                          key={att.userId}
                                          onClick={() => setSelectedProfileUserId(att.userId)}
                                          className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors text-left"
                                          title="Ver perfil real"
                                        >
                                          <img 
                                            src={att.userAvatar} 
                                            alt={att.userName} 
                                            className="h-5 w-5 rounded-lg object-cover ring-1 ring-slate-700"
                                          />
                                          <span className="text-xs font-semibold text-white">{att.userName}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Interactive RSVP Action */}
                                {isMember && (
                                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 -mx-5 -mb-5 p-4 rounded-b-3xl">
                                    <div className="text-xs">
                                      <span className="text-slate-400 block font-semibold">¿Asistirás a esta reunión?</span>
                                      <span className="text-[11px] text-slate-500">
                                        {attendingCount} sí · {declinedCount} no · {unsureCount} indecisos
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleAttendance(meeting.id, 'asistire')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                          userAttendance?.response === 'asistire'
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400'
                                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                        }`}
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Voy a asistir</span>
                                      </button>

                                      <button
                                        onClick={() => handleAttendance(meeting.id, 'no_asistire')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                          userAttendance?.response === 'no_asistire'
                                            ? 'bg-rose-900 text-rose-200 ring-2 ring-rose-500'
                                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                        }`}
                                      >
                                        No podré asistir
                                      </button>

                                      <button
                                        onClick={() => handleAttendance(meeting.id, 'quizas')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                          userAttendance?.response === 'quizas' || userAttendance?.response === 'tal_vez'
                                            ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                        }`}
                                      >
                                        <HelpCircle className="h-3.5 w-3.5" />
                                        <span>Duda</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                          <Calendar className="h-10 w-10 text-slate-600 mx-auto" />
                          <p className="text-sm font-bold text-slate-300">No hay reuniones futuras programadas</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Los administradores anunciarán aquí la próxima fecha, lugar y agenda de actividades.
                          </p>
                        </div>
                      )}

                      {/* Past Meetings */}
                      {pastMeetings.length > 0 && (
                        <div className="pt-4 border-t border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Historial de Reuniones Pasadas ({pastMeetings.length})
                          </h4>
                          <div className="space-y-2">
                            {pastMeetings.map(m => (
                              <div key={m.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-between text-xs text-slate-400">
                                <div>
                                  <span className="font-bold text-slate-300 block">{m.title}</span>
                                  <span className="text-[11px] text-slate-500">{m.date} · {(m.attendees || []).filter(a => a.response === 'asistire').length} asistentes</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-400">
                                  {m.status.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 3: AVISOS OFICIALES */}
                  {communityTab === 'avisos' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">Tablero de Avisos</h3>
                          <p className="text-xs text-slate-400">Comunicados oficiales y avisos del liderazgo juvenil.</p>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => setAdminPanelCommunity(selectedCommunity)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Gestionar Avisos en Panel</span>
                          </button>
                        )}
                      </div>

                      {announcements.length > 0 ? (
                        <div className="space-y-3">
                          {announcements.map(notice => (
                            <div 
                              key={notice.id}
                              className={`rounded-3xl p-5 border shadow-md space-y-2 ${
                                notice.type === 'urgente' 
                                  ? 'bg-rose-950/20 border-rose-500/30' 
                                  : notice.type === 'espiritual'
                                  ? 'bg-amber-950/20 border-amber-500/30'
                                  : 'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  notice.type === 'urgente' ? 'bg-rose-500 text-white' :
                                  notice.type === 'espiritual' ? 'bg-amber-500 text-slate-950' :
                                  'bg-blue-600/30 text-blue-300'
                                }`}>
                                  {notice.type}
                                </span>
                                <span className="text-[11px] text-slate-400">{notice.date || notice.createdAt}</span>
                              </div>

                              <h4 className="text-sm font-bold text-white">{notice.title}</h4>
                              <p className="text-xs text-slate-300 leading-relaxed">{notice.content}</p>
                              
                              <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1">
                                <span>Publicado por:</span>
                                <span className="text-slate-300 font-semibold">{notice.authorName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                          <Megaphone className="h-10 w-10 text-slate-600 mx-auto" />
                          <p className="text-sm font-bold text-slate-300">No hay avisos publicados</p>
                          <p className="text-xs text-slate-500">Los administradores compartirán novedades y recordatorios aquí.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: MIEMBROS REALES */}
                  {communityTab === 'miembros' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">Miembros de la Comunidad</h3>
                          <p className="text-xs text-slate-400">
                            {selectedCommunity.members.length} jóvenes adventistas vinculados. Haz clic en un perfil para conocer sus datos.
                          </p>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => setAdminPanelCommunity(selectedCommunity)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                          >
                            <Settings className="h-3.5 w-3.5 text-blue-400" />
                            <span>Gestionar Roles en Panel</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCommunity.members.map(member => (
                          <div 
                            key={member.userId}
                            onClick={() => setSelectedProfileUserId(member.userId)}
                            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                avatar={member.avatar}
                                name={member.name}
                                size="sm"
                                showBadge={false}
                              />
                              <div>
                                <span className="text-xs font-bold text-white block hover:text-blue-400 transition-colors">
                                  {member.name}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  {member.church || selectedCommunity.church}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Unido: {member.joinedAt}
                                </span>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${
                              member.role === 'creador' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              member.role === 'administrador' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                              member.role === 'moderador' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {member.role.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })()
      ) : (
        /* ------------------------------------------------------------- */
        /* CASE B: MAIN COMMUNITIES LIST VIEW */
        /* ------------------------------------------------------------- */
        <>
          {/* Intro Header */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-950 border border-blue-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="h-4 w-4" />
                <span>RED ECLESIAL · ZONA BUENAVENTURA</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                Comunidades de Fe, Iglesias y Distritos
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Organiza tu comunidad eclesiástica, programa reuniones con asistencia confirmada, 
                publica comunicados y administra miembros con inspección de perfil real.
              </p>
            </div>

            <button
              onClick={() => {
                setCommunityToEdit(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 self-start sm:self-auto transition-transform active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Crear Comunidad</span>
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, iglesia, distrito, lema o temática..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtros por Distrito Oficial */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Filtrar por Distrito de la Asociación del Pacífico:
            </span>
            <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveDistrictFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeDistrictFilter === 'todos'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos los Distritos
              </button>
              {districtsList.map(dist => (
                <button
                  key={dist}
                  onClick={() => setActiveDistrictFilter(dist)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeDistrictFilter === dist
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Tipo / Pertenencia */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
            <button
              onClick={() => setActivePrivacyFilter('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePrivacyFilter === 'todas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({communities.length})
            </button>
            <button
              onClick={() => setActivePrivacyFilter('mis_comunidades')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePrivacyFilter === 'mis_comunidades'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mis Comunidades
            </button>
            <button
              onClick={() => setActivePrivacyFilter('publicas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePrivacyFilter === 'publicas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Abiertas
            </button>
            <button
              onClick={() => setActivePrivacyFilter('privadas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePrivacyFilter === 'privadas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Privadas
            </button>
          </div>

          {/* Grid de Comunidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map(comm => {
              const isMember = comm.members.some(m => m.userId === currentUser.id);
              const userRole = comm.members.find(m => m.userId === currentUser.id)?.role;
              const isPending = comm.pendingRequests.some(r => r.userId === currentUser.id);
              const isLeader = userRole === 'creador' || userRole === 'administrador';

              return (
                <div
                  key={comm.id}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all shadow-md overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-950">
                      <img
                        src={comm.imageUrl}
                        alt={comm.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {comm.isPrivate ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm">
                            <Lock className="h-3 w-3" />
                            Privada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Globe className="h-3 w-3" />
                            Abierta
                          </span>
                        )}

                        {isMember && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                            ✓ {userRole?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1">
                        <Users className="h-3 w-3 text-amber-400" />
                        <span>{comm.members.length} miembros reales</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          {comm.themeCategory === 'otra' && comm.customThemeCategory
                            ? comm.customThemeCategory
                            : comm.themeCategory?.replace(/_/g, ' ') || 'MINISTERIO JUVENIL'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                        {comm.name}
                      </h3>

                      <div className="space-y-0.5 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5 truncate">
                          <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span>{comm.church}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{comm.district} · {comm.city}</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                        {comm.description}
                      </p>

                      {(comm.meetingDays || comm.meetingTime) && (
                        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-blue-400 shrink-0" />
                          <span>{comm.meetingDays || 'Reunión'} {comm.meetingTime ? `(${comm.meetingTime})` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCommunityId(comm.id);
                          setCommunityTab('inicio');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-blue-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Ver Comunidad</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      {isMember ? (
                        <button
                          onClick={() => setCommunityToLeave(comm)}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/40 transition-colors"
                          title="Abandonar comunidad"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      ) : isPending ? (
                        <span className="py-2 px-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold text-center">
                          Pendiente
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDirectJoin(comm)}
                          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{comm.isPrivate ? 'Solicitar' : 'Unirme'}</span>
                        </button>
                      )}
                    </div>

                    {isLeader && comm.pendingRequests.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between font-bold">
                        <span>{comm.pendingRequests.length} solicitud(es)</span>
                        <button
                          onClick={() => setAdminPanelCommunity(comm)}
                          className="underline text-amber-400 hover:text-white"
                        >
                          Revisar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SHARED MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Modal: Presentar Solicitud de Ingreso (Comunidad Privada) */}
      {joinModalCommunity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Solicitar Ingreso</h3>
              </div>
              <button
                onClick={() => setJoinModalCommunity(null)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Estás solicitando ingreso a <strong className="text-white">{joinModalCommunity.name}</strong> ({joinModalCommunity.church}).
              Los administradores revisarán tu perfil adventista real antes de aprobarte.
            </p>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">
                Mensaje de Presentación (opcional):
              </label>
              <textarea
                value={joinPresentationMsg}
                onChange={(e) => setJoinPresentationMsg(e.target.value)}
                placeholder="Cuéntale a los líderes por qué deseas unirte o a qué congregación perteneces..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setJoinModalCommunity(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitJoinRequest}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-900/30"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear o Editar Comunidad */}
      {(showCreateModal || !!communityToEdit) && (
        <CreateOrEditCommunityModal
          isOpen={showCreateModal || !!communityToEdit}
          communityToEdit={communityToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setCommunityToEdit(null);
          }}
          onSave={(data, communityId) => {
            if (communityId) {
              comunidadStorage.updateCommunity(communityId, data);
            } else {
              const created = comunidadStorage.createCommunity(data, currentMemberObj);
              setSelectedCommunityId(created.id);
            }
            setShowCreateModal(false);
            setCommunityToEdit(null);
          }}
        />
      )}

      {/* Modal: Salir de Comunidad */}
      {communityToLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Salir de la comunidad?</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{communityToLeave.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Dejarás de recibir avisos y no podrás confirmar asistencia a reuniones exclusivas. Puedes volver a unirte o solicitar ingreso en cualquier momento.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCommunityToLeave(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLeaveConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Panel */}
      {adminPanelCommunity && (
        <CommunityAdminPanel
          community={adminPanelCommunity}
          onClose={() => setAdminPanelCommunity(null)}
          onEditCommunityClick={() => {
            setCommunityToEdit(adminPanelCommunity);
            setAdminPanelCommunity(null);
          }}
          onCommunityUpdated={() => {
            setCommunities(comunidadStorage.getCommunities());
          }}
        />
      )}

      {/* Modal: Schedule Meeting */}
      {scheduleMeetingCommunity && (
        <ScheduleMeetingModal
          isOpen={!!scheduleMeetingCommunity}
          communityId={scheduleMeetingCommunity.id}
          communityName={scheduleMeetingCommunity.name}
          onClose={() => setScheduleMeetingCommunity(null)}
          onSave={(data, meetingId) => {
            if (meetingId) {
              comunidadStorage.updateMeeting(meetingId, data);
            } else {
              comunidadStorage.createMeeting(data);
            }
            setScheduleMeetingCommunity(null);
          }}
        />
      )}

      {/* Modal: User Profile Detail */}
      {selectedProfileUserId && (
        <UserProfileDetailModal
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
        />
      )}

    </div>
  );
};
