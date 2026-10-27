import React, { useState } from 'react';
import { OFFICIAL_CHRISTIAN_BOOKS } from '../../data/adventistOfficialData';
import { ChristianBook } from '../../types';
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Bookmark, 
  CheckCircle2, 
  Sparkles,
  Info,
  X,
  Share2
} from 'lucide-react';

export const ChristianBooksPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingBook, setReadingBook] = useState<ChristianBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<number>(15); // in pixels

  const categories = [
    { id: 'all', label: 'Todos los Libros' },
    { id: 'Elena G. de White', label: 'Elena G. de White' },
    { id: 'Vida Devocional', label: 'Vida Devocional' },
    { id: 'Juventud y Crecimiento', label: 'Juventud JA' },
  ];

  const filteredBooks = OFFICIAL_CHRISTIAN_BOOKS.filter(book => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      book.title.toLowerCase().includes(term) || 
      book.author.toLowerCase().includes(term) ||
      book.description.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenReader = (book: ChristianBook) => {
    setReadingBook(book);
    setActiveChapterIndex(0);
  };

  const handleNextChapter = () => {
    if (readingBook && activeChapterIndex < readingBook.chapters.length - 1) {
      setActiveChapterIndex(prev => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 mb-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>BIBLIOTECA JUVENIL CRISTIANA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Portal de Libros & Obras Inspiradas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Lee directamente en tu dispositivo obras maestras de la literatura adventista: <em>El Camino a Cristo</em>, <em>Mensajes para los Jóvenes</em> y <em>La Educación</em>, con lector integrado y enlaces autorizados a egwwritings.org.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-center min-w-[130px] shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Colección</span>
            <span className="text-2xl font-black text-indigo-400">{OFFICIAL_CHRISTIAN_BOOKS.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Libros Oficiales</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, autor o tema..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all p-5 shadow-lg flex flex-col justify-between group"
          >
            <div>
              {/* Cover and header */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {book.category}
                </div>
                {book.year && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-slate-300 text-[10px] font-mono">
                    {book.year}
                  </div>
                )}
              </div>

              <div className="text-[11px] font-bold text-amber-400 mb-1">
                {book.author}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug mb-2">
                {book.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {book.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{book.format}</span>
                </span>
                <span>{book.chapters.length} Capítulos Disponibles</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenReader(book)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Leer Ahora</span>
                </button>

                <a
                  href={book.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Abrir en fuente oficial (egwwritings.org / iadpa.org)"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comfort Digital Reader Modal */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {readingBook.title}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    {readingBook.author} · Cap. {activeChapterIndex + 1} de {readingBook.chapters.length}
                  </span>
                </div>
              </div>

              {/* Font controls and close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  title="Reducir letra"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono w-6 text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  title="Aumentar letra"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setReadingBook(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chapter Selection Bar */}
            <div className="px-4 py-2 bg-slate-950/30 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
              {readingBook.chapters.map((ch, idx) => (
                <button
                  key={ch.chapterNumber}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3 py-1 rounded-lg shrink-0 text-xs font-bold transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Cap. {ch.chapterNumber}
                </button>
              ))}
            </div>

            {/* Reader Content Area */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-5 bg-slate-900/60 leading-relaxed text-slate-200 selection:bg-indigo-500/30">
              <div className="border-b border-slate-800/80 pb-4 mb-4">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Capítulo {readingBook.chapters[activeChapterIndex].chapterNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                  {readingBook.chapters[activeChapterIndex].title}
                </h2>
              </div>

              <div 
                className="space-y-4 font-serif text-slate-200" 
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
              >
                {readingBook.chapters[activeChapterIndex].content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* End of chapter notice */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Obra oficial conservada en egwwritings.org</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activeChapterIndex === 0}
                    onClick={handlePrevChapter}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  <button
                    disabled={activeChapterIndex >= readingBook.chapters.length - 1}
                    onClick={handleNextChapter}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold flex items-center gap-1"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
