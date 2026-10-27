import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Check, 
  X, 
  UserPlus, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { SessionAccount } from '../../services/accountManagerService';

interface AccountSwitcherProps {
  onOpenAuthModal?: () => void;
  onAccountSwitched?: () => void;
  variant?: 'compact' | 'full';
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  onOpenAuthModal,
  onAccountSwitched
}) => {
  const { 
    currentUser, 
    savedSessions, 
    switchAccountSession, 
    removeAccountSession,
    triggerCelebration 
  } = useApp();

  const handleSwitch = async (session: SessionAccount) => {
    if (session.uid === currentUser.id) return;
    const ok = await switchAccountSession(session.uid);
    if (ok) {
      triggerCelebration();
      if (onAccountSwitched) onAccountSwitched();
    }
  };

  const handleRemove = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    removeAccountSession(uid);
  };

  const isLimitReached = savedSessions.length >= 2;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-heading">
              Cuentas en este Dispositivo
            </h3>
            <p className="text-[10px] text-slate-400">
              {savedSessions.length} de 2 cuentas guardadas
            </p>
          </div>
        </div>

        {isLimitReached && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Límite 2/2
          </span>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-2">
        {savedSessions.length === 0 ? (
          <div className="p-3 text-center text-slate-400 text-xs">
            Inicia sesión o registra una cuenta para recordarla aquí.
          </div>
        ) : (
          savedSessions.map((session) => {
            const isActive = session.uid === currentUser.id;
            return (
              <div
                key={session.uid}
                onClick={() => handleSwitch(session)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Avatar and Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-8 w-8 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-xs font-bold text-amber-400">
                    {session.photoURL ? (
                      <img src={session.photoURL} alt={session.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{(session.displayName || session.email || 'J')[0].toUpperCase()}</span>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-slate-950 text-[8px] font-black text-amber-400 rounded-tl flex items-center justify-center border-t border-l border-slate-700">
                      {session.slot}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">
                        {session.displayName || 'Usuario'}
                      </p>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5 shrink-0">
                          <Check className="h-2.5 w-2.5" />
                          <span>Activa</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {session.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => handleSwitch(session)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black hover:bg-amber-400 transition-colors shadow-sm flex items-center gap-1 active:scale-95"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Cambiar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, session.uid)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                    title="Quitar de este dispositivo (sin borrar del servidor)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add second account action */}
      {!isLimitReached ? (
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-amber-500/40 hover:border-amber-500 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5 text-amber-400" />
          <span>Vincular / Añadir Segunda Cuenta ({savedSessions.length}/2)</span>
        </button>
      ) : (
        <p className="text-[10px] text-slate-400 text-center px-1 leading-relaxed">
          Has alcanzado el límite de 2 cuentas recordadas en este dispositivo. Para vincular otra cuenta, quita una de las existentes primero.
        </p>
      )}

      {/* Security badge */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        <span>Operaciones en Firestore vinculadas al UID de la cuenta activa</span>
      </div>
    </div>
  );
};
