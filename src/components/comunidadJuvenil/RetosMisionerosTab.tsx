import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Award, 
  Clock, 
  Users, 
  BookOpen, 
  Plus, 
  Upload, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { ServiceChallenge, ServiceChallengeStatus } from './types';
import confetti from 'canvas-confetti';

export const RetosMisionerosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [challenges, setChallenges] = useState<ServiceChallenge[]>(comunidadStorage.getChallenges());
  const [activeTab, setActiveTab] = useState<'disponibles' | 'mis_retos' | 'revision'>('disponibles');

  // Submit Evidence Modal
  const [selectedChallengeForEvidence, setSelectedChallengeForEvidence] = useState<ServiceChallenge | null>(null);
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Review Evidence Modal
  const [reviewingChallenge, setReviewingChallenge] = useState<ServiceChallenge | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setChallenges(comunidadStorage.getChallenges());
    });
    return unsub;
  }, []);

  const handleEnroll = (challengeId: string) => {
    comunidadStorage.enrollInChallenge(challengeId, currentUser.id);
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForEvidence || !evidenceDesc.trim() || !consentConfirmed) return;

    comunidadStorage.submitChallengeEvidence(selectedChallengeForEvidence.id, {
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      userAvatar: currentUser.avatar,
      description: evidenceDesc.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
      consentConfirmed: true
    });

    setSelectedChallengeForEvidence(null);
    setEvidenceDesc('');
    setEvidenceUrl('');
    setConsentConfirmed(false);
  };

  const handleApproveEvidence = (challengeId: string, targetUserId: string) => {
    comunidadStorage.approveChallengeEvidence(
      challengeId,
      targetUserId,
      `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      reviewNotes.trim() || 'Aprobado con gozo cristiano.'
    );
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setReviewingChallenge(null);
    setReviewNotes('');
  };

  const misRetos = challenges.filter(c => c.enrolledUserIds.includes(currentUser.id));
  const pendientesRevision = challenges.filter(c => 
    c.responsibleId === currentUser.id || currentUser.role === 'admin'
  );

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>FUNCIÓN REAL F · RETOS DE SERVICIO CRISTIANO</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Acción Misionera y Servicio Solidario
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Inscripción a retos comunitarios, acompañamiento de adultos mayores con consentimiento ético, 
            envío de evidencias con salvaguardas de privacidad y aprobación oficial por líderes responsables.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('disponibles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'disponibles' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disponibles ({challenges.length})
          </button>
          <button
            onClick={() => setActiveTab('mis_retos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mis_retos' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mis Retos Activos ({misRetos.length})
          </button>
          {pendientesRevision.length > 0 && (
            <button
              onClick={() => setActiveTab('revision')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'revision' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Revisar Evidencias
            </button>
          )}
        </div>
      </div>

      {/* Grid de Retos */}
      <div className="grid grid-cols-1 gap-4">
        {(activeTab === 'disponibles' ? challenges : activeTab === 'mis_retos' ? misRetos : pendientesRevision).map(item => {
          const userStatus: ServiceChallengeStatus = item.userStatuses[currentUser.id] || 'pendiente';
          const isEnrolled = item.enrolledUserIds.includes(currentUser.id);
          const isResponsible = item.responsibleId === currentUser.id || currentUser.role === 'admin';
          const pendingEvidences = item.evidences.filter(e => item.userStatuses[e.userId] === 'enviado');

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 transition-all shadow-md space-y-4 ${
                userStatus === 'completado'
                  ? 'bg-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Responsable: {item.responsibleName}
                    </span>
                    {item.deadline && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>Límite: {item.deadline}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {item.title}
                  </h3>
                </div>

                {/* Badge de Estado del Usuario */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {isEnrolled ? (
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      userStatus === 'completado'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : userStatus === 'enviado'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {userStatus === 'completado' && '✓ Completado'}
                      {userStatus === 'enviado' && '⏳ Evidencia en Revisión'}
                      {userStatus === 'en_progreso' && '⚡ En Progreso'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(item.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md"
                    >
                      Inscribirme al Reto
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              {/* Instrucciones y Criterios */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                  Criterios e Instrucciones de Cumplimiento:
                </span>
                <ul className="space-y-1">
                  {item.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="h-4 w-4 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                  <strong>Criterio de aprobación:</strong> {item.criteria}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-serif italic">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>{item.bibleVerse}</span>
              </div>

              {/* Acciones de Avance / Enviar Evidencia */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  {item.enrolledUserIds.length} jóvenes participando
                </span>

                <div className="flex items-center gap-2">
                  {isEnrolled && userStatus === 'en_progreso' && (
                    <button
                      onClick={() => setSelectedChallengeForEvidence(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Presentar Evidencia</span>
                    </button>
                  )}

                  {isResponsible && pendingEvidences.length > 0 && (
                    <button
                      onClick={() => setReviewingChallenge(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Revisar ({pendingEvidences.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Presentar Evidencias con Consentimiento y Privacidad */}
      {selectedChallengeForEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Presentar Evidencias del Reto</h3>
              </div>
              <button onClick={() => setSelectedChallengeForEvidence(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reto: <strong>{selectedChallengeForEvidence.title}</strong>
            </p>

            <form onSubmit={handleSubmitEvidence} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descripción de la actividad realizada: *</label>
                <textarea
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Detalla cómo llevaste a cabo el reto, a quiénes serviste y qué versículo compartiste..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Enlace a fotografía o evidencia (opcional):</label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Cláusula estricta de consentimiento y privacidad requerida */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                  />
                  <div className="text-[11px] text-slate-300 leading-snug">
                    <span className="font-bold text-amber-400 block mb-0.5">Consentimiento ético y protección de privacidad:</span>
                    Confirmo que cualquier persona o adulto mayor mencionado o fotografiado ha otorgado su consentimiento informado previo para este reporte eclesiástico juvenil, respetando plenamente su dignidad.
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForEvidence(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!evidenceDesc.trim() || !consentConfirmed}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  Enviar para Aprobación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Revisar Evidencias (Líder Responsable) */}
      {reviewingChallenge && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Revisión de Evidencias</h3>
              </div>
              <button onClick={() => setReviewingChallenge(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {reviewingChallenge.evidences
                .filter(ev => reviewingChallenge.userStatuses[ev.userId] === 'enviado')
                .map(ev => (
                  <div key={ev.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{ev.userName}</span>
                      <span className="text-[10px] text-slate-500">{ev.submittedAt}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{ev.description}</p>

                    {ev.evidenceUrl && (
                      <div className="rounded-xl overflow-hidden max-h-40 border border-slate-800">
                        <img src={ev.evidenceUrl} alt="Evidencia" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Consentimiento informado confirmado por el usuario</span>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-end gap-2">
                      <input
                        type="text"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Nota o palabra de aliento del líder..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                      <button
                        onClick={() => handleApproveEvidence(reviewingChallenge.id, ev.userId)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                      >
                        ✓ Aprobar Reto
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReviewingChallenge(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
