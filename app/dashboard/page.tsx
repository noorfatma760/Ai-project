'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trophy,
  Ticket,
  DollarSign,
  History,
  Plus,
  Minus,
  ShoppingCart,
  Play,
  Loader2,
  Gift,
  X,
  Share2,
  Copy,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  runTransaction,
  updateDoc,
  increment
} from 'firebase/firestore';

/* ---------------- STATIC DATA (OUTSIDE COMPONENT = FAST) ---------------- */

const cardTypes = [
  { id: 'rs10', name: 'Bronze', price: 10, tier: 'BRONZE', color: 'text-amber-600', bg: 'bg-[#1e1511]/80', border: 'border-amber-700/30', hover: 'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥉' },
  { id: 'rs20', name: 'Silver', price: 20, tier: 'SILVER', color: 'text-slate-300', bg: 'bg-[#181e29]/80', border: 'border-slate-500/30', hover: 'hover:border-slate-300/80 hover:shadow-[0_0_30px_rgba(203,213,225,0.2)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥈' },
  { id: 'rs50', name: 'Gold', price: 50, tier: 'GOLD', color: 'text-[#F5C542]', bg: 'bg-[#1f1b0d]/80', border: 'border-[#F5C542]/30', hover: 'hover:border-[#F5C542]/80 hover:shadow-[0_0_30px_rgba(245,197,66,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥇' },
  { id: 'rs100', name: 'Platinum', price: 100, tier: 'PLATINUM', color: 'text-cyan-300', bg: 'bg-[#0f1f2e]/80', border: 'border-cyan-500/30', hover: 'hover:border-cyan-300/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '💎' },
  { id: 'free', name: 'Free Card', price: 0, tier: 'FREE', color: 'text-emerald-400', bg: 'bg-[#102a1c]/80', border: 'border-emerald-500/30', hover: 'hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🎁' }
];

const recentGames = [
  { id: 1, name: "Gold", result: "Won", amount: "+Rs 500", date: "2 hrs ago", status: "emerald" },
  { id: 2, name: "Silver", result: "Lost", amount: "-Rs 20", date: "5 hrs ago", status: "rose" },
];

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  const router = useRouter();

  const [balance, setBalance] = useState(1000);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [myCards, setMyCards] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [freeTimeLeft, setFreeTimeLeft] = useState(0);

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const [refCode, setRefCode] = useState('');
  const [refLink, setRefLink] = useState('');
  const [refCount, setRefCount] = useState(0);
  const [refEarnings, setRefEarnings] = useState(0);
  const [shareCountToday, setShareCountToday] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  /* ---------------- MEMO ---------------- */

  const stats = useMemo(() => [
    { title: "Total Balance", value: `Rs ${balance}`, icon: <DollarSign className="w-5 h-5" />, col: "from-emerald-500 to-teal-500" },
    { title: "Cards Available", value: myCards.reduce((s, c) => s + c.quantity, 0).toString(), icon: <Ticket className="w-5 h-5" />, col: "from-blue-500 to-indigo-500" },
  ], [balance, myCards]);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    const storedBalance = localStorage.getItem('demo_balance');
    if (storedBalance) setBalance(Number(storedBalance));

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/auth');

      setUserEmail(user.email || '');
      setUserName(user.email?.split('@')[0] || '');
      setRefCode(user.uid);

      const link = `${window.location.origin}/auth?ref=${user.uid}`;
      setRefLink(link);

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setRefEarnings(snap.data().referralEarnings || 0);
      }

      setAuthLoading(false);
    });

    return () => unsub();
  }, [router]);

  /* ---------------- TIMER (OPTIMIZED) ---------------- */

  useEffect(() => {
    const checkTimer = () => {
      const lastClaim = localStorage.getItem('demo_free_claim_date');
      const hours = Number(localStorage.getItem('admin_free_card_timer') || '24');

      if (!lastClaim) return setFreeTimeLeft(0);

      const diff = Date.now() - Number(lastClaim);
      const cooldown = hours * 3600 * 1000;

      setFreeTimeLeft(diff < cooldown ? cooldown - diff : 0);
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- ACTIONS (STABLE) ---------------- */

  const updateQuantity = useCallback((id: string, delta: number) => {
    setQuantities(prev => {
      const next = (prev[id] || 0) + delta;
      if (next < 0 || next > 5) return prev;
      return { ...prev, [id]: next };
    });
  }, []);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(refLink);
    setSuccessMessage('Copied!');
  }, [refLink]);

  const handleShareEarn = useCallback(() => {
    if (shareCountToday >= 5) return alert("Limit reached");

    navigator.share?.({ url: refLink }) || navigator.clipboard.writeText(refLink);

    const next = shareCountToday + 1;
    setShareCountToday(next);
    localStorage.setItem('demo_share_count_today', String(next));
  }, [refLink, shareCountToday]);

  /* ---------------- UI ---------------- */

  if (authLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F9CFF]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">

      {isTransitioning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Loader2 className="w-10 h-10 animate-spin text-[#4F9CFF]" />
        </div>
      )}

      <h1 className="text-3xl font-black text-white">
        Welcome {userName}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-6 rounded-xl bg-[#1A1B3A]/40 border border-white/10">
            {s.title} <br />
            <span className="text-white text-xl">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {cardTypes.map(card => (
          <div key={card.id} className="p-4 rounded-xl border border-white/10">
            <h3 className="text-white">{card.name}</h3>

            {card.id !== 'free' ? (
              <>
                <div className="flex gap-2">
                  <button onClick={() => updateQuantity(card.id, -1)}>-</button>
                  <span>{quantities[card.id] || 0}</span>
                  <button onClick={() => updateQuantity(card.id, 1)}>+</button>
                </div>
              </>
            ) : (
              <div>
                {freeTimeLeft ? formatTime(freeTimeLeft) : "READY"}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
