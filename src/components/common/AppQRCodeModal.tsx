import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  ExternalLink,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface AppQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppQRCodeModal: React.FC<AppQRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');

  // Determine the real public web URL for mobile scanning
  const getPublicUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // If running on a public cloud URL (Run or AI Studio preview), use it
      if (origin && origin.startsWith('https://')) {
        return origin;
      }
    }
    // Verified production preview host URL
    return 'https://ais-pre-htzyj2hkqk5vzjeebjdets-167314969114.us-east5.run.app';
  };

  const appUrl = getPublicUrl();

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toString(appUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff'
      },
      width: isZoomed ? 340 : 220
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error('Error generating QR Code:', err));
  }, [isOpen, appUrl, isZoomed]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isZoomed ? 'max-w-lg p-6 sm:p-8' : 'max-w-sm p-6'
        }`}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Cerrar ventana"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-lg mb-2.5">
            <Smartphone className="h-5 w-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white font-heading">
            Abrir A Prueba de Fuego en tu Celular
          </h3>
          <p className="text-xs text-amber-300/90 font-medium mt-1">
            Escanea este código con tu celular para abrir A Prueba de Fuego
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative p-3.5 bg-white rounded-2xl shadow-xl border-4 border-amber-500/30">
            {qrSvg ? (
              <div 
                className="w-auto h-auto flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
              </div>
            )}
            
            {/* Center mini flame badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="p-1 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 shadow-md ring-2 ring-white">
                <Flame className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Zoom toggle button */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded-full transition-colors"
          >
            {isZoomed ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Reducir tamaño</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Ampliar código QR</span>
              </>
            )}
          </button>
        </div>

        {/* URL Box & Copy Link Button */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-300 truncate select-all px-1">
            {appUrl}
          </span>
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar enlace</span>
              </>
            )}
          </button>
        </div>

        {/* Security & Instructions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Dirección web pública segura. No contiene contraseñas ni tokens personales.</span>
        </div>

      </div>
    </div>
  );
};
