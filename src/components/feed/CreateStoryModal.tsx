import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  compressImageFromGallery, 
  processVideoFromGallery,
  uploadMediaFile 
} from '../../utils/mediaUtils';
import { 
  validateVideoFile, 
  validateImageFile 
} from '../../services/mediaValidationService';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Film, 
  BookOpen, 
  Flame, 
  Camera, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  CheckCircle2,
  Play,
  Pause,
  Music,
  Mic,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { AudioRecorderModal } from '../audioStories/AudioRecorderModal';
import { UserAvatar } from '../common/UserAvatar';
import { AudioUploaderModal } from '../audioStories/AudioUploaderModal';
import { ChristianMusicLibraryModal } from '../audioStories/ChristianMusicLibraryModal';
import { AudioStoryEditor } from '../audioStories/AudioStoryEditor';
import { StoryAudioPlayerBadge } from '../audioStories/StoryAudioPlayerBadge';
import { AudioDraftState } from '../audioStories/types';
import { analyzeStoryAndRecommendMusic } from '../audioStories/smartMusicRecommender';

interface CreateStoryModalProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'oracion', label: 'Oración', emoji: '🙏' },
  { id: 'versiculo', label: 'Versículo', emoji: '📖' },
  { id: 'testimonio', label: 'Testimonio', emoji: '❤️' },
  { id: 'reflexion', label: 'Reflexión', emoji: '🔥' },
  { id: 'musica', label: 'Música JA', emoji: '🎵' },
  { id: 'iglesia', label: 'Iglesia', emoji: '⛪' },
  { id: 'campamento', label: 'Campamento', emoji: '🏕️' },
] as const;

