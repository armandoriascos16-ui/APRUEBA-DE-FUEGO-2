import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  MapPin, 
  Bookmark, 
  Clock, 
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { BibleStudyItem, BibleStudySession } from './types';

export const EstudiosBiblicosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [studies, setStudies] = useState<BibleStudyItem[]>(comunidadStorage.getBibleStudies());
  const [sessions, setSessions] = useState<BibleStudySession[]>(comunidadStorage.getStudySessions());
  const [expandedId, setExpandedId] = useState<string | null>(studies[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'estudios' | 'sesiones' | 'planes'>('estudios');

  // Answer states
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState('');

  // Create Study Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBook, setNewBook] = useState('Daniel');
  const [newPassage, setNewPassage] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMaterials, setNewMaterials] = useState('Biblia Reina-Valera 1960\nComentario Bíblico Adventista');

  // Create Session Modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('07:00 PM');
  const [sessionMode, setSessionMode] = useState<'presencial' | 'virtual'>('presencial');
  const [sessionLocation, setSessionLocation] = useState('');

  // Reading marker in localStorage
  const [savedMarker, setSavedMarker] = useState<string>(() => {
    return localStorage.getItem('cjc_reading_marker') || 'Daniel 2:44';
  });

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setStudies(comunidadStorage.getBibleStudies());
      setSessions(comunidadStorage.getStudySessions());
    });
    return unsub;
  }, []);

  const handleSaveMarker = (passage: string) => {
    localStorage.setItem('cjc_reading_marker', passage);
    setSavedMarker(passage);
  };

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const materialsArr = newMaterials.split('\n').filter(m => m.trim().length > 0);

    const created = comunidadStorage.createBibleStudy({
      title: newTitle.trim(),
      bookOfBible: newBook,
      chapterAndVerses: newPassage.trim() || `${newBook} 1`,
      topic: newTopic.trim() || 'Estudio Doctrinal y Espiritual',
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      content: newContent.trim(),
      materials: materialsArr,
      keyVerses: [{ ref: newPassage || newBook, text: 'Escudriñad las Escrituras; porque en ellas tenéis la vida eterna.' }]
    });

    setShowCreateModal(false);
    setExpandedId(created.id);
    setNewTitle('');
    setNewContent('');
    setNewPassage('');
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    comunidadStorage.createStudySession({
      studyId: expandedId || 'study_general',
      title: sessionTitle.trim(),
      date: sessionDate || 'Próximo sábado',
      time: sessionTime,
      mode: sessionMode,
      locationOrUrl: sessionLocation.trim() || (sessionMode === 'virtual' ? 'Enlace en Google Meet' : 'Templo Adventista Central'),
      hostName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username
    });

    setShowSessionModal(false);
    setSessionTitle('');
    setSessionLocation('');
  };

  const handleSendAnswer = (studyId: string, questionId: string) => {
    if (!answerInput.trim()) return;

    comunidadStorage.addAnswerToStudyQuestion(
      studyId,
      questionId,
      currentUser.id,
      `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      currentUser.avatar,
      answerInput.trim()
    );

    setAnswerInput('');
    setActiveQuestionId(null);
  };

  // Distinct books for filter
  const books = Array.from(new Set(studies.map(s => s.bookOfBible)));

  const filteredStudies = studies.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(term) ||
                        s.bookOfBible.toLowerCase().includes(term) ||
                        s.topic.toLowerCase().includes(term) ||
                        s.content.toLowerCase().includes(term);
    if (!matchSearch) return false;

    if (selectedBookFilter !== 'todos') {
      return s.bookOfBible === selectedBookFilter;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4" />
            <span>FUNCIÓN REAL D · ESTUDIOS BÍBLICOS Y PREGUNTAS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Academia Bíblica de la Juventud
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Estudios organizados por libro bíblico y tema. Preguntas para reflexión grupal, respuestas de la hermandad, 
            calendario de sesiones y marcador personal de lectura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Publicar Estudio</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas Internas */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('estudios')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'estudios'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Estudios Bíblicos ({studies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sesiones')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sesiones'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Sesiones Programadas ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('planes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'planes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Marcador & Plan</span>
        </button>
      </div>

      {/* PESTAÑA 1: ESTUDIOS BÍBLICOS */}
      {activeTab === 'estudios' && (
        <div className="space-y-4">
          {/* Búsqueda y Filtros por Libro */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar estudio por libro, tema o palabra clave..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedBookFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedBookFilter === 'todos'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos los Libros
              </button>
              {books.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBookFilter(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedBookFilter === b
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Acordeón de Estudios */}
          <div className="space-y-3">
            {filteredStudies.map(study => {
              const isExpanded = expandedId === study.id;

              return (
                <div
                  key={study.id}
                  className={`rounded-3xl border transition-all ${
                    isExpanded 
                      ? 'bg-slate-900/95 border-emerald-500/40 shadow-lg' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : study.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          {study.bookOfBible} · {study.chapterAndVerses}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Por: {study.authorName}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {study.title}
                      </h3>
                      <span className="text-xs text-amber-400 font-semibold block mt-0.5">
                        Tema: {study.topic}
                      </span>
                    </div>

                    <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-150">
                      
                      {/* Contenido teológico del estudio */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-850">
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                            Desarrollo del Estudio Bíblico
                          </span>
                          <button
                            onClick={() => handleSaveMarker(study.chapterAndVerses)}
                            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                            <span>Marcar este pasaje como última lectura</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif">
                          {study.content}
                        </p>
                      </div>

                      {/* Materiales y Referencias */}
                      {study.materials.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs">
                          <span className="text-slate-400 font-bold block mb-1">Materiales y Referencias Bíblicas:</span>
                          <div className="flex flex-wrap gap-2">
                            {study.materials.map((mat, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                                📚 {mat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preguntas de Reflexión Personal y Grupal con Respuestas */}
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-emerald-400" />
                          <span>Preguntas para Reflexión y Comentarios de la Comunidad:</span>
                        </h4>

                        {study.reflectionQuestions.length > 0 ? (
                          <div className="space-y-3">
                            {study.reflectionQuestions.map(q => (
                              <div key={q.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2.5 text-xs">
                                <span className="font-bold text-white block">
                                  {q.question}
                                </span>

                                {/* Respuestas enviadas */}
                                {q.answers.length > 0 && (
                                  <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500/40">
                                    {q.answers.map(ans => (
                                      <div key={ans.id} className="text-[11px] text-slate-300 space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-emerald-300">{ans.authorName}:</span>
                                          <span className="text-[10px] text-slate-500">{ans.createdAt}</span>
                                        </div>
                                        <p className="italic text-slate-300">«{ans.answerText}»</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Formulario para responder la pregunta */}
                                {activeQuestionId === q.id ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <input
                                      type="text"
                                      value={answerInput}
                                      onChange={(e) => setAnswerInput(e.target.value)}
                                      placeholder="Tu respuesta a la luz de la Biblia..."
                                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                      onClick={() => handleSendAnswer(study.id, q.id)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                                    >
                                      Enviar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveQuestionId(q.id);
                                      setAnswerInput('');
                                    }}
                                    className="text-[11px] text-emerald-400 hover:underline font-semibold block"
                                  >
                                    + Aportar mi respuesta a esta pregunta
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No hay preguntas de reflexión registradas en este estudio.</p>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}

            {filteredStudies.length === 0 && (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  No se encontraron estudios bíblicos con los filtros actuales
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Como líder juvenil, puedes agregar un nuevo estudio bíblico organizado por libro y tema.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Crear Nuevo Estudio Bíblico
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SESIONES PROGRAMADAS */}
      {activeTab === 'sesiones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Calendario de Sesiones de Estudio Bíblico
            </h3>
            <button
              onClick={() => setShowSessionModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Programar Sesión</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessions.map(sess => (
              <div
                key={sess.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sess.mode === 'virtual' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {sess.mode === 'virtual' ? 'Sesión Virtual' : 'Presencial'}
                  </span>

                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span>{sess.time}</span>
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white">
                  {sess.title}
                </h4>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Fecha:</strong> {sess.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span><strong>Lugar / Enlace:</strong> {sess.locationOrUrl}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Organiza: {sess.hostName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: MARCADOR & PLAN DE LECTURA */}
      {activeTab === 'planes' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Bookmark className="h-4 w-4" />
              <span>Último Punto de Lectura Guardado</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Marcador Actual: <span className="text-amber-400">{savedMarker}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tu marcador se conserva de forma persistente para que retomes tu lectura bíblica exactamente donde quedaste.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Plan de Lectura del Año Bíblico Juvenil
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lectura sistemática de los 66 libros de la Biblia. Avanza capítulo a capítulo y marca tu progreso diario.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Lectura de hoy:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Día 298 de 365
                </span>
              </div>
              <p className="text-slate-300">
                Pasaje recomendado: <strong>Daniel 2 y Daniel 3</strong> (Fidelidad inquebrantable en Babilonia).
              </p>
              <button
                onClick={() => handleSaveMarker('Daniel 3:18')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                ✓ Guardar como Marcador de Lectura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Estudio Bíblico */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Publicar Nuevo Estudio Bíblico</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título del Estudio: *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Daniel 7: Las Cuatro Bestias y el Juicio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Libro de la Biblia:</label>
                  <input
                    type="text"
                    required
                    value={newBook}
                    onChange={(e) => setNewBook(e.target.value)}
                    placeholder="Ej: Daniel, Apocalipsis, Romanos, Juan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Capítulos y Versículos:</label>
                  <input
                    type="text"
                    value={newPassage}
                    onChange={(e) => setNewPassage(e.target.value)}
                    placeholder="Ej: Daniel 7:9-14"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tema Principal:</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Ej: El Santuario Celestial y el Juicio Investigador"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contenido y Puntos de Estudio: *</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Escribe el desarrollo del estudio bíblico..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 resize-none font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Materiales y Referencias (uno por línea):</label>
                <textarea
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-[11px] font-mono focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  Publicar Estudio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Programar Sesión */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Programar Sesión de Estudio</h3>
              <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título de la Sesión: *</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Ej: Estudio Zonal sobre las 70 Semanas"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hora:</label>
                  <input
                    type="text"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    placeholder="07:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Modalidad:</label>
                <select
                  value={sessionMode}
                  onChange={(e) => setSessionMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="presencial">Presencial en Templo</option>
                  <option value="virtual">Virtual por Enlace</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Lugar o Enlace:</label>
                <input
                  type="text"
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                  placeholder={sessionMode === 'virtual' ? 'https://meet.google.com/...' : 'Iglesia Central de Buenaventura'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!sessionTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  Agendar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
