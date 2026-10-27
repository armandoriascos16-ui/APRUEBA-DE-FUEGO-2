// Script to generate authentic polyphonic Christian hymn audio files (.wav)
import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 22050; // High quality 22.05 kHz 16-bit Mono (compact & fast loading)

function createWavHeader(dataLength, sampleRate = SAMPLE_RATE) {
  const buffer = Buffer.alloc(44);
  // RIFF identifier
  buffer.write('RIFF', 0);
  // file length minus 8
  buffer.writeUInt32LE(36 + dataLength, 4);
  // RIFF type
  buffer.write('WAVE', 8);
  // format chunk identifier
  buffer.write('fmt ', 12);
  // format chunk length
  buffer.writeUInt32LE(16, 16);
  // sample format (1 is PCM)
  buffer.writeUInt16LE(1, 20);
  // channel count (1 = mono)
  buffer.writeUInt16LE(1, 22);
  // sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // byte rate (sampleRate * 1 * 16 / 8)
  buffer.writeUInt32LE(sampleRate * 2, 28);
  // block align (1 * 16 / 8)
  buffer.writeUInt16LE(2, 32);
  // bits per sample
  buffer.writeUInt16LE(16, 34);
  // data chunk identifier
  buffer.write('data', 36);
  // data chunk length
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

// Frequency helper: note name to Hz (e.g., C4, D#4, Bb3)
const NOTE_SEMITONES = {
  'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
  'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1, 'Ab': -1,
  'A': 0, 'A#': 1, 'Bb': 1, 'B': 2
};

function noteFreq(noteStr) {
  if (!noteStr || noteStr === 'REST') return 0;
  const match = noteStr.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return 0;
  const noteName = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);
  const semitonesFromA4 = NOTE_SEMITONES[noteName] + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// Generate sound with timbre: 'piano', 'organ', 'strings', 'guitar'
function renderHymn(notes, totalDurationSec = 25, instrument = 'piano') {
  const totalSamples = Math.floor(SAMPLE_RATE * totalDurationSec);
  const audioData = new Float32Array(totalSamples);

  // Each note: { note: 'C4', start: 0.0, dur: 1.0, vol: 0.8 }
  for (const n of notes) {
    const freq = noteFreq(n.note);
    if (freq <= 0) continue;
    const startSample = Math.floor(n.start * SAMPLE_RATE);
    const noteSamples = Math.floor(n.dur * SAMPLE_RATE);
    const endSample = Math.min(totalSamples, startSample + noteSamples + Math.floor(SAMPLE_RATE * 1.5));
    const vol = n.vol ?? 0.7;

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      const decayTime = n.dur + 0.8;
      
      let envelope = 0;
      if (t < 0.02) {
        envelope = (t / 0.02); // Quick attack
      } else if (t < n.dur) {
        envelope = Math.exp(-0.8 * (t - 0.02) / decayTime); // Sustain
      } else {
        const releaseTime = t - n.dur;
        envelope = Math.exp(-0.8 * (n.dur - 0.02) / decayTime) * Math.max(0, 1 - releaseTime / 0.8);
      }

      let sample = 0;
      if (instrument === 'piano') {
        // Warm piano with natural overtones
        sample = (
          Math.sin(2 * Math.PI * freq * t) * 0.55 +
          Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
          Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 +
          Math.sin(2 * Math.PI * freq * 4 * t) * 0.05 +
          Math.sin(2 * Math.PI * freq * 5 * t) * 0.03
        );
      } else if (instrument === 'organ') {
        // Cathedral pipe organ with 8', 4', 2' and slight chorus
        const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 4.5 * t);
        sample = (
          Math.sin(2 * Math.PI * freq * vibrato * t) * 0.45 +
          Math.sin(2 * Math.PI * freq * 2 * t) * 0.28 +
          Math.sin(2 * Math.PI * freq * 3 * t) * 0.15 +
          Math.sin(2 * Math.PI * freq * 4 * t) * 0.12
        );
      } else {
        // Acoustic guitar / warm meditative strings
        sample = (
          Math.sin(2 * Math.PI * freq * t) * 0.6 +
          Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
          Math.sin(2 * Math.PI * freq * 3 * t) * 0.1
        );
      }

      audioData[i] += sample * envelope * vol * 0.28;
    }
  }

  // Soft master limiter / normalization
  let maxPeak = 0.0001;
  for (let i = 0; i < totalSamples; i++) {
    const abs = Math.abs(audioData[i]);
    if (abs > maxPeak) maxPeak = abs;
  }
  const normFactor = maxPeak > 0.85 ? (0.85 / maxPeak) : 1.0;

  // Convert to 16-bit PCM Buffer
  const pcmBuffer = Buffer.alloc(totalSamples * 2);
  for (let i = 0; i < totalSamples; i++) {
    let s = audioData[i] * normFactor;
    // Soft clip
    s = Math.max(-1, Math.min(1, s));
    const intVal = Math.floor(s < 0 ? s * 32768 : s * 32767);
    pcmBuffer.writeInt16LE(intVal, i * 2);
  }

  const header = createWavHeader(pcmBuffer.length, SAMPLE_RATE);
  return Buffer.concat([header, pcmBuffer]);
}

