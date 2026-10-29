import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { auth, createGoogleAuthProvider, db } from '../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, SavedAccount, AuthEvent } from '../../types';
import { recordAuthEventInFirestore } from '../../firebase/firestoreService';
import { 
  Flame, 
  ShieldCheck, 
  Users, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Loader2, 
  CheckCircle2,
  Calendar,
  HeartHandshake
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface AuthGateScreenProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({
  onOpenLogin,
  onOpenRegister
}) => {
  const { 
    savedAccounts, 
    switchAccount, 
    addSavedAccount,
    loginAs, 
    setAllUsers, 
    triggerCelebration 
  } = useApp();

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleQuickGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setGoogleError(null);

    try {
      const provider = createGoogleAuthProvider(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar perfil en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        console.warn('Could not read user doc from server:', err);
      }

      let profileData: any;
      const isNew = !userDocSnap || !userDocSnap.exists();

      if (!isNew && userDocSnap) {
        profileData = userDocSnap.data();
        setAllUsers((prev: User[]) => {
          const exists = prev.some((u: User) => u.id === user.uid);
          if (exists) return prev.map((u: User) => u.id === user.uid ? { ...u, ...profileData } : u);
          return [profileData as any, ...prev];
        });
      } else {
        const displayName = user.displayName || 'Joven Cristiano';
        const parts = displayName.split(' ');
        const firstName = parts[0] || 'Joven';
        const lastName = parts.slice(1).join(' ') || 'Cristiano';

        profileData = {
          id: user.uid,
          name: firstName,
          lastName: lastName,
          username: user.email ? user.email.split('@')[0].replace(/\./g, '_') : `joven_${user.uid.slice(0, 5)}`,
          email: user.email || '',
          avatar: user.photoURL || '',
          emailVerified: user.emailVerified ?? true,
          church: 'Iglesia Adventista del Séptimo Día',
          country: 'Colombia',
          points: 0,
          level: 1,
          levelName: 'Explorador de la Fe',
          role: 'user',
          isOfficialVerified: false,
          isProfileComplete: true,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, profileData, { merge: true });
        } catch (dbErr) {
          console.warn('Could not write initial Firestore user doc:', dbErr);
        }

        setAllUsers((prev: User[]) => {
          const exists = prev.some((u: User) => u.id === user.uid);
          if (exists) return prev.map((u: User) => u.id === user.uid ? { ...u, ...profileData } : u);
          return [profileData, ...prev];
        });
      }

      // Guardar cuenta en el dispositivo (slot 1)
      addSavedAccount({
        id: user.uid,
        email: user.email || '',
        name: profileData?.name || user.displayName || 'Joven Cristiano',
        avatar: user.photoURL || undefined,
        lastActive: new Date().toISOString(),
        slot: 1,
        providerId: 'google.com'
      });

      // Registrar evento de auditoría
      const authEvt: AuthEvent = {
        id: `evt_${Date.now()}_${user.uid.slice(0, 6)}`,
        userId: user.uid,
        userEmail: user.email || '',
        userName: profileData?.name || user.displayName || 'Joven Cristiano',
        eventType: isNew ? 'register' : 'login',
        timestamp: new Date().toISOString(),
        providerId: 'google.com'
      };
      recordAuthEventInFirestore(authEvt).catch(() => {});

      loginAs(user.uid);
      localStorage.setItem('apdf_registered', 'true');
      triggerCelebration();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setGoogleError('La ventana de Google se cerró antes de completar el acceso.');
      } else {
        setGoogleError(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSelectAccount = async (acc: SavedAccount) => {
    await switchAccount(acc.id);
    triggerCelebration();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto p-4 sm:p-6 my-auto flex flex-col items-center text-center space-y-6">
        
        {/* Brand Icon & Badge */}
        <div className="space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 p-0.5 shadow-2xl shadow-orange-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Flame className="h-10 w-10 text-amber-500 fill-amber-500/30 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              Comunidad JA
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              A PRUEBA DE FUEGO
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Red social y discipulado para jóvenes adventistas y cristianos.
            </p>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="p-2 space-y-1">
            <Sparkles className="h-4 w-4 text-amber-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">Retos & Puntos</p>
          </div>
          <div className="p-2 space-y-1 border-x border-slate-800">
            <Users className="h-4 w-4 text-orange-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">Comunidades</p>
          </div>
          <div className="p-2 space-y-1">
            <HeartHandshake className="h-4 w-4 text-emerald-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">Oración 24/7</p>
          </div>
        </div>

        {/* Saved Accounts Fast Switcher (If any saved on this device) */}
        {savedAccounts.length > 0 && (
          <div className="w-full space-y-2 text-left">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block px-1">
              Cuentas activas en este dispositivo:
            </span>
            <div className="space-y-2">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-between group active:scale-98 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatar={acc.avatar}
                      name={acc.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[190px]">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <span>Entrar</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error notification */}
        {googleError && (
          <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-left">
            {googleError}
          </div>
        )}

        {/* Mandatory Authentication Action Buttons */}
        <div className="w-full space-y-3">
          
          {/* Quick Google Sign In Button */}
          <button
            onClick={handleQuickGoogleSignIn}
            disabled={isLoadingGoogle}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 disabled:opacity-50"
          >
            {isLoadingGoogle ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                <span>Conectando con Google...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          {/* Email Login Button */}
          <button
            onClick={onOpenLogin}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <LogIn className="h-4 w-4 text-amber-400" />
            <span>Iniciar Sesión con Correo</span>
          </button>

          {/* Create New Account Button */}
          <button
            onClick={onOpenRegister}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
          >
            <UserPlus className="h-4 w-4 fill-slate-950" />
            <span>Crear Cuenta Nueva</span>
          </button>

        </div>

        {/* Security & Access Information */}
        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 max-w-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Acceso seguro protegido por Firebase Authentication</span>
        </div>

      </div>

      {/* Footer text */}
      <footer className="p-4 text-center text-[10px] text-slate-400">
        A Prueba de Fuego &copy; {new Date().getFullYear()} · Red Juvenil Cristiana & Adventista
      </footer>

    </div>
  );
};
