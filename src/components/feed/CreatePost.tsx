import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createPost as createPostInDb } from '../../firebase/db';
import { Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { 
  compressImageFromGallery, 
  processVideoFromGallery,
  uploadMediaFile 
} from '../../utils/mediaUtils';
import { 
  validateVideoFile, 
  validateImageFile, 
  MediaValidationResult 
} from '../../services/mediaValidationService';
import { 
  Flame, 
  Image as ImageIcon, 
  Film, 
  BookOpen, 
  Trash2, 
  X, 
  Check, 
  Loader2,
  Camera,
  Send,
  RefreshCw,
  Info,
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface CreatePostProps {
  onSuccess?: (post: Post) => void;
  onCancel?: () => void;
  isModal?: boolean;
  defaultMediaType?: 'photo' | 'video';
}

export const CreatePost: React.FC<CreatePostProps> = ({ 
  onSuccess, 
  onCancel, 
  isModal = false,
  defaultMediaType
}) => {
  const { currentUser, createPost: createPostInContext, triggerCelebration } = useApp();

  // Form State
  const [content, setContent] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [mediaMeta, setMediaMeta] = useState<string>('');
  const [validationResult, setValidationResult] = useState<MediaValidationResult | null>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['JuventudAdventista', 'FuegoEspiritual']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Hidden File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto trigger file picker if modal opened from a specific button
  useEffect(() => {
    if (defaultMediaType === 'photo') {
      const timer = setTimeout(() => {
        imageInputRef.current?.click();
      }, 150);
      return () => clearTimeout(timer);
    } else if (defaultMediaType === 'video') {
      const timer = setTimeout(() => {
        videoInputRef.current?.click();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [defaultMediaType]);

  const suggestedTags = [
    'RetoJuvenil',
    'AlabanzaJA',
    'CampamentoJA',
    'Testimonio',
    'Oración',
    'MisiónCaleb',
    'EstudioBíblico'
  ];

  // Handle Image Upload & Compression from device gallery
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingMedia(true);
    setFeedbackMsg(null);

    // 1. Validar imagen antes de procesar
    const validation = await validateImageFile(file, 'feed_post');
    setValidationResult(validation);

    if (!validation.isValid) {
      setIsProcessingMedia(false);
      setFeedbackMsg(validation.error || 'La imagen no cumple con los requisitos.');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    try {
      const result = await compressImageFromGallery(file, 800, 1200, 0.72);
      const uploadRes = await uploadMediaFile(file);
      setImageUrl(uploadRes.url || result.dataUrl);
      setMediaType('image');
      setImageFileName(uploadRes.filename || result.name);
      setMediaMeta(`${result.width}x${result.height} · ${result.sizeKb} KB`);
      // Clear video
      setVideoUrl(null);
      setVideoPoster(null);
      setVideoDuration(undefined);
      setVideoFileName('');
    } catch (err) {
      console.error('Error optimizando foto de galería:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setMediaType('image');
          setImageFileName(file.name);
          setMediaMeta(`${Math.round(file.size / 1024)} KB`);
          setVideoUrl(null);
          setVideoPoster(null);
          setVideoDuration(undefined);
          setVideoFileName('');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  // Handle Video Upload from device gallery
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingMedia(true);
    setFeedbackMsg(null);

    // 1. Validación exhaustiva de tipo MIME, códec y límites de tamaño antes de subir
    const validation = await validateVideoFile(file, 'feed_post');
    setValidationResult(validation);

    if (!validation.isValid) {
      setIsProcessingMedia(false);
      setFeedbackMsg(validation.error || 'El video seleccionado no es válido.');
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    try {
      const result = await processVideoFromGallery(file, 'feed_post');
      setVideoUrl(result.url);
      setVideoPoster(result.posterUrl || null);
      setVideoDuration(result.duration || validation.duration);
      setMediaType('video');
      setVideoFileName(result.name);

      const formatLabel = validation.isH264AacMp4 
        ? ' · MP4 H.264/AAC Óptimo' 
        : (result.wasConverted ? ' · Convertido a MP4 H.264' : ' · MP4 Universal');

      setMediaMeta(`${result.sizeMb} MB${result.duration ? ` · ${result.duration}s` : ''}${formatLabel}`);
      
      // Mostrar recomendaciones si existen
      if (validation.warnings.length > 0) {
        setFeedbackMsg(validation.warnings[0]);
      }

      // Clear image
      setImageUrl(null);
      setImageFileName('');
    } catch (err: any) {
      console.error('Error procesando video de galería:', err);
      setFeedbackMsg(err.message || 'Error al procesar el archivo de video.');
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRemoveMedia = () => {
    setImageUrl(null);
    setVideoUrl(null);
    setVideoPoster(null);
    setVideoDuration(undefined);
    setValidationResult(null);
    setMediaType(null);
    setImageFileName('');
    setVideoFileName('');
    setMediaMeta('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const postId = `post_${Date.now()}`;
    const newPost: Post = {
      id: postId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      authorPoints: currentUser.points,
      authorIsOfficial: currentUser.role === 'admin' || currentUser.isOfficialVerified,
      content: content.trim(),
      bibleVerse: bibleVerse.trim() || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      mediaType: mediaType || (imageUrl ? 'image' : videoUrl ? 'video' : 'image'),
      tags: selectedTags,
      isOfficial: false,
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
      viewsCount: 1,
      createdAt: 'Justo ahora',
    };

    try {
      // Sincronizar en el estado de la aplicación y en Firestore
      createPostInContext({
        content: newPost.content,
        bibleVerse: newPost.bibleVerse,
        imageUrl: newPost.imageUrl,
        videoUrl: newPost.videoUrl,
        videoPoster: videoPoster || undefined,
        videoDuration: videoDuration,
        mediaType: newPost.mediaType,
        tags: newPost.tags,
      });

      triggerCelebration();
      setFeedbackMsg('¡Publicación con tu medio de galería compartida con la juventud!');

      // Reset form
      setContent('');
      setBibleVerse('');
      handleRemoveMedia();

      if (onSuccess) {
        onSuccess(newPost);
      }
    } catch (error) {
      console.warn('Error al guardar publicación:', error);
      triggerCelebration();
      if (onSuccess) {
        onSuccess(newPost);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerClasses = isModal 
    ? 'w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5'
    : 'w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-4 sm:p-5 mb-4';

  return (
    <div className={containerClasses}>
      
      {/* Hidden File Pickers */}
      <input 
        type="file" 
        ref={imageInputRef} 
        accept="image/*" 
        onChange={handleImageChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/3gpp,video/*" 
        onChange={handleVideoChange} 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20">
            <Flame className="h-4 w-4 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Publicar en el Feed Juvenil
            </h3>
            <span className="text-[10px] text-amber-400 font-medium">
              Sube fotos y videos desde tu propia galería
            </span>
          </div>
        </div>

        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Author Bar */}
      <div className="flex items-center gap-2.5 mb-3">
        <UserAvatar
          avatar={currentUser.avatar}
          name={`${currentUser.name} ${currentUser.lastName}`}
          size="md"
          role={currentUser.role}
          isOfficial={currentUser.isOfficialVerified}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-white truncate">
              {currentUser.name} {currentUser.lastName}
            </span>
            {currentUser.role === 'admin' && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                Admin
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            @{currentUser.username} · {currentUser.church || 'Guerrero JA'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Main Text Content */}
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`¿Qué testimonio, reflexión o bendición deseas compartir hoy, ${currentUser.name}?`}
          className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
          required
        />

        {/* Bible Verse Input */}
        <div className="relative">
          <div className="absolute left-3 top-2.5 flex items-center text-amber-400 pointer-events-none">
            <BookOpen className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={bibleVerse}
            onChange={(e) => setBibleVerse(e.target.value)}
            placeholder="Versículo bíblico (Ej: Filipenses 4:13 — 'Todo lo puedo en Cristo...')"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Loading Spinner for Media Processing */}
        {isProcessingMedia && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-amber-300 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
            <span>Optimizando archivo de galería para que cargue a máxima velocidad...</span>
          </div>
        )}

        {/* Media Preview Box (Image or Video) */}
        {(imageUrl || videoUrl) && (
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/50 bg-black max-h-80 flex items-center justify-center group shadow-xl">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Vista previa de foto"
                className="w-full h-auto max-h-80 object-contain rounded-2xl"
              />
            )}

            {videoUrl && (
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full h-auto max-h-80 rounded-2xl bg-black"
              />
            )}

            {/* Media Information Overlay Badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-white font-semibold">
              {imageUrl ? (
                <>
                  <Camera className="h-3 w-3 text-amber-400" />
                  <span>Foto de Galería</span>
                </>
              ) : (
                <>
                  <Film className="h-3 w-3 text-purple-400" />
                  <span>Video de Galería</span>
                </>
              )}
              {mediaMeta && <span className="text-slate-400 ml-1">({mediaMeta})</span>}
            </div>

            {/* Action buttons (Replace / Delete) */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => imageUrl ? imageInputRef.current?.click() : videoInputRef.current?.click()}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 transition-colors backdrop-blur-md"
                title="Cambiar archivo por otro de tu galería"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleRemoveMedia}
                className="p-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-colors backdrop-blur-md"
                title="Quitar archivo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Validation & Codec Tag */}
            {validationResult && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  {validationResult.isH264AacMp4 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Compatible Nativo (MP4 H.264/AAC)
                    </span>
                  ) : validationResult.fileType === 'video' ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1 shrink-0">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Transcodificado a MP4 Universal
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Foto Optimizada Web
                    </span>
                  )}
                  {validationResult.aspectRatioLabel && (
                    <span className="text-slate-400 truncate hidden sm:inline">· {validationResult.aspectRatioLabel}</span>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[9px] shrink-0">
                  {validationResult.sizeFormatted}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Gallery Pickers Bar */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              Adjuntar contenido desde tu galería:
            </span>
            <span className="text-[10px] text-slate-500">
              {imageUrl ? 'Foto seleccionada' : videoUrl ? 'Video seleccionado' : 'Sin archivo adjunto'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                imageUrl
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-amber-500/40'
              }`}
            >
              <Camera className="h-4 w-4 text-amber-400 shrink-0" />
              <span>📷 Foto de Galería</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                videoUrl
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-purple-500/40'
              }`}
            >
              <Film className="h-4 w-4 text-purple-400 shrink-0" />
              <span>🎥 Video de Galería</span>
            </button>
          </div>
        </div>

        {/* Tags Selection */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Etiquetas cristianas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || isProcessingMedia}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publicar en la Comunidad</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
