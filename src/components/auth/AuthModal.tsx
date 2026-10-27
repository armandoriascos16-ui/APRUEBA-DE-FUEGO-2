import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  auth, 
  createGoogleAuthProvider,
  db 
} from '../../firebase/config';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, SavedAccount } from '../../types';
import { 
  Flame, 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  QrCode,
  UserPlus,
  Users,
  Check
} from 'lucide-react';
import { AppQRCodeModal } from '../common/AppQRCodeModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onRegistrationSuccess?: (userData: { uid: string; email: string; name: string; avatar?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onRegistrationSuccess
}) => {
  const { 
    loginAs, 
    setAllUsers, 
    setActiveTab, 
    triggerCelebration,
    savedAccounts,
    addSavedAccount,
    removeSavedAccount,
    switchAccount,
    currentUser
  } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!isOpen) return null;

  const handleSelectSavedAccount = async (acc: SavedAccount) => {
    await switchAccount(acc.id);
    onClose();
    triggerCelebration();
  };

  const handleCreateAnotherAccount = () => {
    if (savedAccounts.length >= 2) {
      setErrorMessage(
        'Has alcanzado el límite de 2 cuentas guardadas en este dispositivo. Para registrar otra cuenta, primero debes quitar una de la lista de cuentas guardadas.'
      );
      setSuccessMessage(null);
      return;
    }

    setMode('register');
    setName('');
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage(
      savedAccounts.length > 0 
        ? 'Creando otra cuenta en este dispositivo. Tu cuenta actual permanecerá intacta y a salvo.'
        : null
    );
  };

  /**
   * Autenticación o registro oficial con Google con selector explícito de cuenta
   * prompt: 'select_account' para permitir elegir cuentas distintas en Cuenta 1 y Cuenta 2.
   */
  const handleGoogleAuthWithSlot = async (slot: 1 | 2) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Si ya existen 2 cuentas en el dispositivo y ninguna corresponde a este slot
    const existingInSlot = savedAccounts.find(a => a.slot === slot);
    if (!existingInSlot && savedAccounts.length >= 2) {
      setErrorMessage(
        'Has alcanzado el límite de 2 cuentas guardadas en este dispositivo. Para registrar otra cuenta de Google, primero debes quitar una de la lista.'
      );
      setIsLoading(false);
      return;
    }

    try {
      // Forzar siempre selector de cuenta de Google para evitar autoselección silenciosa
      const provider = createGoogleAuthProvider(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        console.warn('Could not read user doc from server:', err);
      }

      let profileData: any;

      if (userDocSnap && userDocSnap.exists()) {
        profileData = userDocSnap.data();
        setAllUsers((prev: User[]) => {
          const exists = prev.some((u: User) => u.id === user.uid);
          if (exists) return prev.map((u: User) => u.id === user.uid ? { ...u, ...profileData } : u);
          return [profileData as any, ...prev];
        });
      } else {
        // First-time user via Google -> Crear perfil inicial seguro en Firestore sin sobreescribir otros
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
          emailVerified: user.emailVerified || true,
          church: 'Iglesia Adventista del Séptimo Día',
          country: 'Colombia',
          points: 0,
          level: 1,
          levelName: 'Explorador de la Fe',
          role: 'user',
          isOfficialVerified: false,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, profileData, { merge: true });
        } catch (dbErr) {
          console.warn('Could not write initial Firestore user doc for Google account:', dbErr);
        }

        setAllUsers((prev: User[]) => {
          const exists = prev.some((u: User) => u.id === user.uid);
          if (exists) return prev.map((u: User) => u.id === user.uid ? { ...u, ...profileData } : u);
          return [profileData, ...prev];
        });
      }

      // Guardar en la lista de cuentas recordadas del dispositivo (máximo 2)
      addSavedAccount({
        id: user.uid,
        email: user.email || '',
        name: profileData?.name || user.displayName || 'Joven Cristiano',
        avatar: user.photoURL || undefined,
        lastActive: new Date().toISOString(),
        slot,
        providerId: 'google.com'
      });

      loginAs(user.uid);
      localStorage.setItem('apdf_registered', 'true');
      onClose();
      triggerCelebration();
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La ventana de Google fue cerrada antes de completar el acceso.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Solicitud cancelada.');
      } else {
        setErrorMessage(error.message || 'Error al conectar con Google Authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        // Sign In with Email & Password
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;

        // Guardar en la lista de cuentas recordadas en el dispositivo (máx 2)
        addSavedAccount({
          id: user.uid,
          email: user.email || email.trim(),
          name: user.displayName || email.trim().split('@')[0],
          avatar: user.photoURL || undefined,
          lastActive: new Date().toISOString(),
          providerId: 'password'
        });

        // Synchronize or link Firestore user profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profile = userDocSnap.data();
            setAllUsers((prev: User[]) => {
              const exists = prev.some((u: User) => u.id === user.uid);
              if (exists) return prev.map((u: User) => u.id === user.uid ? { ...u, ...profile } : u);
              return [profile as any, ...prev];
            });
          } else {
            // First time link if doc was missing
            const fallbackProfile: Partial<User> = {
              id: user.uid,
              name: user.displayName || 'Joven Cristiano',
              email: user.email || email.trim(),
              avatar: user.photoURL || '',
              emailVerified: user.emailVerified || false,
              points: 0,
              level: 1,
              levelName: 'Explorador de la Fe',
              role: 'user',
              isOfficialVerified: false,
            };
            await setDoc(userDocRef, fallbackProfile, { merge: true });
          }
        } catch (err) {
          console.warn('Firestore profile sync note:', err);
        }

        loginAs(user.uid);
        localStorage.setItem('apdf_registered', 'true');
        onClose();
        triggerCelebration();
      } else {
        // Validación de límite de cuentas en dispositivo antes de registrar
        const emailLower = email.trim().toLowerCase();
        const alreadySaved = savedAccounts.some(a => a.email.toLowerCase() === emailLower);
        if (savedAccounts.length >= 2 && !alreadySaved) {
          setErrorMessage(
            'Has alcanzado el límite de 2 cuentas guardadas en este dispositivo. Para registrar otra cuenta, primero debes quitar una de la lista.'
          );
          setIsLoading(false);
          return;
        }

        // Register New Account with Email & Password
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;

        // Enviar correo de verificación real a través de Firebase Auth
        try {
          await sendEmailVerification(user);
        } catch (verifErr) {
          console.warn('Could not send verification email:', verifErr);
        }

        if (name.trim()) {
          try {
            await updateProfile(user, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn('Could not update Auth displayName:', profileErr);
          }
        }

        // Create base user record in Firestore without overwriting other accounts
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const initialProfileData = {
            id: user.uid,
            name: name.trim() || 'Joven',
            lastName: 'Cristiano',
            username: name.trim() ? name.trim().toLowerCase().replace(/\s+/g, '_') : `joven_${user.uid.slice(0, 5)}`,
            email: user.email || email.trim(),
            avatar: user.photoURL || '',
            emailVerified: user.emailVerified || false,
            church: 'Iglesia Adventista del Séptimo Día',
            country: 'Colombia',
            points: 0,
            level: 1,
            levelName: 'Explorador de la Fe',
            role: 'user',
            isOfficialVerified: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, initialProfileData, { merge: true });
        } catch (dbErr) {
          console.warn('Could not write initial Firestore user doc:', dbErr);
        }

        // Registrar la nueva cuenta en savedAccounts
        addSavedAccount({
          id: user.uid,
          email: user.email || email.trim(),
          name: name.trim() || 'Joven Cristiano',
          avatar: user.photoURL || undefined,
          lastActive: new Date().toISOString(),
          providerId: 'password'
        });

        loginAs(user.uid);
        localStorage.setItem('apdf_registered', 'true');
        onClose();
        if (onRegistrationSuccess) {
          onRegistrationSuccess({
            uid: user.uid,
            email: user.email || email.trim(),
            name: name.trim() || 'Joven Cristiano',
            avatar: user.photoURL || undefined
          });
        }
        setActiveTab('onboarding');
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'El proveedor de Correo/Contraseña requiere activación en Firebase Console. ' +
          'Pasos: Firebase Console → Authentication → Sign-in method → Correo/Contraseña → Habilitar. ' +
          'Mientras tanto, pulsa "Registrarse con Google" para ingresar de inmediato.'
        );
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este correo ya está registrado en Firebase. Por favor, selecciona "Inicia sesión aquí" e ingresa tu contraseña.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMessage('Contraseña o correo incorrectos. Verifica tus datos o usa "¿Olvidaste tu contraseña?" para restablecerla.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No existe ninguna cuenta registrada con este correo electrónico. Puedes crear una pulsando "Regístrate aquí".');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('El formato del correo electrónico no es válido. Revisa que esté bien escrito.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Demasiados intentos fallidos por seguridad. Espera unos minutos antes de intentar de nuevo.');
      } else {
        setErrorMessage(error.message || 'Error al autenticar con Firebase. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-7 relative">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-lg mb-2.5 fire-glow">
            <Flame className="h-6 w-6 fill-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">
            {mode === 'login' 
              ? 'Iniciar Sesión en tu Cuenta' 
              : savedAccounts.length > 0 
                ? 'Registrar Otra Cuenta' 
                : 'Crea tu Cuenta con Firebase'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
            {mode === 'login' 
              ? 'Accede a tu ficha de jugador, retos y comunidad juvenil adventista.'
              : savedAccounts.length > 0
                ? 'Registra una segunda cuenta. Tu primera cuenta y publicaciones permanecerán a salvo.'
                : 'Regístrate para comenzar tu aventura espiritual con 00 puntos.'}
          </p>
        </div>

        {/* Success message box */}
        {successMessage && (
          <div className="mb-3.5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Error message box */}
        {errorMessage && (
          <div className="mb-3.5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Selector de Cuentas Guardadas en el Dispositivo (Máximo 2) */}
        {mode === 'login' && savedAccounts.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-amber-400" />
                <span>Cuentas en este dispositivo ({savedAccounts.length}/2)</span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-medium">
                Toca para seleccionar
              </span>
            </div>

            <div className="space-y-1.5">
              {savedAccounts.map((acc) => {
                const isActive = acc.id === currentUser.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectSavedAccount(acc)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-xs font-bold text-amber-400">
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{(acc.name || 'J')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                              <Check className="h-2.5 w-2.5" />
                              <span>Activa</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => removeSavedAccount(acc.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Quitar de este dispositivo (no se borra del servidor)"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'forgot' ? (
          /* Forgot Password View */
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setIsLoading(true);
              setErrorMessage(null);
              setSuccessMessage(null);
              try {
                await sendPasswordResetEmail(auth, email.trim());
                setSuccessMessage('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.');
              } catch (err: any) {
                console.error('Password reset error:', err);
                if (err.code === 'auth/user-not-found') {
                  setErrorMessage('No encontramos ninguna cuenta registrada con este correo.');
                } else if (err.code === 'auth/invalid-email') {
                  setErrorMessage('El formato de correo no es válido.');
                } else {
                  setErrorMessage(err.message || 'Error al enviar correo de recuperación.');
                }
              } finally {
                setIsLoading(false);
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Ingresa tu Correo Registrado:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu_correo@ejemplo.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black hover:from-amber-400 hover:to-orange-500 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Enviar Enlace de Recuperación</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <>
            {/* Quick Open on Mobile via QR Code */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 mb-3 shadow-sm active:scale-[0.98]"
            >
              <QrCode className="h-4 w-4 text-amber-400" />
              <span>Abrir en tu Celular con Código QR</span>
            </button>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre y Apellido:
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Daniel Morales"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu_correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Contraseña:
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 1. Botón obligatorio: Iniciar sesión / Continuar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black hover:from-amber-400 hover:to-orange-500 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Iniciar sesión' : 'Continuar al Onboarding'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {/* 2. Botón obligatorio: «Crear otra cuenta» justo debajo de Iniciar sesión */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleCreateAnotherAccount}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm mt-2"
                >
                  <UserPlus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Crear otra cuenta</span>
                </button>
              )}

              {/* 3. Dos opciones visibles e independientes de registro con Google */}
              <div className="pt-2.5 space-y-2 border-t border-slate-800/80 mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-center tracking-wider">
                  Opciones de Google (hasta 2 cuentas)
                </span>

                {/* Opción A: Registrarse con Google — Cuenta 1 */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuthWithSlot(1)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-between gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
                    </svg>
                    <span className="truncate">Registrarse con Google — Cuenta 1</span>
                  </div>
                  {savedAccounts.some(a => a.slot === 1) && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 font-extrabold border border-emerald-500/30 shrink-0">
                      Guardada
                    </span>
                  )}
                </button>

                {/* Opción B: Registrarse con Google — Cuenta 2 */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuthWithSlot(2)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-white border border-slate-700 hover:border-amber-500/50 font-bold text-xs transition-all flex items-center justify-between gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
                    </svg>
                    <span className="truncate">Registrarse con Google — Cuenta 2</span>
                  </div>
                  {savedAccounts.some(a => a.slot === 2) && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 shrink-0">
                      Guardada
                    </span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === 'forgot' ? (
            <p>
              ¿Recordaste tus datos?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:underline font-bold"
              >
                Volver a Iniciar Sesión
              </button>
            </p>
          ) : mode === 'login' ? (
            <p>
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:underline font-bold"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:underline font-bold"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Protegido con Firebase Auth & Encriptación SSL</span>
        </div>

      </div>

      {/* Mobile QR Scanner Modal */}
      <AppQRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};
