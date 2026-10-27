import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DAILY_CHALLENGES_SCHEDULE } from '../../data/adventistResourcesData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Activity,
  Flame
} from 'lucide-react';

interface WeeklyConsistencyWidgetProps {
  className?: string;
}

export const WeeklyConsistencyWidget: React.FC<WeeklyConsistencyWidgetProps> = ({ className = '' }) => {
  const { currentUser, submissions } = useApp();
  const [chartType, setChartType] = useState<'bars' | 'area'>('bars');

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado

  // Construir datos semanales (Domingo a Sábado)
  const weeklyData = useMemo(() => {
    return DAILY_CHALLENGES_SCHEDULE.map((schedule) => {
      const dayIndex = schedule.dayOfWeek;
      const todayBadgeId = `badge_daily_${dayIndex}`;

      // Verificar si el usuario completó el reto de este día
      const hasBadge = (currentUser?.badges || []).some((b) => b.id === todayBadgeId);
      const hasSubmission = submissions.some(
        (s) =>
          s.userId === currentUser.id &&
          s.status === 'approved' &&
          (s.challengeId.startsWith(`daily_${dayIndex}`) || s.challengeTitle.includes(schedule.dayName))
      );

      const isCompleted = hasBadge || hasSubmission;
      const isToday = dayIndex === currentDayOfWeek;
      const isPast = dayIndex < currentDayOfWeek;
      const isUpcoming = dayIndex > currentDayOfWeek;

      // Puntos asignados
      const pointsEarned = isCompleted ? schedule.points : 0;
      const targetPoints = schedule.points;

      // Abreviación para el eje X
      const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

      return {
        dayIndex,
        dayName: schedule.dayName,
        shortDay: shortDays[dayIndex],
        theme: schedule.theme,
        title: schedule.title,
        icon: schedule.icon,
        isCompleted,
        isToday,
        isPast,
        isUpcoming,
        pointsEarned,
        targetPoints,
        // Acumulado para vista de área
        statusLabel: isCompleted
          ? '✓ Completado'
          : isToday
          ? '⚡ Reto de Hoy'
          : isPast
          ? 'No realizado'
          : '📅 Próximo',
      };
    });
  }, [currentUser, submissions, currentDayOfWeek]);

  // Datos con acumulación progresiva para la vista de Área
  const cumulativeData = useMemo(() => {
    let runningTotal = 0;
    return weeklyData.map((d) => {
      runningTotal += d.pointsEarned;
      return {
        ...d,
        accumulatedPoints: runningTotal,
      };
    });
  }, [weeklyData]);

  // Métricas de consistencia
  const completedDaysCount = weeklyData.filter((d) => d.isCompleted).length;
  const consistencyRate = Math.round((completedDaysCount / 7) * 100);
  const totalPointsEarned = weeklyData.reduce((acc, d) => acc + d.pointsEarned, 0);
  const totalPossiblePoints = weeklyData.reduce((acc, d) => acc + d.targetPoints, 0);

  // Custom Tooltip para el gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-3 shadow-2xl text-xs space-y-1 z-50 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>{data.icon}</span>
              <span>{data.dayName}</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                data.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : data.isToday
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {data.statusLabel}
            </span>
          </div>
          <p className="text-[11px] text-amber-300 font-semibold">{data.theme}</p>
          <div className="flex items-center justify-between text-slate-300 pt-1">
            <span>Puntos obtenidos:</span>
            <span className="font-black text-amber-400">
              {data.pointsEarned} / {data.targetPoints} pts
            </span>
          </div>
          {chartType === 'area' && (
            <div className="flex items-center justify-between text-slate-300 text-[10px] border-t border-slate-800 pt-1">
              <span>Acumulado semanal:</span>
              <span className="font-bold text-emerald-400">{data.accumulatedPoints} pts</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl relative overflow-hidden ${className}`}>
      
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Metrics and View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black uppercase text-amber-400 mb-1">
            <Activity className="h-3 w-3" />
            <span>Métrica de Consistencia Espiritual</span>
          </div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            Progreso Semanal de Retos
          </h3>
          <p className="text-xs text-slate-400">
            Monitorea tu constancia día a día de Domingo a Sábado y mantén tu fuego encendido.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setChartType('bars')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartType === 'bars'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Barras</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartType === 'area'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Curva</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Días Cumplidos</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-lg font-black text-white">
              {completedDaysCount} <span className="text-xs text-slate-500 font-normal">/ 7</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consistencia</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span className="text-lg font-black text-amber-400">{consistencyRate}%</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Puntos Semanales</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-lg font-black text-white">
              +{totalPointsEarned} <span className="text-[10px] text-slate-500 font-normal">pts</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Racha Activa</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flame className="h-4 w-4 text-rose-500 fill-rose-500" />
            <span className="text-lg font-black text-white">
              {currentUser.stats?.activeStreakDays || completedDaysCount} <span className="text-[10px] text-slate-500 font-normal">días</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bars' ? (
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Gradient for Completed Bars */}
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>

                {/* Gradient for Today's Active Bar */}
                <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity={0.8} />
                </linearGradient>

                {/* Gradient for Pending Bars */}
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#334155" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="shortDay" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[0, 220]}
                ticks={[0, 50, 100, 150, 200]}
              />

              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />

              <Bar 
                dataKey="pointsEarned" 
                radius={[8, 8, 4, 4]} 
                maxBarSize={42}
              >
                {weeklyData.map((entry, index) => {
                  let fill = 'url(#pendingGrad)';
                  if (entry.isCompleted) {
                    fill = 'url(#completedGrad)';
                  } else if (entry.isToday) {
                    fill = 'url(#todayGrad)';
                  }
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fill}
                      stroke={entry.isToday ? '#F59E0B' : entry.isCompleted ? '#10B981' : '#334155'}
                      strokeWidth={entry.isToday ? 2 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis 
                dataKey="shortDay" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area 
                type="monotone" 
                dataKey="accumulatedPoints" 
                stroke="#F59E0B" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#areaGrad)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Mini Days Badge Track */}
      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-7 gap-1 sm:gap-2">
        {weeklyData.map((day) => (
          <div
            key={day.dayIndex}
            className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-between ${
              day.isCompleted
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : day.isToday
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/30'
                : 'bg-slate-950 border-slate-850 text-slate-500'
            }`}
          >
            <span className="text-[10px] font-bold uppercase">{day.shortDay}</span>
            <span className="text-base my-0.5">{day.icon}</span>
            <span className="text-[10px] font-black">
              {day.isCompleted ? `+${day.targetPoints}` : day.isToday ? 'Hoy' : '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Encouragement message */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>
            {consistencyRate >= 70
              ? '🔥 ¡Excelente consistencia! Eres un fiel testimonio juvenil.'
              : consistencyRate >= 40
              ? '⚡ Buen ritmo de avance, ¡sigue perseverando en la fe!'
              : '🌱 Da el paso hoy y completa el reto para impulsar tu racha.'}
          </span>
        </span>
        <span className="font-semibold text-slate-300">
          Meta: 7 / 7 días
        </span>
      </div>

    </div>
  );
};
