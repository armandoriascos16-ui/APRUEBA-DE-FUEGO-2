/**
 * Utilidades para integración de Calendario del Teléfono y servicios en la nube.
 * Soporta generación de archivos iCalendar (.ics) nativos compatibles con iOS, Android,
 * Google Calendar, Apple Calendar y Outlook.
 */

import { EventItem } from '../types';

/**
 * Convierte una fecha y hora legible (ej: "15 al 25 de Octubre, 2026", "08:00 AM")
 * en fechas ISO aproximadas para el estándar iCalendar (RFC 5545).
 */
export function parseEventDates(event: EventItem): { start: Date; end: Date } {
  if (event.startDate) {
    const sParts = event.startDate.split('-');
    if (sParts.length === 3) {
      const year = parseInt(sParts[0], 10);
      const month = parseInt(sParts[1], 10) - 1;
      const day = parseInt(sParts[2], 10);
      
      let startHour = 9;
      let startMinute = 0;
      const timeMatch = (event.time || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        startHour = parseInt(timeMatch[1], 10);
        startMinute = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === 'PM' && startHour < 12) startHour += 12;
        if (meridiem === 'AM' && startHour === 12) startHour = 0;
      }
      
      const start = new Date(year, month, day, startHour, startMinute, 0);
      let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      
      if (event.endDate) {
        const eParts = event.endDate.split('-');
        if (eParts.length === 3) {
          end = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10), 18, 0, 0);
        }
      }
      return { start, end };
    }
  }

  const currentYear = new Date().getFullYear();
  let startYear = currentYear;
  
  // Buscar año en la cadena de fecha
  const yearMatch = event.date.match(/20\d{2}/);
  if (yearMatch) {
    startYear = parseInt(yearMatch[0], 10);
  }

  // Mapeo de meses en español
  const months: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11
  };

  const lowerDate = event.date.toLowerCase();
  let foundMonth = 9; // Octubre por defecto
  for (const [mName, mIdx] of Object.entries(months)) {
    if (lowerDate.includes(mName)) {
      foundMonth = mIdx;
      break;
    }
  }

  // Buscar primer día numérico
  const dayMatch = event.date.match(/\b(\d{1,2})\b/);
  const startDay = dayMatch ? Math.min(28, Math.max(1, parseInt(dayMatch[1], 10))) : 15;

  // Analizar hora (ej: "08:00 AM", "06:30 PM", "20:00")
  let startHour = 9;
  let startMinute = 0;
  const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    startHour = parseInt(timeMatch[1], 10);
    startMinute = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3]?.toUpperCase();
    if (meridiem === 'PM' && startHour < 12) startHour += 12;
    if (meridiem === 'AM' && startHour === 12) startHour = 0;
  }

  const startDate = new Date(startYear, foundMonth, startDay, startHour, startMinute, 0);
  // Fin de evento predeterminado: 2 horas después (o varios días si indica rango)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  return { start: startDate, end: endDate };
}

/**
 * Formatea una fecha de JavaScript al formato UTC de iCalendar (YYYYMMDDTHHmmssZ).
 */
export function formatToIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Genera el contenido en formato estándar iCalendar (.ics RFC 5545).
 */
export function generateIcsContent(event: EventItem): string {
  const { start, end } = parseEventDates(event);
  const dtStamp = formatToIcsDate(new Date());
  const dtStart = formatToIcsDate(start);
  const dtEnd = formatToIcsDate(end);

  const cleanDescription = `${event.description}\n\nOrganizado por: ${event.organizer}\nLugar: ${event.venue}\nComunidad: A Prueba de Fuego`
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanTitle = event.title.replace(/,/g, '\\,').replace(/;/g, '\\;');
  const cleanLocation = `${event.venue}, ${event.city}, ${event.country}`.replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A Prueba de Fuego//Calendario Juvenil Adventista//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apdf-${event.id}-${start.getTime()}@apruebadefuego.org`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de Evento A Prueba de Fuego',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Descarga el archivo .ics en el dispositivo. En teléfonos inteligentes (iOS y Android),
 * abrir este archivo invoca automáticamente el diálogo de la app de Calendario nativa.
 */
export function downloadIcsFile(event: EventItem): boolean {
  try {
    const icsContent = generateIcsContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const filename = `evento-${event.id}.ics`;

    // Crear enlace temporal de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error al descargar archivo de calendario .ics:', err);
    return false;
  }
}

/**
 * Genera la URL directa para agregar a Google Calendar en web o app móvil.
 */
export function getGoogleCalendarUrl(event: EventItem): string {
  const { start, end } = parseEventDates(event);
  const dtStart = formatToIcsDate(start);
  const dtEnd = formatToIcsDate(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
    details: `${event.description}\n\nOrganizado por: ${event.organizer}\nLugar: ${event.venue}\nA Prueba de Fuego`,
    location: `${event.venue}, ${event.city}, ${event.country}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera la URL directa para Outlook / Office 365.
 */
export function getOutlookCalendarUrl(event: EventItem): string {
  const { start, end } = parseEventDates(event);
  const dtStart = start.toISOString();
  const dtEnd = end.toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: dtStart,
    enddt: dtEnd,
    body: `${event.description}\n\nOrganizado por: ${event.organizer}\nLugar: ${event.venue}`,
    location: `${event.venue}, ${event.city}, ${event.country}`,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Intenta compartir con las apps nativas del teléfono mediante Web Share API
 * si está soportado, o recurre a la descarga directa del .ics.
 */
export async function shareOrAddToDeviceCalendar(event: EventItem): Promise<{ success: boolean; method: 'share' | 'download' }> {
  const icsData = generateIcsContent(event);
  const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.ics`;
  const file = new File([icsData], filename, { type: 'text/calendar' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: event.title,
        text: `Evento JA: ${event.title} - ${event.date} en ${event.city}`,
      });
      return { success: true, method: 'share' };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share falló, procediendo a descarga:', err);
      }
    }
  }

  // Fallback a descarga directa de archivo .ics
  const downloaded = downloadIcsFile(event);
  return { success: downloaded, method: 'download' };
}
