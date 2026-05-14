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

  const cardTypes = [
    { id: 'rs10', name: 'Bronze', price: 10, tier: 'BRONZE', icon: '🥉' },
    { id: 'rs20', name: 'Silver', price: 20, tier: 'SILVER', icon: '🥈' },
    { id: 'rs50', name: 'Gold', price: 50, tier: 'GOLD', icon: '🥇' },
    { id: 'rs100', name: 'Platinum', price: 100, tier: 'PLATINUM', icon: '💎' },
    { id: 'free', name: 'Free Card', price: 0, tier: 'FREE', icon: '🎁' }
  ];

  useEffect(() => {
    const storedBalance = localStorage.getItem('demo_balance');
    if (storedBalance) setBalance(Number(storedBalance));

    import('@/lib/firebase').then(({ auth, db }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            router.push('/auth');
            return;
          }

          setUserEmail(user.email || '');
          setUserName(user.email?.split('@')[0] || '');

          const rCode = user.uid;
          setRefCode(rCode);
          setRefLink(`${window.location.origin}/auth?ref=${rCode}`);

          setAuthLoading(false);
        });
      });
    });

    const cardTypesList = [
      { id: 'rs10', name: 'Bronze' },
      { id: 'rs20', name: 'Silver' },
      { id: 'rs50', name: 'Gold' },
      { id: 'rs100', name: 'Platinum' },
      { id: 'free', name: 'Free Card' }
    ];

    const loadedCards: any[] = [];

    cardTypesList.forEach((ct) => {
      const q = localStorage.getItem('demo_card_' + ct.id);
      if (q && Number(q) > 0) {
        loadedCards.push({
          type: ct.name,
          id: ct.id,
          quantity: Number(q)
        });
      }
    });

    setMyCards(loadedCards);

    const checkTimer = () => {
      const lastClaim = localStorage.getItem('demo_free_claim_date');
      const hours = Number(localStorage.getItem('admin_free_card_timer') || '24');

      if (lastClaim) {
        const diff = Date.now() - Number(lastClaim);
        const limit = hours * 60 * 60 * 1000;

        setFreeTimeLeft(diff < limit ? limit - diff : 0);
      } else {
        setFreeTimeLeft(0);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next < 0 || next > 5) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleBuySingleCard = (id: string) => {
    const qty = quantities[id];
    if (!qty) return;

    const card = cardTypes.find((c) => c.id === id);
    if (!card) return;

    const cost = card.price * qty;
    if (balance < cost) return alert('Insufficient balance');

    const newBalance = balance - cost;
    setBalance(newBalance);
    localStorage.setItem('demo_balance', String(newBalance));

    const updated = [...myCards];
    const index = updated.findIndex((x) => x.id === id);

    if (index >= 0) updated[index].quantity += qty;
    else updated.push({ type: card.name, id: card.id, quantity: qty });

    setMyCards(updated);
    setQuantities((p) => ({ ...p, [id]: 0 }));

    setIsTransitioning(true);
    setTimeout(() => router.push('/game'), 800);
  };

  const claimFreeCard = () => {
    localStorage.setItem('demo_free_claim_date', String(Date.now()));

    setSuccessMessage('Free card claimed!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const totalCards = myCards.reduce((a, b) => a + b.quantity, 0);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">
        Welcome {userName}
      </h1>

      <p>Balance: Rs {balance}</p>
      <p>Total Cards: {totalCards}</p>

      <div className="grid gap-4 mt-6">
        {cardTypes.map((card) => (
          <div key={card.id} className="p-4 border rounded">
            <h2>{card.name}</h2>
            <p>Price: {card.price}</p>

            {card.price > 0 && (
              <>
                <button onClick={() => updateQuantity(card.id, -1)}>-</button>
                <span>{quantities[card.id] || 0}</span>
                <button onClick={() => updateQuantity(card.id, 1)}>+</button>

                <button onClick={() => handleBuySingleCard(card.id)}>
                  Buy
                </button>
              </>
            )}

            {card.price === 0 && (
              <button onClick={claimFreeCard}>Claim Free</button>
            )}
          </div>
        ))}
      </div>

      {successMessage && <p>{successMessage}</p>}
    </div>
  );
}
