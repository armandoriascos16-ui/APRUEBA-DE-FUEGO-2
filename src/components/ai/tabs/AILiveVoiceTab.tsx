import React, { useState, useRef, useEffect } from 'react';
import { Radio, Mic, MicOff, Volume2, ShieldCheck, Activity } from 'lucide-react';

export const AILiveVoiceTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [statusText, setStatusText] = useState('Listo para iniciar sesión de voz en vivo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      disconnectLive();
    };
  }, []);

  const connectLive = async () => {
    try {
      setErrorMsg(null);
      setStatusText('Conectando a Gemini 3.8 Live API...');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 16kHz for input mic capture as required by Live API
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextInRef.current = inputCtx;

      // 24kHz for model audio playback
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextOutRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live-ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Sesión en vivo activa: Habla con tu consejero pastoral');

        // Hook up microphone stream
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32Array to 16-bit PCM little-endian
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            const uint8 = new Uint8Array(pcm16.buffer);
            let binary = '';
            for (let i = 0; i < uint8.byteLength; i++) {
              binary += String.fromCharCode(uint8[i]);
            }
            const base64Audio = btoa(binary);
            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorMsg(msg.error);
            return;
          }
          if (msg.interrupted) {
            // User interrupted model: reset audio playback queue
            if (audioContextOutRef.current) {
              nextPlayTimeRef.current = audioContextOutRef.current.currentTime;
            }
            setIsTalking(false);
            return;
          }
          if (msg.audio) {
            setIsTalking(true);
            playPcm24kChunk(msg.audio);
          }
        } catch (err) {
          console.warn('Error processing WS audio message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Live error:', err);
        setErrorMsg('Error en la conexión WebSocket de voz en vivo.');
        disconnectLive();
      };

      ws.onclose = () => {
        disconnectLive();
      };
    } catch (err: any) {
      console.error('Error connecting to Live API:', err);
      setErrorMsg(err.message || 'No se pudo iniciar el micrófono o la conexión.');
      disconnectLive();
    }
  };

  const playPcm24kChunk = (base64Audio: string) => {
    try {
      const outputCtx = audioContextOutRef.current;
      if (!outputCtx) return;

      const binary = atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const sourceNode = outputCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(outputCtx.destination);

      const startTime = Math.max(outputCtx.currentTime, nextPlayTimeRef.current);
      sourceNode.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      sourceNode.onended = () => {
        if (outputCtx.currentTime >= nextPlayTimeRef.current - 0.05) {
          setIsTalking(false);
        }
      };
    } catch (err) {
      console.warn('Error playing audio chunk:', err);
    }
  };

  const disconnectLive = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextInRef.current) {
      audioContextInRef.current.close().catch(() => {});
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
      audioContextOutRef.current.close().catch(() => {});
      audioContextOutRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
    setStatusText('Sesión de voz finalizada');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            Conversación de Voz en Tiempo Real (Gemini 3.8 Live API)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Diálogo de audio continuo y bidireccional con <code className="text-amber-300 font-mono">gemini-3.8-live</code> vía WebSocket (16kHz entrada / 24kHz salida).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isConnected ? 'En Línea' : 'Desconectado'}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-6 max-w-xl mx-auto shadow-inner">
        
        {/* Animated Avatar / Sound Wave Indicator */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full transition duration-500 ${
            isTalking
              ? 'bg-amber-500/20 scale-125 animate-ping'
              : isConnected
              ? 'bg-amber-500/10 scale-105'
              : 'bg-slate-800/30'
          }`} />
          <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
            isTalking
              ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/40 scale-110'
              : isConnected
              ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400'
              : 'bg-slate-900 border border-slate-800 text-slate-500'
          }`}>
            {isTalking ? (
              <Activity className="w-12 h-12 animate-bounce" />
            ) : isConnected ? (
              <Volume2 className="w-12 h-12" />
            ) : (
              <Radio className="w-12 h-12" />
            )}
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-white mb-1">
            {isTalking ? 'El Consejero está respondiendo...' : isConnected ? 'Te escucho con atención...' : 'Inicia una conversación pastoral por voz'}
          </h4>
          <p className="text-xs text-slate-400 font-medium">{statusText}</p>
        </div>

        {/* Live CTA Button */}
        <div>
          {isConnected ? (
            <button
              onClick={disconnectLive}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 mx-auto shadow-lg shadow-rose-500/20 cursor-pointer text-sm"
            >
              <MicOff className="w-4 h-4" />
              <span>Finalizar Sesión de Voz</span>
            </button>
          ) : (
            <button
              onClick={connectLive}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition flex items-center gap-2 mx-auto shadow-xl shadow-amber-500/25 cursor-pointer text-sm"
            >
              <Mic className="w-5 h-5" />
              <span>Iniciar Conversación con Gemini Live</span>
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        <div className="pt-2 border-t border-slate-900 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Privacidad & Cifrado Seguro
          </span>
          <span>•</span>
          <span>Baja latencia WebSocket</span>
        </div>
      </div>

    </div>
  );
};
