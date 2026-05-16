'use client';

import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const router = useRouter();

  const [balance, setBalance] = useState(1000);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    rs10: 0,
    rs20: 0,
    rs50: 0,
    rs100: 0
  });

  const [myCards, setMyCards] = useState<{ type: string; id: string; quantity: number }[]>([]);
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

  // ================= FIREBASE + INIT =================
  useEffect(() => {
    const init = async () => {
      const storedBalance = localStorage.getItem('demo_balance');
      if (storedBalance) setBalance(Number(storedBalance));

      const { auth, db } = await import('@/lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');

      onAuthStateChanged(auth, async (user) => {
        if (!user) {
  setAuthLoading(false);
  router.push('/auth');
  return;
}

        setUserEmail(user.email || '');
        const rCode = user.uid;

        setRefCode(rCode);
        setRefLink(`${window.location.origin}/auth?ref=${rCode}`);

        const snap = await getDoc(doc(db, 'users', user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || user.email?.split('@')[0]);
          setRefEarnings(data.referralEarnings || 0);
          setRefCount(Math.floor((data.referralEarnings || 0) / 10));
        } else {
          setUserName(user.email?.split('@')[0] || '');
        }

        setAuthLoading(false);
      });

      // share logic
      const lastShareDate = localStorage.getItem('demo_share_date');
      const today = new Date().toDateString();

      if (lastShareDate !== today) {
        localStorage.setItem('demo_share_date', today);
        localStorage.setItem('demo_share_count_today', '0');
        setShareCountToday(0);
      } else {
        setShareCountToday(Number(localStorage.getItem('demo_share_count_today') || 0));
      }

      // cards load
      const list = ['rs10', 'rs20', 'rs50', 'rs100', 'free'];
      const loaded: any[] = [];

      list.forEach((id) => {
        const q = localStorage.getItem('demo_card_' + id);
        if (q && Number(q) > 0) {
          loaded.push({ id, type: id, quantity: Number(q) });
        }
      });

      setMyCards(loaded);

      const checkTimer = () => {
        const last = localStorage.getItem('demo_free_claim_date');
        const hours = Number(localStorage.getItem('admin_free_card_timer') || '24');

        if (!last) return setFreeTimeLeft(0);

        const diff = Date.now() - Number(last);
        const cooldown = hours * 3600 * 1000;

        setFreeTimeLeft(diff < cooldown ? cooldown - diff : 0);
      };

      checkTimer();
      const interval = setInterval(checkTimer, 1000);

      return () => clearInterval(interval);
    };

    init();
  }, [router]);

  // ================= RENDER SAFE =================
  if (authLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="text-white p-6">
      <h1>Dashboard Loaded Successfully</h1>
      <p>User: {userName}</p>
      <p>Email: {userEmail}</p>
      <p>Balance: {balance}</p>
    </div>
  );
}
