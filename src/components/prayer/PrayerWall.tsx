import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  HeartHandshake, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Flame, 
  Share2, 
  Clock, 
  MessageSquare,
  Church,
  X
} from 'lucide-react';

export const PrayerWall: React.FC = () => {
  const { 
    currentUser, 
    prayerRequests, 
    testimonials, 
    prayForRequest, 
    createPrayerRequest, 
    markPrayerAnswered, 
    createTestimonial 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'testimonials'>('requests');
  const [showNewPrayerModal, setShowNewPrayerModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);
  const [testimonyInput, setTestimonyInput] = useState('');

  // New prayer form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'salud' | 'familia' | 'mision' | 'estudios' | 'espiritual'>('espiritual');

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createPrayerRequest({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    setTitle('');
    setDescription('');
    setShowNewPrayerModal(false);
  };

  const handleConfirmAnswered = (requestId: string) => {
    if (!testimonyInput.trim()) return;
    markPrayerAnswered(requestId, testimonyInput.trim());
    setTestimonyInput('');
    setShowAnswerModal(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-bold text-purple-300 mb-2">
              <HeartHandshake className="h-3.5 w-3.5 text-purple-400" />
              <span>INTERCESIÓN Y PODER DE DIOS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
              Muro de Oración & Testimonios
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
              "Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados. La oración eficaz del justo puede mucho." Santiago 5:16
            </p>
          </div>

          <button
            onClick={() => setShowNewPrayerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black shadow-md hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Pedir Oración</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          <span>Peticiones Activas ({prayerRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'testimonials'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Muro de Testimonios ({testimonials.length})</span>
        </button>
      </div>

      {/* TAB 1: PRAYER REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {prayerRequests.map((request) => {
            const isUserPraying = request.prayingUserIds.includes(currentUser.id);
            const isAuthor = request.authorId === currentUser.id;

            return (
              <div
                key={request.id}
                className={`rounded-3xl p-5 border transition-all shadow-md ${
                  request.isAnswered
                    ? 'bg-slate-900/70 border-emerald-500/30'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Author row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      avatar={request.authorAvatar}
                      name={request.authorName}
                      size="md"
                    />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white">{request.authorName}</h3>
                      <p className="text-[11px] text-slate-400">
                        {request.authorChurch} · {request.createdAt}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {request.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{request.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {request.description}
                </p>

                {/* Answered Testimony Card */}
                {request.isAnswered && request.testimony && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-emerald-300 mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>¡ORACIÓN RESPONDIDA POR DIOS!</span>
                    </div>
                    <p className="italic leading-relaxed">"{request.testimony}"</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      🙏 <span className="tabular-nums">{request.prayingCount}</span> jóvenes orando
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAuthor && !request.isAnswered && (
                      <button
                        onClick={() => setShowAnswerModal(request.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        ✓ Marcar Respondida
                      </button>
                    )}

                    <button
                      onClick={() => prayForRequest(request.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                        isUserPraying
                          ? 'bg-purple-600 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:from-amber-400 hover:to-orange-500'
                      }`}
                    >
                      <span>🙏</span>
                      <span>{isUserPraying ? 'Estoy Orando' : 'Unirme en Oración'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    avatar={test.authorAvatar}
                    name={test.authorName}
                    size="md"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{test.authorName}</h3>
                    <p className="text-[11px] text-slate-400">{test.authorChurch} · {test.date}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider capitalize">
                  {test.category.replace('_', ' ')}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mb-2 font-heading">
                {test.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-4 rounded-2xl border border-slate-850 mb-3">
                "{test.story}"
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  🔥 {test.amenCount} glorificaron a Dios
                </span>
                <button
                  onClick={() => alert('¡Gloria a Dios! Testimonio compartido.')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Prayer Request */}
      {showNewPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Publicar Petición de Oración</h2>
              <button onClick={() => setShowNewPrayerModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Título de la petición:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Por la salud de mi madre / Por mi examen de fe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Categoría:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="espiritual">Crecimiento Espiritual</option>
                  <option value="salud">Salud y Sanidad</option>
                  <option value="familia">Familia y Hogar</option>
                  <option value="mision">Misión y Evangelismo</option>
                  <option value="estudios">Estudios y Universidad</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Detalle del clamor:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comparte el motivo para que la red juvenil de A Prueba de Fuego ore por ti..."
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewPrayerModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                >
                  Publicar en el Muro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Prayer Answered */}
      {showAnswerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h2 className="text-sm font-bold text-white mb-2">¡Cuéntanos el Testimonio!</h2>
            <p className="text-xs text-slate-400 mb-3">
              Al marcar tu oración como respondida, tu testimonio se publicará en el muro para edificar la fe de otros jóvenes.
            </p>
            <textarea
              value={testimonyInput}
              onChange={(e) => setTestimonyInput(e.target.value)}
              placeholder="¿Cómo respondió Dios tu oración? Escribe tu gratitud..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAnswerModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmAnswered(showAnswerModal)}
                disabled={!testimonyInput.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold disabled:opacity-40"
              >
                Publicar Testimonio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
