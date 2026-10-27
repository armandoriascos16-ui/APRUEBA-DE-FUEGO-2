import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiblePlan } from '../../types';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Share2, 
  Calendar, 
  Flame, 
  ArrowLeft, 
  Users, 
  Check, 
  Clock 
} from 'lucide-react';

export const BiblePlansView: React.FC = () => {
  const { 
    currentUser, 
    biblePlans, 
    toggleJoinBiblePlan, 
    toggleCompleteBiblePlanDay, 
    setActiveTab 
  } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(biblePlans[0]?.id || null);

  const activePlan = biblePlans.find(p => p.id === selectedPlanId) || biblePlans[0];
  const isJoined = activePlan?.joinedUserIds.includes(currentUser.id) ?? false;

  const completedDaysCount = activePlan?.days.filter(d => d.completed).length || 0;
  const totalDays = activePlan?.days.length || 1;
  const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

  const handleSharePlan = () => {
    const text = `¡Estoy completando el plan bíblico "${activePlan.title}" (${progressPercent}% completado) en A Prueba de Fuego! 📖✨`;
    if (navigator.share) {
      navigator.share({ title: activePlan.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Progreso del plan bíblico copiado al portapapeles para compartir!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Planes Bíblicos Diarios</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Crece espiritualmente con lecturas estructuradas
            </p>
          </div>
        </div>

        <button
          onClick={handleSharePlan}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Compartir</span>
        </button>
      </div>

      {/* Plan Selector Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {biblePlans.map((plan) => {
          const isCurrent = plan.id === selectedPlanId;
          const joined = plan.joinedUserIds.includes(currentUser.id);
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>{plan.title}</span>
              {joined && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Plan Hero Card */}
      {activePlan && (
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          <div className="relative h-44 sm:h-52 w-full">
            <img
              src={activePlan.coverImage}
              alt={activePlan.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                {activePlan.durationDays} Días
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-medium flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-400" />
                <span>{activePlan.participantsCount} participantes</span>
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {activePlan.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                {activePlan.description}
              </p>
            </div>
          </div>

          {/* Progress & Join Bar */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Progreso de lectura</span>
                <p className="text-[11px] text-slate-400">
                  {completedDaysCount} de {totalDays} lecturas ({progressPercent}%)
                </p>
              </div>

              <button
                onClick={() => toggleJoinBiblePlan(activePlan.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isJoined
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                }`}
              >
                {isJoined ? '✓ Siguiendo plan' : '+ Unirme al plan'}
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Days Checklist */}
          <div className="p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lecturas del Plan:
            </h4>

            {activePlan.days.map((day) => (
              <div
                key={day.dayNumber}
                onClick={() => toggleCompleteBiblePlanDay(activePlan.id, day.dayNumber)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  day.completed
                    ? 'bg-blue-950/30 border-blue-500/40 text-slate-200'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {day.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white">
                      Día {day.dayNumber}: {day.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/20 shrink-0">
                      📖 {day.reading}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic mt-1 leading-relaxed">
                    “{day.verseText}”
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
