import React, { useState } from 'react';
import { 
  YOUTH_ACTIVITY_IDEAS, 
  FUNDRAISING_GUIDES, 
  WORK_PLAN_TEMPLATES, 
  YouthActivityIdea, 
  FundraisingGuide, 
  WorkPlanTemplate 
} from '../../data/adventistResourcesData';
import { 
  Sparkles, 
  Lightbulb, 
  DollarSign, 
  Calendar, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Share2, 
  Heart, 
  Flame,
  FileText,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const YouthActivitiesPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'actividades' | 'fondos' | 'planes'>('actividades');
  const [selectedActivity, setSelectedActivity] = useState<YouthActivityIdea | null>(null);
  const [selectedFundraiser, setSelectedFundraiser] = useState<FundraisingGuide | null>(null);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('all');

  const filteredActivities = YOUTH_ACTIVITY_IDEAS.filter(act => {
    if (activityCategoryFilter === 'all') return true;
    return act.category === activityCategoryFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-600/30 via-orange-950/40 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>GUÍAS DIDÁCTICAS PARA LÍDERES JUVENILES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Portal de Ideas & Planes de Trabajo JA
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Programas completos y didácticos para la Sociedad de Jóvenes, dinámicas de fe, estrategias éticas de recaudación de fondos y planes anuales listos para transformar tu ministerio local.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actividades</span>
              <span className="text-xl font-black text-amber-400">{YOUTH_ACTIVITY_IDEAS.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pro-Fondos</span>
              <span className="text-xl font-black text-orange-400">{FUNDRAISING_GUIDES.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('actividades')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'actividades'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Ideas para Sociedad JA ({YOUTH_ACTIVITY_IDEAS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fondos')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'fondos'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Recaudación de Fondos Éticos ({FUNDRAISING_GUIDES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('planes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'planes'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Planes de Trabajo 2026</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: IDEAS PARA ACTIVIDADES JUVENILES */}
      {/* ========================================================================= */}
      {activeTab === 'actividades' && (
        <div className="space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActivityCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityCategoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActivityCategoryFilter('rompehielos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityCategoryFilter === 'rompehielos'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Rompehielos
            </button>
            <button
              onClick={() => setActivityCategoryFilter('programa_ja')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityCategoryFilter === 'programa_ja'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Dramas & Programas
            </button>
            <button
              onClick={() => setActivityCategoryFilter('gymkhana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityCategoryFilter === 'gymkhana'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Gymkhanas & Circuitos
            </button>
            <button
              onClick={() => setActivityCategoryFilter('mision_social')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityCategoryFilter === 'mision_social'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Misión Urbana
            </button>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                      {act.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {act.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{act.title}</h3>
                  <p className="text-xs text-amber-400/90 font-medium mb-2 italic">
                    Tema: {act.biblicalTheme}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 mb-3 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Objetivo Didáctico:
                    </span>
                    <p>{act.objective}</p>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <span className="font-bold text-slate-300">Materiales necesarios:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {act.materialsRequired.map((mat, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px]">
                          • {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {act.bibleVerse}
                  </span>
                  <button
                    onClick={() => setSelectedActivity(act)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
                  >
                    <span>Ver Paso a Paso</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Step-by-Step Modal */}
          {selectedActivity && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 my-8">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Instrucciones Didácticas JA
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedActivity.title}</h3>
                    <p className="text-xs text-slate-400">{selectedActivity.bibleVerse}</p>
                  </div>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Step by step */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Pasos Didácticos para Realizarla:
                  </span>
                  <div className="space-y-2">
                    {selectedActivity.stepByStepGuide.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Director Tips */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Consejo para el Director de Jóvenes:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedActivity.directorTips}
                  </p>
                </div>

                {/* Discussion */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 uppercase">
                    Pregunta para la conclusión espiritual:
                  </span>
                  <p className="text-xs text-white italic">
                    "{selectedActivity.discussionPrompt}"
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white font-bold hover:bg-slate-700"
                  >
                    Cerrar Guía
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: RECAUDACIÓN DE FONDOS ÉTICOS JA */}
      {/* ========================================================================= */}
      {activeTab === 'fondos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Principios Adventistas de Recaudación Juvenil</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Todas las actividades aquí propuestas están fundamentadas en la ética cristiana: servicio honesto, alimentos saludables (reforma pro-salud) y desarrollo de habilidades manuales e industriales. Quedan expresamente excluidas las rifas de azar y actividades que comprometan la santidad del sábado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FUNDRAISING_GUIDES.map((fund) => (
              <div
                key={fund.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 flex flex-col justify-between space-y-4 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                      {fund.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{fund.timeline}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{fund.title}</h3>
                  
                  <div className="my-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Recaudación Estimada:
                    </span>
                    <span className="text-sm font-black text-white">{fund.estimatedEarnings}</span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {fund.objective}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <span className="font-bold text-slate-300 block">Presupuesto Sugerido:</span>
                    {fund.budgetSample.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-800/80">
                        <span className="truncate max-w-[170px]">{item.item}</span>
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {item.cost > 0 ? `-$${item.cost.toLocaleString()}` : `+$${item.expectedReturn.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedFundraiser(fund)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ver Plan de Ejecución</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Fundraiser Plan Modal */}
          {selectedFundraiser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 my-8">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Proyecto de Recaudación Pro-Fondos JA
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedFundraiser.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedFundraiser(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-white block">Pasos de Ejecución para la Directiva:</span>
                  {selectedFundraiser.executionSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      {step}
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
                  <span className="font-bold text-emerald-400 block">Nota Ética & Espíritu de Profecía:</span>
                  <p className="text-slate-300 italic">{selectedFundraiser.adventistPrinciplesNote}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedFundraiser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white font-bold hover:bg-slate-700"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: PLANES DE TRABAJO 2026 */}
      {/* ========================================================================= */}
      {activeTab === 'planes' && (
        <div className="space-y-6">
          {WORK_PLAN_TEMPLATES.map((plan) => (
            <div key={plan.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase">
                    {plan.scope} {plan.year}
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">{plan.title}</h3>
                  <p className="text-xs text-amber-400/90 font-medium italic mt-0.5">{plan.motto}</p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `*${plan.title}*\n${plan.motto}\n\n*Objetivos Espirituales:*\n` +
                      plan.spiritualGoals.map(g => `• ${g}`).join('\n') +
                      `\n\n*Objetivos Misioneros:*\n` +
                      plan.missionaryGoals.map(m => `• ${m}`).join('\n')
                    );
                    alert('¡Plan de trabajo copiado al portapapeles para compartir con la junta de iglesia!');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Copiar Plan de Trabajo</span>
                </button>
              </div>

              {/* Goals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    🎯 Metas Espirituales:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.spiritualGoals.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                    🔥 Metas Misioneras:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.missionaryGoals.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-400 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Monthly Schedule Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">
                  Calendario Mes a Mes de Actividades Juveniles (Enero a Diciembre):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.monthlySchedule.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">{m.month}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold">
                          Mes #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white">{m.mainEvent}</p>
                      <div className="text-[10px] text-slate-400 flex flex-wrap gap-1 pt-1">
                        {m.weeklyFocus.map((f, i) => (
                          <span key={i} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committee Roles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">
                  Matriz de Responsabilidades de la Directiva JA:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.leadershipRoles.map((r, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="font-bold text-amber-400 block mb-0.5">{r.role}</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{r.responsibility}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
