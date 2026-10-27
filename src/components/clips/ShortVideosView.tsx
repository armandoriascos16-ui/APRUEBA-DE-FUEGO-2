import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Plus, 
  Flame, 
  Camera, 
  Film, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const CLIP_CATEGORIES = [
  'Todos',
  'Reflexiones',
  'Testimonios',
  'Música',
  'Evangelismo',
  'Actividades',
  'Humor sano',
  'Predicaciones cortas'
] as const;

interface ShortClipItem {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  church: string;
  caption: string;
  videoUrl: string;
  category: typeof CLIP_CATEGORIES[number];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

const INITIAL_CLIPS: ShortClipItem[] = [
  {
    id: 'clip_1',
    authorId: 'user_david',
    authorName: 'David Morales',
    authorUsername: 'david_morales',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    church: 'Iglesia Adventista El Sinaí',
    caption: '¡Ensayando el coro juvenil de este Sábado! Dios habita en medio de las alabanzas de su pueblo 🎸✨',
    videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80', // video thumbnail / visual
    category: 'Música',
    tags: ['AlabanzaJA', 'JuventudAdventista', 'Sábado'],
    likesCount: 142,
    commentsCount: 28,
    sharesCount: 19,
  },
  {
    id: 'clip_2',
    authorId: 'user_sarah',
    authorName: 'Sarah Gómez',
    authorUsername: 'sarah_adventist',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
    church: 'Iglesia Adventista Central',
    caption: 'Testimonio impactante en Misión Caleb: Una abuelita aceptó estudiar la Biblia con nosotros hoy ❤️🙏',
    videoUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    category: 'Testimonios',
    tags: ['MisiónCaleb', 'Testimonio', 'AmorDeDios'],
    likesCount: 238,
    commentsCount: 45,
    sharesCount: 31,
  },
  {
    id: 'clip_3',
    authorId: 'user_mateo',
    authorName: 'Mateo Ríos',
    authorUsername: 'mateo_rios',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    church: 'Club de Conquistadores Orión',
    caption: '¡Nudo as de guía en 5 segundos! Reto de especialidad en el camporee JA 🏕️⚡ ¿Quién lo supera?',
    videoUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&q=80',
    category: 'Actividades',
    tags: ['Conquistadores', 'CamporeeJA', 'Especialidades'],
    likesCount: 189,
    commentsCount: 34,
    sharesCount: 26,
  },
];

interface ShortVideosViewProps {
  onOpenCreateVideo?: () => void;
}

export const ShortVideosView: React.FC<ShortVideosViewProps> = ({ onOpenCreateVideo }) => {
  const { currentUser, followUser, setActiveTab } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<typeof CLIP_CATEGORIES[number]>('Todos');
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const filteredClips = INITIAL_CLIPS.filter(c => 
    selectedCategory === 'Todos' ? true : c.category === selectedCategory
  );

  const currentClip = filteredClips[activeClipIndex] || filteredClips[0];
  const isLiked = currentClip ? likesMap[currentClip.id] : false;
  const isSaved = currentClip ? savedMap[currentClip.id] : false;
  const isFollowing = currentClip ? currentUser.followingIds.includes(currentClip.authorId) : false;

  const toggleLike = (clipId: string) => {
    setLikesMap(prev => ({ ...prev, [clipId]: !prev[clipId] }));
  };

  const toggleSave = (clipId: string) => {
    setSavedMap(prev => ({ ...prev, [clipId]: !prev[clipId] }));
  };

  const handleShare = () => {
    const text = `¡Mira este clip de fe en A Prueba de Fuego!: "${currentClip?.caption}"`;
    if (navigator.share) {
      navigator.share({ title: currentClip?.authorName, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Enlace del video corto copiado!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-4 py-2 space-y-3">
      
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Film className="h-4 w-4 text-purple-400" />
              <span>Clips JA & Videos Cortos</span>
            </h2>
          </div>
        </div>

        {onOpenCreateVideo && (
          <button
            onClick={onOpenCreateVideo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>+ Subir Clip</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CLIP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setActiveClipIndex(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Vertical Video Frame (9:16) */}
      {currentClip && (
        <div className="relative w-full aspect-[9/16] max-h-[72vh] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Media / Video Layer */}
          <div 
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 bg-slate-950 flex items-center justify-center cursor-pointer"
          >
            <img
              src={currentClip.videoUrl}
              alt={currentClip.caption}
              className="w-full h-full object-cover"
            />
            
            {/* Play/Pause indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
                  <Play className="h-8 w-8 fill-white" />
                </div>
              </div>
            )}
          </div>

          {/* Top Audio & Category Bar */}
          <div className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
            <span className="px-2.5 py-1 rounded-full bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase">
              {currentClip.category}
            </span>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Bottom & Right Interaction Layer */}
          <div className="relative z-10 p-4 flex items-end justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            
            {/* Left: Author & Caption */}
            <div className="space-y-2 max-w-[78%]">
              <div className="flex items-center gap-2">
                <img
                  src={currentClip.authorAvatar}
                  alt={currentClip.authorName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white drop-shadow-md">
                      {currentClip.authorName}
                    </p>
                    {currentClip.authorId !== currentUser.id && (
                      <button
                        onClick={() => followUser(currentClip.authorId)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          isFollowing
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-600 text-white shadow-sm'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : '+ Seguir'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-purple-300 drop-shadow">
                    @{currentClip.authorUsername} · {currentClip.church}
                  </p>
                </div>
              </div>

              <p className="text-xs text-white leading-relaxed drop-shadow-md line-clamp-3">
                {currentClip.caption}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {currentClip.tags.map(t => (
                  <span key={t} className="text-[10px] text-purple-300 font-semibold drop-shadow">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Floating Social Interaction Buttons */}
            <div className="flex flex-col items-center gap-3">
              
              {/* Like */}
              <button
                onClick={() => toggleLike(currentClip.id)}
                className="flex flex-col items-center gap-0.5 text-white active:scale-125 transition-transform"
              >
                <div className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isLiked ? 'bg-rose-500/80 text-white' : 'bg-black/50 text-white'
                }`}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
                </div>
                <span className="text-[10px] font-bold drop-shadow">
                  {currentClip.likesCount + (isLiked ? 1 : 0)}
                </span>
              </button>

              {/* Comments */}
              <button
                onClick={() => alert(`Comentarios de este video corto (${currentClip.commentsCount})`)}
                className="flex flex-col items-center gap-0.5 text-white"
              >
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold drop-shadow">{currentClip.commentsCount}</span>
              </button>

              {/* Save */}
              <button
                onClick={() => toggleSave(currentClip.id)}
                className="flex flex-col items-center gap-0.5 text-white"
              >
                <div className={`p-2.5 rounded-full backdrop-blur-md ${
                  isSaved ? 'bg-amber-500 text-slate-950' : 'bg-black/50 text-white'
                }`}>
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-slate-950' : ''}`} />
                </div>
                <span className="text-[10px] font-bold drop-shadow">Guardar</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-0.5 text-white"
              >
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold drop-shadow">{currentClip.sharesCount}</span>
              </button>

            </div>

          </div>

          {/* Navigation Controls (Next / Prev Clip) */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-3 py-1 bg-black/60 backdrop-blur-md text-xs text-slate-300">
            <button
              disabled={activeClipIndex === 0}
              onClick={() => setActiveClipIndex(prev => Math.max(0, prev - 1))}
              className="disabled:opacity-30 hover:text-white"
            >
              ▲ Anterior
            </button>
            <span className="text-[11px] text-purple-400 font-bold">
              {activeClipIndex + 1} de {filteredClips.length}
            </span>
            <button
              disabled={activeClipIndex >= filteredClips.length - 1}
              onClick={() => setActiveClipIndex(prev => Math.min(filteredClips.length - 1, prev + 1))}
              className="disabled:opacity-30 hover:text-white"
            >
              Siguiente ▼
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
