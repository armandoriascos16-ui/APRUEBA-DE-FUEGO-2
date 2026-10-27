import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Wand2, 
  Upload, 
  Download, 
  RefreshCw, 
  Layers, 
  Check, 
  Copy, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Maximize2, 
  X, 
  Radio, 
  BookOpen, 
  Flame, 
  Send, 
  HeartHandshake, 
  Grid, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Sun,
  Shield,
  Church
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface SavedArtItem {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  aspectRatio: string;
  mode: 'create' | 'edit';
  bibleVerse?: string;
  engine?: string;
}

const CHRISTIAN_THEMATIC_CATEGORIES = [
  {
    id: 'paisajes',
    name: 'Paisajes Bíblicos',
    icon: Sun,
    prompts: [
      'Paisaje majestuoso del Monte Sinaí al amanecer con rayos de luz divina dorada, hiperrealista 2K',
      'Mar de Galilea en calma al atardecer con aguas cristalinas y cielo azul pacífico',
      'Río Jordán rodeado de vegetación verde y cielo abierto de gloria celestial',
      'Monte de los Olivos bajo la luz suave de la luna y olivos centenarios de paz',
    ],
  },
  {
    id: 'parabolas',
    name: 'Parábolas de Jesús',
    icon: BookOpen,
    prompts: [
      'El hijo pródigo siendo recibido y abrazado por su padre con amor incondicional en una colina al atardecer',
      'El buen samaritano atendiendo con ternura y compasión al viajero herido en el camino de Jericó',
      'El sembrador esparciendo semillas de esperanza sobre tierra fértil bajo un sol radiante',
      'La oveja perdida descansando sobre los hombros amorosos del Buen Pastor en los prados',
    ],
  },
  {
    id: 'vida_jesus',
    name: 'Vida de Jesús',
    icon: HeartHandshake,
    prompts: [
      'Jesús calmando la tempestad en la barca sobre las aguas embravecidas de Galilea',
      'El sermón del monte con una multitud escuchando palabras de bendición en una verde colina',
      'La cruz solitaria y luminosa en la cima del Calvario bajo un cielo crepuscular de esperanza',
      'La tumba vacía en el jardín al despuntar el alba con luz de victoria y resurrección',
    ],
  },
  {
    id: 'versiculos',
    name: 'Fondos con Versículo',
    icon: Sparkles,
    prompts: [
      'Fondo devocional pacífico con el Salmo 23: «Jehová es mi pastor, nada me faltará»',
      'Cielo abierto con águila remontando el vuelo y la promesa de Isaías 40:31',
      'Guerrero de oración de rodillas con la armadura de Dios y el texto de Josué 1:9',
      'Montaña verde coronada por rayos de sol con el lema de Filipenses 4:13',
    ],
  },
  {
    id: 'afiches_ja',
    name: 'Afiches & Actividades JA',
    icon: Flame,
    prompts: [
      'Afiche juvenil vibrante para Culto Joven: Juventud Fuerte en la Fe y Servicio',
      'Invitación artística para Campamento JA en las montañas con fogata y cielo estrellado',
      'Banner cristiano de evangelismo juvenil con antorcha encendida a prueba de fuego',
      'Póster para vigilia de oración y alabanza juvenil con siluetas de adoración',
    ],
  },
  {
    id: 'sabática',
    name: 'Escuela Sabática',
    icon: Church,
    prompts: [
      'El Arca de Noé flotando pacíficamente sobre las aguas con un arcoíris brillante de pacto',
      'El Tabernáculo en el desierto con la nube de día y la columna de fuego divino de noche',
      'La Ciudad Santa de la Nueva Jerusalén resplandeciente con murallas de jaspe celestial',
      'Daniel en el foso de los leones en profunda oración mientras un ángel cierra la boca de las fieras',
    ],
  },
];

