import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, User, ShieldCheck, Chrome, RefreshCw } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, logUserActivity } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup';
type UserRole = 'customer' | 'admin';
type Screen = 'role-selection' | 'auth-form' | 'verification-sent';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [screen, setScreen] = useState<Screen>('role-selection');
  const [role, setRole] = useState<UserRole>('customer');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please fill in your email address above first, then click "Forgot Password" to receive a password recovery email.');
      return;
    }
    setError('');
    setResetFeedback(null);
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetFeedback({
        type: 'success',
        text: `Success! We have sent a password reset link to ${email}. Please check your inbox and spam folder.`
      });
    } catch (err: any) {
      console.error('Password reset helper error:', err);
      setResetFeedback({
        type: 'error',
        text: err.message?.replace('Firebase:', '').trim() || 'Failed to send password reset email. Please try again.'
      });
    } finally {
      setSendingReset(false);
    }
  };

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid confusing chars like 1/I, 0/O
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (isOpen && screen === 'auth-form' && mode === 'login') {
      generateCaptcha();
    }
  }, [isOpen, screen, mode]);

  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    setResetFeedback(null);
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setMode('login');
    resetFormState();
    setScreen('auth-form');
  };

  const handleGoBack = () => {
    setScreen('role-selection');
    resetFormState();
  };

  const handleError = (err: any) => {
    console.error('Auth error detail:', err);
    const errorCode = err.code || '';
    const message = err.message || '';

    const isWrongCredentials = 
      errorCode === 'auth/wrong-password' || 
      errorCode === 'auth/user-not-found' || 
      errorCode === 'auth/invalid-credential' ||
      errorCode.includes('invalid-credential') ||
      message.includes('invalid-credential') ||
      message.includes('invalid_credential') ||
      message.includes('auth/invalid-credential') ||
      message.includes('wrong') || 
      message.includes('password') || 
      message.includes('incorrect');

    const isEmailAlreadyInUse = 
      errorCode === 'auth/email-already-in-use' ||
      errorCode.includes('email-already-in-use') ||
      message.includes('email-already-in-use') ||
      message.includes('already-exists') ||
      message.includes('already exists');

    const isUnauthorizedDomain =
      errorCode === 'auth/unauthorized-domain' ||
      errorCode.includes('unauthorized-domain') ||
      message.includes('unauthorized-domain') ||
      message.includes('unauthorized domain') ||
      message.includes('auth/unauthorized-domain');

    if (isUnauthorizedDomain) {
      setError(`Domain unauthorized. Please add "${window.location.hostname}" to the "Authorized domains" list under your Firebase Console (Authentication > Settings).`);
    } else if (isWrongCredentials) {
      setError('Email or password is incorrect.');
    } else if (isEmailAlreadyInUse) {
      setError('User already exists. Please sign in instead.');
    } else {
      setError(message.replace('Firebase:', '').trim() || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Find if user already exists
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);
        let finalRole = result.user.email === 'mithilacateringservices@gmail.com' ? 'admin' : 'customer';
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data && data.role) {
            finalRole = result.user.email === 'mithilacateringservices@gmail.com' ? 'admin' : data.role;
          }
        } else {
          // Write user profile to Firestore
          await setDoc(userRef, {
            uid: result.user.uid,
            name: result.user.displayName || 'Customer',
            email: result.user.email,
            role: result.user.email === 'mithilacateringservices@gmail.com' ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          }, { merge: true });
        }

        // Store role & close modal instantly (no full page reload)
        localStorage.setItem('userRole', finalRole);
        await logUserActivity('Google Sign-In Success', { email: result.user.email, role: finalRole });
        if (finalRole === 'admin') {
          window.location.href = '/admin-dashboard';
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'login') {
      const inputNorm = captchaInput.toUpperCase().trim();
      const codeNorm = captchaCode.toUpperCase().trim();
      if (!inputNorm || inputNorm !== codeNorm) {
        setError('CAPTCHA verification mismatch. Please solve the code correctly.');
        generateCaptcha();
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send email authorization link
        await sendEmailVerification(user);

        // Save profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        const targetRole = email.toLowerCase() === 'mithilacateringservices@gmail.com' ? 'admin' : role;
        await setDoc(userRef, {
          uid: user.uid,
          name: email.split('@')[0],
          email: user.email,
          role: targetRole,
          createdAt: new Date().toISOString()
        }, { merge: true });

        // Sign the user out immediately so they cannot access pages as unverified logged-in users
        if (email.toLowerCase() !== 'mithilacateringservices@gmail.com') {
          await signOut(auth);
          localStorage.removeItem('userRole');
          setRegisteredEmail(user.email || email);
          setScreen('verification-sent');
        } else {
          localStorage.setItem('userRole', 'admin');
          onClose();
          window.location.href = '/admin-dashboard';
        }

        await logUserActivity('User Signed Up - Verification Email Sent', { email: user.email, role: targetRole });
      } else {
        // Login mode
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Strict Email Authorization Check
        if (!user.emailVerified && user.email?.toLowerCase() !== 'mithilacateringservices@gmail.com') {
          // Resend email verification link for helper convenience
          await sendEmailVerification(user);
          await signOut(auth);
          localStorage.removeItem('userRole');
          throw new Error("Email unverified. We have sent an authorization approval link to your email. Please check your inbox and click the link to verify first!");
        }

        // Fetch user document from Firestore to find their real role
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        let finalRole = email.toLowerCase() === 'mithilacateringservices@gmail.com' ? 'admin' : role; // fall back to chosen form role if profile not in DB

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data && data.role) {
            finalRole = email.toLowerCase() === 'mithilacateringservices@gmail.com' ? 'admin' : data.role;
          }
        } else {
          // Document doesn't exist, create it
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email,
            role: finalRole,
            createdAt: new Date().toISOString()
          }, { merge: true });
        }

        // Store role & close or redirect
        localStorage.setItem('userRole', finalRole);
        await logUserActivity('User Logged In', { email: user.email, role: finalRole });
        if (finalRole === 'admin') {
          window.location.href = '/admin-dashboard';
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-screen h-screen top-0 left-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm w-screen h-screen"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md bg-white rounded-3xl max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-orange-100 z-10 m-auto self-center"
          >
            {/* Header / Background Pattern */}
            <div className="bg-orange-600 px-6 py-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-orange-700 rounded-full transition-colors"
                id="close-auth-modal"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-black tracking-tight mt-2">
                {screen === 'role-selection' && 'Welcome to Mithila'}
                {screen === 'auth-form' && (role === 'admin' ? 'Admin Portal' : 'Customer Portal')}
                {screen === 'verification-sent' && 'Verify Your Email'}
              </h3>
              <p className="text-orange-100 text-sm mt-1">
                {screen === 'role-selection' && 'Choose your account type to proceed'}
                {screen === 'auth-form' && (mode === 'login' ? 'Please log in to continue' : 'Create an account to continue')}
                {screen === 'verification-sent' && 'Action Required'}
              </p>
            </div>

            <div className="p-6">
              {/* SCREEN 1: ROLE SELECTION */}
              {screen === 'role-selection' && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleRoleSelect('customer')}
                    className="w-full flex items-center gap-4 p-5 bg-orange-50 hover:bg-orange-100/80 border border-orange-100 rounded-2xl text-left transition-all active:scale-[0.98] group"
                    id="role-customer-btn"
                  >
                    <div className="p-3 bg-orange-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-800 text-lg">I am a Customer</h4>
                      <p className="text-xs text-neutral-500">Log in or sign up to check preferences and planner</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full flex items-center gap-4 p-5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl text-left transition-all active:scale-[0.98] group"
                    id="role-admin-btn"
                  >
                    <div className="p-3 bg-neutral-800 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-800 text-lg">I am Admin</h4>
                      <p className="text-xs text-neutral-500">Access catering inquiries and business dashboard</p>
                    </div>
                  </button>
                </div>
              )}

              {/* SCREEN 2 & 3: EMAIL AUTH & GOOGLE AUTH */}
              {screen === 'auth-form' && (
                <div className="space-y-5">
                  {/* Google Authenticator (only for customers) */}
                  {role === 'customer' && (
                    <div>
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold rounded-2xl transition-all disabled:opacity-50"
                        id="google-signin-btn"
                      >
                        <Chrome size={20} className="text-red-500" />
                        <span>Continue with Google</span>
                      </button>

                      <div className="relative my-6 flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-neutral-200"></div>
                        <span className="relative px-3 bg-white text-xs font-bold text-neutral-400 tracking-wider uppercase">or use email</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-11 pr-4 py-3 bg-neutral-50 border-2 border-neutral-100 focus:border-orange-500 focus:bg-white rounded-2xl text-sm transition-colors outline-none font-bold text-black placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3 bg-neutral-50 border-2 border-neutral-100 focus:border-orange-500 focus:bg-white rounded-2xl text-sm transition-colors outline-none font-bold text-black placeholder-stone-400"
                        />
                      </div>
                    </div>

                    {mode === 'login' && (
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={sendingReset}
                          className="text-[11px] font-black uppercase tracking-wider text-orange-600 hover:text-orange-700 hover:underline transition-all cursor-pointer"
                        >
                          {sendingReset ? 'Sending Reset Mail...' : 'Forgot/Reset Password?'}
                        </button>
                      </div>
                    )}

                    {resetFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 text-[11px] font-bold rounded-xl border leading-relaxed ${
                          resetFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {resetFeedback.text}
                      </motion.div>
                    )}

                    {/* Captcha challenge verification widget for Login Mode only */}
                    {mode === 'login' && (
                      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-rose-800 uppercase tracking-widest block">
                            Anti-Bot Verification
                          </label>
                          <button
                            type="button"
                            onClick={generateCaptcha}
                            className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 uppercase tracking-wider bg-white px-2 py-1 rounded-lg border border-orange-200"
                          >
                            <RefreshCw size={10} className="text-orange-500" />
                            <span>Reload</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Captcha box itself */}
                          <div className="h-11 w-32 bg-stone-900 rounded-xl relative overflow-hidden select-none flex items-center justify-center border border-stone-800 shadow-inner">
                            {/* Visual grid line deco */}
                            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%)] bg-[size:10px_10px]" />
                            <span 
                              className="text-stone-300 font-extrabold text-base tracking-widest select-none select-none select-none font-mono relative z-10 italic line-through decoration-orange-500/70 select-none cursor-default"
                              style={{ transform: 'rotate(-4deg)', letterSpacing: '4px' }}
                            >
                              {captchaCode}
                            </span>
                          </div>

                          <div className="flex-1">
                            <input
                              type="text"
                              required
                              placeholder="Solve CAPTCHA code"
                              value={captchaInput}
                              onChange={(e) => setCaptchaInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs font-black text-neutral-800 placeholder-stone-400 tracking-wider uppercase text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-[0.99] mt-6"
                      id="submit-auth-btn"
                    >
                      <LogIn size={18} />
                      <span>{loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}</span>
                    </button>
                  </form>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <button
                      onClick={handleGoBack}
                      className="text-neutral-500 hover:text-orange-600 font-bold transition-colors"
                    >
                      ← Back to roles
                    </button>

                    {role !== 'admin' && (
                      <button
                        onClick={() => {
                          setMode(mode === 'login' ? 'signup' : 'login');
                          setError('');
                        }}
                        className="text-orange-600 hover:text-orange-700 font-extrabold transition-colors"
                        id="toggle-auth-mode-btn"
                      >
                        {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN 4: EMAIL VERIFICATION SENT */}
              {screen === 'verification-sent' && (
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 animate-pulse">
                    <Mail size={32} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-black text-neutral-800">Verify your email address</h4>
                    <p className="text-neutral-600 text-sm leading-relaxed px-2">
                      We have sent you a verification email to {registeredEmail} please verify it & log in
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScreen('auth-form');
                      setMode('login');
                      resetFormState();
                    }}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-2xl transition-all shadow-md active:scale-[0.99]"
                    id="verification-login-btn"
                  >
                    Go Log In
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
