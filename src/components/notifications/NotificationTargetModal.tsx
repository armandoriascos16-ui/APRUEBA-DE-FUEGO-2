import React from 'react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { X, AlertCircle, ArrowLeft } from 'lucide-react';

export const NotificationTargetModal: React.FC = () => {
  const { 
    selectedPostForDetail, 
    setSelectedPostForDetail,
    contentUnavailableMessage,
    setContentUnavailableMessage,
    setActiveTab
  } = useApp();

  if (!selectedPostForDetail && !contentUnavailableMessage) {
    return null;
  }

  const handleClose = () => {
    setSelectedPostForDetail(null);
    setContentUnavailableMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold text-white font-heading">
              {selectedPostForDetail ? 'Publicación' : 'Aviso de Contenido'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        {selectedPostForDetail ? (
          <div className="flex-1">
            <PostCard post={selectedPostForDetail} />
          </div>
        ) : (
          <div className="py-8 px-4 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 font-heading">
              Contenido no disponible
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
              {contentUnavailableMessage || 'Esta publicación ya no se encuentra disponible o fue eliminada por su autor.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('inicio');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-md"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
