import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserMinus, 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Edit3, 
  Plus, 
  Eye, 
  Settings, 
  Sparkles, 
  ChevronRight, 
  Check, 
  X,
  MapPin,
  Building2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { 
  ChurchCommunity, 
  CommunityMember, 
  CommunityRole, 
  JoinRequest, 
  CommunityMeeting, 
  MeetingAttendance,
  CommunityAnnouncement
} from './types';
import { comunidadStorage } from './comunidadStorage';
import { UserProfileDetailModal } from './UserProfileDetailModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';

interface CommunityAdminPanelProps {
  community: ChurchCommunity;
  onCommunityUpdated: () => void;
  onEditCommunityClick: () => void;
  onClose: () => void;
}

export const CommunityAdminPanel: React.FC<CommunityAdminPanelProps> = ({
  community,
  onCommunityUpdated,
  onEditCommunityClick,
  onClose
}) => {
  const { currentUser } = useApp();
  const [adminTab, setAdminTab] = useState<'resumen' | 'solicitudes' | 'miembros' | 'reuniones' | 'avisos'>('resumen');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  
  // Inspection modal
  const [inspectingUser, setInspectingUser] = useState<{
    id: string;
    name: string;
    avatar: string;
    church?: string;
    district?: string;
  } | null>(null);

  // Remove member confirmation
  const [memberToRemove, setMemberToRemove] = useState<CommunityMember | null>(null);

  // Meeting schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<CommunityMeeting | null>(null);

  // Quick announcement modal / form
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'general' | 'urgente' | 'cambio_horario' | 'cambio_lugar' | 'materiales'>('general');
  const [annPinned, setAnnPinned] = useState(false);

  // Check if current user is authorized (creator or administrator)
  const userRole = community.members.find(m => m.userId === currentUser.id)?.role;
  const isCreator = community.creatorId === currentUser.id || userRole === 'creador';
  const isAdmin = isCreator || userRole === 'administrador';

  const meetings = comunidadStorage.getMeetings(community.id);
  const announcements = comunidadStorage.getAnnouncements(community.id);
  
  // Sort upcoming meetings
  const upcomingMeetings = meetings.filter(m => m.status === 'programada').sort((a, b) => a.date.localeCompare(b.date));
  const nextMeeting = upcomingMeetings[0];
  const nextMeetingAttendances = nextMeeting ? comunidadStorage.getAttendances(nextMeeting.id) : [];
  const nextMeetingWillAttend = nextMeetingAttendances.filter(a => a.response === 'asistire').length;
  const nextMeetingWontAttend = nextMeetingAttendances.filter(a => a.response === 'no_asistire').length;
  const nextMeetingMaybe = nextMeetingAttendances.filter(a => a.response === 'tal_vez').length;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Acceso Restringido</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Solo el creador y los administradores autorizados tienen acceso a este panel de administración.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
        >
          Volver a la Comunidad
        </button>
      </div>
    );
  }

  // Solicitud actions
  const handleApproveRequest = (reqId: string) => {
    comunidadStorage.handleJoinRequest(community.id, reqId, true);
    onCommunityUpdated();
  };

  const handleRejectRequest = (reqId: string) => {
    comunidadStorage.handleJoinRequest(community.id, reqId, false);
    onCommunityUpdated();
  };

  // Member role change
  const handleRoleChange = (userId: string, newRole: CommunityRole) => {
    comunidadStorage.updateMemberRole(community.id, userId, newRole);
    onCommunityUpdated();
  };

  // Remove member execution
  const handleConfirmRemoveMember = () => {
    if (!memberToRemove) return;
    comunidadStorage.removeMember(community.id, memberToRemove.userId);
    setMemberToRemove(null);
    onCommunityUpdated();
  };

  // Save meeting
  const handleSaveMeeting = (data: Omit<CommunityMeeting, 'id' | 'createdAt' | 'status'>, mId?: string) => {
    if (mId) {
      comunidadStorage.updateMeeting(mId, data);
    } else {
      comunidadStorage.createMeeting(data);
    }
    onCommunityUpdated();
  };

  // Cancel meeting
  const handleCancelMeeting = (mId: string) => {
    if (confirm('¿Seguro que deseas cancelar esta reunión? Se notificará a los miembros.')) {
      comunidadStorage.cancelMeeting(mId);
      onCommunityUpdated();
    }
  };

  // Create announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    comunidadStorage.createAnnouncement({
      communityId: community.id,
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName || ''}`.trim() || currentUser.username,
      authorAvatar: currentUser.avatar,
      authorRole: userRole || 'administrador',
      pinned: annPinned
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnouncementForm(false);
    onCommunityUpdated();
  };

  // Filter members
  const filteredMembers = community.members.filter(m => {
    const q = memberSearchTerm.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.church && m.church.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner of Admin Panel */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600/25 via-slate-900 to-slate-950 border border-amber-500/40 p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Panel de Administración Eclesiástica</span>
            <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
              {isCreator ? 'Creador Principal' : 'Administrador'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Gestión de {community.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Administra los miembros aceptados, revisa perfiles de solicitantes, programa reuniones y mantén informada a tu comunidad.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onEditCommunityClick}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5 text-amber-400" />
            <span>Editar Información</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setAdminTab('resumen')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            adminTab === 'resumen'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Resumen</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('solicitudes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            adminTab === 'solicitudes'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Solicitudes</span>
          {community.pendingRequests.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              adminTab === 'solicitudes' ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
            }`}>
              {community.pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('miembros')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            adminTab === 'miembros'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Miembros ({community.members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('reuniones')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            adminTab === 'reuniones'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Reuniones ({meetings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('avisos')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            adminTab === 'avisos'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Avisos ({announcements.length})</span>
        </button>
      </div>

      {/* SECCIÓN A: RESUMEN DE LA COMUNIDAD */}
      {adminTab === 'resumen' && (
        <div className="space-y-4">
          
          {/* Métricas Reales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <span>Miembros Aceptados</span>
              </span>
              <p className="text-2xl font-black text-white">{community.members.length}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Reales y verificados</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Solicitudes Pendientes</span>
              </span>
              <p className="text-2xl font-black text-amber-400">{community.pendingRequests.length}</p>
              <span className="text-[10px] text-slate-400 font-medium">
                {community.pendingRequests.length === 0 ? 'Al día' : 'Requieren revisión'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                <span>Reuniones Programadas</span>
              </span>
              <p className="text-2xl font-black text-white">{upcomingMeetings.length}</p>
              <span className="text-[10px] text-purple-300 font-medium">Próximas actividades</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Bell className="h-3.5 w-3.5 text-rose-400" />
                <span>Avisos Publicados</span>
              </span>
              <p className="text-2xl font-black text-white">{announcements.length}</p>
              <span className="text-[10px] text-slate-400 font-medium">Comunicaciones activas</span>
            </div>
          </div>

          {/* Tarjeta de Próxima Reunión y Confirmaciones Reales */}
          {nextMeeting ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Próxima Reunión Programada:
                  </span>
                  <h4 className="text-base font-bold text-white">{nextMeeting.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{nextMeeting.date}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{nextMeeting.startTime} {nextMeeting.endTime ? `- ${nextMeeting.endTime}` : ''}</span>
                  </span>
                </div>
              </div>

              {/* Confirmaciones de Asistencia Reales */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">
                  Confirmaciones de Asistencia ({nextMeetingAttendances.length} respuestas registradas):
                </span>
                
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-400 font-bold block">✓ Asistirán</span>
                    <span className="text-base font-black text-white">{nextMeetingWillAttend}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                    <span className="text-[11px] text-rose-400 font-bold block">✗ No podrán</span>
                    <span className="text-base font-black text-white">{nextMeetingWontAttend}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <span className="text-[11px] text-amber-400 font-bold block">? Tal vez</span>
                    <span className="text-base font-black text-white">{nextMeetingMaybe}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  Modalidad: <strong className="text-white capitalize">{nextMeeting.modality}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setAdminTab('reuniones')}
                  className="text-xs text-amber-400 hover:text-white font-bold flex items-center gap-1"
                >
                  <span>Gestionar reunión y lista de asistentes</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">No hay reuniones futuras programadas en este momento.</p>
              <button
                type="button"
                onClick={() => {
                  setMeetingToEdit(null);
                  setShowScheduleModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Programar primera reunión</span>
              </button>
            </div>
          )}

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setMeetingToEdit(null);
                setShowScheduleModal(true);
              }}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center gap-3 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Programar Reunión</span>
                <span className="text-[10px] text-slate-400">Presencial o virtual</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAdminTab('avisos');
                setShowAnnouncementForm(true);
              }}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex items-center gap-3 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Publicar Aviso</span>
                <span className="text-[10px] text-slate-400">Horarios, avisos, notas</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onEditCommunityClick}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 flex items-center gap-3 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Configuración</span>
                <span className="text-[10px] text-slate-400">Días, reglas y portada</span>
              </div>
            </button>
          </div>

        </div>
      )}

      {/* SECCIÓN B: SOLICITUDES DE INGRESO */}
      {adminTab === 'solicitudes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Solicitudes de Ingreso Pendientes</h3>
              <p className="text-xs text-slate-400">Revisa la información y perfil de cada persona antes de aprobar</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
              {community.pendingRequests.length} pendientes
            </span>
          </div>

          {community.pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {community.pendingRequests.map(req => (
                <div 
                  key={req.id} 
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img 
                        src={req.userAvatar} 
                        alt={req.userName} 
                        className="h-11 w-11 rounded-2xl object-cover ring-2 ring-slate-800 shadow-md shrink-0 cursor-pointer"
                        onClick={() => setInspectingUser({
                          id: req.userId,
                          name: req.userName,
                          avatar: req.userAvatar,
                          church: req.userChurch,
                          district: req.userDistrict
                        })}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 
                            onClick={() => setInspectingUser({
                              id: req.userId,
                              name: req.userName,
                              avatar: req.userAvatar,
                              church: req.userChurch,
                              district: req.userDistrict
                            })}
                            className="text-sm font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                          >
                            {req.userName}
                          </h4>
                          <span className="text-[10px] text-slate-400">· {req.requestedAt}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                          {req.userChurch && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-blue-400" />
                              <span>{req.userChurch}</span>
                            </span>
                          )}
                          {req.userDistrict && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-400" />
                              <span>{req.userDistrict}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectingUser({
                          id: req.userId,
                          name: req.userName,
                          avatar: req.userAvatar,
                          church: req.userChurch,
                          district: req.userDistrict
                        })}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1"
                        title="Ver perfil real en A Prueba de Fuego"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-400" />
                        <span>Ver Perfil</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Aceptar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>

                  {/* Mensaje de presentación si fue escrito */}
                  {req.reason && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold block">
                        Mensaje de presentación del solicitante:
                      </span>
                      <p className="leading-relaxed italic">«{req.reason}»</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">¡No hay solicitudes pendientes!</h4>
              <p className="text-xs text-slate-400">
                Todas las solicitudes de ingreso han sido atendidas. Los nuevos pedidos aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN C: ADMINISTRACIÓN DE MIEMBROS */}
      {adminTab === 'miembros' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-white">Miembros Aceptados ({community.members.length})</h3>
              <p className="text-xs text-slate-400">Gestiona roles eclesiásticos o retira integrantes de la comunidad</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                placeholder="Buscar miembro..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredMembers.map(member => {
              const isTargetCreator = member.role === 'creador';
              const isTargetSelf = member.userId === currentUser.id;

              return (
                <div 
                  key={member.userId}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="cursor-pointer shrink-0"
                      onClick={() => setInspectingUser({
                        id: member.userId,
                        name: member.name,
                        avatar: member.avatar,
                        church: member.church,
                        district: member.district
                      })}
                    >
                      <UserAvatar
                        avatar={member.avatar}
                        name={member.name}
                        size="sm"
                        showBadge={false}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => setInspectingUser({
                            id: member.userId,
                            name: member.name,
                            avatar: member.avatar,
                            church: member.church,
                            district: member.district
                          })}
                          className="font-bold text-white truncate hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {member.name}
                        </span>
                        {isTargetSelf && (
                          <span className="text-[10px] text-amber-400 font-bold">(Tú)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{member.church || 'Iglesia Local'}</span>
                        <span>·</span>
                        <span>Ingresó: {member.joinedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Botón Ver Perfil */}
                    <button
                      type="button"
                      onClick={() => setInspectingUser({
                        id: member.userId,
                        name: member.name,
                        avatar: member.avatar,
                        church: member.church,
                        district: member.district
                      })}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Ver perfil real"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Selector de Rol */}
                    {isCreator && !isTargetCreator && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value as CommunityRole)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="miembro">Miembro</option>
                        <option value="moderador">Moderador</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    )}

                    {!isCreator && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-300 font-bold capitalize text-[11px] border border-slate-800">
                        {member.role}
                      </span>
                    )}

                    {/* Retirar miembro con confirmación */}
                    {!isTargetCreator && !isTargetSelf && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 transition-colors"
                        title="Retirar miembro de la comunidad"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN D: GESTIÓN DE REUNIONES */}
      {adminTab === 'reuniones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Reuniones y Actividades Programadas</h3>
              <p className="text-xs text-slate-400">Coordina la agenda presencial y virtual de la comunidad</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMeetingToEdit(null);
                setShowScheduleModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Programar Reunión</span>
            </button>
          </div>

          <div className="space-y-3">
            {meetings.map(m => {
              const attendances = comunidadStorage.getAttendances(m.id);
              const willAttend = attendances.filter(a => a.response === 'asistire');
              const wontAttend = attendances.filter(a => a.response === 'no_asistire');
              const maybe = attendances.filter(a => a.response === 'tal_vez');

              return (
                <div 
                  key={m.id}
                  className={`p-4 rounded-2xl bg-slate-900 border space-y-3 shadow-md ${
                    m.status === 'cancelada' ? 'border-red-900/40 opacity-70' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{m.title}</h4>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          m.status === 'cancelada' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {m.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold capitalize">
                          {m.modality}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        Temática: {m.theme}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.status !== 'cancelada' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMeetingToEdit(m);
                              setShowScheduleModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelMeeting(m.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{m.date} · {m.startTime} {m.endTime ? `- ${m.endTime}` : ''}</span>
                    </p>
                    {m.location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{m.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Asistencias Confirmadas */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">
                        Confirmaciones de Asistencia ({attendances.length}):
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-emerald-400 font-bold">✓ {willAttend.length} asistirán</span>
                        <span className="text-rose-400 font-bold">✗ {wontAttend.length} no podrán</span>
                        <span className="text-amber-400 font-bold">? {maybe.length} tal vez</span>
                      </div>
                    </div>

                    {willAttend.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-500 mr-1">Confirmados:</span>
                        {willAttend.map(a => (
                          <span 
                            key={a.userId} 
                            className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-medium border border-slate-800 flex items-center gap-1"
                          >
                            <img src={a.userAvatar} alt={a.userName} className="h-3.5 w-3.5 rounded-full object-cover" />
                            <span>{a.userName}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {meetings.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                No hay reuniones programadas aún. Pulsa «Programar Reunión» para crear la primera.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN E: AVISOS Y ANUNCIOS */}
      {adminTab === 'avisos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Espacio de Avisos y Comunicados</h3>
              <p className="text-xs text-slate-400">Publica cambios de horario, lugar, materiales y recordatorios</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>{showAnnouncementForm ? 'Ocultar Formulario' : 'Nuevo Aviso'}</span>
            </button>
          </div>

          {/* Formulario de Nuevo Aviso */}
          {showAnnouncementForm && (
            <form onSubmit={handleCreateAnnouncement} className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/40 space-y-3 text-xs shadow-lg animate-in fade-in duration-100">
              <h4 className="font-bold text-white">Publicar Aviso a la Comunidad</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Título del aviso: *</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Ej: Cambio de horario este sábado / Recordatorio de materiales"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de aviso:</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="general">Aviso General</option>
                    <option value="urgente">Urgente / Importante</option>
                    <option value="cambio_horario">Cambio de Horario</option>
                    <option value="cambio_lugar">Cambio de Lugar</option>
                    <option value="materiales">Materiales de Estudio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contenido del aviso: *</label>
                <textarea
                  required
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Escribe el mensaje claro para todos los miembros de la comunidad..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={annPinned}
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span>Fijar este aviso en la parte superior</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20"
                  >
                    Publicar Aviso
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Lista de Avisos */}
          <div className="space-y-3">
            {announcements.map(ann => (
              <div 
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                      {ann.pinned && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          Fijado
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] capitalize">
                        {ann.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Publicado por {ann.authorName} · {ann.createdAt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Eliminar este aviso?')) {
                        comunidadStorage.deleteAnnouncement(ann.id);
                        onCommunityUpdated();
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 text-xs p-1"
                  >
                    Eliminar
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                No hay avisos publicados en esta comunidad.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA RETIRAR MIEMBRO */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">¿Retirar a este miembro?</h4>
                <p className="text-xs text-slate-400">Esta acción retirará su acceso a los contenidos privados.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs">
              <UserAvatar avatar={memberToRemove.avatar} name={memberToRemove.name} size="sm" showBadge={false} />
              <div>
                <span className="font-bold text-white block">{memberToRemove.name}</span>
                <span className="text-[11px] text-slate-400">Rol: {memberToRemove.role.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveMember}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20"
              >
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTOR DE PERFIL REAL DE SOLICITANTE / MIEMBRO */}
      {inspectingUser && (
        <UserProfileDetailModal
          userId={inspectingUser.id}
          userName={inspectingUser.name}
          userAvatar={inspectingUser.avatar}
          userChurch={inspectingUser.church}
          userDistrict={inspectingUser.district}
          onClose={() => setInspectingUser(null)}
        />
      )}

      {/* MODAL DE PROGRAMAR / EDITAR REUNIÓN */}
      {showScheduleModal && (
        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          communityId={community.id}
          communityName={community.name}
          meetingToEdit={meetingToEdit}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSaveMeeting}
        />
      )}

    </div>
  );
};
