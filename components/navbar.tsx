'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Ticket, Wallet, LayoutDashboard, Menu, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email === 'admin@example.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  let links = [
    { href: '/', label: 'Home' },
    { href: '/game', label: 'Games', icon: <Ticket className="w-4 h-4 mr-2" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4 mr-2" /> },
  ];

  if (isAdmin) {
    links.push({ href: '/admin', label: 'Admin', icon: <ShieldAlert className="w-4 h-4 mr-2" /> });
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B1220]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F9CFF] to-indigo-600 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(79,156,255,0.4)] group-hover:scale-105 transition-transform border border-white/20">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Scratch<span className="text-[#4F9CFF]">Win</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all duration-300 ${
                  pathname === link.href
                    ? 'bg-[#4F9CFF]/10 text-white border-b-2 border-[#4F9CFF]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
               <button 
                onClick={() => auth.signOut()}
                className="text-sm font-bold bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white px-6 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
               >
                 Logout
               </button>
            ) : (
              <Link href="/auth" className="text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2 rounded-full shadow-lg transition-all flex items-center gap-2">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-800 bg-slate-900"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium flex items-center ${
                    pathname === link.href
                      ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                       auth.signOut();
                       setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-center rounded-xl font-medium bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-lg"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-center rounded-xl font-medium bg-indigo-600 text-white shadow-lg"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
