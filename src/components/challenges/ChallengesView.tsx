import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Challenge, Badge, ChallengeSubmission } from '../../types';
import { SubmitEvidenceModal } from './SubmitEvidenceModal';
import { WeeklyConsistencyWidget } from './WeeklyConsistencyWidget';
import { BibleGames } from '../games/BibleGames';
import { DAILY_CHALLENGES_SCHEDULE } from '../../data/adventistResourcesData';
import { calculateLevel } from '../../data/seedData';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Filter,
  PlusCircle,
  FileCheck,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Trophy,
  Check,
  X,
  MapPin,
  Star,
  Gamepad2,
  UserPlus,
  RefreshCw,
  Medal,
  ChevronRight,
  Send,
  Info
} from 'lucide-react';
import { InviteFriendsModal } from '../invitations/InviteFriendsModal';

export interface SpiritualBadgeDef extends Badge {
  unlockRequirement: string;
  pointsReward: number;
  verseRef: string;
}

export const SPIRITUAL_ACHIEVEMENT_BADGES: SpiritualBadgeDef[] = [
  {
    id: 'b_orador_dia',
    name: 'Orador del día',
    icon: '🎤',
    imageUrl: '/src/assets/images/badge_orador_dia_1791150552233.jpg',
    description: 'Proclamó con valentía y unción la palabra de Dios ante la congregación o grupo juvenil JA.',
    category: 'fe',
    unlockRequirement: 'Participar como orador en el culto JA, dar un tema bíblico o dirigir la meditación devocional.',
    pointsReward: 250,
    verseRef: '1 Pedro 4:11',
  },
  {
    id: 'b_servidor_fiel',
    name: 'Servidor fiel',
    icon: '❤️',
    imageUrl: '/src/assets/images/badge_servidor_fiel_1791150561583.jpg',
    description: 'Manifestó el amor de Cristo mediante servicio generoso a los necesitados, la comunidad y la iglesia.',
    category: 'servicio',
    unlockRequirement: 'Realizar una obra solidaria de impacto: alimentos a necesitados, visita a enfermos o apoyo al prójimo.',
    pointsReward: 220,
    verseRef: 'Gálatas 5:13',
  },
  {
    id: 'b_estudiante_biblia',
    name: 'Estudiante de la Biblia',
    icon: '📖',
    imageUrl: '/src/assets/images/badge_estudiante_biblia_1791150570985.jpg',
    description: 'Profundizó diligentemente en el estudio bíblico personal, lección de Escuela Sabática y memorización.',
    category: 'fe',
    unlockRequirement: 'Completar 7 días de estudio diario de la Biblia y repaso de la lección de Escuela Sabática.',
    pointsReward: 200,
    verseRef: '2 Timoteo 3:16-17',
  },
];

