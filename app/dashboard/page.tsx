'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

import {
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
  increment
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
  const router = useRouter();

  const [balance, setBalance] = useState(1000);

  const [quantities, setQuantities] = useState<Record<string, number>>({
    rs10: 0,
    rs20: 0,
    rs50: 0,
    rs100: 0
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

  const cardTypes = useMemo(
    () => [
      {
        id: 'rs10',
        name: 'Bronze',
        price: 10,
        tier: 'BRONZE',
        color: 'text-amber-600',
        bg: 'bg-[#1e1511]/80',
        border: 'border-amber-700/30',
        hover:
          'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)]',
        shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        icon: '🥉'
      },
      {
        id: 'rs20',
        name: 'Silver',
        price: 20,
        tier: 'SILVER',
        color: 'text-slate-300',
        bg: 'bg-[#181e29]/80',
        border: 'border-slate-500/30',
        hover:
          'hover:border-slate-300/80 hover:shadow-[0_0_30px_rgba(203,213,225,0.2)]',
        shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        icon: '🥈'
      },
      {
        id: 'rs50',
        name: 'Gold',
        price: 50,
        tier: 'GOLD',
        color: 'text-[#F5C542]',
        bg: 'bg-[#1f1b0d]/80',
        border: 'border-[#F5C542]/30',
        hover:
          'hover:border-[#F5C542]/80 hover:shadow-[0_0_30px_rgba(245,197,66,0.3)]',
        shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        icon: '🥇'
      },
      {
        id: 'rs100',
        name: 'Platinum',
        price: 100,
        tier: 'PLATINUM',
        color: 'text-cyan-300',
        bg: 'bg-[#0f1f2e]/80',
        border: 'border-cyan-500/30',
        hover:
          'hover:border-cyan-300/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
        shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        icon: '💎'
      },
      {
        id: 'free',
        name: 'Free Card',
        price: 0,
        tier: 'FREE',
        color: 'text-emerald-400',
        bg: 'bg-[#102a1c]/80',
        border: 'border-emerald-500/30',
        hover:
          'hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]',
        shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        icon: '🎁'
      }
    ],
    []
  );

  useEffect(() => {
    const storedBalance = localStorage.getItem('demo_balance');

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }

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

    const cards = [
      { id: 'rs10', name: 'Bronze' },
      { id: 'rs20', name: 'Silver' },
      { id: 'rs50', name: 'Gold' },
      { id: 'rs100', name: 'Platinum' },
      { id: 'free', name: 'Free Card' }
    ];

    const loadedCards = cards
      .map((ct) => {
        const q = Number(localStorage.getItem('demo_card_' + ct.id) || 0);

        if (q > 0) {
          return {
            type: ct.name,
            id: ct.id,
            quantity: q
          };
        }

        return null;
      })
      .filter(Boolean) as {
      type: string;
      id: string;
      quantity: number;
    }[];

    setMyCards(loadedCards);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));

        if (userSnap.exists()) {
          const data = userSnap.data();

          setUserName(
            data.name || user.email?.split('@')[0] || 'Player'
          );

          setRefEarnings(data.referralEarnings || 0);

          setRefCount(
            data.referralEarnings
              ? Math.floor(data.referralEarnings / 10)
              : 0
          );
        } else {
          setUserName(user.email?.split('@')[0] || 'Player');
        }
      } catch (err) {
        console.error(err);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const checkTimer = () => {
      const lastClaim = localStorage.getItem('demo_free_claim_date');

      const customAdminHours = Number(
        localStorage.getItem('admin_free_card_timer') || '24'
      );

      if (!lastClaim) {
        setFreeTimeLeft(0);
        return;
      }

      const timePassed = Date.now() - parseInt(lastClaim);

      const cooldownMs = customAdminHours * 60 * 60 * 1000;

      if (timePassed < cooldownMs) {
        setFreeTimeLeft(cooldownMs - timePassed);
      } else {
        setFreeTimeLeft(0);
      }
    };

    checkTimer();

    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setSuccessMessage('');

    setQuantities((prev) => {
      const current = prev[id] || 0;

      const next = current + delta;

      if (next >= 0 && next <= 5) {
        return {
          ...prev,
          [id]: next
        };
      }

      return prev;
    });
  }, []);

  const handleDepositSubmit = async () => {
    const amt = Number(depositAmount);

    if (!amt || isNaN(amt) || amt <= 0) return;

    if (amt < 100) {
      alert('Minimum deposit amount is Rs 100');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to deposit.');
        return;
      }

      await addDoc(collection(db, 'deposits'), {
        uid: user.uid,
        amount: amt,
        paymentMethod: paymentMethod || 'Not specified',
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSuccessMessage('Deposit request submitted');

      setShowAddFunds(false);

      setDepositAmount('');
      setPaymentMethod('');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Error submitting deposit request.');
    }
  };

  const handleBuySingleCard = async (id: string) => {
    const qty = quantities[id];

    if (qty === 0) return;

    const card = cardTypes.find((c) => c.id === id);

    if (!card) return;

    const cost = card.price * qty;

    if (balance < cost) {
      alert('Insufficient balance!');
      return;
    }

    const newBalance = balance - cost;

    setBalance(newBalance);

    localStorage.setItem('demo_balance', newBalance.toString());

    let updatedCards = [...myCards];

    const existingIndex = updatedCards.findIndex((x) => x.id === id);

    let newQty = qty;

    if (existingIndex >= 0) {
      updatedCards[existingIndex].quantity += qty;
      newQty = updatedCards[existingIndex].quantity;
    } else {
      updatedCards.push({
        type: card.name,
        id: card.id,
        quantity: qty
      });
    }

    const assignedRewards = JSON.parse(
      localStorage.getItem('demo_assigned_rewards_' + id) || '[]'
    );

    let currentTotalReward = 0;

    try {
      const user = auth.currentUser;

      if (user && card.price > 0) {
        const poolRef = doc(
          db,
          'scratchPools',
          card.price.toString()
        );

        for (let i = 0; i < qty; i++) {
          let rewardVal = 0;

          await runTransaction(db, async (transaction) => {
            const poolSnap = await transaction.get(poolRef);

            if (poolSnap.exists()) {
              const data = poolSnap.data();

              const rewards = data.rewards || [];

              if (rewards.length > 0) {
                const randomIdx = Math.floor(
                  Math.random() * rewards.length
                );

                rewardVal = rewards[randomIdx];

                const newRewards = [...rewards];

                newRewards.splice(randomIdx, 1);

                transaction.update(poolRef, {
                  rewards: newRewards
                });
              }
            }
          });

          assignedRewards.push(rewardVal);

          currentTotalReward += rewardVal;

          await addDoc(collection(db, 'transactions'), {
            uid: user.uid,
            price: card.price,
            reward: rewardVal,
            createdAt: new Date().toISOString()
          });
        }

        if (currentTotalReward > 0) {
          await updateDoc(doc(db, 'users', user.uid), {
            balance: increment(currentTotalReward)
          });
        }
      } else if (card.price === 0) {
        for (let i = 0; i < qty; i++) {
          assignedRewards.push(0);
        }
      }
    } catch (e) {
      console.error(e);

      for (let i = 0; i < qty; i++) {
        assignedRewards.push(0);
      }
    }

    localStorage.setItem(
      'demo_assigned_rewards_' + id,
      JSON.stringify(assignedRewards)
    );

    localStorage.setItem('demo_card_' + id, newQty.toString());

    setMyCards(updatedCards);

    setQuantities((prev) => ({
      ...prev,
      [id]: 0
    }));

    setIsTransitioning(true);

    setTimeout(() => {
      router.push('/game');
    }, 800);
  };

  const claimFreeCard = () => {
    localStorage.setItem(
      'demo_free_claim_date',
      Date.now().toString()
    );

    const currentFree = parseInt(
      localStorage.getItem('demo_card_free') || '0'
    );

    localStorage.setItem(
      'demo_card_free',
      (currentFree + 1).toString()
    );

    const updatedCards = [...myCards];

    const existingIndex = updatedCards.findIndex(
      (x) => x.id === 'free'
    );

    if (existingIndex >= 0) {
      updatedCards[existingIndex].quantity += 1;
    } else {
      updatedCards.push({
        type: 'Free Card',
        id: 'free',
        quantity: 1
      });
    }

    setMyCards(updatedCards);

    setSuccessMessage('Claim successful! Added 1 Free Card.');

    const customAdminHours = Number(
      localStorage.getItem('admin_free_card_timer') || '24'
    );

    setFreeTimeLeft(customAdminHours * 60 * 60 * 1000);

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refLink);

    setSuccessMessage('Referral link copied to clipboard!');

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const processShareReward = () => {
    const nextCount = shareCountToday + 1;

    setShareCountToday(nextCount);

    localStorage.setItem(
      'demo_share_count_today',
      nextCount.toString()
    );

    const newBalance = balance + 1;

    setBalance(newBalance);

    localStorage.setItem(
      'demo_balance',
      newBalance.toString()
    );

    setSuccessMessage(
      `Shared successfully! Rs 1 added to balance. (${nextCount}/5 today)`
    );

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleShareEarn = () => {
    if (shareCountToday >= 5) {
      alert(
        'You have reached the daily sharing limit of 5. Come back tomorrow!'
      );

      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this Scratch Card Game',
          text: 'Join me and win prizes!',
          url: refLink
        })
        .then(() => {
          processShareReward();
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      navigator.clipboard.writeText(refLink);

      setSuccessMessage(
        'Link copied to clipboard (Native share not supported).'
      );

      processShareReward();
    }
  };

  const simulateReferralDeposit = () => {
    const newCount = refCount + 1;

    const newEarnings = refEarnings + 5;

    const newBalance = balance + 5;

    setRefCount(newCount);

    setRefEarnings(newEarnings);

    setBalance(newBalance);

    localStorage.setItem(
      'demo_ref_count',
      newCount.toString()
    );

    localStorage.setItem(
      'demo_ref_earnings',
      newEarnings.toString()
    );

    localStorage.setItem(
      'demo_balance',
      newBalance.toString()
    );

    setSuccessMessage(
      'Demo: A referred user deposited! You earned Rs 5.'
    );

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return `${hours
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const totalCardsCount = useMemo(() => {
    return myCards.reduce(
      (sum, card) => sum + card.quantity,
      0
    );
  }, [myCards]);

  const stats = useMemo(
    () => [
      {
        title: 'Total Balance',
        value: `Rs ${balance}`,
        icon: <DollarSign className="w-5 h-5" />,
        col: 'from-emerald-500 to-teal-500'
      },
      {
        title: 'Cards Available',
        value: totalCardsCount.toString(),
        icon: <Ticket className="w-5 h-5" />,
        col: 'from-blue-500 to-indigo-500'
      }
    ],
    [balance, totalCardsCount]
  );

  const recentGames = [
    {
      id: 1,
      name: 'Gold',
      result: 'Won',
      amount: '+Rs 500',
      date: '2 hrs ago',
      status: 'emerald'
    },
    {
      id: 2,
      name: 'Silver',
      result: 'Lost',
      amount: '-Rs 20',
      date: '5 hrs ago',
      status: 'rose'
    }
  ];

  if (authLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F9CFF] opacity-50" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 mt-4 relative z-10">
      {/* SAME UI — NO CHANGES */}
    </div>
  );
}