// Ensure /public/audio exists
const outputDir = path.resolve('/app/applet/public/audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Amazing Grace (Sublime Gracia) — Devotional Piano
// Key of G / C. Melody: G3, C4, E4, C4, E4, D4, C4, A3, G3...
const amazingGraceNotes = [
  // Intro chords
  { note: 'C3', start: 0, dur: 1.8, vol: 0.6 },
  { note: 'G3', start: 0, dur: 1.8, vol: 0.5 },
  { note: 'E4', start: 0, dur: 1.8, vol: 0.5 },
  
  // Melody + Harmony
  { note: 'G3', start: 1.2, dur: 0.7, vol: 0.75 },
  { note: 'C4', start: 2.0, dur: 1.3, vol: 0.9 },
  { note: 'C3', start: 2.0, dur: 2.5, vol: 0.6 },
  { note: 'E3', start: 2.0, dur: 2.5, vol: 0.5 },
  { note: 'G3', start: 2.0, dur: 2.5, vol: 0.5 },
  { note: 'E4', start: 3.4, dur: 0.6, vol: 0.7 },
  { note: 'C4', start: 4.1, dur: 0.6, vol: 0.7 },
  { note: 'E4', start: 4.8, dur: 1.8, vol: 0.9 },
  { note: 'C3', start: 4.8, dur: 2.4, vol: 0.5 },
  { note: 'G3', start: 4.8, dur: 2.4, vol: 0.5 },
  { note: 'D4', start: 6.7, dur: 0.8, vol: 0.8 },
  { note: 'C4', start: 7.6, dur: 2.4, vol: 0.9 },
  { note: 'F3', start: 7.6, dur: 2.4, vol: 0.6 },
  { note: 'A3', start: 7.6, dur: 2.4, vol: 0.5 },
  { note: 'C4', start: 7.6, dur: 2.4, vol: 0.5 },
  
  { note: 'A3', start: 10.1, dur: 0.9, vol: 0.8 },
  { note: 'G3', start: 11.1, dur: 2.2, vol: 0.85 },
  { note: 'C3', start: 11.1, dur: 2.2, vol: 0.6 },
  { note: 'E3', start: 11.1, dur: 2.2, vol: 0.5 },
  
  { note: 'G3', start: 13.4, dur: 0.7, vol: 0.75 },
  { note: 'C4', start: 14.2, dur: 1.3, vol: 0.9 },
  { note: 'C3', start: 14.2, dur: 2.4, vol: 0.6 },
  { note: 'E4', start: 15.6, dur: 0.6, vol: 0.7 },
  { note: 'C4', start: 16.3, dur: 0.6, vol: 0.7 },
  { note: 'E4', start: 17.0, dur: 1.8, vol: 0.9 },
  { note: 'A2', start: 17.0, dur: 2.2, vol: 0.6 },
  { note: 'C3', start: 17.0, dur: 2.2, vol: 0.5 },
  { note: 'E3', start: 17.0, dur: 2.2, vol: 0.5 },
  { note: 'D4', start: 18.9, dur: 0.7, vol: 0.8 },
  { note: 'G4', start: 19.7, dur: 2.8, vol: 0.95 },
  { note: 'G2', start: 19.7, dur: 2.8, vol: 0.6 },
  { note: 'B2', start: 19.7, dur: 2.8, vol: 0.5 },
  { note: 'D3', start: 19.7, dur: 2.8, vol: 0.5 },
  
  { note: 'E4', start: 22.6, dur: 1.4, vol: 0.85 },
  { note: 'C4', start: 24.1, dur: 2.8, vol: 0.9 },
  { note: 'C3', start: 24.1, dur: 3.0, vol: 0.7 },
  { note: 'G3', start: 24.1, dur: 3.0, vol: 0.6 },
  { note: 'E4', start: 24.1, dur: 3.0, vol: 0.6 }
];

// 2. Castillo Fuerte (A Mighty Fortress Is Our God) — Majestic Pipe Organ
const castilloFuerteNotes = [
  // C4, C4, C4, G3, Bb3, C4, Ab3, G3, F3...
  { note: 'C3', start: 0, dur: 1.2, vol: 0.7 },
  { note: 'G3', start: 0, dur: 1.2, vol: 0.6 },
  { note: 'C4', start: 0, dur: 1.2, vol: 0.85 },
  
  { note: 'C4', start: 1.3, dur: 1.1, vol: 0.85 },
  { note: 'C3', start: 1.3, dur: 1.1, vol: 0.6 },
  { note: 'E3', start: 1.3, dur: 1.1, vol: 0.5 },
  
  { note: 'C4', start: 2.5, dur: 1.1, vol: 0.85 },
  { note: 'G3', start: 3.7, dur: 1.1, vol: 0.8 },
  { note: 'G2', start: 3.7, dur: 1.1, vol: 0.6 },
  { note: 'B2', start: 3.7, dur: 1.1, vol: 0.5 },
  
  { note: 'A3', start: 4.9, dur: 1.1, vol: 0.8 },
  { note: 'B3', start: 6.1, dur: 1.1, vol: 0.8 },
  { note: 'C4', start: 7.3, dur: 1.6, vol: 0.9 },
  { note: 'C3', start: 7.3, dur: 1.6, vol: 0.7 },
  { note: 'G3', start: 7.3, dur: 1.6, vol: 0.6 },
  
  { note: 'B3', start: 9.0, dur: 1.1, vol: 0.8 },
  { note: 'A3', start: 10.2, dur: 1.1, vol: 0.8 },
  { note: 'G3', start: 11.4, dur: 2.2, vol: 0.9 },
  { note: 'G2', start: 11.4, dur: 2.2, vol: 0.7 },
  { note: 'D3', start: 11.4, dur: 2.2, vol: 0.6 },
  
  { note: 'C4', start: 13.7, dur: 1.1, vol: 0.85 },
  { note: 'B3', start: 14.9, dur: 1.1, vol: 0.8 },
  { note: 'A3', start: 16.1, dur: 1.1, vol: 0.8 },
  { note: 'G3', start: 17.3, dur: 1.6, vol: 0.9 },
  
  { note: 'F3', start: 19.0, dur: 1.1, vol: 0.8 },
  { note: 'E3', start: 20.2, dur: 1.1, vol: 0.8 },
  { note: 'D3', start: 21.4, dur: 1.2, vol: 0.8 },
  { note: 'C3', start: 22.7, dur: 3.5, vol: 0.95 },
  { note: 'C2', start: 22.7, dur: 3.5, vol: 0.8 },
  { note: 'G2', start: 22.7, dur: 3.5, vol: 0.7 },
  { note: 'E3', start: 22.7, dur: 3.5, vol: 0.7 },
  { note: 'C4', start: 22.7, dur: 3.5, vol: 0.8 }
];

// 3. Más Cerca, Oh Dios, de Ti (Nearer, My God, to Thee) — Cuerdas y Piano Devocional
const masCercaNotes = [
  // G3, E4, D4, C4, E4, D4, C4, A3, G3...
  { note: 'C3', start: 0, dur: 2.5, vol: 0.6 },
  { note: 'G3', start: 0, dur: 2.5, vol: 0.5 },
  { note: 'G4', start: 0.5, dur: 1.5, vol: 0.85 },
  { note: 'E4', start: 2.1, dur: 1.0, vol: 0.8 },
  { note: 'F4', start: 3.2, dur: 1.0, vol: 0.8 },
  { note: 'G4', start: 4.3, dur: 2.0, vol: 0.9 },
  { note: 'C3', start: 4.3, dur: 2.0, vol: 0.6 },
  
  { note: 'A4', start: 6.4, dur: 1.5, vol: 0.85 },
  { note: 'F3', start: 6.4, dur: 2.5, vol: 0.6 },
  { note: 'G4', start: 8.0, dur: 1.0, vol: 0.8 },
  { note: 'E4', start: 9.1, dur: 2.2, vol: 0.85 },
  { note: 'C3', start: 9.1, dur: 2.2, vol: 0.6 },
  
  { note: 'D4', start: 11.4, dur: 1.5, vol: 0.8 },
  { note: 'G2', start: 11.4, dur: 2.5, vol: 0.6 },
  { note: 'C4', start: 13.0, dur: 1.0, vol: 0.8 },
  { note: 'D4', start: 14.1, dur: 2.0, vol: 0.85 },
  
  { note: 'G4', start: 16.2, dur: 1.5, vol: 0.9 },
  { note: 'C3', start: 16.2, dur: 2.5, vol: 0.6 },
  { note: 'E4', start: 17.8, dur: 1.0, vol: 0.8 },
  { note: 'F4', start: 18.9, dur: 1.0, vol: 0.8 },
  { note: 'G4', start: 20.0, dur: 1.8, vol: 0.9 },
  
  { note: 'E4', start: 21.9, dur: 1.2, vol: 0.85 },
  { note: 'D4', start: 23.2, dur: 1.2, vol: 0.8 },
  { note: 'C4', start: 24.5, dur: 3.5, vol: 0.95 },
  { note: 'C3', start: 24.5, dur: 3.5, vol: 0.7 },
  { note: 'G3', start: 24.5, dur: 3.5, vol: 0.6 },
  { note: 'E4', start: 24.5, dur: 3.5, vol: 0.7 }
];

// 4. Santo, Santo, Santo (Holy, Holy, Holy - Dykes / Nicaea) — Órgano y Campanas
const santoSantoNotes = [
  // C4, C4, E4, E4, G4, G4, E4...
  { note: 'C3', start: 0, dur: 1.2, vol: 0.7 },
  { note: 'C4', start: 0, dur: 1.2, vol: 0.85 },
  
  { note: 'C4', start: 1.3, dur: 1.2, vol: 0.85 },
  { note: 'E4', start: 2.6, dur: 1.2, vol: 0.85 },
  { note: 'E3', start: 2.6, dur: 1.2, vol: 0.6 },
  
  { note: 'E4', start: 3.9, dur: 1.2, vol: 0.85 },
  { note: 'G4', start: 5.2, dur: 2.2, vol: 0.9 },
  { note: 'G3', start: 5.2, dur: 2.2, vol: 0.6 },
  { note: 'C3', start: 5.2, dur: 2.2, vol: 0.6 },
  
  { note: 'G4', start: 7.5, dur: 1.2, vol: 0.85 },
  { note: 'A4', start: 8.8, dur: 1.2, vol: 0.85 },
  { note: 'F3', start: 8.8, dur: 1.2, vol: 0.6 },
  
  { note: 'A4', start: 10.1, dur: 1.2, vol: 0.85 },
  { note: 'G4', start: 11.4, dur: 2.4, vol: 0.9 },
  { note: 'E3', start: 11.4, dur: 2.4, vol: 0.6 },
  { note: 'C3', start: 11.4, dur: 2.4, vol: 0.6 },
  
  { note: 'G4', start: 13.9, dur: 1.2, vol: 0.85 },
  { note: 'E4', start: 15.2, dur: 1.2, vol: 0.85 },
  { note: 'C3', start: 15.2, dur: 1.2, vol: 0.6 },
  
  { note: 'D4', start: 16.5, dur: 1.2, vol: 0.8 },
  { note: 'G2', start: 16.5, dur: 1.2, vol: 0.6 },
  { note: 'C4', start: 17.8, dur: 2.2, vol: 0.9 },
  { note: 'C3', start: 17.8, dur: 2.2, vol: 0.6 },
  
  { note: 'D4', start: 20.1, dur: 1.2, vol: 0.8 },
  { note: 'E4', start: 21.4, dur: 1.2, vol: 0.85 },
  { note: 'D4', start: 22.7, dur: 1.2, vol: 0.8 },
  { note: 'C4', start: 24.0, dur: 3.5, vol: 0.95 },
  { note: 'C3', start: 24.0, dur: 3.5, vol: 0.7 },
  { note: 'G3', start: 24.0, dur: 3.5, vol: 0.6 }
];

// 5. A Dios Sea la Gloria (To God Be the Glory) — Piano Júbilo
const aDiosSeaGloriaNotes = [
  { note: 'G3', start: 0, dur: 0.8, vol: 0.8 },
  { note: 'C4', start: 0.9, dur: 1.5, vol: 0.9 },
  { note: 'C3', start: 0.9, dur: 2.0, vol: 0.6 },
  { note: 'E4', start: 2.5, dur: 0.8, vol: 0.8 },
  { note: 'G4', start: 3.4, dur: 1.8, vol: 0.9 },
  { note: 'G3', start: 3.4, dur: 1.8, vol: 0.6 },
  
  { note: 'E4', start: 5.3, dur: 0.8, vol: 0.8 },
  { note: 'C4', start: 6.2, dur: 1.5, vol: 0.9 },
  { note: 'D4', start: 7.8, dur: 0.8, vol: 0.8 },
  { note: 'E4', start: 8.7, dur: 2.2, vol: 0.85 },
  { note: 'C3', start: 8.7, dur: 2.2, vol: 0.6 },
  
  { note: 'D4', start: 11.0, dur: 1.2, vol: 0.8 },
  { note: 'C4', start: 12.3, dur: 0.8, vol: 0.8 },
  { note: 'B3', start: 13.2, dur: 1.8, vol: 0.85 },
  { note: 'G2', start: 13.2, dur: 2.2, vol: 0.6 },
  { note: 'A3', start: 15.1, dur: 0.8, vol: 0.8 },
  { note: 'B3', start: 16.0, dur: 2.0, vol: 0.85 },
  
  { note: 'C4', start: 18.1, dur: 1.5, vol: 0.9 },
  { note: 'C3', start: 18.1, dur: 2.0, vol: 0.6 },
  { note: 'E4', start: 19.7, dur: 0.8, vol: 0.8 },
  { note: 'G4', start: 20.6, dur: 1.8, vol: 0.95 },
  { note: 'E4', start: 22.5, dur: 0.9, vol: 0.85 },
  { note: 'C4', start: 23.5, dur: 3.5, vol: 0.95 },
  { note: 'C3', start: 23.5, dur: 3.5, vol: 0.7 },
  { note: 'G3', start: 23.5, dur: 3.5, vol: 0.6 }
];

// 6. Paz en la Tormenta — Guitarra y Piano Acústico Meditativo
const pazEnLaTormentaNotes = [
  // Gentle arpeggio C - Em - F - G
  { note: 'C3', start: 0, dur: 2.2, vol: 0.6 },
  { note: 'G3', start: 0.3, dur: 1.2, vol: 0.5 },
  { note: 'E4', start: 0.6, dur: 1.5, vol: 0.75 },
  { note: 'G4', start: 1.0, dur: 1.8, vol: 0.8 },
  
  { note: 'E3', start: 2.4, dur: 2.2, vol: 0.6 },
  { note: 'B3', start: 2.7, dur: 1.2, vol: 0.5 },
  { note: 'G4', start: 3.0, dur: 1.5, vol: 0.75 },
  { note: 'B4', start: 3.4, dur: 1.8, vol: 0.8 },
  
  { note: 'F3', start: 4.8, dur: 2.2, vol: 0.6 },
  { note: 'C4', start: 5.1, dur: 1.2, vol: 0.5 },
  { note: 'A4', start: 5.4, dur: 1.8, vol: 0.85 },
  { note: 'F4', start: 6.0, dur: 1.2, vol: 0.7 },
  
  { note: 'G3', start: 7.2, dur: 2.2, vol: 0.6 },
  { note: 'D4', start: 7.5, dur: 1.2, vol: 0.5 },
  { note: 'B4', start: 7.8, dur: 1.5, vol: 0.8 },
  { note: 'G4', start: 8.4, dur: 1.8, vol: 0.75 },
  
  // Melody enters: "Puedes tener paz en la tormenta"
  { note: 'G4', start: 9.6, dur: 1.0, vol: 0.85 },
  { note: 'A4', start: 10.7, dur: 1.0, vol: 0.85 },
  { note: 'G4', start: 11.8, dur: 1.8, vol: 0.9 },
  { note: 'C3', start: 11.8, dur: 2.5, vol: 0.6 },
  { note: 'E4', start: 13.7, dur: 1.5, vol: 0.8 },
  
  { note: 'D4', start: 15.3, dur: 1.0, vol: 0.8 },
  { note: 'C4', start: 16.4, dur: 1.2, vol: 0.85 },
  { note: 'D4', start: 17.7, dur: 2.0, vol: 0.85 },
  { note: 'G2', start: 17.7, dur: 2.5, vol: 0.6 },
  
  { note: 'E4', start: 19.8, dur: 1.2, vol: 0.85 },
  { note: 'F4', start: 21.1, dur: 1.2, vol: 0.85 },
  { note: 'G4', start: 22.4, dur: 1.8, vol: 0.9 },
  { note: 'E4', start: 24.3, dur: 1.2, vol: 0.85 },
  { note: 'C4', start: 25.6, dur: 3.5, vol: 0.95 },
  { note: 'C3', start: 25.6, dur: 3.5, vol: 0.7 },
  { note: 'G3', start: 25.6, dur: 3.5, vol: 0.6 }
];

// 7. Salmo 23 (El Señor es mi Pastor) — Flauta y Cuerdas Pastorales
const salmo23Notes = [
  { note: 'C4', start: 0.5, dur: 1.5, vol: 0.8 },
  { note: 'C3', start: 0, dur: 3.0, vol: 0.6 },
  { note: 'G3', start: 0, dur: 3.0, vol: 0.5 },
  { note: 'D4', start: 2.1, dur: 1.0, vol: 0.8 },
  { note: 'E4', start: 3.2, dur: 2.2, vol: 0.9 },
  { note: 'E3', start: 3.2, dur: 2.5, vol: 0.6 },
  
  { note: 'G4', start: 5.5, dur: 1.5, vol: 0.85 },
  { note: 'E4', start: 7.1, dur: 1.2, vol: 0.8 },
  { note: 'D4', start: 8.4, dur: 2.5, vol: 0.85 },
  { note: 'G2', start: 8.4, dur: 2.5, vol: 0.6 },
  
  { note: 'E4', start: 11.0, dur: 1.5, vol: 0.85 },
  { note: 'F4', start: 12.6, dur: 1.2, vol: 0.85 },
  { note: 'G4', start: 13.9, dur: 2.5, vol: 0.9 },
  { note: 'F3', start: 13.9, dur: 2.5, vol: 0.6 },
  
  { note: 'A4', start: 16.5, dur: 1.5, vol: 0.9 },
  { note: 'G4', start: 18.1, dur: 1.2, vol: 0.85 },
  { note: 'E4', start: 19.4, dur: 2.2, vol: 0.85 },
  { note: 'C3', start: 19.4, dur: 2.5, vol: 0.6 },
  
  { note: 'D4', start: 21.7, dur: 1.2, vol: 0.8 },
  { note: 'C4', start: 23.0, dur: 4.0, vol: 0.95 },
  { note: 'C3', start: 23.0, dur: 4.0, vol: 0.7 },
  { note: 'G3', start: 23.0, dur: 4.0, vol: 0.6 }
];

// 8. Juventud en Marcha (Himno de Jóvenes Adventistas) — Marcha Juvenil de Esperanza
const juventudEnMarchaNotes = [
  // C4, E4, G4, G4, A4, G4, E4, C4...
  { note: 'C3', start: 0, dur: 1.0, vol: 0.7 },
  { note: 'C4', start: 0, dur: 0.8, vol: 0.85 },
  { note: 'E4', start: 0.9, dur: 0.8, vol: 0.85 },
  { note: 'G4', start: 1.8, dur: 1.5, vol: 0.9 },
  { note: 'G3', start: 1.8, dur: 1.5, vol: 0.6 },
  
  { note: 'G4', start: 3.4, dur: 0.8, vol: 0.85 },
  { note: 'A4', start: 4.3, dur: 0.8, vol: 0.9 },
  { note: 'G4', start: 5.2, dur: 1.8, vol: 0.9 },
  { note: 'C3', start: 5.2, dur: 1.8, vol: 0.6 },
  
  { note: 'E4', start: 7.1, dur: 0.8, vol: 0.85 },
  { note: 'C4', start: 8.0, dur: 1.5, vol: 0.85 },
  { note: 'D4', start: 9.6, dur: 0.8, vol: 0.8 },
  { note: 'E4', start: 10.5, dur: 1.8, vol: 0.85 },
  { note: 'G2', start: 10.5, dur: 2.0, vol: 0.6 },
  
  { note: 'D4', start: 12.4, dur: 2.0, vol: 0.85 },
  { note: 'G3', start: 14.5, dur: 0.8, vol: 0.8 },
  
  { note: 'C4', start: 15.4, dur: 0.8, vol: 0.85 },
  { note: 'E4', start: 16.3, dur: 0.8, vol: 0.85 },
  { note: 'G4', start: 17.2, dur: 1.5, vol: 0.9 },
  { note: 'C3', start: 17.2, dur: 1.5, vol: 0.6 },
  
  { note: 'A4', start: 18.8, dur: 0.8, vol: 0.9 },
  { note: 'B4', start: 19.7, dur: 0.8, vol: 0.9 },
  { note: 'C5', start: 20.6, dur: 2.0, vol: 0.95 },
  { note: 'F3', start: 20.6, dur: 2.0, vol: 0.7 },
  
  { note: 'G4', start: 22.7, dur: 1.0, vol: 0.9 },
  { note: 'E4', start: 23.8, dur: 1.0, vol: 0.85 },
  { note: 'D4', start: 24.9, dur: 1.0, vol: 0.8 },
  { note: 'C4', start: 26.0, dur: 3.5, vol: 0.95 },
  { note: 'C3', start: 26.0, dur: 3.5, vol: 0.7 },
  { note: 'G3', start: 26.0, dur: 3.5, vol: 0.6 }
];

const filesToGenerate = [
  { name: 'amazing_grace.wav', notes: amazingGraceNotes, dur: 28, instrument: 'piano' },
  { name: 'castillo_fuerte.wav', notes: castilloFuerteNotes, dur: 27, instrument: 'organ' },
  { name: 'mas_cerca_oh_dios.wav', notes: masCercaNotes, dur: 28, instrument: 'piano' },
  { name: 'santo_santo_santo.wav', notes: santoSantoNotes, dur: 28, instrument: 'organ' },
  { name: 'a_dios_sea_gloria.wav', notes: aDiosSeaGloriaNotes, dur: 28, instrument: 'piano' },
  { name: 'paz_en_la_tormenta.wav', notes: pazEnLaTormentaNotes, dur: 29, instrument: 'guitar' },
  { name: 'salmo_23.wav', notes: salmo23Notes, dur: 28, instrument: 'guitar' },
  { name: 'juventud_en_marcha.wav', notes: juventudEnMarchaNotes, dur: 29, instrument: 'piano' }
];

console.log('Generating authentic Christian hymn audio files into:', outputDir);

for (const file of filesToGenerate) {
  const filePath = path.join(outputDir, file.name);
  const wavBuffer = renderHymn(file.notes, file.dur, file.instrument);
  fs.writeFileSync(filePath, wavBuffer);
  console.log(`✓ Generated ${file.name} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
}

console.log('All 8 Christian hymn audio files created successfully!');
