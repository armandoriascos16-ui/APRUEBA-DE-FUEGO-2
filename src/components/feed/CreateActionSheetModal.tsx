import React from 'react';
import { 
  Camera, 
  Film, 
  Sparkles, 
  BookOpen, 
  X, 
  ChevronRight, 
  Flame,
  Layers,
  Radio
} from 'lucide-react';

interface CreateActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'photo' | 'video' | 'story' | 'text' | 'live') => void;
}

export const CreateActionSheetModal: React.FC<CreateActionSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Mobile Bottom Sheet container */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-slate-900 border-t border-x border-slate-800 rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up">
        {/* Pull handle indicator */}
        <div className="flex justify-center -mt-2 mb-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-700/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Crear Contenido</h3>
              <p className="text-[11px] text-slate-400">Edifica a la juventud con tu fe y talentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Grid / List */}
        <div className="space-y-2.5">
          {/* 1. Foto de Galería para el Feed */}
          <button
            onClick={() => {
              onSelectAction('photo');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500/25 transition-colors">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Publicar Foto de Galería</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">Feed</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Sube fotos de cultos, campamentos, clubes y vida diaria
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
          </button>

          {/* 2. Video de Galería para el Feed */}
          <button
            onClick={() => {
              onSelectAction('video');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/25 transition-colors">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Publicar Video de Galería</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">Video JA</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Comparte alabanzas, sermones cortos o mensajes en video
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
          </button>

          {/* 3. Nuevo Estado / Story (Foto o Video) */}
          <button
            onClick={() => {
              onSelectAction('story');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent hover:from-amber-500/20 border border-amber-500/30 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 group-hover:bg-amber-500/30 transition-colors">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300">Tu Estado / Story</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">24 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Foto o video vertical con versículos y stickers dinámicos
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </button>

          {/* 4. Versículo / Testimonio en texto */}
          <button
            onClick={() => {
              onSelectAction('text');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/25 transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Testimonio o Versículo</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Texto</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Comparte una reflexión espiritual o una experiencia con Dios
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
          </button>

          {/* 5. Transmitir en Vivo */}
          <button
            onClick={() => {
              onSelectAction('live');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-red-600/15 via-rose-600/10 to-transparent hover:from-red-600/25 border border-red-500/30 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 group-hover:bg-red-600/30 transition-colors">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-400">Transmitir en Vivo</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold">Cultos & JA</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Emisión en directo desde la iglesia, estudio o radio adventista
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </button>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span>Formatos compatibles: JPG, PNG, WEBP, MP4, MOV</span>
          </div>
          <span className="font-semibold text-slate-400">Compresión automática</span>
        </div>
      </div>
    </div>
  );
};