const PRESET_BACKGROUNDS = [
  {
    url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80',
    label: 'Biblia & Luz',
  },
  {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    label: 'Alabanza',
  },
  {
    url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&q=80',
    label: 'Campamento',
  },
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    label: 'Jóvenes Unidos',
  },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose }) => {
  const { currentUser, createStory, triggerCelebration } = useApp();

  const [category, setCategory] = useState<typeof CATEGORIES[number]['id']>('reflexion');
  const [textContent, setTextContent] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  
  // Media State
  const [mediaUrl, setMediaUrl] = useState<string>(PRESET_BACKGROUNDS[0].url);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaSource, setMediaSource] = useState<'gallery_photo' | 'gallery_video' | 'preset'>('preset');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [mediaMeta, setMediaMeta] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Hidden File Inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Audio State (Prompt Estados con Audio)
  const [audioDraft, setAudioDraft] = useState<AudioDraftState | null>(null);
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [smartFeedback, setSmartFeedback] = useState<string | null>(null);

  // Auto-recommendation helper
  const handleTriggerSmartRecommendation = () => {
    const res = analyzeStoryAndRecommendMusic(textContent, bibleVerse, category);
    if (res.primaryRecommendation) {
      setAudioDraft({
        audioUrl: res.primaryRecommendation.audioUrl,
        duration: Math.min(30, res.primaryRecommendation.duration || 30),
        type: 'catalog',
        title: res.primaryRecommendation.title,
        artist: res.primaryRecommendation.artist,
        license: res.primaryRecommendation.license,
        attribution: res.primaryRecommendation.attribution,
        category: res.primaryRecommendation.categoryLabel,
        mood: res.primaryRecommendation.moods[0],
        sourceUrl: res.primaryRecommendation.sourceUrl,
        trimStart: 0,
        trimEnd: Math.min(30, res.primaryRecommendation.duration || 30),
        volume: 0.9
      });
      setSmartFeedback(`Música recomendada: «${res.primaryRecommendation.title}» según tu contenido espiritual.`);
      setTimeout(() => setSmartFeedback(null), 4000);
    } else {
      setShowLibraryModal(true);
    }
  };

  // Handle Photo selection from gallery
  const handlePhotoFromGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación previa
    const validation = await validateImageFile(file, 'story');
    if (!validation.isValid) {
      setSmartFeedback(validation.error || 'La foto no cumple los requisitos para historias.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const result = await compressImageFromGallery(file, 800, 1200, 0.72);
      const uploadRes = await uploadMediaFile(file);
      setMediaUrl(uploadRes.url || result.dataUrl);
      setMediaType('image');
      setMediaSource('gallery_photo');
      setMediaFileName(uploadRes.filename || result.name);
      setMediaMeta(`${result.width}x${result.height} · ${result.sizeKb} KB`);
    } catch (err) {
      console.warn('Fallback al leer foto:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrl(event.target.result as string);
          setMediaType('image');
          setMediaSource('gallery_photo');
          setMediaFileName(file.name);
          setMediaMeta(`${Math.round(file.size / 1024)} KB`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Video selection from gallery
  const handleVideoFromGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación previa para historias (límite 60s, tamaño, formato)
    const validation = await validateVideoFile(file, 'story');
    if (!validation.isValid) {
      setSmartFeedback(validation.error || 'El video no cumple los requisitos para historias.');
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processVideoFromGallery(file, 'story');
      setMediaUrl(result.url);
      setMediaType('video');
      setMediaSource('gallery_video');
      setMediaFileName(result.name);
      const codecTag = validation.isH264AacMp4 ? ' · H.264/AAC' : ' · MP4';
      setMediaMeta(`${result.sizeMb} MB ${result.duration ? `· ${result.duration}s` : ''}${codecTag}`);
      setIsVideoPlaying(true);
    } catch (err: any) {
      console.warn('Fallback al leer video:', err);
      setSmartFeedback(err.message || 'No se pudo procesar el video.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    setMediaUrl(url);
    setMediaType('image');
    setMediaSource('preset');
    setMediaFileName('');
    setMediaMeta('');
  };

  const handleToggleVideoPlayback = () => {
    if (!previewVideoRef.current) return;
    if (previewVideoRef.current.paused) {
      previewVideoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      previewVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!textContent.trim() && !mediaUrl) || isProcessing || isSubmitting) return;

    setIsSubmitting(true);
    try {
      createStory({
        category,
        textContent: textContent.trim(),
        bibleVerse: bibleVerse.trim(),
        mediaUrl: mediaUrl || PRESET_BACKGROUNDS[0].url,
        mediaType,
        audio: audioDraft ? {
          audioUrl: audioDraft.audioUrl,
          duration: audioDraft.duration,
          type: audioDraft.type,
          title: audioDraft.title,
          artist: audioDraft.artist,
          license: audioDraft.license,
          attribution: audioDraft.attribution,
          category: audioDraft.category,
          mood: audioDraft.mood,
          sourceUrl: audioDraft.sourceUrl,
          trimStart: audioDraft.trimStart,
          trimEnd: audioDraft.trimEnd,
          volume: audioDraft.volume
        } : undefined
      });

      triggerCelebration();
      onClose();
    } catch (err) {
      console.error('Error publicando estado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        onChange={handlePhotoFromGallery}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/3gpp,video/*"
        onChange={handleVideoFromGallery}
        className="hidden"
      />

      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Publicar Estado Espiritual (24h)</h2>
              <p className="text-[11px] text-amber-400 font-medium">
                Comparte fotos y videos desde tu galería o temas de fe
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Controls & Inputs (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
            
            {/* Gallery Media Upload Section */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>Sube desde tu propia galería:</span>
                </label>
                {mediaSource !== 'preset' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                    {mediaType === 'image' ? '📷 Foto de Galería' : '🎥 Video de Galería'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    mediaSource === 'gallery_photo'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-amber-500/50'
                  }`}
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>📷 Foto de Galería</span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    mediaSource === 'gallery_video'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-purple-500/50'
                  }`}
                >
                  <Film className="h-4 w-4 text-purple-400" />
                  <span>🎥 Video de Galería</span>
                </button>
              </div>

              {/* Status info if gallery media loaded */}
              {mediaSource !== 'preset' && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="truncate max-w-[200px]">
                    {mediaFileName || 'Medio cargado'} {mediaMeta ? `· ${mediaMeta}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(PRESET_BACKGROUNDS[0].url)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Quitar</span>
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-amber-300 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>Optimizando medio de tu galería...</span>
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoría del estado:
              </label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      category === c.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-1">{c.emoji}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mensaje o reflexión para el estado:
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="¿Qué testimonio, alabanza o palabra de fe deseas dejar en tu estado hoy?"
                rows={3}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>

            {/* Scripture Verse */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Versículo bíblico (opcional):
              </label>
              <div className="relative">
                <BookOpen className="h-3.5 w-3.5 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bibleVerse}
                  onChange={(e) => setBibleVerse(e.target.value)}
                  placeholder="Ej: Salmos 23:1 — Jehová es mi pastor..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* AGREGAR AUDIO O MÚSICA CRISTIANA (Prompt Estados con Audio) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="h-4 w-4 text-amber-400" />
                  <span>Agregar audio o música cristiana:</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Opcional (máx. 30s)</span>
              </div>

              {smartFeedback && (
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{smartFeedback}</span>
                </div>
              )}

              {audioDraft ? (
                /* Editor Activo de Audio */
                <AudioStoryEditor
                  audio={audioDraft}
                  onChangeAudio={setAudioDraft}
                  onRemoveAudio={() => setAudioDraft(null)}
                  onChangeMusicClick={() => setShowLibraryModal(true)}
                  onSmartRecommendClick={handleTriggerSmartRecommendation}
                />
              ) : (
                /* Botones de Selección de Audio */
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecorderModal(true)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Mic className="h-4 w-4 text-red-400" />
                    <span>Grabar mi audio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUploaderModal(true)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="h-4 w-4 text-purple-400" />
                    <span>Subir audio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLibraryModal(true)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Music className="h-4 w-4 text-amber-400" />
                    <span>Elegir música cristiana</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerSmartRecommendation}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    title="Analizar versículo y texto para sugerir música adecuada"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Recomendar música</span>
                  </button>
                </div>
              )}
            </div>

            {/* Preset Backgrounds as Alternative */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                O elige un fondo prediseñado:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_BACKGROUNDS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(p.url)}
                    className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      mediaSource === 'preset' && mediaUrl === p.url
                        ? 'border-amber-400 scale-95 shadow-md shadow-amber-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white py-0.5 text-center font-bold truncate">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={(!textContent.trim() && !mediaUrl) || isProcessing || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black shadow-md shadow-orange-500/20 hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Publicando Estado...</span>
                  </>
                ) : (
                  <span>Publicar Estado (24h)</span>
                )}
              </button>
            </div>

          </form>

          {/* RIGHT COLUMN: Live Story Phone Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span>Vista Previa del Estado</span>
            </span>

            {/* 9:16 Mockup Frame */}
            <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-3xl overflow-hidden bg-black border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between">
              
              {/* Media Layer (Image or Video) */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={previewVideoRef}
                      src={mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleToggleVideoPlayback}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-sm z-20"
                    >
                      {isVideoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                  </div>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Top Progress Bar & Header Overlay */}
              <div className="relative z-10 p-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent space-y-2">
                <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-amber-400 rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <UserAvatar
                    avatar={currentUser.avatar}
                    name={currentUser.name}
                    size="xs"
                    showBadge={false}
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate leading-tight drop-shadow-md">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-amber-300">
                      <span>{CATEGORIES.find(c => c.id === category)?.emoji}</span>
                      <span className="capitalize">{category}</span>
                      <span>· Ahora</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Caption & Scripture Overlay */}
              <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-1.5">
                
                {/* Audio Badge Preview if set */}
                {audioDraft && (
                  <div className="mb-1 pointer-events-auto">
                    <StoryAudioPlayerBadge audio={audioDraft} isStoryPaused={false} />
                  </div>
                )}

                {bibleVerse && (
                  <div className="p-1.5 rounded-lg bg-amber-500/25 border border-amber-500/40 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-amber-300 leading-tight">
                      📖 {bibleVerse}
                    </p>
                  </div>
                )}

                {textContent ? (
                  <p className="text-xs text-white font-medium leading-snug drop-shadow-md line-clamp-4">
                    {textContent}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    (Escribe tu reflexión o mensaje para verla aquí)
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between text-[9px] text-slate-300">
                  <span>24h restantes</span>
                  {mediaType === 'video' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold">
                      VIDEO
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Modales de Audio Cristiano */}
      <AudioRecorderModal
        isOpen={showRecorderModal}
        onClose={() => setShowRecorderModal(false)}
        onSaveAudio={(audio) => setAudioDraft(audio)}
        onSwitchToUpload={() => setShowUploaderModal(true)}
      />

      <AudioUploaderModal
        isOpen={showUploaderModal}
        onClose={() => setShowUploaderModal(false)}
        onSaveAudio={(audio) => setAudioDraft(audio)}
      />

      <ChristianMusicLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectTrack={(audio) => setAudioDraft(audio)}
        storyContext={{
          textContent,
          bibleVerse,
          category
        }}
      />
    </div>
  );
};
