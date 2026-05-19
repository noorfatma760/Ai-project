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
  let unsub: any;
  let interval: any;

  const init = async () => {
    try {
      const { auth, db } = await import('../../lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');

      unsub = onAuthStateChanged(auth, async (user) => {
        try {
          if (!user) {
            setAuthLoading(false);
            router.push('/auth');
            return;
          }

          setUserEmail(user.email || '');
          setUserName(user.email?.split('@')[0] || '');

          const origin =
            typeof window !== "undefined" ? window.location.origin : "";

          setRefCode(user.uid);
          setRefLink(`${origin}/auth?ref=${user.uid}`);

          const snap = await getDoc(doc(db, 'users', user.uid));

          if (snap.exists()) {
            const data = snap.data();
            setUserName(data.name || user.email?.split('@')[0]);
            setRefEarnings(data.referralEarnings || 0);
            setRefCount(Math.floor((data.referralEarnings || 0) / 10));
          }

        } catch (error) {
          console.log("Auth error:", error);
        }

        setAuthLoading(false);
      });

      const checkTimer = () => {
        const last = localStorage.getItem('demo_free_claim_date');
        const hours = Number(localStorage.getItem('admin_free_card_timer') || '24');

        if (!last) return setFreeTimeLeft(0);

        const diff = Date.now() - Number(last);
        const cooldown = hours * 3600 * 1000;

        setFreeTimeLeft(diff < cooldown ? cooldown - diff : 0);
      };

      checkTimer();
      interval = setInterval(checkTimer, 1000);

    } catch (error) {
      console.log(error);
      setAuthLoading(false);
    }
  };

  init();

  return () => {
    if (unsub) unsub();
    if (interval) clearInterval(interval);
  };
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
