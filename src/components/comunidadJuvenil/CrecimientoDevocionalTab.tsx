import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Flame, 
  Lock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Heart, 
  Calendar, 
  Bell, 
  X,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { DEVOTIONAL_DAYS_PLAN } from './comunidadData';
import { SpiritualJournalEntry, SpiritualGoal } from './types';
import confetti from 'canvas-confetti';

export const CrecimientoDevocionalTab: React.FC = () => {
  const { currentUser } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'devocional' | 'diario' | 'metas'>('devocional');
  const [devotionalDays, setDevotionalDays] = useState(DEVOTIONAL_DAYS_PLAN);
  const [activeDayNumber, setActiveDayNumber] = useState(3);

  // Journal entries (strictly private to currentUser.id)
  const [journalEntries, setJournalEntries] = useState<SpiritualJournalEntry[]>(() =>
    comunidadStorage.getJournalEntries(currentUser.id)
  );
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalPassage, setJournalPassage] = useState('');
  const [journalGratitude, setJournalGratitude] = useState('');

  // Goals
  const [goals, setGoals] = useState<SpiritualGoal[]>(() =>
    comunidadStorage.getSpiritualGoals(currentUser.id)
  );

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setJournalEntries(comunidadStorage.getJournalEntries(currentUser.id));
      setGoals(comunidadStorage.getSpiritualGoals(currentUser.id));
    });
    return unsub;
  }, [currentUser.id]);

  const handleToggleDayComplete = (dayNum: number) => {
    setDevotionalDays(prev => prev.map(d => {
      if (d.dayNumber === dayNum) {
        const nextDone = !d.isCompleted;
        if (nextDone) {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        }
        return { ...d, isCompleted: nextDone };
      }
      return d;
    }));
  };

  const handleCreateJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const gratitudeArr = journalGratitude.split('\n').filter(g => g.trim().length > 0);

    comunidadStorage.addJournalEntry(
      currentUser.id,
      journalTitle.trim(),
      journalContent.trim(),
      journalPassage.trim() || undefined,
      gratitudeArr
    );

    setShowJournalModal(false);
    setJournalTitle('');
    setJournalContent('');
    setJournalPassage('');
    setJournalGratitude('');
  };

  const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);

  const confirmDeleteJournal = () => {
    if (!deletingJournalId) return;
    comunidadStorage.deleteJournalEntry(deletingJournalId, currentUser.id);
    setDeletingJournalId(null);
  };

  const handleIncrementGoal = (goalId: string) => {
    comunidadStorage.incrementGoal(goalId, currentUser.id);
  };

  const activeDay = devotionalDays.find(d => d.dayNumber === activeDayNumber) || devotionalDays[0];

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>FUNCIÓN REAL I · CRECIMIENTO ESPIRITUAL Y DIARIO PRIVADO</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Consagración & Hábitos Devocionales
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Planes de lectura del Año Bíblico, metas personales de oración y diario espiritual 
            estrictamente privado y encriptado en tu sesión personal.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('devocional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'devocional' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Devocional Diario
          </button>
          <button
            onClick={() => setActiveSubTab('diario')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'diario' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>Diario Privado ({journalEntries.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('metas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'metas' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hábitos & Metas
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DEVOCIONAL DIARIO */}
      {activeSubTab === 'devocional' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {devotionalDays.map(d => (
              <button
                key={d.dayNumber}
                onClick={() => setActiveDayNumber(d.dayNumber)}
                className={`px-4 py-2 rounded-2xl text-left border shrink-0 transition-all ${
                  activeDayNumber === d.dayNumber
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] mb-0.5">
                  <span className="font-bold">Día {d.dayNumber}</span>
                  {d.isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </div>
                <span className="text-xs font-bold block text-slate-200 truncate max-w-[130px]">
                  {d.title}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  Día {activeDay.dayNumber} · Año Bíblico
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {activeDay.title}
                </h3>
              </div>

              <button
                onClick={() => handleToggleDayComplete(activeDay.dayNumber)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto ${
                  activeDay.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                }`}
              >
                {activeDay.isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>✓ Lectura Completada</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Marcar Día Completado</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-amber-400 font-black text-xs block">{activeDay.bibleVerseRef}</span>
              <p className="text-xs sm:text-sm text-slate-200 italic font-serif leading-relaxed">
                {activeDay.bibleVerseText}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Reflexión Juvenil:</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">
                {activeDay.reflection}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  Desafío del Día:
                </span>
                <p className="text-amber-200/90 leading-relaxed">{activeDay.challengeOfDay}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-1">
                <span className="font-bold text-indigo-300 block flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  Oración Matutina:
                </span>
                <p className="text-slate-300 italic">{activeDay.prayerPoint}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DIARIO ESPIRITUAL PRIVADO */}
      {activeSubTab === 'diario' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
              <Lock className="h-4 w-4" />
              <span>Privacidad Garantizada: Nadie más puede ver tus entradas de diario</span>
            </div>

            <button
              onClick={() => setShowJournalModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Entrada Privada</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {journalEntries.map(entry => (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold block">{entry.date}</span>
                    <h4 className="text-sm sm:text-base font-bold text-white">{entry.title}</h4>
                  </div>

                  <button
                    onClick={() => setDeletingJournalId(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar entrada privada"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {entry.passageRead && (
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold inline-block">
                    📖 Lectura: {entry.passageRead}
                  </span>
                )}

                <p className="text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                  {entry.content}
                </p>

                {entry.gratitudeList && entry.gratitudeList.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs space-y-1">
                    <span className="text-amber-400 font-bold text-[11px] block">Motivos de Gratitud a Dios:</span>
                    <ul className="space-y-0.5">
                      {entry.gratitudeList.map((g, i) => (
                        <li key={i} className="text-slate-300 text-[11px] flex items-center gap-1.5">
                          <span className="text-amber-500">✓</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {journalEntries.length === 0 && (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <Lock className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Tu diario espiritual está vacío</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Comienza escribiendo tus oraciones íntimas, reflexiones de devoción matutina y motivos de gratitud a Dios.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: METAS Y SEGUIMIENTO DE HÁBITOS */}
      {activeSubTab === 'metas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map(goal => {
              const progressPct = Math.round((goal.currentCount / goal.targetCount) * 100);

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{goal.currentCount}/{goal.targetCount}</span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 text-[11px]">{progressPct}% completado</span>
                    <button
                      onClick={() => handleIncrementGoal(goal.id)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      + Registrar Hábito de Hoy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Nueva Entrada de Diario */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Escribir en Diario Privado</h3>
              </div>
              <button onClick={() => setShowJournalModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJournalEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título de la Meditación: *</label>
                <input
                  type="text"
                  required
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Ej: Dios me dio paz en la dificultad de hoy..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pasaje Bíblico Leído:</label>
                <input
                  type="text"
                  value={journalPassage}
                  onChange={(e) => setJournalPassage(e.target.value)}
                  placeholder="Ej: Salmos 23:1-6"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reflexión y Oración Íntima: *</label>
                <textarea
                  required
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  rows={4}
                  placeholder="Escribe libremente tus pensamientos y clamor a Dios..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Motivos de Gratitud (uno por línea):</label>
                <textarea
                  value={journalGratitude}
                  onChange={(e) => setJournalGratitude(e.target.value)}
                  rows={2}
                  placeholder="1. Por mi familia adventista&#10;2. Por salud en este día"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowJournalModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancelar
                </button>
                <button type="submit" disabled={!journalTitle.trim() || !journalContent.trim()} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50">
                  Guardar en mi Diario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación de Diario Privado */}
      {deletingJournalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Eliminar entrada del diario?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta reflexión personal será eliminada definitivamente de tu almacenamiento privado en este dispositivo.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingJournalId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteJournal}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Eliminar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