export const AIImageStudioTab: React.FC = () => {
  const { currentUser, createStory, createPost, triggerCelebration, setActiveTab } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'create' | 'edit' | 'gallery'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('1K');
  const [selectedCategory, setSelectedCategory] = useState('paisajes');
  const [customVerse, setCustomVerse] = useState('');

  // Edit Mode state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState(false);

  // Generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    model?: string;
    engine?: string;
    prompt?: string;
    aspectRatio?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Modals
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState<'story' | 'post' | null>(null);
  const [shareCaption, setShareCaption] = useState('');
  const [shareVerseText, setShareVerseText] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Saved Art Gallery
  const storageKey = `apdf_saved_art_${currentUser.id || 'invitado'}`;
  const [savedGallery, setSavedGallery] = useState<SavedArtItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load saved art:', e);
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto hide toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Persist gallery to localStorage
  const saveGalleryToStorage = (items: SavedArtItem[]) => {
    setSavedGallery(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save art to localStorage:', e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('La imagen excede el límite de 10 MB. Selecciona una imagen más ligera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (activeTabMode === 'create') {
        const res = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            aspectRatio,
            imageSize,
            bibleVerse: customVerse.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}: Fallo en el servicio de generación`);
        }

        const data = await res.json();
        setGeneratedImage(data.imageUrl);
        setGeneratedMetadata({
          model: data.model || 'gemini-nano-banana-2.1',
          engine: data.engine || 'christian-sacred-art-engine',
          prompt: data.prompt || prompt,
          aspectRatio,
        });
        setToastMsg('¡Obra de arte bíblica generada con éxito!');
      } else {
        // Edit mode
        if (!selectedImage) {
          throw new Error('Por favor sube una imagen base para aplicar retoques o ediciones.');
        }

        const res = await fetch('/api/ai/edit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            base64Image: selectedImage,
            aspectRatio,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}: Fallo al editar imagen`);
        }

        const data = await res.json();
        setGeneratedImage(data.imageUrl);
        setGeneratedMetadata({
          model: data.model || 'gemini-nano-banana-2.1',
          engine: data.engine || 'christian-image-editor-engine',
          prompt: data.prompt || prompt,
          aspectRatio,
        });
        setToastMsg('¡Imagen modificada y retocada con éxito!');
      }
    } catch (err: any) {
      console.error('Error generating/editing image:', err);
      setErrorMsg(err.message || 'Dificultad al procesar la imagen. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert SVG/DataURL into real PNG raster blob for safe download across mobile and desktop
  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const filename = `a-prueba-de-fuego-arte-cristiano-${Date.now()}.png`;

      if (generatedImage.startsWith('data:image/svg+xml')) {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = generatedImage;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1024;
        canvas.height = img.height || 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setToastMsg('Imagen descargada en formato PNG.');
          }, 'image/png');
          return;
        }
      }

      // Standard PNG/JPEG data URL download
      const a = document.createElement('a');
      a.href = generatedImage;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMsg('Imagen descargada exitosamente.');
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      window.open(generatedImage, '_blank');
    }
  };

  const handleCopy = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    setCopied(true);
    setToastMsg('Enlace de imagen copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to user's persistent gallery
  const handleSaveToAccount = () => {
    if (!generatedImage) return;

    const alreadySaved = savedGallery.some(item => item.url === generatedImage);
    if (alreadySaved) {
      setToastMsg('Esta obra ya está guardada en tu cuenta.');
      return;
    }

    const newItem: SavedArtItem = {
      id: `art_${Date.now()}`,
      url: generatedImage,
      prompt: prompt || 'Obra bíblica sin título',
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      aspectRatio,
      mode: activeTabMode === 'edit' ? 'edit' : 'create',
      bibleVerse: customVerse || undefined,
      engine: generatedMetadata?.engine,
    };

    const updated = [newItem, ...savedGallery];
    saveGalleryToStorage(updated);
    triggerCelebration();
    setToastMsg('✅ ¡Obra guardada permanentemente en tu cuenta!');
  };

  const handleDeleteSavedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGallery.filter(item => item.id !== id);
    saveGalleryToStorage(updated);
    setToastMsg('Obra eliminada de tu galería personal.');
  };

  // Open sharing modal
  const handleOpenShare = (target: 'story' | 'post') => {
    if (!generatedImage) return;
    setShareCaption(prompt);
    setShareVerseText(customVerse);
    setShowShareModal(target);
  };

  const handleConfirmShare = () => {
    if (!generatedImage || !showShareModal) return;

    setIsSharing(true);
    try {
      if (showShareModal === 'story') {
        createStory({
          mediaUrl: generatedImage,
          textContent: shareCaption.trim() || prompt,
          bibleVerse: shareVerseText.trim() || undefined,
          category: 'reflexion',
        });
        triggerCelebration();
        setShowShareModal(null);
        setToastMsg('🎉 ¡Obra publicada en tus Estados de 24h!');
      } else {
        createPost({
          imageUrl: generatedImage,
          content: shareCaption.trim() || prompt,
          bibleVerse: shareVerseText.trim() || undefined,
          tags: ['ArteCristiano', 'IAaPruebaDeFuego', 'JuventudAdventista'],
        });
        triggerCelebration();
        setShowShareModal(null);
        setToastMsg('🎉 ¡Publicada con éxito en el muro de la comunidad!');
      }
    } catch (err) {
      console.error('Error sharing image:', err);
      setToastMsg('Error al compartir la obra. Intenta de nuevo.');
    } finally {
      setIsSharing(false);
    }
  };

  const currentCategoryObj = CHRISTIAN_THEMATIC_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xl backdrop-blur-md relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-amber-500/50 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Estudio de Creación & Edición Visual Cristiana
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Genera arte bíblico de alta resolución, ilustra versículos, afiches JA o sube tus fotos para añadir iluminación celestial y retoque sagrado.
          </p>
        </div>

        {/* Mode Switcher Dock */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTabMode('create')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Nueva</span>
          </button>
          <button
            onClick={() => setActiveTabMode('edit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'edit'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Editar Foto</span>
          </button>
          <button
            onClick={() => setActiveTabMode('gallery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'gallery'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mis Obras ({savedGallery.length})</span>
          </button>
        </div>
      </div>

      {/* Main Studio View: Create or Edit */}
      {activeTabMode !== 'gallery' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form & Thematic Selectors */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* If Edit Mode: Upload Image section */}
            {activeTabMode === 'edit' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  1. Sube la imagen que deseas modificar o retocar:
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition group"
                >
                  {selectedImage ? (
                    <div className="relative aspect-video max-h-48 mx-auto rounded-lg overflow-hidden border border-slate-800">
                      <img src={selectedImage} alt="Base para editar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-amber-300 font-semibold transition">
                        Cambiar imagen seleccionada
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto transition" />
                      <div className="text-xs font-semibold text-slate-300">Haz clic para cargar imagen</div>
                      <div className="text-[11px] text-slate-500">PNG, JPG, WEBP (hasta 10 MB)</div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* If Create Mode: Thematic Christian Category Tabs */}
            {activeTabMode === 'create' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Inspiraciones Bíblicas & Temas Sagrados:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CHRISTIAN_THEMATIC_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2 rounded-xl text-left border transition text-xs font-medium flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate text-[11px] font-semibold">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Preset Prompt Pills */}
                {currentCategoryObj && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Ideas rápidas para tu imagen:
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar pr-1">
                      {currentCategoryObj.prompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPrompt(p)}
                          className="w-full text-left text-xs bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 border border-slate-800/80 p-2 rounded-lg transition line-clamp-2 cursor-pointer"
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>
                  {activeTabMode === 'create'
                    ? 'Descripción de la escena bíblica o celestial:'
                    : 'Instrucciones escritas de modificación:'}
                </span>
                <span className="text-[10px] text-slate-500">{prompt.length} caracteres</span>
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  activeTabMode === 'create'
                    ? 'Ej: El Monte Sinaí al amanecer con rayos de luz divina dorada, hiperrealista 2K...'
                    : 'Ej: Aplica iluminación celestial cálida dorada, añade viñeta suave y un versículo de fe...'
                }
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Optional Scripture Overlay */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Versículo Bíblico Incrustado (Opcional):
              </label>
              <input
                type="text"
                value={customVerse}
                onChange={e => setCustomVerse(e.target.value)}
                placeholder="Ej: «Jehová es mi pastor; nada me faltará.» — Salmos 23:1"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            {/* Aspect Ratio and Quality Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Formato / Relación</label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="1:1">1:1 (Cuadrado / Feed)</option>
                  <option value="16:9">16:9 (Panorámico / TV)</option>
                  <option value="9:16">9:16 (Vertical / Estados)</option>
                  <option value="4:3">4:3 (Estándar)</option>
                  <option value="3:4">3:4 (Retrato)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Resolución / Render</label>
                <select
                  value={imageSize}
                  onChange={e => setImageSize(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="1K">1K (Rápido - 1024px)</option>
                  <option value="2K">2K (Ultra HD - 2048px)</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading || (activeTabMode === 'edit' && !selectedImage)}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Sintetizando obra con IA Cristiana...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>
                    {activeTabMode === 'create'
                      ? 'Generar Obra de Arte Bíblica'
                      : 'Aplicar Modificaciones & Filtros'}
                  </span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs space-y-1">
                <div className="font-semibold">Aviso del Asistente:</div>
                <div>{errorMsg}</div>
              </div>
            )}
          </div>

          {/* Right Column: Visual Preview Canvas & Toolbar */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-h-[460px] relative overflow-hidden">
            
            {isLoading ? (
              <div className="text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Creando arte sagrado en alta definición...</p>
                  <p className="text-xs text-slate-400">Procesando iluminación volumétrica, elementos bíblicos y tipografía</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col items-center justify-between space-y-4">
                
                {/* Visual Viewport with aspect ratio control */}
                <div className="relative group max-h-[440px] w-full flex items-center justify-center rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                  <img
                    src={previewOriginal && selectedImage ? selectedImage : generatedImage}
                    alt="Arte Cristiano"
                    className="max-h-[440px] w-auto object-contain transition-all duration-300"
                  />

                  {/* Top floating controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setShowFullscreen(true)}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-900 transition"
                      title="Pantalla completa"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle between original and edited in Edit Mode */}
                  {activeTabMode === 'edit' && selectedImage && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 p-1 rounded-lg flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => setPreviewOriginal(false)}
                        className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                          !previewOriginal ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                        }`}
                      >
                        Editada
                      </button>
                      <button
                        onClick={() => setPreviewOriginal(true)}
                        className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                          previewOriginal ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                        }`}
                      >
                        Original
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  
                  {/* Left: Download & Save */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PNG</span>
                    </button>

                    <button
                      onClick={handleSaveToAccount}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>Guardar en Cuenta</span>
                    </button>
                  </div>

                  {/* Right: Sharing options */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenShare('story')}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      title="Compartir como Estado de 24 horas"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Compartir en Estados</span>
                    </button>

                    <button
                      onClick={() => handleOpenShare('post')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Compartir como Publicación en el Muro"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Publicar</span>
                    </button>

                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700 cursor-pointer"
                      title="Copiar imagen"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center space-y-3 text-slate-500 p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-300">Lienzo Creativo en Espera</div>
                  <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Selecciona una temática bíblica o escribe tu visión para ver la imagen renderizada aquí con opciones completas de guardado, descarga y publicación.
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Saved Art Gallery View */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                Mis Obras de Arte Bíblicas Guardadas
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Colección personal de imágenes creadas y editadas asociadas a tu cuenta de usuario.
              </p>
            </div>
            <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full font-mono">
              {savedGallery.length} {savedGallery.length === 1 ? 'obra' : 'obras'}
            </span>
          </div>

          {savedGallery.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-400">Aún no has guardado obras de arte</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cuando generes o edites imágenes, presiona «Guardar en Cuenta» para tenerlas disponibles permanentemente en esta sección.
              </p>
              <button
                onClick={() => setActiveTabMode('create')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crear mi primera obra</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedGallery.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setGeneratedImage(item.url);
                    setPrompt(item.prompt);
                    setAspectRatio(item.aspectRatio as any);
                    setActiveTabMode('create');
                  }}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl overflow-hidden group cursor-pointer transition shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-900">
                    <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <button
                      onClick={(e) => handleDeleteSavedItem(item.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 opacity-0 group-hover:opacity-100 transition"
                      title="Eliminar de mi galería"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-amber-300 font-mono">
                      {item.aspectRatio}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <p className="text-xs text-slate-200 line-clamp-2 font-medium">"{item.prompt}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>{item.createdAt}</span>
                      <span className="text-amber-400 font-medium">Abrir en estudio →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {showFullscreen && generatedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Cerrar vista"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
            <img src={generatedImage} alt="Fullscreen View" className="max-w-full max-h-[85vh] object-contain" />
          </div>
          <p className="text-xs text-slate-400 mt-4 max-w-xl text-center">"{prompt}"</p>
        </div>
      )}

      {/* Share Confirmation Modal (Stories or Posts) */}
      {showShareModal && generatedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                {showShareModal === 'story' ? (
                  <>
                    <Radio className="w-4 h-4 text-orange-400" />
                    <span>Compartir en Estados de 24 horas</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Publicar en la Comunidad JA</span>
                  </>
                )}
              </h4>
              <button
                onClick={() => setShowShareModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Thumbnail */}
            <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                <img src={generatedImage} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 text-xs text-slate-300 overflow-hidden">
                <div className="font-semibold text-white truncate">Obra de Arte Bíblica</div>
                <div className="text-slate-400 text-[11px] line-clamp-2">"{prompt}"</div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {showShareModal === 'story' ? 'Duración: 24h exactas' : 'Visible en el feed social'}
                </div>
              </div>
            </div>

            {/* Caption Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Mensaje devocional o reflexión que acompañará tu imagen:
              </label>
              <textarea
                value={shareCaption}
                onChange={e => setShareCaption(e.target.value)}
                rows={3}
                placeholder="Escribe un mensaje de fe, reflexión o testimonio para los jóvenes..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Verse Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Cita Bíblica Destacada (Opcional):
              </label>
              <input
                type="text"
                value={shareVerseText}
                onChange={e => setShareVerseText(e.target.value)}
                placeholder="Ej: Salmos 23:1"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowShareModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmShare}
                disabled={isSharing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar y Publicar</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
