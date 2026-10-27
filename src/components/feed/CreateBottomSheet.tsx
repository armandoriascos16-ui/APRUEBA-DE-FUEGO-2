import React from 'react';
import { 
  X, 
  Camera, 
  Film, 
  Sparkles, 
  BookOpen, 
  HeartHandshake, 
  Flame, 
  Calendar,
  MessageSquareQuote
} from 'lucide-react';

interface CreateBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: () => void;
  onSelectVideo: () => void;
  onSelectStory: () => void;
  onSelectPrayer: () => void;
  onSelectVerse: () => void;
  onSelectActivity: () => void;
  onSelectTestimony: () => void;
}

export const CreateBottomSheet: React.FC<CreateBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  onSelectVideo,
  onSelectStory,
  onSelectPrayer,
  onSelectVerse,
  onSelectActivity,
  onSelectTestimony,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 z-10 animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white shadow-md shadow-blue-500/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Crear Contenido Juvenil
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                Edifica y conecta con tu comunidad adventista
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          
          {/* 1. Foto de Galería o Cámara */}
          <button
            onClick={() => {
              onClose();
              onSelectPhoto();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Foto</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Galería o cámara</p>
            </div>
          </button>

          {/* 2. Video de Galería o Cámara */}
          <button
            onClick={() => {
              onClose();
              onSelectVideo();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Video</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Clips y alabanzas</p>
            </div>
          </button>

          {/* 3. Estado / Historia de 24h */}
          <button
            onClick={() => {
              onClose();
              onSelectStory();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Estado (24h)</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Foto/video efímero</p>
            </div>
          </button>

          {/* 4. Petición de Oración */}
          <button
            onClick={() => {
              onClose();
              onSelectPrayer();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Oración</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Muro de intercesión</p>
            </div>
          </button>

          {/* 5. Versículo Bíblico */}
          <button
            onClick={() => {
              onClose();
              onSelectVerse();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Versículo</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Palabra inspiradora</p>
            </div>
          </button>

          {/* 6. Testimonio o Reflexión */}
          <button
            onClick={() => {
              onClose();
              onSelectTestimony();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-900/90 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Testimonio</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Lo que Dios hizo</p>
            </div>
          </button>

          {/* 7. Actividad JA / Evento */}
          <button
            onClick={() => {
              onClose();
              onSelectActivity();
            }}
            className="col-span-2 flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-950 border border-blue-500/30 hover:border-blue-400 text-left transition-all group active:scale-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Nueva Actividad o Reunión JA</h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Sociedad de Jóvenes, Conquistadores, Camporee o Misión Caleb</p>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
