import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Bell, 
  X, 
  Globe, 
  Mail, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { YouthCommunityEvent, EventStatus } from './types';

export const EventosEncuentrosTab: React.FC = () => {
  const { currentUser } = useApp();
  const [events, setEvents] = useState<YouthCommunityEvent[]>(comunidadStorage.getEvents());
  const [activeFilter, setActiveFilter] = useState<'proximos' | 'mis_eventos' | 'realizados'>('proximos');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('08:00 PM');
  const [newLocation, setNewLocation] = useState('');
  const [newIsVirtual, setNewIsVirtual] = useState(false);
  const [newVirtualLink, setNewVirtualLink] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newCapacity, setNewCapacity] = useState<number | undefined>(undefined);

  useEffect(() => {
    const unsub = comunidadStorage.subscribe(() => {
      setEvents(comunidadStorage.getEvents());
    });
    return unsub;
  }, []);

  const handleToggleRegistration = (eventId: string) => {
    comunidadStorage.toggleEventRegistration(eventId, currentUser.id);
  };

  const handleToggleReminder = (eventId: string) => {
    comunidadStorage.toggleEventReminder(eventId, currentUser.id);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    comunidadStorage.createEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      date: newDate,
      time: newTime,
      location: newLocation.trim() || (newIsVirtual ? 'Plataforma Virtual Autorizada' : 'Templo Adventista Central Buenaventura'),
      isVirtual: newIsVirtual,
      virtualLink: newIsVirtual ? (newVirtualLink.trim() || 'https://meet.google.com/iasd-pacifico') : undefined,
      organizer: `${currentUser.name} ${currentUser.lastName}`.trim() || currentUser.username,
      organizerId: currentUser.id,
      contactInfo: newContact.trim() || currentUser.email || 'contacto@asopacifico.org',
      capacity: newCapacity ? Number(newCapacity) : undefined,
      status: 'proximo'
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewLocation('');
  };

  const filteredEvents = events.filter(ev => {
    if (activeFilter === 'mis_eventos') {
      return ev.registeredUserIds.includes(currentUser.id);
    }
    if (activeFilter === 'realizados') {
      return ev.status === 'realizado';
    }
    return ev.status === 'proximo';
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/30 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="h-4 w-4" />
            <span>FUNCIÓN REAL G · EVENTOS Y ENCUENTROS JUVENILES</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            Calendario de Encuentros y Vigilias JA
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Inscripción, control de aforo por cupos, recordatorios comunitarios y enlaces autorizados 
            para eventos presenciales y virtuales en la zona de Buenaventura.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 self-start sm:self-auto transition-transform active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Publicar Evento JA</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveFilter('proximos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'proximos' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Próximos Encuentros
        </button>
        <button
          onClick={() => setActiveFilter('mis_eventos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'mis_eventos' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mis Inscripciones ({events.filter(e => e.registeredUserIds.includes(currentUser.id)).length})
        </button>
        <button
          onClick={() => setActiveFilter('realizados')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'realizados' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Histórico / Realizados
        </button>
      </div>

      {/* Grid de Eventos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredEvents.map(ev => {
          const isRegistered = ev.registeredUserIds.includes(currentUser.id);
          const hasReminder = ev.remindersSetUserIds.includes(currentUser.id);
          const isFull = ev.capacity ? ev.registeredUserIds.length >= ev.capacity : false;

          return (
            <div
              key={ev.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.isVirtual
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {ev.isVirtual ? 'Virtual Autorizado' : 'Presencial'}
                    </span>

                    {ev.capacity && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isFull ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isFull ? 'Cupos Llenos' : `${ev.capacity - ev.registeredUserIds.length} cupos libres`}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleReminder(ev.id)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      hasReminder ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={hasReminder ? 'Recordatorio activado' : 'Activar recordatorio'}
                  >
                    <Bell className={`h-4 w-4 ${hasReminder ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white leading-tight">
                  {ev.title}
                </h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Organiza: {ev.organizer}
                </span>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5 line-clamp-3">
                  {ev.description}
                </p>

                <div className="mt-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Fecha:</strong> {ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Hora:</strong> {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span className="truncate"><strong>Lugar:</strong> {ev.location}</span>
                  </div>

                  {ev.isVirtual && ev.virtualLink && (
                    <div className="pt-1 border-t border-slate-850 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Enlace Virtual:</span>
                      <a href={ev.virtualLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                        <span>Ingresar a sala</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-0.5">
                    Contacto: {ev.contactInfo}
                  </div>
                </div>
              </div>

              {/* Botón de Inscripción con Aforo */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Users className="h-3.5 w-3.5 text-cyan-400" />
                  <span><strong>{ev.registeredUserIds.length}</strong> inscritos</span>
                </span>

                <button
                  onClick={() => handleToggleRegistration(ev.id)}
                  disabled={!isRegistered && isFull}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isRegistered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40'
                      : isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>✓ Inscrito (Cancelar)</span>
                    </>
                  ) : isFull ? (
                    <span>Agotado</span>
                  ) : (
                    <span>Inscribirme al Evento</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="sm:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Calendar className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No hay eventos en esta sección</p>
          </div>
        )}
      </div>

      {/* Modal Crear Evento */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Publicar Evento JA</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nombre del Evento: *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Vigilia Zonal de Oración y Alabanza"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descripción y Propósito:</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explica de qué trata el evento, qué deben llevar los jóvenes..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fecha: *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hora:</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="07:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ubicación física:</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Templo Adventista Central..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cupos / Capacidad (opcional):</label>
                  <input
                    type="number"
                    min="1"
                    value={newCapacity || ''}
                    onChange={(e) => setNewCapacity(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Sin límite si está vacío"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsVirtual}
                    onChange={(e) => setNewIsVirtual(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-white font-bold">¿Evento Virtual con Enlace Autorizado?</span>
                </label>

                {newIsVirtual && (
                  <input
                    type="url"
                    value={newVirtualLink}
                    onChange={(e) => setNewVirtualLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contacto Autorizado:</label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Email o teléfono de coordinación distrital..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancelar
                </button>
                <button type="submit" disabled={!newTitle.trim() || !newDate} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50">
                  Publicar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
