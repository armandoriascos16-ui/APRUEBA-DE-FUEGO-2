import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { compressImageFromGallery } from '../../utils/mediaUtils';
import { auth } from '../../firebase/config';
import { 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Camera, 
  Church, 
  Globe, 
  User, 
  Heart,
  BookOpen,
  Music,
  Compass,
  Mic,
  Activity,
  Film,
  Users
} from 'lucide-react';

interface OnboardingFlowProps {
  onCancel?: () => void;
  initialUserData?: {
    uid?: string;
    email?: string;
    name?: string;
    avatar?: string;
  };
  onOpenAuthModal?: () => void;
}

const ONBOARDING_SLIDES = [
  {
    step: 1,
    title: 'Conecta con jóvenes que comparten tu fe',
    description: 'Encuentra hermanos en Cristo de tu iglesia local, distrito, unión y de todo el mundo que viven con el fuego del Espíritu Santo.',
    icon: Users,
    bgGradient: 'from-blue-600 via-indigo-600 to-amber-500',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    badge: 'Comunidad Adventista Global',
  },
  {
    step: 2,
    title: 'Comparte tus experiencias, actividades y testimonios',
    description: 'Sube fotos, videos, historias de 24h y reflexiones que edifiquen y muestren las grandes maravillas que Dios hace en tu vida.',
    icon: Sparkles,
    bgGradient: 'from-amber-500 via-orange-600 to-red-600',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    badge: 'Edificación & Alabanza',
  },
  {
    step: 3,
    title: 'Descubre comunidades y actividades',
    description: 'Participa en campamentos JA, Conquistadores, Misión Caleb, grupos pequeños y proyectos de impacto en tu ciudad.',
    icon: Compass,
    bgGradient: 'from-emerald-600 via-teal-600 to-blue-600',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&q=80',
    badge: 'Misión en Acción',
  },
  {
    step: 4,
    title: 'Crezcamos juntos',
    description: 'Fortalece tus hábitos con planes bíblicos diarios, muro de oración mutua y desafíos espirituales para ser a prueba de fuego.',
    icon: Flame,
    bgGradient: 'from-blue-600 via-indigo-700 to-purple-800',
    image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80',
    badge: 'Fe Inquebrantable',
  },
];

