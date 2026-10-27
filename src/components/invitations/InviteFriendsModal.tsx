import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  UserPlus, 
  Flame, 
  Sparkles, 
  Church, 
  BookOpen, 
  HeartHandshake,
  QrCode
} from 'lucide-react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultActivity?: 'app' | 'church_service' | 'youth_society' | 'prayer' | 'bible_reading';
  defaultActivityTitle?: string;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  defaultActivity = 'app',
  defaultActivityTitle = 'Comunidad Juvenil A Prueba de Fuego'
}) => {
  const { currentUser, sendFriendInvitation, triggerCelebration } = useApp();

  const [activityType, setActivityType] = useState<'app' | 'church_service' | 'youth_society' | 'prayer' | 'bible_reading'>(defaultActivity);
  const [recipientName, setRecipientName] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate unique invite code based on user
  const inviteCode = `JA-${currentUser.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const baseUrl = window.location.origin || 'https://apruebadefuego.app';
  const inviteUrl = `${baseUrl}/?invite=${inviteCode}&from=${encodeURIComponent(currentUser.name)}`;

  const getActivityMessage = () => {
    const friendGreeting = recipientName.trim() ? `¡Hola ${recipientName.trim()}!` : '¡Hola!';
    switch (activityType) {
      case 'church_service':
        return `${friendGreeting} Te invito especialmente al culto de adoración en nuestra iglesia ${currentUser.church || 'Adventista'}. Ven a compartir un tiempo especial con Dios y con nosotros.`;
      case 'youth_society':
        return `${friendGreeting} Te invito a la reunión de Sociedad de Jóvenes JA este sábado. Habrá alabanza, dinámicas y un mensaje edificante que encenderá tu corazón.`;
      case 'prayer':
        return `${friendGreeting} Quería decirte que estoy orando por ti. Te invito a compartir tus peticiones en nuestro muro de oración en A Prueba de Fuego.`;
      case 'bible_reading':
        return `${friendGreeting} Te reto fraternalmente a iniciar juntos un plan de lectura bíblica diaria en A Prueba de Fuego para crecer en la Palabra de Dios.`;
      default:
        return `${friendGreeting} Te invito a unirte a "A Prueba de Fuego", la red social cristiana juvenil adventista para compartir la fe, cumplir retos espirituales y edificar nuestro carácter en Cristo.`;
    }
  };

  const finalMessage = customNote.trim() 
    ? `${getActivityMessage()}\n\n"${customNote.trim()}"\n\nÚnete aquí: ${inviteUrl}`
    : `${getActivityMessage()}\n\nÚnete aquí: ${inviteUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      triggerCelebration();
      setTimeout(() => setIsCopied(false), 2500);

      // Record invitation in Firestore
      sendFriendInvitation({
        recipientName: recipientName.trim() || undefined,
        message: finalMessage,
        activityType,
        activityTitle: defaultActivityTitle,
        inviteCode,
        inviteUrl,
      }).catch(e => console.warn('Invite save error:', e));
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');

    sendFriendInvitation({
      recipientName: recipientName.trim() || undefined,
      message: finalMessage,
      activityType,
      activityTitle: defaultActivityTitle,
      inviteCode,
      inviteUrl,
    }).catch(e => console.warn('Invite save error:', e));

    setSentSuccess(true);
    triggerCelebration();
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitación a A Prueba de Fuego',
          text: finalMessage,
          url: inviteUrl,
        });
        sendFriendInvitation({
          recipientName: recipientName.trim() || undefined,
          message: finalMessage,
          activityType,
          activityTitle: defaultActivityTitle,
          inviteCode,
          inviteUrl,
        }).catch(e => console.warn('Invite save error:', e));
        setSentSuccess(true);
        triggerCelebration();
        setTimeout(() => setSentSuccess(false), 3000);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-heading">
              Invita a un Amigo
            </h2>
            <p className="text-xs text-slate-400">
              Cumple el Reto Misionero y comparte la fe con tus amigos y familiares
            </p>
          </div>
        </div>

        {/* Activity Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            ¿A qué deseas invitarlo?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'app', label: 'A la Red Social', icon: Flame },
              { id: 'church_service', label: 'Culto de Iglesia', icon: Church },
              { id: 'youth_society', label: 'Sociedad JA', icon: Sparkles },
              { id: 'prayer', label: 'Muro de Oración', icon: HeartHandshake },
              { id: 'bible_reading', label: 'Plan Bíblico', icon: BookOpen },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = activityType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivityType(item.id as any)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all active:scale-95 text-xs font-semibold ${
                    isSelected 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Friend Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            Nombre de tu amigo (Opcional):
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Ej: David, Laura, Carlos..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Optional Custom Note */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            Palabras personales adicionales (Opcional):
          </label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Ej: Te guardo un asiento al lado mío este sábado."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Preview Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-400">Mensaje que recibirá:</span>
            <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded-md">Código: {inviteCode}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            "{finalMessage}"
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Compartir por WhatsApp Directo</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{isCopied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              <span>Otras Aplicaciones</span>
            </button>
          </div>
        </div>

        {sentSuccess && (
          <p className="text-center text-xs text-emerald-400 font-bold animate-in fade-in">
            ¡Invitación compartida exitosamente! Recuerda subir la evidencia en Retos para ganar tus +100 puntos.
          </p>
        )}

      </div>
    </div>
  );
};
