import React, { useState } from 'react';
import { EventItem } from '../../types';
import { 
  downloadIcsFile, 
  getGoogleCalendarUrl, 
  getOutlookCalendarUrl, 
  shareOrAddToDeviceCalendar 
} from '../../utils/calendarUtils';
import { 
  Calendar as CalendarIcon, 
  Smartphone, 
  Globe, 
  Mail, 
  CheckCircle2, 
  Copy, 
  X, 
  Clock, 
  MapPin, 
  Flame,
  Share2
} from 'lucide-react';

interface AddToCalendarModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeviceCalendar = async () => {
    const res = await shareOrAddToDeviceCalendar(event);
    if (res.success) {
      showToast('¡Archivo .ics generado! Ábrelo para guardar el evento en el calendario de tu teléfono.');
    } else {
      showToast('Descargando archivo .ics...');
    }
  };

  const handleGoogleCalendar = () => {
    const url = getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Abriendo Google Calendar...');
  };

  const handleOutlookCalendar = () => {
    const url = getOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Abriendo Outlook Calendar...');
  };

  const handleCopyDetails = async () => {
    const text = `🔥 Evento JA: ${event.title}\n📅 Fecha: ${event.date}\n⏰ Hora: ${event.time}\n📍 Lugar: ${event.venue}, ${event.city}\n👥 Organiza: ${event.organizer}\n\nDetalles: ${event.description}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('¡Detalles del evento copiados al portapapeles!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('No se pudo copiar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-8 sm:pb-6 space-y-4">
        
        {/* Grab bar on mobile */}
        <div className="flex justify-center -mt-1 mb-2 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-700/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Agregar a tu Calendario
              </h3>
              <p className="text-[11px] text-slate-400">Recordatorio para eventos juveniles JA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event Quick Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-850 space-y-1.5">
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{event.title}</h4>
          <div className="flex items-center gap-3 text-[11px] text-amber-400 flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {event.date}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="h-3 w-3 text-slate-400" />
              {event.time}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="h-3 w-3 text-emerald-400" />
              {event.city}
            </span>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2 pt-1">
          {/* 1. Calendario del teléfono (Nativo .ics) */}
          <button
            onClick={handleDeviceCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent hover:bg-blue-600/25 border border-blue-500/30 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">Calendario del Teléfono</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">Nativo</span>
                </div>
                <p className="text-[11px] text-slate-400">Descarga .ics para iPhone, Android o Samsung</p>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">Abrir →</span>
          </button>

          {/* 2. Google Calendar */}
          <button
            onClick={handleGoogleCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white">Google Calendar</span>
                <p className="text-[11px] text-slate-400">Sincroniza directamente en tu cuenta de Google</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Web / App →</span>
          </button>

          {/* 3. Outlook */}
          <button
            onClick={handleOutlookCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white">Outlook / Office 365</span>
                <p className="text-[11px] text-slate-400">Para correos corporativos o cuentas Microsoft</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Abrir →</span>
          </button>

          {/* 4. Copiar detalles para WhatsApp */}
          <button
            onClick={handleCopyDetails}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition-all text-left text-slate-400 hover:text-slate-200"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Copy className="h-4 w-4 text-emerald-400" />
              <span>Copiar fecha y detalles para compartir en WhatsApp JA</span>
            </div>
            {copied ? (
              <span className="text-[11px] text-emerald-400 font-bold">¡Copiado!</span>
            ) : (
              <span className="text-[11px] text-slate-500">Copiar</span>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="text-[10px] text-center text-slate-500 pt-1">
          💡 La cita incluye la dirección, recordatorio 24 horas antes y enlaces oficiales.
        </p>

      </div>
    </div>
  );
};
