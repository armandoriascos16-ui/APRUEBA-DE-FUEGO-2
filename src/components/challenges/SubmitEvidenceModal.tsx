import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Challenge } from '../../types';
import { compressImageFromGallery, processVideoFromGallery } from '../../utils/mediaUtils';
import { VerificationResult } from '../../services/challengeVerificationService';
import { 
  X, 
  Camera, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Film, 
  Loader2, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SubmitEvidenceModalProps {
  challenge: Challenge;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitEvidenceModal: React.FC<SubmitEvidenceModalProps> = ({ challenge, onClose, onSuccess }) => {
  const { currentUser, submitChallengeEvidence } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reflection, setReflection] = useState('');
  const [approximateLocation, setApproximateLocation] = useState(currentUser.city || 'Bogotá, Colombia');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [studyTheme, setStudyTheme] = useState('');
  const [bibleVerseUsed, setBibleVerseUsed] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState(challenge.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Submission process state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<VerificationResult | null>(null);

  // Check challenge requirements type
  const isBibleStudy = challenge.id === 'ch_reto_6_dar_estudio_biblico';
  const isPreaching = challenge.id === 'ch_reto_7_predicar_colegio_universidad';
  const isLiterature = challenge.id === 'ch_reto_2_repartir_literatura';
  const isElderVisit = challenge.id === 'ch_reto_3_visitar_adulto_mayor';
  const isInviteFriend = challenge.id === 'ch_reto_1_invitar_amigo';

  const sampleEvidencePhotos = [
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&q=80',
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadFeedback('Procesando archivo...');
    try {
      if (file.type.startsWith('video/')) {
        const videoRes = await processVideoFromGallery(file);
        setMediaUrl(videoRes.url);
        setMediaType('video');
        const durText = videoRes.duration ? ` (${videoRes.duration.toFixed(0)}s)` : '';
        setUploadFeedback(`Video cargado${durText}`);
      } else {
        const imgRes = await compressImageFromGallery(file, 1024, 1024, 0.8);
        setMediaUrl(imgRes.dataUrl);
        setMediaType('photo');
        setUploadFeedback(`Fotografía optimizada (${imgRes.sizeKb} KB)`);
      }
    } catch (err) {
      console.error(err);
      setUploadFeedback('Error al procesar archivo. Intenta con otra imagen o video.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitChallengeEvidence({
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        challengePoints: challenge.points,
        userId: currentUser.id,
        userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
        userUsername: currentUser.username,
        userAvatar: currentUser.avatar,
        userChurch: currentUser.church,
        date,
        approximateLocation: approximateLocation.trim(),
        commentReflection: reflection.trim(),
        studyTheme: studyTheme.trim() || undefined,
        bibleVerseUsed: bibleVerseUsed.trim() || undefined,
        materialsUsed: materialsUsed.trim() || undefined,
        mediaType,
        mediaUrl,
      });

      setVerificationFeedback(result);
    } catch (err) {
      console.error('Error submitting challenge evidence:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 my-8">
        
        {/* If verification feedback exists, show the result modal */}
        {verificationFeedback ? (
          <div className="py-2 text-center space-y-4">
            {verificationFeedback.status === 'approved' && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    ¡Reto Aprobado Automáticamente!
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">
                    +{challenge.points} Puntos Otorgados
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    {verificationFeedback.reason}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Reto completado:</span>
                    <strong className="text-white">{challenge.title}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Nivel actual:</span>
                    <strong className="text-amber-400">{currentUser.levelName} ({currentUser.points} pts)</strong>
                  </div>
                  {verificationFeedback.suggestedFeedback && (
                    <p className="text-[11px] text-emerald-300/90 pt-1 border-t border-slate-800">
                      💡 {verificationFeedback.suggestedFeedback}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSuccess?.();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  Continuar
                </button>
              </div>
            )}

            {verificationFeedback.status === 'pending' && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    Evidencia en Revisión Responsable
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    Tu participación ha sido registrada
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    {verificationFeedback.reason}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5">
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-slate-200">Revisión moderada:</strong> Para garantizar la integridad y el respeto a la privacidad, un moderador validará tu evidencia antes de asignar los <strong>+{challenge.points} puntos</strong>.
                  </p>
                  {verificationFeedback.suggestedFeedback && (
                    <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
                      ℹ️ {verificationFeedback.suggestedFeedback}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSuccess?.();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                >
                  Entendido, ver mis retos
                </button>
              </div>
            )}

            {verificationFeedback.status === 'more_info' && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
                    Información Adicional Requerida
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    Ajusta los detalles de tu evidencia
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    {verificationFeedback.reason}
                  </p>
                </div>

                {verificationFeedback.suggestedFeedback && (
                  <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-left text-xs text-orange-200">
                    📝 <strong>Sugerencia:</strong> {verificationFeedback.suggestedFeedback}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerificationFeedback(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Completar datos requeridos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {verificationFeedback.status === 'rejected' && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                    Participación No Válida
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    No fue posible aprobar la evidencia
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    {verificationFeedback.reason}
                  </p>
                </div>

                {verificationFeedback.suggestedFeedback && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300">
                    ℹ️ {verificationFeedback.suggestedFeedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Retos Juveniles A Prueba de Fuego
                </span>
                <h2 className="text-base font-bold text-white">Presentar Evidencia</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Challenge Summary Banner */}
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{challenge.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{challenge.title}</p>
                  <p className="text-[10px] text-amber-300">
                    Dificultad: {challenge.difficulty} • Recompensa: +{challenge.points} puntos
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black shrink-0">
                +{challenge.points} pts
              </div>
            </div>

            {/* Specific Instructions & Privacy Notice */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Objetivo:</strong> {challenge.instructions || challenge.description}
                </p>
              </div>
              {challenge.requiredEvidence && (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-850">
                  <AlertCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Requisito de evidencia:</strong> {challenge.requiredEvidence}
                  </p>
                </div>
              )}
            </div>

            {/* Special privacy alerts */}
            {isElderVisit && (
              <div className="mt-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protección de privacidad:</strong> Asegúrate de contar con el consentimiento del adulto mayor. No publiques teléfonos ni datos sensibles privados.
                </span>
              </div>
            )}
            {isInviteFriend && (
              <div className="mt-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Respeto y privacidad:</strong> Puedes mencionar el nombre de pila de tu amigo/a invitado(a). No incluyas números telefónicos ni datos privados.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              
              {/* Reflection / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción y reflexión de la experiencia: <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Describe cómo realizaste el reto, qué impacto tuvo y qué enseñanza dejó en tu corazón..."
                  rows={3}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              {/* Conditional fields based on challenge */}
              {(isBibleStudy || isPreaching) && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Datos bíblicos del {isBibleStudy ? 'estudio' : 'mensaje predicado'}:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Tema bíblico:</label>
                      <input
                        type="text"
                        value={studyTheme}
                        onChange={(e) => setStudyTheme(e.target.value)}
                        placeholder="Ej: La segunda venida de Cristo"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Cita o pasaje bíblico:</label>
                      <input
                        type="text"
                        value={bibleVerseUsed}
                        onChange={(e) => setBibleVerseUsed(e.target.value)}
                        placeholder="Ej: Juan 14:1-3, Apocalipsis 22"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {isLiterature && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título del libro o literatura entregada: <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    placeholder="Ej: El Gran Conflicto, Esperanza Más Allá del Mañana, Tratado misionero"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>Lugar aproximado:</span>
                  </label>
                  <input
                    type="text"
                    value={approximateLocation}
                    onChange={(e) => setApproximateLocation(e.target.value)}
                    placeholder="Ej: Iglesia Central, Escuela, Parque Central"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>Fecha de realización:</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Media Evidence Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-amber-400" />
                    <span>Fotografía o evidencia:</span>
                  </span>
                  {uploadFeedback && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {uploadFeedback}
                    </span>
                  )}
                </label>

                {/* Direct Device Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFile}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {isProcessingFile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                        <span>Optimizando evidencia...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-amber-400" />
                        <span>Subir desde mi Galería / Cámara</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preview of current media */}
                {mediaUrl && (
                  <div className="relative mb-2 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-36 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="max-h-36 w-auto" />
                    ) : (
                      <img src={mediaUrl} alt="Vista previa de evidencia" className="max-h-36 w-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] text-white font-medium flex items-center gap-1">
                      {mediaType === 'video' ? <Film className="h-3 w-3 text-amber-400" /> : <Camera className="h-3 w-3 text-amber-400" />}
                      <span>{mediaType === 'video' ? 'Video' : 'Foto'}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 mb-2">
                  {sampleEvidencePhotos.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setMediaUrl(img);
                        setMediaType('photo');
                      }}
                      className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        mediaUrl === img ? 'border-amber-400 scale-95 shadow-md shadow-amber-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Evidence option" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsible verification notice */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verificación Automática Responsable</span>
                </div>
                <p className="text-slate-400">
                  Si tu evidencia cuenta con la información clara y completa, los <strong>+{challenge.points} puntos</strong> se acreditarán automáticamente a tu perfil. De lo contrario, pasará a revisión de moderación.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!reflection.trim() || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black shadow-md hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Comprobando evidencia...</span>
                    </>
                  ) : (
                    <span>Enviar Evidencia (+{challenge.points} pts)</span>
                  )}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
