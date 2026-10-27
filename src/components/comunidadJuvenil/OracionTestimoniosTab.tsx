import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Lock, 
  Globe, 
  Trash2, 
  Flag, 
  X, 
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { CommunityPrayerRequest } from './types';

export const OracionTestimoniosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [prayers, setPrayers] = useState<CommunityPrayerRequest[]>(() => 
    comunidadStorage.getPrayers(currentUser.id)
  );
  const [activeTab, setActiveTab] = useState<'peticiones' | 'testimonios' | 'mis_peticiones'>('peticiones');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newDistrict, setNewDistrict] = useState(currentUser.district || 'Distrito Central');
  const [isTestimonyMode, setIsTestimonyMode] = useState(false);
  const [newTestimonyText, setNewTestimonyText] = useState('');

  // Encouragement message
  const [activeEncouragementId, setActiveEncouragementId] = useState<string | null>(null);
  const [encouragementText, setEncouragementText] = useState('');

  // Mark answered modal
  const [answeringPrayer, setAnsweringPrayer] = useState<CommunityPrayerRequest | null>(null);
  const [testimonyInput, setTestimonyInput] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Report modal
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setPrayers(comunidadStorage.getPrayers(currentUser.id));
    });
    return unsub;
  }, [currentUser.id]);

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRequest.trim()) return;

    comunidadStorage.createPrayer({
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      authorDistrict: newDistrict,
      authorAvatar: currentUser.avatar,
      title: newTitle.trim(),
      request: newRequest.trim(),
      isPrivate: newIsPrivate
    });

    if (isTestimonyMode && newTestimonyText.trim()) {
      // Create directly marked answered
      const all = comunidadStorage.getPrayers(currentUser.id);
      if (all[0]) {
        comunidadStorage.markPrayerAnswered(all[0].id, currentUser.id, newTestimonyText.trim());
      }
    }

    setNewTitle('');
    setNewRequest('');
    setNewTestimonyText('');
    setIsTestimonyMode(false);
    setNewIsPrivate(false);
  };

  const handleTogglePrayFor = (id: string) => {
    comunidadStorage.togglePrayFor(id, currentUser.id);
  };

  const handleSendEncouragement = (prayerId: string) => {
    if (!encouragementText.trim()) return;
    comunidadStorage.addEncouragementMessage(
      prayerId,
      currentUser.id,
      `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      currentUser.avatar,
      encouragementText.trim()
    );
    setEncouragementText('');
    setActiveEncouragementId(null);
  };

  const handleConfirmAnswered = () => {
    if (!answeringPrayer || !testimonyInput.trim()) return;
    comunidadStorage.markPrayerAnswered(answeringPrayer.id, currentUser.id, testimonyInput.trim());
    setAnsweringPrayer(null);
    setTestimonyInput('');
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    comunidadStorage.deletePrayer(deletingId, currentUser.id);
    setDeletingId(null);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingId || !reportReason.trim()) return;

    comunidadStorage.addReport({
      reporterId: currentUser.id,
      reporterName: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      contentType: 'prayer',
      contentId: reportingId,
      reason: reportReason.trim()
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingId(null);
      setReportReason('');
    }, 2000);
  };

  // Filter lists
  const peticionesList = prayers.filter(p => !p.isAnswered);
  const testimoniosList = prayers.filter(p => p.isAnswered);
  const misPeticionesList = prayers.filter(p => p.authorId === currentUser.id);

  const displayedList = activeTab === 'peticiones' 
    ? peticionesList 
    : activeTab === 'testimonios' 
      ? testimoniosList 
      : misPeticionesList;

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-950 border border-rose-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="h-4 w-4" />
            <span>FUNCIÓN REAL E · PETICIONES DE ORACIÓN Y TESTIMONIOS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Altar de Clamor & Respuestas de Fe
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Presenta motivos públicos o privados con control de privacidad estricto. 
            Únete en intercesión («Estoy orando por esto»), deja mensajes de ánimo respetuosos y testifica de las oraciones contestadas.
          </p>
        </div>

        {/* Aviso de Emergencias */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 max-w-xs self-start sm:self-auto flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Este espacio es para edificación espiritual comunitaria. Para emergencias médicas o crisis, recurre a profesionales o líneas de atención oficiales.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('peticiones')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'peticiones'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Peticiones en Clamor ({peticionesList.length})
        </button>

        <button
          onClick={() => setActiveTab('testimonios')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'testimonios'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Testimonios de Victoria ({testimoniosList.length})
        </button>

        <button
          onClick={() => setActiveTab('mis_peticiones')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mis_peticiones'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mis Peticiones ({misPeticionesList.length})
        </button>
      </div>

      {/* Caja de Creación de Petición / Testimonio */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-rose-400" />
          <span>Presentar un Motivo de Oración ante el Trono de Gracia</span>
        </h3>

        <form onSubmit={handleCreatePrayer} className="space-y-3 text-xs">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del motivo (ej: Por salud, empleo, consagración de un familiar)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-bold"
          />

          <textarea
            required
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Describe cómo la juventud puede unirse en clamor por esta situación..."
            rows={3}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Distrito Eclesiástico:</label>
              <select
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              >
                <option value="Distrito Central">Distrito Central (Buenaventura)</option>
                <option value="Distrito Emanuel">Distrito Emanuel (Buenaventura)</option>
                <option value="Distrito Alfa y Omega">Distrito Alfa y Omega (Buenaventura)</option>
                <option value="Distrito Manantial">Distrito Manantial (Buenaventura)</option>
                <option value="Distrito Bajo Calima">Distrito Bajo Calima (Buenaventura)</option>
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Visibilidad Privada</span>
                <span className="text-[10px] text-slate-400">Solo visible para ti y tu grupo autorizado</span>
              </div>
              <input
                type="checkbox"
                checked={newIsPrivate}
                onChange={(e) => setNewIsPrivate(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTestimonyMode}
                onChange={(e) => setIsTestimonyMode(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="text-amber-400 font-bold">¿Dios ya contestó esta oración? Compartir testimonio directo</span>
            </label>

            {isTestimonyMode && (
              <textarea
                value={newTestimonyText}
                onChange={(e) => setNewTestimonyText(e.target.value)}
                placeholder="Cuenta con gozo cómo obró Dios en respuesta a la oración..."
                rows={2}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!newTitle.trim() || !newRequest.trim()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publicar Petición</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Peticiones o Testimonios */}
      <div className="space-y-4">
        {displayedList.map(item => {
          const isOwner = item.authorId === currentUser.id;
          const hasPrayed = item.intercessorsUserIds.includes(currentUser.id);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 transition-all shadow-md space-y-4 ${
                item.isAnswered
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : item.isPrivate
                    ? 'bg-slate-900/90 border-purple-500/30 ring-1 ring-purple-500/20'
                    : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    className="h-10 w-10 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{item.authorName}</span>
                      {item.isPrivate ? (
                        <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Privada
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Pública
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.authorDistrict} · {item.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isOwner && !item.isAnswered && (
                    <button
                      onClick={() => setAnsweringPrayer(item)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/30"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>¡Dios Contestó!</span>
                    </button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Eliminar mi petición"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => setReportingId(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Reportar"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Título y Descripción */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.request}
                </p>
              </div>

              {/* Testimonio si está respondida */}
              {item.testimony && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Testimonio de Oración Respondida:</span>
                  </span>
                  <p className="italic">«{item.testimony}»</p>
                </div>
              )}

              {/* Botón "Estoy Orando por Esto" y Mensajes de Ánimo */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <HeartHandshake className="h-4 w-4 text-rose-400" />
                  <span><strong>{item.intercessorsUserIds.length}</strong> intercesores en clamor</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePrayFor(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasPrayed
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-850'
                    }`}
                  >
                    <span>{hasPrayed ? '✓ Te uniste en oración' : '🙏 Estoy orando por esto'}</span>
                  </button>

                  <button
                    onClick={() => setActiveEncouragementId(activeEncouragementId === item.id ? null : item.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-850 font-semibold"
                  >
                    {item.encouragementMessages.length} mensajes de ánimo
                  </button>
                </div>
              </div>

              {/* Subsección de Mensajes de Ánimo */}
              {activeEncouragementId === item.id && (
                <div className="pt-3 border-t border-slate-850 space-y-2.5 animate-in fade-in duration-150">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {item.encouragementMessages.map(msg => (
                      <div key={msg.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{msg.authorName}</span>
                          <span className="text-[10px] text-slate-500">{msg.createdAt}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={encouragementText}
                      onChange={(e) => setEncouragementText(e.target.value)}
                      placeholder="Escribe un versículo o palabra de aliento respetuosa..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => handleSendEncouragement(item.id)}
                      disabled={!encouragementText.trim()}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <HeartHandshake className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              No hay peticiones registradas en esta vista
            </p>
            <p className="text-xs text-slate-400">
              Usa el formulario superior para presentar el primer motivo de oración.
            </p>
          </div>
        )}
      </div>

      {/* Modal Responder con Testimonio */}
      {answeringPrayer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Registrar Oración Contestada</span>
              </h3>
              <button onClick={() => setAnsweringPrayer(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Cuéntale a la hermandad cómo Dios respondió a: <strong>{answeringPrayer.title}</strong>
            </p>

            <textarea
              required
              value={testimonyInput}
              onChange={(e) => setTestimonyInput(e.target.value)}
              placeholder="Describe la respuesta divina para edificar la fe de otros jóvenes..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAnsweringPrayer(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAnswered}
                disabled={!testimonyInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black disabled:opacity-50"
              >
                Publicar Testimonio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar petición?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Esta petición y sus intercesiones serán eliminadas del muro.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reportar */}
      {reportingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reportar Petición</h3>
              </div>
              <button onClick={() => setReportingId(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs text-center font-bold">
                ✓ Reporte recibido. Será revisado por moderadores.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Indica el motivo del reporte de esta petición o comentario:
                </p>
                <textarea
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe el motivo del reporte..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setReportingId(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">
                    Cancelar
                  </button>
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
                    Enviar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