export const ChallengesView: React.FC = () => {
  const { challenges, submissions, currentUser, allUsers, setActiveTab, completeDailyChallenge } = useApp();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'available' | 'my_submissions' | 'ranking' | 'public_feed' | 'spiritual_badges' | 'games'>('available');

  // Daily Challenge State
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const dailySchedule = DAILY_CHALLENGES_SCHEDULE.find(d => d.dayOfWeek === currentDayOfWeek) || DAILY_CHALLENGES_SCHEDULE[0];
  const hoursLeft = 23 - now.getHours();
  const minutesLeft = 59 - now.getMinutes();

  // Asignar icono/medallón 3D temático para el reto de hoy
  const associatedSpiritualBadge = 
    (currentDayOfWeek === 6 || currentDayOfWeek === 3) ? SPIRITUAL_ACHIEVEMENT_BADGES[0] : // Orador del día
    (currentDayOfWeek === 4 || currentDayOfWeek === 0) ? SPIRITUAL_ACHIEVEMENT_BADGES[1] : // Servidor fiel
    SPIRITUAL_ACHIEVEMENT_BADGES[2]; // Estudiante de la Biblia

  const todayBadgeId = `badge_daily_${currentDayOfWeek}`;
  const todayBadge: Badge = {
    id: todayBadgeId,
    name: `Insignia ${dailySchedule.dayName}: ${dailySchedule.theme}`,
    icon: dailySchedule.icon,
    imageUrl: associatedSpiritualBadge.imageUrl,
    description: `Completó el reto diario de ${dailySchedule.dayName} («${dailySchedule.title}»)`,
    category: 'reto',
    unlockedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  const hasCompletedToday = 
    currentUser.badges.some(b => b.id === todayBadgeId) ||
    submissions.some(s => s.userId === currentUser.id && (s.challengeId.startsWith(`daily_${currentDayOfWeek}`) || s.challengeTitle.includes(dailySchedule.dayName)));

  // Daily Modal, Celebration Modal, Spiritual Badge Modal and Golden Flash states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [selectedSpiritualBadge, setSelectedSpiritualBadge] = useState<SpiritualBadgeDef | null>(null);
  const [dailyReflection, setDailyReflection] = useState('');
  const [dailyLocation, setDailyLocation] = useState(currentUser.city || 'Buenaventura, Colombia');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedBadgeAlert, setUnlockedBadgeAlert] = useState<Badge | null>(null);
  const [showGoldenFlash, setShowGoldenFlash] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Animación visual de confeti y destello dorado
  const triggerGoldenBadgeCelebration = () => {
    setShowGoldenFlash(true);
    setTimeout(() => setShowGoldenFlash(false), 900);

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 100]);
      }
    } catch {
      // safe fallback
    }

    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#FFD700', '#F59E0B', '#F97316', '#EF4444', '#10B981', '#FFFFFF'],
        ticks: 250,
        gravity: 1.1,
        scalar: 1.25,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 },
          colors: ['#FFD700', '#FBBF24', '#F59E0B', '#FFFFFF'],
          ticks: 220,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#FFD700', '#FBBF24', '#F59E0B', '#FFFFFF'],
          ticks: 220,
        });
      }, 140);
    } catch (e) {
      console.warn('Efecto confeti fallback:', e);
    }
  };

  const handleOpenDailyModal = () => {
    setShowDailyModal(true);
  };

  const handleClaimDailyReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyReflection.trim()) return;

    setIsSubmitting(true);
    const challengeId = `daily_${currentDayOfWeek}_${now.toISOString().slice(0, 10)}`;

    try {
      const result = await completeDailyChallenge(
        todayBadge,
        dailySchedule.points,
        challengeId,
        dailyReflection.trim()
      );

      setShowDailyModal(false);
      setDailyReflection('');
      setUnlockedBadgeAlert(result.badge);

      triggerGoldenBadgeCelebration();
    } catch (err) {
      console.error('Error al reclamar recompensa del reto diario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimSpiritualBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpiritualBadge || !dailyReflection.trim()) return;

    setIsSubmitting(true);
    const challengeId = `spiritual_${selectedSpiritualBadge.id}_${Date.now()}`;

    try {
      const badgeToAward: Badge = {
        id: selectedSpiritualBadge.id,
        name: selectedSpiritualBadge.name,
        icon: selectedSpiritualBadge.icon,
        imageUrl: selectedSpiritualBadge.imageUrl,
        description: selectedSpiritualBadge.description,
        category: selectedSpiritualBadge.category,
        unlockedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      const result = await completeDailyChallenge(
        badgeToAward,
        selectedSpiritualBadge.pointsReward,
        challengeId,
        dailyReflection.trim()
      );

      setSelectedSpiritualBadge(null);
      setDailyReflection('');
      setUnlockedBadgeAlert(result.badge);

      triggerGoldenBadgeCelebration();
    } catch (err) {
      console.error('Error al certificar insignia espiritual:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User stats & level calculation
  const currentPoints = currentUser.points || 0;
  const userLevelInfo = calculateLevel(currentPoints);

  // Level Progression Calculation:
  // 1: Participante (0-49)
  // 2: Colaborador (50-149)
  // 3: Misionero activo (150-299)
  // 4: Embajador juvenil (300-499)
  // 5: Líder de retos (500+)
  const levelProgress = useMemo(() => {
    if (currentPoints < 50) {
      const nextTarget = 50;
      const ptsNeeded = nextTarget - currentPoints;
      const pct = Math.min(100, Math.round((currentPoints / nextTarget) * 100));
      return { nextTarget, nextName: 'Colaborador', ptsNeeded, pct, currentTier: 'Participante' };
    } else if (currentPoints < 150) {
      const nextTarget = 150;
      const ptsNeeded = nextTarget - currentPoints;
      const pct = Math.min(100, Math.round(((currentPoints - 50) / 100) * 100));
      return { nextTarget, nextName: 'Misionero activo', ptsNeeded, pct, currentTier: 'Colaborador' };
    } else if (currentPoints < 300) {
      const nextTarget = 300;
      const ptsNeeded = nextTarget - currentPoints;
      const pct = Math.min(100, Math.round(((currentPoints - 150) / 150) * 100));
      return { nextTarget, nextName: 'Embajador juvenil', ptsNeeded, pct, currentTier: 'Misionero activo' };
    } else if (currentPoints < 500) {
      const nextTarget = 500;
      const ptsNeeded = nextTarget - currentPoints;
      const pct = Math.min(100, Math.round(((currentPoints - 300) / 200) * 100));
      return { nextTarget, nextName: 'Líder de retos', ptsNeeded, pct, currentTier: 'Embajador juvenil' };
    } else {
      return { nextTarget: 500, nextName: 'Nivel Máximo', ptsNeeded: 0, pct: 100, currentTier: 'Líder de retos' };
    }
  }, [currentPoints]);

  const mySubmissions = useMemo(() => {
    return submissions.filter(s => s.userId === currentUser.id);
  }, [submissions, currentUser.id]);

  const myApprovedCount = useMemo(() => {
    return mySubmissions.filter(s => s.status === 'approved').length;
  }, [mySubmissions]);

  const myPendingCount = useMemo(() => {
    return mySubmissions.filter(s => s.status === 'pending').length;
  }, [mySubmissions]);

  // General Ranking Table of Registered Users
  // Tie-breakers: 1) Points, 2) Completed retos count, 3) Alphabetical
  const generalRanking = useMemo(() => {
    const list = allUsers.map(u => {
      const approvedCount = submissions.filter(s => s.userId === u.id && s.status === 'approved').length;
      const challengesDone = Math.max(approvedCount, u.completedChallengesCount || 0, u.stats?.challengesCompleted || 0);
      return {
        id: u.id,
        name: `${u.name} ${u.lastName}`.trim() || u.username,
        username: u.username,
        avatar: u.avatar,
        church: u.church,
        city: u.city,
        points: u.points || 0,
        level: u.level || 1,
        levelName: u.levelName || calculateLevel(u.points || 0).name,
        completedChallengesCount: challengesDone,
        isCurrent: u.id === currentUser.id,
      };
    });

    list.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.completedChallengesCount !== a.completedChallengesCount) return b.completedChallengesCount - a.completedChallengesCount;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [allUsers, submissions, currentUser.id]);

  // Public wall of approved submissions (respecting privacy: no personal phone numbers, no sensitive details)
  const publicApprovedSubmissions = useMemo(() => {
    return submissions
      .filter(s => s.status === 'approved')
      .slice(0, 30);
  }, [submissions]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      if (filterDifficulty === 'all') return true;
      if (filterDifficulty === 'Fácil') return c.difficulty === 'Fácil';
      if (filterDifficulty === 'Medio') return c.difficulty === 'Medio';
      if (filterDifficulty === 'Difícil') return c.difficulty === 'Difícil';
      return (c.difficulty as string) === filterDifficulty;
    });
  }, [challenges, filterDifficulty]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Hero Header & User Stats Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-600/20 via-orange-950/40 to-slate-950 border border-amber-500/30 p-5 sm:p-6 mb-6 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300">
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>RETOS JUVENILES • A PRUEBA DE FUEGO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
              Retos Juveniles & Misiones de Fe
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cumple retos cristianos, sube tus evidencias con verificación responsable, acumula puntos y avanza en la clasificación general.
            </p>
          </div>

          {/* User Score & Level Badge */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-xl flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tu Nivel Actual</span>
                <span className="text-sm font-black text-white">{levelProgress.currentTier}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Puntos</span>
                <div className="flex items-center gap-1 text-lg font-black text-amber-400 tabular-nums">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>{currentPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Progreso hacia {levelProgress.nextName}</span>
                <span className="font-bold text-amber-300">
                  {levelProgress.ptsNeeded > 0 ? `${levelProgress.ptsNeeded} pts faltantes` : '¡Nivel máximo!'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.pct}%` }}
                />
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
              <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 font-bold block">{myApprovedCount}</span>
                <span className="text-slate-400">Aprobados</span>
              </div>
              <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 font-bold block">{myPendingCount}</span>
                <span className="text-slate-400">En revisión</span>
              </div>
              <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-sky-400 font-bold block">{challenges.length}</span>
                <span className="text-slate-400">Disponibles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Spotlight Card */}
      <div className={`rounded-3xl border-2 p-5 mb-6 shadow-xl relative overflow-hidden transition-all ${
        hasCompletedToday
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40'
          : 'bg-gradient-to-r from-amber-500/25 via-orange-600/20 to-slate-950 border-amber-500/50'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-md ${
                hasCompletedToday ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                <Zap className="h-3.5 w-3.5 fill-current" />
                Reto Diario: {dailySchedule.dayName}
              </span>

              {hasCompletedToday ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Insignia Desbloqueada y Guardada en Firestore
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Termina en: {hoursLeft}h {minutesLeft}m
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white">
              {dailySchedule.title}
            </h2>

            <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
              {dailySchedule.description}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="text-amber-400 font-bold italic flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {dailySchedule.verseRef}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Recompensa: Insignia 3D + {dailySchedule.points} pts</span>
            </div>
          </div>

          {/* Reward & Button Column */}
          <div className="flex flex-col items-end sm:items-center gap-2 shrink-0 self-end sm:self-center">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 bg-amber-500/10 shrink-0 flex items-center justify-center">
                {todayBadge.imageUrl ? (
                  <img 
                    src={todayBadge.imageUrl} 
                    alt={todayBadge.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{dailySchedule.icon}</span>
                )}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Insignia a Obtener
                </span>
                <span className="text-xs font-black text-white block truncate max-w-[130px]">
                  {todayBadge.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-extrabold">
                  +{dailySchedule.points} pts
                </span>
              </div>
            </div>

            {hasCompletedToday ? (
              <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>¡Reto Cumplido Hoy!</span>
              </div>
            ) : (
              <button
                onClick={handleOpenDailyModal}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
              >
                <Award className="h-4 w-4 fill-slate-950" />
                <span>Completar y Ganar Insignia</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Consistency Widget */}
      <WeeklyConsistencyWidget className="mb-6" />

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-5 gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setViewTab('available')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'available'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Retos de Misión ({challenges.length})</span>
          </button>

          <button
            onClick={() => setViewTab('my_submissions')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'my_submissions'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Mis Evidencias ({mySubmissions.length})</span>
          </button>

          <button
            onClick={() => setViewTab('ranking')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'ranking'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Clasificación General</span>
          </button>

          <button
            onClick={() => setViewTab('public_feed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'public_feed'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Retos Cumplidos</span>
          </button>

          <button
            onClick={() => setViewTab('spiritual_badges')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'spiritual_badges'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Star className="h-4 w-4 fill-current" />
            <span>Insignias 3D</span>
          </button>

          <button
            onClick={() => setViewTab('games')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'games'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Juegos Bíblicos</span>
          </button>
        </div>

        {/* Filter difficulty on available tab */}
        {viewTab === 'available' && (
          <div className="flex items-center gap-1 text-xs self-end sm:self-center">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las dificultades</option>
              <option value="Fácil">Fácil (10-15 pts)</option>
              <option value="Medio">Intermedio (20-25 pts)</option>
              <option value="Difícil">Avanzado (35-40 pts)</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: AVAILABLE MISSION CHALLENGES */}
      {viewTab === 'available' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map((challenge) => {
              const mySub = mySubmissions.find(s => s.challengeId === challenge.id);
              const isApproved = mySub?.status === 'approved';
              const isPending = mySub?.status === 'pending';
              const needsMoreInfo = mySub?.status === 'more_info';

              return (
                <div
                  key={challenge.id}
                  className={`rounded-3xl bg-slate-900 border transition-all p-5 flex flex-col justify-between shadow-lg relative overflow-hidden ${
                    isApproved ? 'border-emerald-500/40 bg-emerald-950/10' :
                    isPending ? 'border-amber-500/40 bg-amber-950/10' :
                    needsMoreInfo ? 'border-orange-500/40 bg-orange-950/10' :
                    'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-3xl p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        {challenge.icon}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-amber-400 text-xs font-black border border-slate-800 tabular-nums">
                          +{challenge.points} pts
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          challenge.difficulty === 'Fácil' ? 'bg-emerald-500/20 text-emerald-300' :
                          challenge.difficulty === 'Medio' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-orange-500/20 text-orange-300'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
                      {challenge.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {challenge.description}
                    </p>

                    {challenge.instructions && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 mb-3 text-[11px] text-slate-300">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                          Instrucciones:
                        </span>
                        <p>{challenge.instructions}</p>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-850 text-[11px] text-slate-400 mb-4">
                      <strong className="text-slate-300">Evidencia requerida:</strong> {challenge.requiredEvidence}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {challenge.participantsCount || 0} participantes
                    </span>

                    {isApproved ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        Aprobado (+{challenge.points} pts)
                      </span>
                    ) : isPending ? (
                      <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs">
                        <Clock className="h-4 w-4" />
                        En revisión
                      </span>
                    ) : needsMoreInfo ? (
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs hover:bg-orange-400 transition-colors flex items-center gap-1 shadow-md"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Completar Evidencia</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {challenge.id === 'ch_reto_1_invitar_amigo' && (
                          <button
                            type="button"
                            onClick={() => setShowInviteModal(true)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-750 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-700"
                            title="Generar enlace de invitación"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Invitar</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-colors shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Presentar Evidencia</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MY SUBMISSIONS & HISTORY */}
      {viewTab === 'my_submissions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Mi Historial de Retos & Certificaciones</h3>
              <p className="text-xs text-slate-400">
                Consulta el estado de cada evidencia presentada y los puntos acreditados a tu cuenta.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              {mySubmissions.length} participaciones registradas
            </div>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3">
              <FileCheck className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Aún no has presentado evidencias de retos.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explora los retos de misión en la pestaña principal, realiza la actividad con fe y envía tu evidencia fotográfica o testimonio.
              </p>
              <button
                onClick={() => setViewTab('available')}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Ver Retos Disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((sub) => {
                const challenge = challenges.find(c => c.id === sub.challengeId);

                return (
                  <div 
                    key={sub.id} 
                    className={`p-4 rounded-3xl bg-slate-900 border transition-all flex flex-col gap-3 shadow-md ${
                      sub.status === 'approved' ? 'border-emerald-500/30' :
                      sub.status === 'pending' ? 'border-amber-500/30' :
                      sub.status === 'more_info' ? 'border-orange-500/30' :
                      'border-red-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{sub.challengeTitle}</h4>
                          <span className="text-[10px] text-slate-400">
                            Enviado: {sub.submittedAt} {sub.approximateLocation && `• ${sub.approximateLocation}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-amber-400 text-xs font-black border border-slate-800">
                          {sub.status === 'approved' ? `+${sub.awardedPoints || sub.challengePoints} pts ganados` : `+${sub.challengePoints} pts potenciales`}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          sub.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          sub.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          sub.status === 'more_info' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                          'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {sub.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {sub.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                          {sub.status === 'more_info' && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>
                            {sub.status === 'approved' ? 'Aprobado y Acreditado' :
                             sub.status === 'pending' ? 'En Revisión Responsable' :
                             sub.status === 'more_info' ? 'Requiere Corrección' :
                             'No Aprobado'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      "{sub.commentReflection}"
                    </p>

                    {/* Metadata details if study/verse/materials were attached */}
                    {(sub.studyTheme || sub.bibleVerseUsed || sub.materialsUsed) && (
                      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {sub.studyTheme && (
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Tema Bíblico:</span>
                            <span className="text-slate-200">{sub.studyTheme}</span>
                          </div>
                        )}
                        {sub.bibleVerseUsed && (
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Pasaje Bíblico:</span>
                            <span className="text-amber-300">{sub.bibleVerseUsed}</span>
                          </div>
                        )}
                        {sub.materialsUsed && (
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Literatura / Material:</span>
                            <span className="text-slate-200">{sub.materialsUsed}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Reason or Feedback */}
                    {(sub.verificationReason || sub.moderatorFeedback) && (
                      <div className={`p-2.5 rounded-2xl text-xs space-y-0.5 ${
                        sub.status === 'approved' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' :
                        sub.status === 'more_info' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-200' :
                        'bg-slate-950 border border-slate-800 text-slate-300'
                      }`}>
                        <div className="flex items-center gap-1 font-bold">
                          <Info className="w-3.5 h-3.5" />
                          <span>Nota de revisión:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {sub.verificationReason || sub.moderatorFeedback}
                        </p>
                      </div>
                    )}

                    {/* Action button if more info is needed */}
                    {sub.status === 'more_info' && challenge && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>Corregir y Reenviar Evidencia</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CLASIFICACIÓN GENERAL (LEADERBOARD) */}
      {viewTab === 'ranking' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Clasificación de Retos Juveniles</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Puntaje acumulado por los jóvenes en misiones evangelísticas, servicio y retos de fe.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Desempate: <strong>1° Retos completados</strong> • <strong>2° Orden alfabético</strong>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Posición</th>
                    <th className="py-3 px-4">Participante</th>
                    <th className="py-3 px-4">Nivel</th>
                    <th className="py-3 px-4 text-center">Retos Cumplidos</th>
                    <th className="py-3 px-4 text-right">Puntos Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {generalRanking.map((participant, index) => {
                    const rank = index + 1;
                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;

                    return (
                      <tr 
                        key={participant.id}
                        className={`transition-colors ${
                          participant.isCurrent 
                            ? 'bg-amber-500/10 font-bold border-l-4 border-amber-400' 
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Position */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isTop1 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shadow-amber-500/30">
                                🥇
                              </span>
                            ) : isTop2 ? (
                              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-xs">
                                🥈
                              </span>
                            ) : isTop3 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
                                {rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Participant */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs">{participant.name}</span>
                                {participant.isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">
                                @{participant.username} {participant.church ? `• ${participant.church}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-bold">
                            {participant.levelName}
                          </span>
                        </td>

                        {/* Retos Cumplidos */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-black text-xs">
                            {participant.completedChallengesCount}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="text-sm font-black text-amber-400 tabular-nums">
                            {participant.points.toLocaleString()} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PUBLIC WALL OF COMPLETED CHALLENGES (Respecting Privacy) */}
      {viewTab === 'public_feed' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Retos Cumplidos Recientemente</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Inspírate con las misiones completadas por los jóvenes de la comunidad.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
              {publicApprovedSubmissions.length} misiones certificadas
            </div>
          </div>

          {publicApprovedSubmissions.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Aún no hay retos certificados en el muro público.</p>
              <p className="text-xs text-slate-400">
                ¡Sé el primero en cumplir una misión y aparecer aquí!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publicApprovedSubmissions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={sub.userAvatar} 
                          alt={sub.userName} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0" 
                        />
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {sub.userName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {sub.userChurch || sub.approximateLocation || 'Joven Adventista'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black shrink-0">
                        +{sub.awardedPoints || sub.challengePoints} pts
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-850 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                        Reto cumplido:
                      </span>
                      <p className="text-xs font-bold text-white">{sub.challengeTitle}</p>
                    </div>

                    <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed">
                      "{sub.commentReflection}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{sub.submittedAt}</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verificado</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: SPIRITUAL BADGES (Insignias Personalizadas Generadas) */}
      {viewTab === 'spiritual_badges' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-950 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Medallones 3D de Logros Espirituales
              </span>
              <h3 className="text-sm font-bold text-white">
                Insignias Espirituales Especiales para Jóvenes Adventistas
              </h3>
              <p className="text-xs text-slate-300">
                Certifica tu servicio como orador, servidor generoso o estudiante fiel de la Biblia para agregarlas a tu perfil en Firestore.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SPIRITUAL_ACHIEVEMENT_BADGES.map((badge) => {
              const isUnlocked = (currentUser?.badges || []).some((b) => b.id === badge.id);

              return (
                <div
                  key={badge.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-500/10 shadow-lg'
                      : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60 shadow-lg'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform bg-slate-950">
                          <img
                            src={badge.imageUrl}
                            alt={badge.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isUnlocked && (
                          <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black block">
                          +{badge.pointsReward} pts
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase">
                          {badge.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-white mb-1">
                      {badge.name}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {badge.description}
                    </p>

                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1 mb-4 text-[11px]">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Requisito para certificar:
                      </span>
                      <p className="text-slate-200">{badge.unlockRequirement}</p>
                      <span className="text-amber-400 italic text-[10px] block pt-0.5 font-semibold">
                        📖 {badge.verseRef}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    {isUnlocked ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Desbloqueada en Firestore</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSpiritualBadge(badge)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
                      >
                        <Award className="h-4 w-4 fill-slate-950" />
                        <span>Certificar y Ganar Medallón</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 6: JUEGOS BÍBLICOS JA */}
      {viewTab === 'games' && (
        <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-1 sm:p-3 animate-in fade-in duration-200">
          <BibleGames />
        </div>
      )}

      {/* 1. Modal: Subir Evidencia para Retos Regulares */}
      {selectedChallenge && (
        <SubmitEvidenceModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onSuccess={() => setViewTab('my_submissions')}
        />
      )}

      {/* 2. Modal: Completar Reto Diario & Reclamar Insignia Virtual */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Reto Diario: {dailySchedule.dayName}
                </span>
                <h3 className="text-base font-black text-white">{dailySchedule.title}</h3>
              </div>
              <button
                onClick={() => setShowDailyModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Reward Card Banner con Medallón 3D */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-slate-950 border border-amber-500/40 flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg shrink-0 bg-slate-950 flex items-center justify-center">
                {todayBadge.imageUrl ? (
                  <img
                    src={todayBadge.imageUrl}
                    alt={todayBadge.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{dailySchedule.icon}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Insignia Virtual a Desbloquear:
                </span>
                <h4 className="text-sm font-black text-white">{todayBadge.name}</h4>
                <p className="text-[11px] text-slate-300">
                  Recompensa inmediata: <strong className="text-emerald-400">+{dailySchedule.points} puntos</strong> al perfil en Firestore.
                </p>
              </div>
            </div>

            {/* Instruction */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-slate-200 block">Misión del Día:</span>
              <p>{dailySchedule.description}</p>
              <p className="text-amber-400 italic text-[11px] pt-1">
                {dailySchedule.verseRef}: {dailySchedule.verseText}
              </p>
            </div>

            {/* Completion Form */}
            <form onSubmit={handleClaimDailyReward} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Escribe cómo cumpliste el reto de hoy (Testimonio o evidencia):
                </label>
                <textarea
                  required
                  rows={3}
                  value={dailyReflection}
                  onChange={(e) => setDailyReflection(e.target.value)}
                  placeholder="Ej: Hoy compartí con mi familia el devocional y oramos por los planes de la semana..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ubicación o Iglesia Local:
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={dailyLocation}
                    onChange={(e) => setDailyLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !dailyReflection.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Award className="h-4 w-4 fill-slate-950" />
                  <span>{isSubmitting ? 'Guardando en Firestore...' : 'Reclamar Insignia y Puntos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Certificar Insignia Espiritual Personalizada */}
      {selectedSpiritualBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Certificación de Logro Espiritual JA
                </span>
                <h3 className="text-base font-black text-white">{selectedSpiritualBadge.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpiritualBadge(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Medallon Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-slate-950 border border-amber-500/40 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0 bg-slate-950">
                <img
                  src={selectedSpiritualBadge.imageUrl}
                  alt={selectedSpiritualBadge.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{selectedSpiritualBadge.name}</h4>
                <p className="text-xs text-slate-300">{selectedSpiritualBadge.description}</p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black">
                    +{selectedSpiritualBadge.pointsReward} pts
                  </span>
                  <span className="text-slate-400 font-bold italic">
                    {selectedSpiritualBadge.verseRef}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirement note */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300">
              <span className="font-bold text-amber-300 block mb-0.5">Requisito a certificar:</span>
              <p>{selectedSpiritualBadge.unlockRequirement}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleClaimSpiritualBadge} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Describe tu experiencia y testimonio para certificar este logro:
                </label>
                <textarea
                  required
                  rows={3}
                  value={dailyReflection}
                  onChange={(e) => setDailyReflection(e.target.value)}
                  placeholder={`Ej: Esta semana completé la labor de ${selectedSpiritualBadge.name.toLowerCase()} compartiendo con la hermandad...`}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lugar o Iglesia Local:
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={dailyLocation}
                    onChange={(e) => setDailyLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSpiritualBadge(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !dailyReflection.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Award className="h-4 w-4 fill-slate-950" />
                  <span>{isSubmitting ? 'Guardando en Firestore...' : 'Certificar y Desbloquear Insignia'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay: Destello Dorado de Feedback Visual (Golden Flash) */}
      {showGoldenFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[120vw] h-[120vh] bg-gradient-to-r from-amber-400/35 via-yellow-300/45 to-orange-400/35 rounded-full blur-3xl animate-ping" />
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs transition-opacity duration-700" />
        </div>
      )}

      {/* 4. Celebration Modal */}
      {unlockedBadgeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-250">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl p-6 text-center space-y-4 relative overflow-hidden shadow-amber-500/30">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative inline-flex items-center justify-center p-6 my-2">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-orange-500/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-400/70 animate-[spin_8s_linear_infinite]" />
              <div className="absolute -inset-4 rounded-full border border-amber-300/40 animate-[spin_12s_linear_infinite_reverse]" />

              <span className="absolute -top-2 -left-2 text-xl animate-bounce">✨</span>
              <span className="absolute -bottom-1 -right-2 text-xl animate-bounce delay-150">🌟</span>
              <span className="absolute top-1/2 -right-4 text-base animate-pulse">⚡</span>
              <span className="absolute top-1/2 -left-4 text-base animate-pulse delay-200">🔥</span>

              <div className="relative z-10 w-28 h-28 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl shadow-amber-500/50 flex items-center justify-center bg-slate-950">
                {unlockedBadgeAlert.imageUrl ? (
                  <img
                    src={unlockedBadgeAlert.imageUrl}
                    alt={unlockedBadgeAlert.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{unlockedBadgeAlert.icon}</span>
                )}
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[11px] font-black uppercase shadow-lg shadow-amber-500/30 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-slate-950" />
                ¡NUEVA INSIGNIA DESBLOQUEADA!
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                {unlockedBadgeAlert.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                {unlockedBadgeAlert.description}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-slate-400">
                <span>Puntos sumados:</span>
                <span className="text-emerald-400 font-black text-sm">+{dailySchedule.points} pts</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Progreso en Firestore:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sincronizado en la nube
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2 relative z-10">
              <button
                type="button"
                onClick={triggerGoldenBadgeCelebration}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🎉 Lanzar Confeti & Destello de Nuevo</span>
              </button>

              <button
                onClick={() => {
                  setUnlockedBadgeAlert(null);
                  setActiveTab('perfil');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                Ver en Mi Ficha de Jugador
              </button>

              <button
                onClick={() => setUnlockedBadgeAlert(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        defaultActivity="app"
        defaultActivityTitle="Reto Misionero: Invita a un amigo"
      />

    </div>
  );
};
