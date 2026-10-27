import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  BookOpen, 
  Package, 
  X, 
  Sparkles, 
  AlertCircle, 
  Repeat,
  Check,
  Building2
} from 'lucide-react';
import { CommunityMeeting, MeetingModality } from './types';
import { useApp } from '../../context/AppContext';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  communityId: string;
  communityName: string;
  meetingToEdit?: CommunityMeeting | null;
  onClose: () => void;
  onSave: (data: Omit<CommunityMeeting, 'id' | 'createdAt' | 'status'>, meetingId?: string) => void;
}

const COMMON_MATERIALS = [
  'Biblia física o app',
  'Cuaderno de notas y bolígrafo',
  'Himnario Adventista',
  'Folleto de Escuela Sabática',
  'Camiseta / Pañuelo JA',
  'Ofrenda o alimentos para donar'
];

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  communityId,
  communityName,
  meetingToEdit,
  onClose,
  onSave
}) => {
  const { currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('18:30');
  const [timeZone, setTimeZone] = useState('America/Bogota (UTC-5)');
  const [modality, setModality] = useState<MeetingModality>('presencial');
  const [location, setLocation] = useState('');
  const [virtualMeetingUrl, setVirtualMeetingUrl] = useState('');
  const [theme, setTheme] = useState('');
  const [materialsNeeded, setMaterialsNeeded] = useState<string[]>(['Biblia física o app', 'Cuaderno de notas y bolígrafo']);
  const [customMaterial, setCustomMaterial] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'semanal' | 'quincenal' | 'mensual'>('semanal');

  useEffect(() => {
    if (meetingToEdit) {
      setTitle(meetingToEdit.title);
      setDescription(meetingToEdit.description);
      setObjective(meetingToEdit.objective || '');
      setDate(meetingToEdit.date);
      setStartTime(meetingToEdit.startTime);
      setEndTime(meetingToEdit.endTime || '');
      setTimeZone(meetingToEdit.timeZone || 'America/Bogota (UTC-5)');
      setModality(meetingToEdit.modality);
      setLocation(meetingToEdit.location || '');
      setVirtualMeetingUrl(meetingToEdit.virtualMeetingUrl || '');
      setTheme(meetingToEdit.theme || '');
      setMaterialsNeeded(meetingToEdit.materialsNeeded || []);
      setBibleVerse(meetingToEdit.bibleVerse || '');
      setAdditionalNotes(meetingToEdit.additionalNotes || '');
      setIsRecurring(meetingToEdit.isRecurring || false);
      setRecurrenceFrequency(meetingToEdit.recurrenceFrequency || 'semanal');
    } else {
      // Default to next Saturday
      const now = new Date();
      const nextSat = new Date();
      nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
      setDate(nextSat.toISOString().split('T')[0]);
      setTitle('');
      setDescription('');
      setObjective('');
      setModality('presencial');
      setLocation('');
      setVirtualMeetingUrl('');
      setTheme('');
      setBibleVerse('');
      setAdditionalNotes('');
      setIsRecurring(false);
    }
  }, [meetingToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleMaterial = (mat: string) => {
    if (materialsNeeded.includes(mat)) {
      setMaterialsNeeded(materialsNeeded.filter(m => m !== mat));
    } else {
      setMaterialsNeeded([...materialsNeeded, mat]);
    }
  };

  const handleAddCustomMaterial = () => {
    if (!customMaterial.trim()) return;
    if (!materialsNeeded.includes(customMaterial.trim())) {
      setMaterialsNeeded([...materialsNeeded, customMaterial.trim()]);
    }
    setCustomMaterial('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave({
      communityId,
      title: title.trim(),
      description: description.trim(),
      objective: objective.trim() || undefined,
      date,
      startTime,
      endTime: endTime.trim() || undefined,
      timeZone,
      modality,
      location: modality !== 'virtual' ? location.trim() : undefined,
      virtualMeetingUrl: modality !== 'presencial' ? virtualMeetingUrl.trim() : undefined,
      theme: theme.trim() || title.trim(),
      materialsNeeded,
      bibleVerse: bibleVerse.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      createdById: currentUser.id,
      createdByName: `${currentUser.name} ${currentUser.lastName || ''}`.trim() || currentUser.username
    }, meetingToEdit?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {meetingToEdit ? 'Editar Reunión de Comunidad' : 'Programar Nueva Reunión'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {communityName} · Administrado por {currentUser.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Título de la reunión */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Título de la reunión o actividad: *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Culto Joven & Taller de Evangelismo en el Puerto"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Temática y Versículo Bíblico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Temática principal: *
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ej: La Fe en Medio de la Prueba, Salmo 23..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Texto bíblico o lectura recomendada:
              </label>
              <input
                type="text"
                value={bibleVerse}
                onChange={(e) => setBibleVerse(e.target.value)}
                placeholder="Ej: 1 Timoteo 4:12, Romanos 8:31"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descripción y Objetivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Descripción del programa: *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los momentos principales: cantos, dinámicas, reflexión bíblica, refrigerio..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Objetivo espiritual / práctico:
              </label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="¿Qué meta o fruto espiritual busca alcanzar este encuentro en los jóvenes?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Fecha, Horarios y Zona Horaria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Fecha: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hora Inicio: *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hora Finalización:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Modalidad: Presencial, Virtual o Mixta */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">
              Modalidad de la reunión:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setModality('presencial')}
                className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modality === 'presencial'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Presencial</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('virtual')}
                className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modality === 'virtual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Virtual</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('mixta')}
                className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modality === 'mixta'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mixta</span>
              </button>
            </div>
          </div>

          {/* Lugar presencial y/o Enlace Virtual */}
          {modality !== 'virtual' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lugar o dirección de encuentro: *
              </label>
              <input
                type="text"
                required={modality === 'presencial'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Salón Juvenil Iglesia Central, Carrera 5 # 3-20..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {modality !== 'presencial' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Enlace de videollamada / reunión virtual: *
              </label>
              <input
                type="url"
                required={modality === 'virtual'}
                value={virtualMeetingUrl}
                onChange={(e) => setVirtualMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx o Zoom"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Materiales que deben llevar */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-300 block">
              ¿Qué deben llevar o preparar los participantes?
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_MATERIALS.map(mat => {
                const selected = materialsNeeded.includes(mat);
                return (
                  <button
                    type="button"
                    key={mat}
                    onClick={() => handleToggleMaterial(mat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                      selected 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{mat}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                placeholder="Agregar otro material..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomMaterial}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Indicaciones adicionales */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Indicaciones adicionales o avisos para los asistentes:
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Ej: Se ruega puntualidad. Habrá espacio para testimonios de fe."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reunión recurrente */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-amber-400" />
              <div>
                <span className="font-bold text-white block">Reunión recurrente</span>
                <span className="text-[11px] text-slate-400">Repetir según los días habituales</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRecurring && (
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              {meetingToEdit ? 'Guardar Cambios' : 'Programar Reunión'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
