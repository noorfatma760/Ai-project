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
  Users,
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
    rs100: 0,
  });

  const [myCards, setMyCards] = useState<
    { type: string; id: string; quantity: number }[]
  >([]);

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

  // -------------------------
  // INIT (OPTIMIZED)
  // -------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      const storedBalance = localStorage.getItem('demo_balance');
      if (storedBalance) setBalance(Number(storedBalance));

      const lastShareDate = localStorage.getItem('demo_share_date');
      const today = new Date().toDateString();

      if (lastShareDate !== today) {
        localStorage.setItem('demo_share_date', today);
        localStorage.setItem('demo_share_count_today', '0');
        setShareCountToday(0);
      } else {
        setShareCountToday(
          Number(localStorage.getItem('demo_share_count_today') || 0)
        );
      }

      const [{ auth }, { onAuthStateChanged }, { db }, { doc, getDoc }] =
        await Promise.all([
          import('@/lib/firebase'),
          import('firebase/auth'),
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ]);

      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/auth');
          return;
        }

        setUserEmail(user.email || '');

        const rCode = user.uid;
        setRefCode(rCode);

        setRefLink(
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth?ref=${rCode}`
            : ''
        );

        const snap = await getDoc(doc(db, 'users', user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || user.email?.split('@')[0]);
          setRefEarnings(data.referralEarnings || 0);
          setRefCount(
            data.referralEarnings
              ? Math.floor(data.referralEarnings / 10)
              : 0
          );
        } else {
          setUserName(user.email?.split('@')[0] || '');
        }

        setAuthLoading(false);
      });

      const cardTypesList = [
        { id: 'rs10', name: 'Bronze' },
        { id: 'rs20', name: 'Silver' },
        { id: 'rs50', name: 'Gold' },
        { id: 'rs100', name: 'Platinum' },
        { id: 'free', name: 'Free Card' },
      ];

      const loadedCards: { type: string; id: string; quantity: number }[] = [];

      for (const ct of cardTypesList) {
        const q = localStorage.getItem('demo_card_' + ct.id);
        if (q && Number(q) > 0) {
          loadedCards.push({
            type: ct.name,
            id: ct.id,
            quantity: Number(q),
          });
        }
      }

      setMyCards(loadedCards);

      const checkTimer = () => {
        const lastClaim = localStorage.getItem('demo_free_claim_date');
        const hours = Number(
          localStorage.getItem('admin_free_card_timer') || '24'
        );

        if (!lastClaim) {
          setFreeTimeLeft(0);
          return;
        }

        const diff = Date.now() - Number(lastClaim);
        const cooldown = hours * 60 * 60 * 1000;

        setFreeTimeLeft(Math.max(0, cooldown - diff));
      };

      checkTimer();
      interval = setInterval(checkTimer, 1000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  // -------------------------
  // LOADING SCREEN
  // -------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  // -------------------------
  // MAIN UI (unchanged concept)
  // -------------------------
  return (
    <div className="text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold">
        Welcome {userName || 'Player'}
      </h1>

      <p className="text-sm text-gray-400">{userEmail}</p>

      <div className="mt-6">
        <p>Balance: Rs {balance}</p>
        <p>Cards: {myCards.length}</p>
      </div>

      <button
        onClick={() => router.push('/game')}
        className="mt-6 px-4 py-2 bg-blue-600 rounded"
      >
        Play
      </button>
    </div>
  );
}
