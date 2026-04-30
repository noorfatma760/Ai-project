'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, AlertCircle, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is already logged in, they shouldn't see auth page, but wait, 
      // let's only redirect explicitly when they successfully log in to avoid flickering if needed.
      // But standard practice is to redirect on mount if logged in.
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (mode === 'register') {
      if (!name) {
        setError('Name is required');
        return;
      }
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        let referredBy = null;
        if (typeof window !== 'undefined') {
           const searchParams = new URLSearchParams(window.location.search);
           referredBy = searchParams.get('ref');
        }

        // Save user to Firestore
        const newUserDoc: any = {
           name: name,
           email: email,
           createdAt: new Date().toISOString()
        };
        
        if (referredBy) {
           newUserDoc.referredBy = referredBy;
        }

        await setDoc(doc(db, 'users', user.uid), newUserDoc);
        
        if (referredBy) {
           // Add referral earnings to the referrer
           try {
             const { updateDoc, increment, collection, addDoc } = await import('firebase/firestore');
             await updateDoc(doc(db, 'users', referredBy), {
                referralEarnings: increment(10),
                balance: increment(10)
             });
             await addDoc(collection(db, 'transactions'), {
                uid: referredBy,
                type: 'referral',
                amount: 10,
                createdAt: new Date().toISOString()
             });
           } catch(e) {
             console.error('Error updating referrer', e);
           }
        }

        // Redirect to dashboard is handled by onAuthStateChanged, or we can push directly
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'An error occurred during registration.');
        setIsLoading(false);
      }
      
    } else {
      if (!password) {
        setError('Password is required');
        return;
      }
      
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } catch (err: any) {
        setError('Invalid email or password.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-8rem)] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F9CFF]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1A1B3A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(79,156,255,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 filter drop-shadow-md">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[#4F9CFF] opacity-80 text-sm font-medium">
              {mode === 'login' ? 'Login to continue playing' : 'Join to start winning'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5" 
              onSubmit={handleGo}
            >
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F9CFF]" />
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      className="w-full bg-[#0B1220]/60 border border-white/10 focus:border-[#4F9CFF] focus:ring-1 focus:ring-[#4F9CFF] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F9CFF]" />
                  <input 
                    type="email" 
                    placeholder="user@example.com" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full bg-[#0B1220]/60 border border-white/10 focus:border-[#4F9CFF] focus:ring-1 focus:ring-[#4F9CFF] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F9CFF]" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full bg-[#0B1220]/60 border border-white/10 focus:border-[#4F9CFF] focus:ring-1 focus:ring-[#4F9CFF] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Re-enter Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F9CFF]" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      className="w-full bg-[#0B1220]/60 border border-white/10 focus:border-[#4F9CFF] focus:ring-1 focus:ring-[#4F9CFF] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              <button disabled={isLoading} type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] text-white rounded-xl font-black text-lg shadow-[0_0_20px_rgba(79,156,255,0.4)] transition-all flex items-center justify-center gap-2 group border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Processing...' : 'Go'}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="text-center mt-6">
                <button 
                  type="button"
                  onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                  }}
                  className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

