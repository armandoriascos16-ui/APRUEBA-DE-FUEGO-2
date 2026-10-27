import React, { useState, useMemo } from 'react';
import { ChristianSticker } from '../../types';
import { 
  STICKER_CATEGORIES, 
  CHRISTIAN_STICKERS_CATALOG 
} from './christianStickersCatalog';
import { X, Search, Sparkles, Check, Heart, BookOpen, Flame } from 'lucide-react';

interface ChristianStickersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: ChristianSticker) => void;
  title?: string;
  selectedStickerId?: string;
}

export const ChristianStickersModal: React.FC<ChristianStickersModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  title = 'Stickers Cristianos de Fe',
  selectedStickerId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStickers = useMemo(() => {
    let list = CHRISTIAN_STICKERS_CATALOG;

    if (selectedCategory !== 'all') {
      list = list.filter(s => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        s.shortPhrase.toLowerCase().includes(q) ||
        (s.verse && s.verse.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                  {filteredStickers.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Selecciona un sticker edificante para reaccionar o comentar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema: Jesús, oración, fe, esperanza, amor..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2.5 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✨ Todos ({CHRISTIAN_STICKERS_CATALOG.length})
          </button>
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredStickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;

            return (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  onSelectSticker(sticker);
                  onClose();
                }}
                className={`group relative p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-br ${sticker.gradient} ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20' 
                    : `${sticker.borderColor} hover:border-amber-400/80`
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl drop-shadow group-hover:scale-110 transition-transform">
                    {sticker.emoji}
                  </span>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold leading-tight truncate ${sticker.textColor}`}>
                      {sticker.title}
                    </h4>
                    {sticker.verse && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        📖 {sticker.verse}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-200 line-clamp-2 leading-snug font-medium drop-shadow-sm">
                  {sticker.shortPhrase}
                </p>

                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                  <span className="truncate">{sticker.categoryLabel}</span>
                  <span className="text-amber-400 font-bold group-hover:underline">Usar</span>
                </div>
              </button>
            );
          })}

          {filteredStickers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <span className="text-4xl block">🔍</span>
              <p className="text-xs font-semibold text-slate-300">
                No encontramos stickers para "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Stickers 100% bíblicos y fraternales</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
