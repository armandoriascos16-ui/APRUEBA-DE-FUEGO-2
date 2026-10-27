import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Challenge, EventItem, User, Post } from '../../types';
import { updateUserInFirestore, deleteUserInFirestore, createPostInFirestore } from '../../firebase/firestoreService';
import { auth } from '../../firebase/config';
import { 
  ShieldCheck, 
  Users, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Calendar, 
  BarChart3, 
  MapPin, 
  Layers, 
  Filter,
  FileText,
  Sparkles,
  Search,
  Trash2,
  Eye,
  Crown,
  Newspaper,
  Image as ImageIcon,
  Film,
  Heart,
  MessageCircle,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    setAllUsers,
    posts, 
    submissions, 
    challenges, 
    events, 
    adminReviewSubmission, 
    adminCreateChallenge, 
    adminCreateEvent,
    deletePost,
    setSelectedUserId,
    setActiveTab,
    pointTransactions,
    triggerCelebration
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'posts' | 'evidence' | 'ledger' | 'stats' | 'new_challenge' | 'new_event'>('users');

  // Inline Dialog & Toast States (No window.alert / window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Official Post Creation Modal State
  const [showCreateOfficialModal, setShowCreateOfficialModal] = useState(false);
  const [officialContent, setOfficialContent] = useState('');
  const [officialImageUrl, setOfficialImageUrl] = useState('');
  const [officialVideoUrl, setOfficialVideoUrl] = useState('');
  const [officialBibleVerse, setOfficialBibleVerse] = useState('');
  const [officialTags, setOfficialTags] = useState('ComunicadoOficial, JuventudAdventista, MisionJA');
  const [isSubmittingOfficial, setIsSubmittingOfficial] = useState(false);
  const [officialFeedbackMsg, setOfficialFeedbackMsg] = useState<string | null>(null);

  const handleCreateOfficialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialContent.trim() || isSubmittingOfficial) return;

    setIsSubmittingOfficial(true);
    setOfficialFeedbackMsg(null);

    try {
      const postId = `post_official_${Date.now()}`;
      const adminId = auth.currentUser?.uid || currentUser.id;
      const adminName = `${currentUser.name} ${currentUser.lastName}`.trim() || 'Administración JA';
      const adminAvatar = currentUser.avatar || '';
      const adminUsername = currentUser.username || 'admin_ja';
      const adminChurch = currentUser.church || 'Unión Colombiana / Distrito Central';

      const parsedTags = officialTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const newPost: Post = {
        id: postId,
        authorId: adminId,
        authorName: adminName,
        authorUsername: adminUsername,
        authorAvatar: adminAvatar,
        authorChurch: adminChurch,
        authorPoints: currentUser.points || 5000,
        authorIsOfficial: true,
        content: officialContent.trim(),
        bibleVerse: officialBibleVerse.trim() || '',
        imageUrl: officialImageUrl.trim() || '',
        videoUrl: officialVideoUrl.trim() || '',
        mediaType: officialImageUrl.trim() ? 'image' : officialVideoUrl.trim() ? 'video' : 'image',
        tags: parsedTags.length > 0 ? parsedTags : ['ComunicadoOficial', 'JuventudAdventista'],
        isOfficial: true,
        viewsCount: 1,
        reactions: {
          amen: 0,
          aleluya: 0,
          gloriaDios: 0,
          diosEsBueno: 0,
          bendiciones: 0,
          estoyOrando: 0,
          meInspiro: 0,
        },
        userReactions: {},
        comments: [],
        sharesCount: 0,
        createdAt: new Date().toISOString(),
      };

      // 1. Guardar en Cloud Firestore en /posts/{postId}
      await createPostInFirestore(newPost);

      triggerCelebration();
      setOfficialFeedbackMsg('¡Comunicado oficial publicado con éxito en Cloud Firestore para toda la comunidad!');

      // Limpiar formulario y cerrar tras breve delay
      setTimeout(() => {
        setOfficialContent('');
        setOfficialImageUrl('');
        setOfficialVideoUrl('');
        setOfficialBibleVerse('');
        setOfficialTags('ComunicadoOficial, JuventudAdventista, MisionJA');
        setIsSubmittingOfficial(false);
        setShowCreateOfficialModal(false);
        setOfficialFeedbackMsg(null);
      }, 900);
    } catch (err: any) {
      console.error('Error al crear publicación oficial:', err);
      setOfficialFeedbackMsg(err?.message || 'Error al guardar la publicación oficial en Firestore.');
      setIsSubmittingOfficial(false);
    }
  };
  
  // Search & Filter state for Users
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Search & Filter state for Posts
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [postMediaFilter, setPostMediaFilter] = useState<'all' | 'photo' | 'video' | 'official'>('all');

  // New Challenge Form State
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengePoints, setNewChallengePoints] = useState(100);
  const [newChallengeDifficulty, setNewChallengeDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil' | 'Épico'>('Medio');
  const [newChallengeCategory, setNewChallengeCategory] = useState('Servicio');
  const [newChallengeEvidence, setNewChallengeEvidence] = useState('');
  const [newChallengeDeadline, setNewChallengeDeadline] = useState('2026-11-30');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCity, setNewEventCity] = useState('Medellín');
  const [newEventVenue, setNewEventVenue] = useState('Templo Central');
  const [newEventDate, setNewEventDate] = useState('15 al 18 de Diciembre, 2026');
  const [newEventOrganizer, setNewEventOrganizer] = useState('Unión Colombiana IASD');
  const [newEventUrl, setNewEventUrl] = useState('https://unioncolombiana.org.co');

  // Review feedback modal state
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const totalPointsAwarded = allUsers.reduce((acc, u) => acc + u.points, 0);

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    const term = userSearchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.church?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term);

    const matchesRole = 
      userRoleFilter === 'all' || 
      (userRoleFilter === 'admin' ? u.role === 'admin' : u.role !== 'admin');

    return matchesSearch && matchesRole;
  });

  // Filtered Posts
  const filteredPosts = posts.filter(p => {
    const term = postSearchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      p.content.toLowerCase().includes(term) || 
      p.authorName.toLowerCase().includes(term) ||
      p.bibleVerse?.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (postMediaFilter === 'photo') return !!p.imageUrl;
    if (postMediaFilter === 'video') return !!p.videoUrl;
    if (postMediaFilter === 'official') return !!p.isOfficial;

    return true;
  });

  // Toggle user admin role
  const handleToggleAdminRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setConfirmDialog({
      isOpen: true,
      title: 'Cambiar Rol de Usuario',
      message: `¿Deseas cambiar el rol de "${targetUser.name}" a ${newRole.toUpperCase()}?`,
      confirmText: 'Confirmar Rol',
      onConfirm: async () => {
        setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        try {
          await updateUserInFirestore(targetUser.id, { role: newRole });
          showToast(`Rol de ${targetUser.name} actualizado a ${newRole}.`);
        } catch (e) {
          console.warn('Error updating role in Firestore:', e);
        }
        setConfirmDialog(null);
      }
    });
  };

  // Delete user from platform
  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      showToast('No puedes eliminar tu propia cuenta administradora activa.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario de la Plataforma',
      message: `¿Estás seguro de que deseas eliminar permanentemente a "${targetUser.name} ${targetUser.lastName}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar Permanentemente',
      isDestructive: true,
      onConfirm: async () => {
        setAllUsers(prev => prev.filter(u => u.id !== targetUser.id));
        try {
          await deleteUserInFirestore(targetUser.id);
          showToast(`Usuario "${targetUser.name}" eliminado.`);
        } catch (e) {
          console.warn('Error deleting user from Firestore:', e);
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    adminCreateChallenge({
      title: newChallengeTitle.trim(),
      description: newChallengeDesc.trim(),
      category: newChallengeCategory,
      difficulty: newChallengeDifficulty,
      points: Number(newChallengePoints),
      deadline: newChallengeDeadline,
      requiredEvidence: newChallengeEvidence.trim() || 'Fotografía de la actividad con descripción del impacto.',
      icon: '🔥',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      isOfficial: true,
    });

    setNewChallengeTitle('');
    setNewChallengeDesc('');
    showToast('¡Nuevo reto oficial publicado en la plataforma!');
    setActiveAdminTab('evidence');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    adminCreateEvent({
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      category: 'campamento',
      date: newEventDate,
      time: '08:00 AM',
      city: newEventCity,
      country: 'Colombia',
      venue: newEventVenue,
      organizer: newEventOrganizer,
      isOfficialSource: true,
      officialOrganization: newEventOrganizer,
      officialSourceUrl: newEventUrl,
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1000&auto=format&fit=crop&q=80',
      scope: 'nacional',
    });

    setNewEventTitle('');
    setNewEventDesc('');
    showToast('¡Nuevo evento oficial agregado al calendario!');
    setActiveAdminTab('evidence');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-600/30 via-orange-950/40 to-slate-950 border-2 border-amber-500/40 p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-black text-amber-300 mb-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>PANEL DE ADMINISTRACIÓN Y SUPERVISIÓN OFICIAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
              A PRUEBA DE FUEGO — CONTROL GENERAL
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
              Monitoreo de jóvenes registrados, supervisión de publicaciones de la comunidad, certificación de retos y convocatorias oficiales.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Jóvenes Registrados</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{allUsers.length}</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Publicaciones</span>
              <span className="text-2xl font-black text-orange-400 tabular-nums">{posts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>👥 Usuarios Registrados ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('posts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'posts'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>📰 Publicaciones ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('evidence')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'evidence'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>🔥 Evidencias ({pendingSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'ledger'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>💎 Libro de Puntos ({pointTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('new_challenge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'new_challenge'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>➕ Crear Reto</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('new_event')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'new_event'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>📅 Crear Evento</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'stats'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>📊 Métricas</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USUARIOS REGISTRADOS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                <span>Directorio de Usuarios Registrados</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {filteredUsers.length} de {allUsers.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Supervisa todos los jóvenes registrados, sus iglesias, distritos, roles y actividad en la red.
              </p>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  userRoleFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  userRoleFilter === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Administradores
              </button>
              <button
                onClick={() => setUserRoleFilter('user')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  userRoleFilter === 'user' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Jóvenes
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apellido, usuario, correo electrónico, iglesia o ciudad..."
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* User List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map((u) => (
              <div 
                key={u.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar
                    avatar={u.avatar}
                    name={`${u.name} ${u.lastName}`}
                    size="lg"
                    isOfficial={u.isOfficialVerified}
                    showBadge={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{u.name} {u.lastName}</span>
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                          <Crown className="h-3 w-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-bold uppercase">
                          Joven
                        </span>
                      )}
                      {u.isOfficialVerified && (
                        <span className="text-amber-400 font-bold text-xs" title="Verificado Oficial">✓</span>
                      )}
                    </div>

                    <p className="text-xs text-amber-400/90 font-medium">@{u.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="truncate max-w-[150px]">⛪ {u.church || 'Iglesia local'}</span>
                      <span>·</span>
                      <span>📍 {u.city}, {u.country}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold">
                        🔥 {u.points} pts
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        Nivel {u.level} ({u.levelName})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setActiveTab('perfil');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
                    title="Ver Perfil Completo"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ver Ficha</span>
                  </button>

                  <button
                    onClick={() => handleToggleAdminRole(u)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      u.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Alternar rol de administrador"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>{u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="flex items-center gap-1 p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Eliminar Usuario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No se encontraron usuarios con ese criterio</p>
              <p className="text-xs text-slate-500 mt-1">Prueba cambiando el término de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PUBLICACIONES DE LA COMUNIDAD */}
      {/* ========================================================================= */}
      {activeAdminTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-amber-400" />
                <span>Supervisión y Publicaciones Oficiales</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold">
                  {filteredPosts.length} publicaciones
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Emite comunicados oficiales para toda la comunidad en Cloud Firestore y modera el contenido de la juventud.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
              {/* Botón Crear Publicación Oficial */}
              <button
                type="button"
                onClick={() => setShowCreateOfficialModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Crear publicación oficial</span>
              </button>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
                <button
                  onClick={() => setPostMediaFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    postMediaFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setPostMediaFilter('photo')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    postMediaFilter === 'photo' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Con Foto
                </button>
                <button
                  onClick={() => setPostMediaFilter('video')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    postMediaFilter === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Con Video
                </button>
                <button
                  onClick={() => setPostMediaFilter('official')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    postMediaFilter === 'official' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Oficiales
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={postSearchTerm}
              onChange={(e) => setPostSearchTerm(e.target.value)}
              placeholder="Buscar por texto de publicación, nombre del autor o versículo bíblico..."
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Posts Grid */}
          <div className="space-y-4">
            {filteredPosts.map((p) => (
              <div 
                key={p.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.authorAvatar}
                      alt={p.authorName}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-2xl object-cover ring-2 ring-amber-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{p.authorName}</span>
                        <span className="text-xs text-amber-400 font-semibold">@{p.authorUsername}</span>
                        {p.isOfficial && (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Oficial
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{p.authorChurch || 'Iglesia local'} · {p.createdAt}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar permanentemente esta publicación de la comunidad?')) {
                        deletePost(p.id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar Publicación</span>
                  </button>
                </div>

                {/* Text Content */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {p.content}
                </p>

                {/* Bible verse */}
                {p.bibleVerse && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 text-xs italic">
                    {p.bibleVerse}
                  </div>
                )}

                {/* Photo Attachment */}
                {p.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-950 border border-slate-800">
                    <img src={p.imageUrl} alt="Adjunto" className="w-full h-auto max-h-72 object-cover" />
                  </div>
                )}

                {/* Video Attachment */}
                {p.videoUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-72 bg-black border border-slate-800">
                    <video src={p.videoUrl} controls className="w-full h-auto max-h-72 rounded-xl" />
                  </div>
                )}

                {/* Stats Summary */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{Object.values(p.reactions).reduce((a, b) => a + b, 0)} reacciones</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{p.comments.length} comentarios</span>
                    </span>
                  </div>
                  <span>👁️ {p.viewsCount} visualizaciones</span>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800">
              <Newspaper className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No hay publicaciones que coincidan con la búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EVIDENCE REVIEW QUEUE */}
      {/* ========================================================================= */}
      {activeAdminTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Cola de Certificación de Retos ({pendingSubmissions.length} pendientes)
            </h2>
            <span className="text-xs text-amber-400 font-medium">
              Aprobar otorga puntos inmediatos al joven
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">¡No hay evidencias pendientes!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Todos los retos enviados por los jóvenes han sido evaluados y certificados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((sub) => (
                <div 
                  key={sub.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4"
                >
                  {/* Submitter header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={sub.userAvatar} 
                        alt={sub.userName} 
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-amber-500" 
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.userName}</h4>
                        <p className="text-[11px] text-slate-400">{sub.userChurch} · {sub.submittedAt}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      +{sub.challengePoints} Puntos en juego
                    </div>
                  </div>

                  {/* Challenge Info */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Reto a certificar:</span>
                    <p className="font-bold text-white">{sub.challengeTitle}</p>
                    <p className="text-slate-300 mt-1 italic leading-relaxed">"{sub.commentReflection}"</p>
                  </div>

                  {/* Media proof */}
                  <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img 
                      src={sub.mediaUrl} 
                      alt="Evidencia fotográfica" 
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-72 object-cover" 
                    />
                  </div>

                  {/* Feedback text input */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Comentario o mensaje pastoral de felicitación para el joven:
                    </label>
                    <input
                      type="text"
                      value={reviewFeedback[sub.id] || ''}
                      onChange={(e) => setReviewFeedback({ ...reviewFeedback, [sub.id]: e.target.value })}
                      placeholder="¡Excelente testimonio! Has sido una bendición para tu iglesia."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => adminReviewSubmission(sub.id, 'rejected', reviewFeedback[sub.id] || 'La evidencia no cumple con los requisitos del reto')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => adminReviewSubmission(sub.id, 'more_info', reviewFeedback[sub.id] || 'Por favor envía una foto más clara')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                    >
                      Pedir Más Información
                    </button>
                    <button
                      onClick={() => adminReviewSubmission(sub.id, 'approved', reviewFeedback[sub.id] || '¡Reto verificado con éxito!')}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all"
                    >
                      ✓ Certificar & Asignar +{sub.challengePoints} Puntos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: AUDITABLE POINT TRANSACTIONS LEDGER (MÓDULO 9) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span>Libro Mayor de Puntos & Auditoría Espiritual</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {pointTransactions.length} movimientos
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Historial inmutable y auditable de asignación y certificación de puntos almacenado en Firestore.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Puntos Auditados</span>
              <span className="text-lg font-black text-amber-400 tabular-nums">
                {pointTransactions.reduce((acc, t) => acc + (t.points || 0), 0).toLocaleString()} pts
              </span>
            </div>
          </div>

          {pointTransactions.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800">
              <Flame className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Aún no se han registrado transacciones de puntos</p>
              <p className="text-xs text-slate-500 mt-1">Los movimientos aparecerán automáticamente al certificar retos o completar trivias bíblicas.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg divide-y divide-slate-800">
              <div className="p-3 bg-slate-950/80 grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="col-span-3">Fecha y Hora</span>
                <span className="col-span-3">Joven Beneficiario</span>
                <span className="col-span-4">Motivo / Reto</span>
                <span className="col-span-2 text-right">Puntos / Certificador</span>
              </div>
              {pointTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 grid grid-cols-12 items-center text-xs hover:bg-slate-850 transition-colors">
                  <div className="col-span-3 text-slate-400 font-mono text-[11px]">
                    {new Date(tx.createdAt).toLocaleString('es-CO', { 
                      day: '2-digit', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="col-span-3">
                    <span className="font-bold text-white block">{tx.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">{tx.userId}</span>
                  </div>
                  <div className="col-span-4 pr-2">
                    <span className="text-slate-200 block font-medium">{tx.description}</span>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                      {tx.type}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs">
                      +{tx.points} pts
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      {tx.awardedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: NEW CHALLENGE FORM */}
      {/* ========================================================================= */}
      {activeAdminTab === 'new_challenge' && (
        <form onSubmit={handleCreateChallenge} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Plus className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Publicar Nuevo Reto Oficial JA</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Título del reto:</label>
            <input
              type="text"
              value={newChallengeTitle}
              onChange={(e) => setNewChallengeTitle(e.target.value)}
              placeholder="Ej: Misión Urbana Caleb 2026"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Descripción e instrucciones:</label>
            <textarea
              rows={3}
              value={newChallengeDesc}
              onChange={(e) => setNewChallengeDesc(e.target.value)}
              placeholder="Explica detalladamente qué debe hacer el joven para cumplir este reto..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Puntos:</label>
              <input
                type="number"
                value={newChallengePoints}
                onChange={(e) => setNewChallengePoints(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Dificultad:</label>
              <select
                value={newChallengeDifficulty}
                onChange={(e) => setNewChallengeDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
                <option value="Épico">Épico</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Categoría:</label>
              <input
                type="text"
                value={newChallengeCategory}
                onChange={(e) => setNewChallengeCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Requisito de evidencia:</label>
            <input
              type="text"
              value={newChallengeEvidence}
              onChange={(e) => setNewChallengeEvidence(e.target.value)}
              placeholder="Fotografía con el grupo juvenil o testimonio con firma del pastor..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Fecha límite:</label>
            <input
              type="date"
              value={newChallengeDeadline}
              onChange={(e) => setNewChallengeDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black shadow-md hover:from-amber-400"
          >
            Publicar Reto en la Plataforma
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NEW EVENT FORM */}
      {/* ========================================================================= */}
      {activeAdminTab === 'new_event' && (
        <form onSubmit={handleCreateEvent} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calendar className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Publicar Evento Oficial / Camporee</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre del evento:</label>
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Ej: Campamento Juvenil Nacional 'Inquebrantables'"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Descripción:</label>
            <textarea
              rows={3}
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              placeholder="Detalles del campamento, requisitos, invitados..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Ciudad:</label>
              <input
                type="text"
                value={newEventCity}
                onChange={(e) => setNewEventCity(e.target.value)}
                placeholder="Ciudad"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Fechas:</label>
              <input
                type="text"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                placeholder="Ej: 10 al 14 de Noviembre, 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Organización oficial:</label>
            <input
              type="text"
              value={newEventOrganizer}
              onChange={(e) => setNewEventOrganizer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Enlace / URL de la Fuente Oficial:</label>
            <input
              type="url"
              value={newEventUrl}
              onChange={(e) => setNewEventUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black shadow-md hover:from-amber-400"
          >
            Publicar Evento Oficial
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STATS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Total Puntos Otorgados</span>
              <span className="text-xl font-black text-amber-400">{totalPointsAwarded.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Jóvenes Registrados</span>
              <span className="text-xl font-black text-emerald-400">{allUsers.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Publicaciones Creadas</span>
              <span className="text-xl font-black text-blue-400">{posts.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Retos Activos</span>
              <span className="text-xl font-black text-orange-400">{challenges.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR PUBLICACIÓN OFICIAL CENTRALIZADA EN FIRESTORE */}
      {/* ========================================================================= */}
      {showCreateOfficialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl p-4 sm:p-6 my-auto text-left relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Crear Publicación Oficial JA</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                      isOfficial: true
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    Se publicará en Cloud Firestore (/posts/{`{postId}`}) y se sincronizará en tiempo real con todos los usuarios.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmittingOfficial) {
                    setShowCreateOfficialModal(false);
                    setOfficialFeedbackMsg(null);
                  }
                }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOfficialPost} className="space-y-4">
              
              {/* Feedback Msg */}
              {officialFeedbackMsg && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  officialFeedbackMsg.includes('éxito')
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300'
                }`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{officialFeedbackMsg}</span>
                </div>
              )}

              {/* Text content */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mensaje o Comunicado Oficial: *
                </label>
                <textarea
                  required
                  rows={4}
                  value={officialContent}
                  onChange={(e) => setOfficialContent(e.target.value)}
                  placeholder="Escribe el comunicado o mensaje pastoral / departamental oficial para toda la juventud..."
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Bible Verse */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Versículo Bíblico de Respaldo (opcional):
                </label>
                <input
                  type="text"
                  value={officialBibleVerse}
                  onChange={(e) => setOfficialBibleVerse(e.target.value)}
                  placeholder="Ej: 1 Timoteo 4:12 — Ninguno tenga en poco tu juventud..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Media URL: Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>URL de Imagen (opcional):</span>
                  </label>
                  <input
                    type="url"
                    value={officialImageUrl}
                    onChange={(e) => {
                      setOfficialImageUrl(e.target.value);
                      if (e.target.value) setOfficialVideoUrl('');
                    }}
                    placeholder="https://... o enlace de foto"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                    <Film className="h-3.5 w-3.5 text-orange-400" />
                    <span>URL de Video (opcional):</span>
                  </label>
                  <input
                    type="url"
                    value={officialVideoUrl}
                    onChange={(e) => {
                      setOfficialVideoUrl(e.target.value);
                      if (e.target.value) setOfficialImageUrl('');
                    }}
                    placeholder="https://... o enlace de video"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Preview if media provided */}
              {officialImageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-48 border border-slate-800 bg-slate-950">
                  <img src={officialImageUrl} alt="Vista previa" className="w-full h-auto max-h-48 object-cover" />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Etiquetas / Tags (separados por coma):
                </label>
                <input
                  type="text"
                  value={officialTags}
                  onChange={(e) => setOfficialTags(e.target.value)}
                  placeholder="ComunicadoOficial, MisionCaleb, CampamentoJA"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Security info notice */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
                🛡️ <strong>Seguridad verificada:</strong> Esta publicación se creará con <code>isOfficial: true</code> y credenciales de administrador validadas por las reglas de Firestore. Todos los usuarios conectados recibirán la notificación y actualización automáticamente.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmittingOfficial}
                  onClick={() => setShowCreateOfficialModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!officialContent.trim() || isSubmittingOfficial}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingOfficial ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Emitiendo en Cloud Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-slate-950 fill-slate-950" />
                      <span>Publicar Comunicado Oficial</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${confirmDialog.isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{confirmDialog.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  confirmDialog.isDestructive 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