const REQUIRED_INTERESTS = [
  { id: 'Fe', label: 'Fe', emoji: '🙏' },
  { id: 'Biblia', label: 'Biblia', emoji: '📖' },
  { id: 'Música', label: 'Música', emoji: '🎵' },
  { id: 'Conquistadores', label: 'Conquistadores', emoji: '⛺' },
  { id: 'Misión', label: 'Misión', emoji: '🌎' },
  { id: 'Evangelismo', label: 'Evangelismo', emoji: '🎤' },
  { id: 'Actividades', label: 'Actividades', emoji: '🏃' },
  { id: 'Contenido', label: 'Contenido', emoji: '🎥' },
  { id: 'Comunidad', label: 'Comunidad', emoji: '👥' },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onCancel, 
  initialUserData, 
  onOpenAuthModal 
}) => {
  const { registerUser, setActiveTab } = useApp();

  // Step 1 to 4: Slides; Step 5: Profile Data; Step 6: Interests Selection
  const [currentSlide, setCurrentSlide] = useState(1);
  const [inProfileSetup, setInProfileSetup] = useState(false);
  const [inInterestsSetup, setInInterestsSetup] = useState(false);

  // Profile Form
  const [name, setName] = useState(initialUserData?.name || '');
  const [country, setCountry] = useState('Colombia');
  const [church, setChurch] = useState('Iglesia Adventista Central');
  const [avatar, setAvatar] = useState(initialUserData?.avatar || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Fe', 'Biblia', 'Música', 'Misión']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFromGallery(file, 400, 400, 0.85);
      setAvatar(res.dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNextSlide = () => {
    if (currentSlide < 4) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setInProfileSetup(true);
    }
  };

  const handleFinishProfileSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setInProfileSetup(false);
    setInInterestsSetup(true);
  };

  const handleFinalizeOnboarding = () => {
    const authUid = initialUserData?.uid || auth.currentUser?.uid;
    if (!authUid) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }

    registerUser({
      id: authUid,
      email: initialUserData?.email || auth.currentUser?.email || undefined,
      name: name.trim() || initialUserData?.name || 'Joven Cristiano',
      country,
      church,
      avatar,
      interests: selectedInterests,
    });
    localStorage.setItem('apdf_registered', 'true');
    setActiveTab('inicio');
  };

  const activeSlideData = ONBOARDING_SLIDES[currentSlide - 1];

  // 1. CARROUSEL DE 4 PANTALLAS INTRODUCTORIAS
  if (!inProfileSetup && !inInterestsSetup) {
    const IconComp = activeSlideData.icon;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
        
        {/* Top skip & indicators */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            {ONBOARDING_SLIDES.map((s) => (
              <div 
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === s.step 
                    ? 'w-8 bg-blue-500' 
                    : currentSlide > s.step 
                    ? 'w-3 bg-blue-700' 
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <span className="text-xs text-amber-400 font-bold px-2 py-1">
            Registro JA
          </span>
        </div>

        {/* Center Illustration Card */}
        <div className="my-auto py-6 flex flex-col items-center text-center space-y-6">
          <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 group">
            <img
              src={activeSlideData.image}
              alt={activeSlideData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-white/10">
              <IconComp className="h-3 w-3 text-amber-400" />
              <span>{activeSlideData.badge}</span>
            </div>

            <div className="absolute bottom-4 inset-x-4">
              <span className="text-[11px] font-black tracking-widest text-blue-400 uppercase">
                Paso {activeSlideData.step} de 4
              </span>
            </div>
          </div>

          <div className="space-y-3 px-2">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight font-heading">
              {activeSlideData.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              {activeSlideData.description}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 pb-safe space-y-3">
          <button
            onClick={handleNextSlide}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{currentSlide === 4 ? 'Empezar mi perfil' : 'Continuar'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors text-center"
            >
              ¿Ya tienes cuenta? <span className="text-blue-400 font-bold underline">Iniciar sesión</span>
            </button>
          )}
        </div>

      </div>
    );
  }

  // 2. CONFIGURACIÓN DE PERFIL BÁSICO (Nombre, Foto de Galería, País, Iglesia)
  if (inProfileSetup) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleAvatarFile} 
          className="hidden" 
        />

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setInProfileSetup(false)}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-amber-400">Paso 2: Tu Identidad</span>
          <div className="w-8" />
        </div>

        <form onSubmit={handleFinishProfileSetup} className="my-auto py-4 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white font-heading">
              Crea tu perfil de joven cristiano
            </h2>
            <p className="text-xs text-slate-400">
              Personaliza tu presencia en la red social adventista
            </p>
          </div>

          {/* Avatar Picker with Gallery/Camera */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group">
              <div className="h-24 w-24 rounded-3xl overflow-hidden ring-4 ring-blue-500/40 shadow-xl flex items-center justify-center bg-slate-900">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-300">
                    <User className="h-10 w-10 text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-1">Sin foto</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-blue-600 text-white shadow-md hover:bg-blue-500 transition-colors"
                title="Subir foto desde tu galería"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                📷 {avatar ? 'Cambiar foto de galería' : 'Subir foto (opcional)'}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="text-xs text-slate-400 hover:text-red-400 font-semibold"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Tu Nombre Completo:
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-blue-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Daniel Gómez"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              País:
            </label>
            <div className="relative">
              <Globe className="h-4 w-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej: Colombia, México, Perú, etc."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Church */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Iglesia Local o Congregación:
            </label>
            <div className="relative">
              <Church className="h-4 w-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="Ej: Iglesia Adventista Central"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>Siguiente: Tus intereses</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

      </div>
    );
  }

  // 3. SELECCIÓN DE INTERESES (Fe, Biblia, Música, Conquistadores, Misión, Evangelismo, Actividades, Contenido, Comunidad)
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={() => {
            setInInterestsSetup(false);
            setInProfileSetup(true);
          }}
          className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-amber-400">Paso 3: Tus Intereses</span>
        <div className="w-8" />
      </div>

      <div className="my-auto py-4 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white font-heading">
            ¿Qué temas te inspiran más?
          </h2>
          <p className="text-xs text-slate-400">
            Personalizaremos tu feed social y actividades sugeridas según lo que elijas.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {REQUIRED_INTERESTS.map((item) => {
            const isSelected = selectedInterests.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/15'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl mb-1">{item.emoji}</span>
                <span className="text-xs font-bold truncate w-full">{item.label}</span>
                {isSelected && (
                  <Check className="h-3 w-3 text-blue-400 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 pb-safe space-y-2">
        <button
          type="button"
          onClick={handleFinalizeOnboarding}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Entrar a A Prueba de Fuego</span>
          <Flame className="h-4 w-4 fill-white text-white" />
        </button>
      </div>

    </div>
  );
};
