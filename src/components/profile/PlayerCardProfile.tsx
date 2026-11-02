import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { CreatePostModal } from '../feed/CreatePostModal';
import { StoryViewerModal } from '../feed/StoryViewerModal';
import { Story } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { AccountSwitcher } from './AccountSwitcher';
import { compressImageFromGallery } from '../../utils/mediaUtils';
import { calculateLevel, LEVEL_TIERS } from '../../data/seedData';
import { auth } from '../../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { 
  Flame, 
  Trophy, 
  Medal, 
  MapPin, 
  Church, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  Edit3, 
  HeartHandshake, 
  BookOpen, 
  Zap,
  CheckCircle2,
  Lock,
  Eye,
  Camera,
  Film,
  Plus,
  Mail,
  RefreshCw,
  AlertTriangle,
  Trash2,
  UserPlus,
  UserCheck,
  Users,
  Radio
} from 'lucide-react';

interface PlayerCardProfileProps {
  userId?: string | null;
}

export const PlayerCardProfile: React.FC<PlayerCardProfileProps> = ({ userId }) => {
  const { 
    currentUser, 
    allUsers, 
    posts, 
    stories,
    submissions, 
    updateUserProfile, 
    setActiveTab, 
    triggerCelebration, 
    followUser,
    setSelectedUserId 
  } = useApp();
  
  // Resolución estricta de usuario: si se pasa un userId, buscar exactamente en allUsers
  const targetUser = userId 
    ? (userId === currentUser.id ? currentUser : allUsers.find(u => u.id === userId))
    : currentUser;

  // Si se solicitó un usuario específico que no existe, mostrar pantalla de error en vez de mostrar al administrador o al usuario actual
  if (userId && !targetUser) {
    return (
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-8">
        <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-white">Perfil no disponible</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            El perfil que intentas consultar no existe o aún se está sincronizando con la base de datos de usuarios registrados.
          </p>
          <button
            onClick={() => {
              setSelectedUserId(null);
              setActiveTab('perfil');
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md active:scale-95"
          >
            ← Volver a mi propio perfil
          </button>
        </div>
      </div>
    );
  }

  const user = targetUser || currentUser;
  const isSelf = user.id === currentUser.id;
  const isViewerAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  const isProfilePrivateForViewer = !isSelf && user.privacy?.isProfilePublic === false && !isViewerAdmin;

  const userApprovedSubmissions = (submissions || []).filter(s => s.userId === user.id && s.status === 'approved');

  const [activeTab, setActiveTabState] = useState<'card' | 'posts' | 'retos' | 'badges' | 'settings'>('card');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user.bio);
  const [editChurch, setEditChurch] = useState(user.church);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMediaType, setCreateMediaType] = useState<'photo' | 'video'>('photo');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationMsg, setVerificationMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Estados vigentes (historias activas de las últimas 24 horas del usuario)
  const activeUserStories = (stories || []).filter(s => {
    if (s.authorId !== user.id) return false;
    if (!s.expiresAt) return true;
    const exp = new Date(s.expiresAt).getTime();
    return isNaN(exp) || exp > Date.now();
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFromGallery(file, 400, 400, 0.75);
      updateUserProfile({ avatar: compressed.dataUrl });
    } catch (err) {
      console.warn('Error al subir foto de perfil:', err);
    }
  };

  const handleRemoveAvatar = () => {
    updateUserProfile({ avatar: '' });
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      setVerificationMsg({ type: 'error', text: 'No hay una sesión activa de Firebase Auth.' });
      return;
    }
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationMsg({ type: 'success', text: `Enlace de verificación enviado a ${auth.currentUser.email}. Revisa tu bandeja de entrada o spam.` });
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error enviando verificación:', err);
      if (err.code === 'auth/too-many-requests') {
        setVerificationMsg({ type: 'error', text: 'Demasiadas solicitudes recientes. Espera unos minutos antes de reintentar.' });
      } else {
        setVerificationMsg({ type: 'error', text: err.message || 'Error al enviar correo de verificación.' });
      }
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setIsVerifying(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        updateUserProfile({ emailVerified: true });
        setVerificationMsg({ type: 'success', text: '¡Excelente! Tu correo ha sido verificado con éxito por Firebase Auth. Tu perfil ahora es público y participa en el ranking.' });
        triggerCelebration();
      } else {
        setVerificationMsg({ type: 'info', text: 'Aún no registramos la confirmación. Haz clic en el enlace enviado a tu correo y vuelve a pulsar Comprobar.' });
      }
    } catch (err: any) {
      setVerificationMsg({ type: 'error', text: 'No se pudo comprobar la verificación en este momento.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const userPosts = posts.filter(p => p.authorId === user.id);
  const levelInfo = calculateLevel(user.points);

  // Calculate next tier progress percentage
  const currentTier = LEVEL_TIERS.find(t => t.level === user.level) || LEVEL_TIERS[0];
  const nextTier = LEVEL_TIERS.find(t => t.level === user.level + 1);
  const pointsInCurrentTier = user.points - currentTier.minPoints;
  const tierRange = (nextTier?.minPoints || currentTier.maxPoints) - currentTier.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((pointsInCurrentTier / tierRange) * 100)));

  const handleSaveProfile = () => {
    updateUserProfile({
      bio: editBio,
      church: editChurch,
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Barra superior de navegación cuando se consulta el perfil de otro usuario */}
      {!isSelf && (
        <div className="flex items-center justify-between gap-2 mb-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-md flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedUserId(null);
                setActiveTab('perfiles');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition-colors shadow-md active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              <span>← Volver a Perfiles</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedUserId(null);
                setActiveTab('perfil');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              <span>Mi Perfil</span>
            </button>
          </div>

          {isProfilePrivateForViewer ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Perfil Privado</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Perfil Público</span>
            </span>
          )}
        </div>
      )}

      {/* Hidden Avatar File Input */}
      {isSelf && (
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      )}

      {/* Navigation tabs within profile */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-5">
        <button
          onClick={() => setActiveTabState('card')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'card' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Ficha de Jugador
        </button>
        <button
          onClick={() => setActiveTabState('posts')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'posts' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isProfilePrivateForViewer ? 'Publicaciones (🔒)' : `Publicaciones (${userPosts.length})`}
        </button>
        <button
          onClick={() => setActiveTabState('retos')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'retos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isProfilePrivateForViewer ? 'Retos (🔒)' : `Retos (${userApprovedSubmissions.length})`}
        </button>
        <button
          onClick={() => setActiveTabState('badges')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'badges' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Insignias ({user.badges.length})
        </button>
        {isSelf && (
          <button
            onClick={() => setActiveTabState('settings')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Configuración
          </button>
        )}
      </div>

      {/* TAB 1: PLAYER CARD (ESTÉTICA DE FICHA DEPORTIVA) */}
      {activeTab === 'card' && (
        <div className="space-y-4">
          
          {/* Verification Status Banner (Firebase Auth Verified Only) */}
          {isSelf && (
            <div className={`rounded-3xl p-4 sm:p-5 border shadow-xl transition-all ${
              (user.emailVerified || auth.currentUser?.emailVerified)
                ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/50'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${
                    (user.emailVerified || auth.currentUser?.emailVerified)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {(user.emailVerified || auth.currentUser?.emailVerified) ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-black text-white">
                        {(user.emailVerified || auth.currentUser?.emailVerified)
                          ? 'Cuenta Verificada por Firebase Auth'
                          : 'Correo Electrónico Pendiente de Verificación'}
                      </h2>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        (user.emailVerified || auth.currentUser?.emailVerified)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {(user.emailVerified || auth.currentUser?.emailVerified) ? '✓ Público & Activo' : '🔒 Privado Restringido'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {(user.emailVerified || auth.currentUser?.emailVerified)
                        ? `Tu cuenta (${user.email}) está verificada. Tu ficha aparece en Descubrimiento Juvenil, en el Ranking distrital y en los listados de la hermandad.`
                        : `Para proteger a la juventud y evitar perfiles ficticios, tu cuenta no se mostrará públicamente hasta confirmar el correo enviado a ${user.email}.`}
                    </p>

                    {verificationMsg && (
                      <div className={`text-xs font-semibold mt-2.5 p-2.5 rounded-xl border ${
                        verificationMsg.type === 'success'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                          : verificationMsg.type === 'error'
                          ? 'bg-red-500/15 border-red-500/30 text-red-200'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                      }`}>
                        {verificationMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                {!user.emailVerified && !auth.currentUser?.emailVerified && (
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendCooldown > 0}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <Mail className="h-3.5 w-3.5 text-amber-400" />
                      <span>{resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar correo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckVerification}
                      disabled={isVerifying}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                      <span>Comprobar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tarjeta de Control de Privacidad de la Cuenta (Público vs Privado) */}
          {isSelf && (
            <div className={`rounded-3xl p-4 sm:p-5 border shadow-xl transition-all ${
              user.privacy?.isProfilePublic !== false
                ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    user.privacy?.isProfilePublic !== false
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {user.privacy?.isProfilePublic !== false ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white">
                        Privacidad: {user.privacy?.isProfilePublic !== false ? 'Perfil Público 🌐' : 'Perfil Privado 🔒'}
                      </h3>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        user.privacy?.isProfilePublic !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {user.privacy?.isProfilePublic !== false ? 'Visible para todos' : 'Protegido'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {user.privacy?.isProfilePublic !== false
                        ? 'Cualquier joven registrado puede encontrarte en "Descubrir", entrar a tu ficha y ver tus publicaciones y Estados espirituales.'
                        : 'Tu cuenta está protegida. Solo tú puedes consultar tus publicaciones y Estados. Los demás usuarios verán tu perfil bloqueado.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !(user.privacy?.isProfilePublic !== false);
                    updateUserProfile({
                      privacy: {
                        ...user.privacy,
                        isProfilePublic: nextState
                      }
                    });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${
                    user.privacy?.isProfilePublic !== false
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {user.privacy?.isProfilePublic !== false ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar a Privado</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Cambiar a Público</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main Soccer Player Card Container */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl p-5 sm:p-7 fire-glow">
            
            {/* Card Background Watermark & Decorative Flames */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Rating Lockup: Soccer Player Style Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-6 border-b border-slate-800">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* Avatar with Level Rating Badge */}
                <div className="relative group">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 shadow-xl flex items-center justify-center">
                    <UserAvatar
                      avatar={user.avatar}
                      name={`${user.name} ${user.lastName}`}
                      size="2xl"
                      role={user.role}
                      isOfficial={user.isOfficialVerified}
                      showBadge={false}
                    />
                  </div>

                  {/* Level Rating Pin */}
                  <div className="absolute -top-2 -left-2 flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-slate-950 border-2 border-amber-400 shadow-md">
                    <span className="text-[9px] font-bold text-slate-400 leading-none">NV</span>
                    <span className="text-sm font-black text-amber-400 leading-none tabular-nums">{user.level}</span>
                  </div>

                  {/* Camera Upload Trigger for Profile Photo */}
                  {isSelf && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                      {user.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="flex items-center justify-center p-2 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg ring-2 ring-slate-950 transition-transform active:scale-90"
                          title="Eliminar foto y usar iniciales neutras"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center justify-center p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg ring-2 ring-slate-950 transition-transform active:scale-90"
                        title="Subir foto de perfil desde tu galería"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>


                {/* Name, Username, Church */}
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
                      {user.name} {user.lastName}
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold">
                      {user.isAdventist ? 'Adventista del 7° Día' : 'Cristiano'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    @{user.username} · {user.age} años · {user.maritalStatus === 'casado' ? '💍 Casado/a' : '🌱 Soltero/a'}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Church className="h-3.5 w-3.5 text-amber-400" />
                      <strong>{user.church}</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span>{user.city}, {user.country}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {user.district} · {user.zone} · {user.yearsServing} años sirviendo
                  </p>

                  {/* Social Counters: Followers & Following */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs mt-2.5">
                    <span className="text-slate-300">
                      <strong className="text-white font-extrabold">{user.followerIds?.length || 0}</strong>{' '}
                      <span className="text-slate-400">seguidores</span>
                    </span>
                    <span className="text-slate-300">
                      <strong className="text-white font-extrabold">{user.followingIds?.length || 0}</strong>{' '}
                      <span className="text-slate-400">siguiendo</span>
                    </span>
                  </div>

                  {/* Social Action Button when viewing other user */}
                  {!isSelf && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => followUser(user.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                          currentUser.followingIds?.includes(user.id)
                            ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {currentUser.followingIds?.includes(user.id) ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Siguiendo</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Seguir</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('chat')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Mensaje</span>
                      </button>

                      {!isProfilePrivateForViewer && activeUserStories.length > 0 && (
                        <button
                          onClick={() => setViewingStory(activeUserStories[0])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all"
                          title="Ver estados espirituales activos (24h)"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span>Ver Estado ({activeUserStories.length})</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Ver tus propios estados vigentes si existen */}
                  {isSelf && activeUserStories.length > 0 && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <button
                        onClick={() => setViewingStory(activeUserStories[0])}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all"
                        title="Ver tus estados espirituales vigentes"
                      >
                        <Radio className="h-3.5 w-3.5" />
                        <span>Tu Estado Activo ({activeUserStories.length})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GIANT SOCCER PLAYER POINT RATING BADGE */}
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-500/25 via-orange-600/20 to-slate-950 border-2 border-amber-400 shadow-xl min-w-[140px] text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  PUNTUACIÓN GLOBAL
                </span>
                <div className="flex items-center gap-1.5 text-3xl font-black text-white tabular-nums my-0.5 font-heading">
                  <Flame className="h-7 w-7 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>{user.points.toLocaleString()}</span>
                </div>
                <span className="text-xs font-extrabold text-amber-300">
                  {user.levelName}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Nivel {user.level} de 10
                </span>
              </div>

            </div>

            {isProfilePrivateForViewer ? (
              <div className="mt-6 rounded-3xl bg-slate-950/80 border-2 border-dashed border-amber-500/40 p-8 text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-white">🔒 Perfil Privado</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {user.name} ha configurado su cuenta como <strong>privada</strong>. Solo el propietario puede entrar y consultar sus publicaciones, Estados espirituales, rachas y detalles misioneros.
                </p>
              </div>
            ) : (
              <>
            {/* Level Progress Bar to Next Level */}
            <div className="mt-5 pb-5 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">
                  Progreso al Nivel {user.level < 10 ? user.level + 1 : 10}
                </span>
                <span className="text-amber-400 font-extrabold tabular-nums">
                  {user.points.toLocaleString()} / {nextTier ? nextTier.minPoints.toLocaleString() : '8,000+'} pts ({progressPercent}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Player Stats Grid (4-pillar metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Retos Cumplidos</span>
                <span className="text-xl font-black text-white tabular-nums">{user.stats.challengesCompleted}</span>
                <span className="text-[10px] text-emerald-400 block font-semibold">Verificados</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Eventos JA</span>
                <span className="text-xl font-black text-white tabular-nums">{user.stats.eventsAttended}</span>
                <span className="text-[10px] text-amber-400 block font-semibold">Asistidos</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Misiones Caleb</span>
                <span className="text-xl font-black text-white tabular-nums">{user.stats.missionsDone}</span>
                <span className="text-[10px] text-orange-400 block font-semibold">En servicio</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Insignias</span>
                <span className="text-xl font-black text-white tabular-nums">{user.badges.length}</span>
                <span className="text-[10px] text-purple-400 block font-semibold">Desbloqueadas</span>
              </div>
            </div>

            {/* Streaks (Rachas espirituales) */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">🙏 Racha Oración</span>
                <strong className="text-amber-300 font-extrabold">{user.stats.prayerStreak} días</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">📖 Racha Lectura</span>
                <strong className="text-amber-300 font-extrabold">{user.stats.bibleReadingStreak} días</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">🔥 Racha Activa</span>
                <strong className="text-amber-300 font-extrabold">{user.stats.activeStreakDays} días</strong>
              </div>
            </div>

            {/* Biography */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Biografía y Testimonio
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850">
                "{user.bio}"
              </p>
            </div>

            {/* Ministries & Activities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Ministerios donde sirve:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.ministries.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Actividades en la iglesia:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.activities.map((a, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 capitalize"
                    >
                      {a.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests Tags */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Intereses seleccionados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Profile CTA if viewing self */}
            {isSelf && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isEditing ? 'Cerrar edición' : 'Editar Ficha'}</span>
                </button>
              </div>
            )}

            {/* Inline Profile Editor */}
            {isEditing && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editar Datos Públicos</h3>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Biografía:</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Iglesia local:</label>
                  <input
                    type="text"
                    value={editChurch}
                    onChange={(e) => setEditChurch(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
              </>
            )}

          </div>

          {/* Cuentas en este Dispositivo (Conmutador 1-clic) */}
          {isSelf && (
            <div className="mt-4">
              <AccountSwitcher />
            </div>
          )}

        </div>
      )}

      {/* TAB 2: POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {isSelf && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>¿Deseas compartir algo nuevo con la comunidad?</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sube fotos o videos desde tu propia galería al feed o a tus estados de 24 horas.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setCreateMediaType('photo');
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>+ Foto</span>
                </button>
                <button
                  onClick={() => {
                    setCreateMediaType('video');
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>+ Video</span>
                </button>
              </div>
            </div>
          )}

          {isProfilePrivateForViewer ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-3 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Publicaciones Privadas</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {user.name} ha configurado su cuenta como privada. Solo el propietario puede consultar sus publicaciones, fotos y videos.
              </p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <p className="text-sm font-bold text-white">No hay publicaciones de este usuario todavía.</p>
              {isSelf && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setCreateMediaType('photo');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Subir foto de galería</span>
                  </button>
                  <button
                    onClick={() => {
                      setCreateMediaType('video');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Subir video</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            userPosts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* TAB 3: RETOS CUMPLIDOS */}
      {activeTab === 'retos' && (
        <div className="space-y-3">
          {isProfilePrivateForViewer ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-3 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Retos Misioneros Privados</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                El historial de retos misioneros y evidencias espirituales de este perfil es privado. Solo el propietario puede consultar su progreso.
              </p>
            </div>
          ) : userApprovedSubmissions.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-2">
              <span className="text-3xl block">🎯</span>
              <p className="text-sm font-bold text-white">No hay retos aprobados registrados todavía.</p>
              <p className="text-xs text-slate-400">
                {isSelf 
                  ? 'Completa uno de los retos juveniles disponibles para acumular puntos y recibir tu certificación.'
                  : 'Este usuario aún no ha certificado retos en la plataforma.'}
              </p>
              {isSelf && (
                <button
                  onClick={() => setActiveTab('retos')}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Explorar Retos Juveniles
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userApprovedSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col justify-between gap-2.5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-black text-white">{sub.challengeTitle}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black">
                        +{sub.awardedPoints || sub.challengePoints} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic line-clamp-3">
                      "{sub.commentReflection}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{sub.submittedAt}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Certificado</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BADGES */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.badges.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm"
            >
              <span className="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                {b.icon}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mt-1">
                  Categoría: {b.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SETTINGS & PRIVACY (Control de Perfiles Públicos y Privados) */}
      {activeTab === 'settings' && isSelf && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Control de Privacidad y Visibilidad</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configura quién puede encontrar tu cuenta y acceder a tus publicaciones y Estados espirituales.
            </p>
          </div>

          {/* Opciones Principales de Perfil: Público vs Privado */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Tipo de Perfil
            </h3>

            {/* Opción 1: Perfil Público */}
            <div
              onClick={() => updateUserProfile({ privacy: { ...user.privacy, isProfilePublic: true } })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                user.privacy?.isProfilePublic !== false
                  ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    user.privacy?.isProfilePublic !== false
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white">Perfil Público</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Cualquier usuario registrado en la aplicación puede encontrar tu ficha en Descubrimiento Juvenil, entrar y consultar tu información, tus publicaciones y tus Estados espirituales.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="privacyProfileOption"
                  checked={user.privacy?.isProfilePublic !== false}
                  onChange={() => updateUserProfile({ privacy: { ...user.privacy, isProfilePublic: true } })}
                  className="h-4 w-4 accent-emerald-500 rounded-full mt-1 shrink-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Opción 2: Perfil Privado */}
            <div
              onClick={() => updateUserProfile({ privacy: { ...user.privacy, isProfilePublic: false } })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                user.privacy?.isProfilePublic === false
                  ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    user.privacy?.isProfilePublic === false
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white">Perfil Privado</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                        Protegido
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Únicamente tú (el propietario) puedes entrar y consultar tus publicaciones y Estados. Los demás usuarios verán tu perfil con indicación de privado y no podrán acceder a tu contenido.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="privacyProfileOption"
                  checked={user.privacy?.isProfilePublic === false}
                  onChange={() => updateUserProfile({ privacy: { ...user.privacy, isProfilePublic: false } })}
                  className="h-4 w-4 accent-amber-500 rounded-full mt-1 shrink-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Opciones Adicionales de Privacidad
            </h3>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
              <div>
                <p className="text-xs font-bold text-white">Mostrar Ubicación General</p>
                <p className="text-[11px] text-slate-400">Mostrar ciudad y país para descubrir jóvenes cercanos</p>
              </div>
              <input
                type="checkbox"
                checked={user.privacy.showLocation}
                onChange={(e) => updateUserProfile({ privacy: { ...user.privacy, showLocation: e.target.checked } })}
                className="h-4 w-4 accent-amber-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
              <div>
                <p className="text-xs font-bold text-white">Mensajes Directos</p>
                <p className="text-[11px] text-slate-400">Permitir que otros jóvenes cristianos te envíen mensajes de chat</p>
              </div>
              <input
                type="checkbox"
                checked={user.privacy.allowDirectMessages}
                onChange={(e) => updateUserProfile({ privacy: { ...user.privacy, allowDirectMessages: e.target.checked } })}
                className="h-4 w-4 accent-amber-500 rounded"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              🛡️ <strong>Seguridad Infantil y Juvenil:</strong> A Prueba de Fuego protege la privacidad de menores de edad. Nunca mostramos direcciones exactas, teléfonos o información financiera en perfiles públicos.
            </p>
          </div>
        </div>
      )}

      {/* Modal para publicar foto/video de galería desde el perfil */}
      {showCreateModal && (
        <CreatePostModal
          defaultMediaType={createMediaType}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal para ver Estados espirituales vigentes del perfil */}
      {viewingStory && (
        <StoryViewerModal
          story={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}

    </div>
  );
};
