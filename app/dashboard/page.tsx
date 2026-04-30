'use client';

import { useState, useEffect } from 'react';
import { Trophy, Ticket, DollarSign, History, Plus, Minus, ShoppingCart, Play, Loader2, Gift, X, Share2, Copy, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [balance, setBalance] = useState(1000);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    rs10: 0, rs20: 0, rs50: 0, rs100: 0
  });
  
  const [myCards, setMyCards] = useState<{type: string, id: string, quantity: number}[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [freeTimeLeft, setFreeTimeLeft] = useState(0);

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Referral and Share variables
  const [refCode, setRefCode] = useState('');
  const [refLink, setRefLink] = useState('');
  const [refCount, setRefCount] = useState(0);
  const [refEarnings, setRefEarnings] = useState(0);
  const [shareCountToday, setShareCountToday] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleDepositSubmit = async () => {
    const amt = Number(depositAmount);
    if (!amt || isNaN(amt) || amt <= 0) return;
    
    if (amt < 100) {
       alert("Minimum deposit amount is Rs 100");
       return;
    }
    
    try {
      const { auth, db } = await import('@/lib/firebase');
      const { addDoc, collection } = await import('firebase/firestore');
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to deposit.");
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
      console.error("Error submitting deposit: ", e);
      alert("Error submitting deposit request.");
    }
  };

  useEffect(() => {
    const storedBalance = localStorage.getItem('demo_balance');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedBalance) setBalance(Number(storedBalance));

    import('@/lib/firebase').then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserEmail(user.email || '');
            
            // Set dynamic ref code and link
            const rCode = user.uid;
            setRefCode(rCode);
            setRefLink(typeof window !== 'undefined' ? `${window.location.origin}/auth?ref=${rCode}` : `https://example.com/auth?ref=${rCode}`);
            
            import('firebase/firestore').then(({ doc, getDoc }) => {
              import('@/lib/firebase').then(({ db }) => {
                getDoc(doc(db, 'users', user.uid)).then(docSnap => {
                  if (docSnap.exists()) {
                    setUserName(docSnap.data().name || user.email?.split('@')[0]);
                    setRefEarnings(docSnap.data().referralEarnings || 0);
                    // fallback to 0 count or from local for demo
                    setRefCount(docSnap.data().referralEarnings ? Math.floor(docSnap.data().referralEarnings / 10) : 0);
                  } else {
                    setUserName(user.email?.split('@')[0] || '');
                  }
                  setAuthLoading(false);
                });
              });
            });
          } else {
            router.push('/auth');
          }
        });
      });
    });

    const lastShareDate = localStorage.getItem('demo_share_date');
    const today = new Date().toDateString();
    if (lastShareDate !== today) {
      localStorage.setItem('demo_share_date', today);
      localStorage.setItem('demo_share_count_today', '0');
      setShareCountToday(0);
    } else {
      setShareCountToday(Number(localStorage.getItem('demo_share_count_today') || 0));
    }

    const cardTypesList = [
      { id: 'rs10', name: 'Bronze' },
      { id: 'rs20', name: 'Silver' },
      { id: 'rs50', name: 'Gold' },
      { id: 'rs100', name: 'Platinum' },
      { id: 'free', name: 'Free Card' }
    ];
    
    let loadedCards: {type: string, id: string, quantity: number}[] = [];
    cardTypesList.forEach(ct => {
      const q = localStorage.getItem('demo_card_' + ct.id);
      if (q && Number(q) > 0) {
        loadedCards.push({ type: ct.name, id: ct.id, quantity: Number(q) });
      }
    });
    setMyCards(loadedCards);

    const checkTimer = () => {
      const lastClaim = localStorage.getItem('demo_free_claim_date');
      const customAdminHours = Number(localStorage.getItem('admin_free_card_timer') || '24');
      if (lastClaim) {
        const timePassed = Date.now() - parseInt(lastClaim);
        const cooldownMs = customAdminHours * 60 * 60 * 1000;
        if (timePassed < cooldownMs) {
          setFreeTimeLeft(cooldownMs - timePassed);
        } else {
          setFreeTimeLeft(0);
        }
      } else {
        setFreeTimeLeft(0);
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const cardTypes = [
    { id: 'rs10', name: 'Bronze', price: 10, tier: 'BRONZE', color: 'text-amber-600', bg: 'bg-[#1e1511]/80', border: 'border-amber-700/30', hover: 'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥉' },
    { id: 'rs20', name: 'Silver', price: 20, tier: 'SILVER', color: 'text-slate-300', bg: 'bg-[#181e29]/80', border: 'border-slate-500/30', hover: 'hover:border-slate-300/80 hover:shadow-[0_0_30px_rgba(203,213,225,0.2)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥈' },
    { id: 'rs50', name: 'Gold', price: 50, tier: 'GOLD', color: 'text-[#F5C542]', bg: 'bg-[#1f1b0d]/80', border: 'border-[#F5C542]/30', hover: 'hover:border-[#F5C542]/80 hover:shadow-[0_0_30px_rgba(245,197,66,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🥇' },
    { id: 'rs100', name: 'Platinum', price: 100, tier: 'PLATINUM', color: 'text-cyan-300', bg: 'bg-[#0f1f2e]/80', border: 'border-cyan-500/30', hover: 'hover:border-cyan-300/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '💎' },
    { id: 'free', name: 'Free Card', price: 0, tier: 'FREE', color: 'text-emerald-400', bg: 'bg-[#102a1c]/80', border: 'border-emerald-500/30', hover: 'hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]', shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', icon: '🎁' }
  ];

  const updateQuantity = (id: string, delta: number) => {
    setSuccessMessage('');
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next >= 0 && next <= 5) {
        return { ...prev, [id]: next };
      }
      return prev;
    });
  };

  const handleBuySingleCard = async (id: string) => {
    const qty = quantities[id];
    if (qty === 0) return;
    
    const card = cardTypes.find(c => c.id === id);
    if (!card) return;
    
    const cost = card.price * qty;
    
    if (balance < cost) {
      alert("Insufficient balance!");
      return;
    }

    const newBalance = balance - cost;
    setBalance(newBalance);
    localStorage.setItem('demo_balance', newBalance.toString());

    let updatedCards = [...myCards];
    const existingIndex = updatedCards.findIndex(x => x.id === id);
    let newQty = qty;
    
    if (existingIndex >= 0) {
      updatedCards[existingIndex].quantity += qty;
      newQty = updatedCards[existingIndex].quantity;
    } else {
      updatedCards.push({ type: card.name, id: card.id, quantity: qty });
    }
    
    const assignedRewards = JSON.parse(localStorage.getItem('demo_assigned_rewards_' + id) || '[]');
    let currentTotalReward = 0;
    try {
      const { auth, db } = await import('@/lib/firebase');
      const { doc, runTransaction, addDoc, collection, updateDoc, increment } = await import('firebase/firestore');
      const user = auth.currentUser;
      if (user && card.price > 0) {
        const poolRef = doc(db, 'scratchPools', card.price.toString());
        for (let i = 0; i < qty; i++) {
          let rewardVal = 0;
          await runTransaction(db, async (transaction) => {
            const poolSnap = await transaction.get(poolRef);
            if (poolSnap.exists()) {
               const data = poolSnap.data();
               const rewards = data.rewards || [];
               if (rewards.length > 0) {
                  const randomIdx = Math.floor(Math.random() * rewards.length);
                  rewardVal = rewards[randomIdx];
                  const newRewards = [...rewards];
                  newRewards.splice(randomIdx, 1);
                  transaction.update(poolRef, { rewards: newRewards });
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
           await updateDoc(doc(db, 'users', user.uid), { balance: increment(currentTotalReward) });
        }
      } else if (card.price === 0) {
        for (let i = 0; i < qty; i++) assignedRewards.push(0);
      }
    } catch (e) {
      console.error(e);
      for (let i = 0; i < qty; i++) assignedRewards.push(0);
    }
    localStorage.setItem('demo_assigned_rewards_' + id, JSON.stringify(assignedRewards));

    localStorage.setItem('demo_card_' + id, newQty.toString());
    
    setMyCards(updatedCards);
    setQuantities(prev => ({ ...prev, [id]: 0 }));
    
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/game');
    }, 800);
  };

  const claimFreeCard = () => {
    localStorage.setItem('demo_free_claim_date', Date.now().toString());
    const currentFree = parseInt(localStorage.getItem('demo_card_free') || '0');
    localStorage.setItem('demo_card_free', (currentFree + 1).toString());
    
    const updatedCards = [...myCards];
    const existingIndex = updatedCards.findIndex(x => x.id === 'free');
    if (existingIndex >= 0) {
      updatedCards[existingIndex].quantity += 1;
    } else {
      updatedCards.push({ type: 'Free Card', id: 'free', quantity: 1 });
    }
    setMyCards(updatedCards);
    setSuccessMessage(`Claim successful! Added 1 Free Card.`);
    
    const customAdminHours = Number(localStorage.getItem('admin_free_card_timer') || '24');
    setFreeTimeLeft(customAdminHours * 60 * 60 * 1000);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refLink);
    setSuccessMessage('Referral link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleShareEarn = () => {
    if (shareCountToday >= 5) {
      alert("You have reached the daily sharing limit of 5. Come back tomorrow!");
      return;
    }
    
    // Attempt native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out this Scratch Card Game',
        text: 'Join me and win prizes!',
        url: refLink,
      }).then(() => {
        processShareReward();
      }).catch((e) => {
        console.log('Share canceled or failed', e);
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(refLink);
      setSuccessMessage('Link copied to clipboard (Native share not supported).');
      processShareReward();
    }
  };

  const processShareReward = () => {
    const nextCount = shareCountToday + 1;
    setShareCountToday(nextCount);
    localStorage.setItem('demo_share_count_today', nextCount.toString());
    
    const newBalance = balance + 1;
    setBalance(newBalance);
    localStorage.setItem('demo_balance', newBalance.toString());
    
    setSuccessMessage(`Shared successfully! Rs 1 added to balance. (${nextCount}/5 today)`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const simulateReferralDeposit = () => {
    // Demo only: Simulate a user registering with the link and depositing
    const newCount = refCount + 1;
    const newEarnings = refEarnings + 5;
    const newBalance = balance + 5;

    setRefCount(newCount);
    setRefEarnings(newEarnings);
    setBalance(newBalance);
    
    localStorage.setItem('demo_ref_count', newCount.toString());
    localStorage.setItem('demo_ref_earnings', newEarnings.toString());
    localStorage.setItem('demo_balance', newBalance.toString());

    setSuccessMessage('Demo: A referred user deposited! You earned Rs 5.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalCardsCount = myCards.reduce((sum, card) => sum + card.quantity, 0);

  const stats = [
    { title: "Total Balance", value: `Rs ${balance}`, icon: <DollarSign className="w-5 h-5" />, col: "from-emerald-500 to-teal-500" },
    { title: "Cards Available", value: totalCardsCount.toString(), icon: <Ticket className="w-5 h-5" />, col: "from-blue-500 to-indigo-500" },
  ];

  const recentGames = [
    { id: 1, name: "Gold", result: "Won", amount: "+Rs 500", date: "2 hrs ago", status: "emerald" },
    { id: 2, name: "Silver", result: "Lost", amount: "-Rs 20", date: "5 hrs ago", status: "rose" },
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
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-[#0B1220]/80 backdrop-blur-sm flex flex-col items-center justify-center fade-in duration-300">
           <Loader2 className="w-12 h-12 text-[#4F9CFF] animate-spin mb-4" />
           <p className="text-xl font-bold text-white tracking-widest uppercase">Preparing Your Cards...</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black mt-2 text-white filter drop-shadow-md">Welcome back, {userName || 'Player'}</h1>
          {userEmail && <p className="text-white/60 text-sm mb-1">{userEmail}</p>}
          <p className="text-[#4F9CFF] opacity-80 text-sm font-medium">Manage your tickets and see your portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/history" className="px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20 text-sm">
            History
          </Link>
          <button 
            onClick={() => {
              import('@/lib/firebase').then(({ auth }) => {
                auth.signOut().then(() => router.push('/auth'));
              });
            }}
            className="px-6 py-3 bg-rose-600/20 text-rose-400 font-bold rounded-full hover:bg-rose-600/30 transition-all shadow-lg border border-rose-500/30 text-sm"
          >
            Logout
          </button>
          {totalCardsCount > 0 && (
            <Link href="/game" className="px-6 py-3 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 text-white font-black rounded-full hover:from-indigo-500 hover:to-[#4F9CFF] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(79,156,255,0.4)] border border-white/10 uppercase tracking-wide text-sm">
              <Play className="w-4 h-4" fill="currentColor" /> Play All Cards
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="relative bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden group shadow-xl flex items-center justify-between">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.col} opacity-10 rounded-full blur-2xl -mt-10 -mr-10 group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-[#0B1220]/50 rounded-xl border border-white/5 text-white">
                {stat.icon}
              </div>
              <div>
                {stat.title === "Total Balance" && userName && (
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">{userName}</p>
                )}
                <p className="text-[#4F9CFF] opacity-80 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
            {stat.title === "Total Balance" && (
              <button 
                onClick={() => setShowAddFunds(true)}
                className="relative z-10 px-4 py-2 bg-[#4F9CFF]/10 text-[#4F9CFF] hover:bg-[#4F9CFF] hover:text-white border border-[#4F9CFF]/30 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Funds
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store: Buy Scratch Cards */}
        <div className="lg:col-span-2 bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Select Scratch Cards</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
            {cardTypes.map(card => (
              <div key={card.id} className={`${card.bg} border ${card.border} ${card.hover} group transition-all duration-300 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg ${card.shadow} relative overflow-hidden backdrop-blur-sm`}>
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity ${card.color}`} />
                
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest ${card.color} bg-black/30 border border-current mb-3`}>
                  {card.tier}
                </span>
                
                <div className="text-4xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                
                <h3 className={`font-bold text-xl mb-1 text-white`}>{card.name}</h3>
                <p className="text-sm text-slate-300 opacity-80 mb-6 font-medium">Price: {card.price === 0 ? 'Free' : `Rs ${card.price}`}</p>
                
                {card.id === 'free' ? (
                  <div className="mt-auto flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-center w-full bg-[#0B1220]/60 rounded-xl p-3 h-12 border border-white/10 text-emerald-400 font-bold tracking-widest font-mono text-lg">
                      {freeTimeLeft > 0 ? formatTime(freeTimeLeft) : 'READY'}
                    </div>
                    <button 
                      onClick={claimFreeCard}
                      disabled={freeTimeLeft > 0}
                      className="w-full h-12 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 shadow-md"
                    >
                      <Gift className="w-4 h-4" /> Claim
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between w-full bg-[#0B1220]/60 rounded-xl p-1 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(card.id, -1)}
                        disabled={quantities[card.id] === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-white text-center flex-1">{quantities[card.id] || 0}</span>
                      <button 
                        onClick={() => updateQuantity(card.id, 1)}
                        disabled={quantities[card.id] >= 5}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleBuySingleCard(card.id)}
                      disabled={!quantities[card.id] || quantities[card.id] === 0 || balance < (card.price * quantities[card.id])}
                      className="w-full h-12 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4" /> Buy {(quantities[card.id] || 0) > 0 && `(Rs ${card.price * (quantities[card.id] || 0)})`}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

            {successMessage && (
              <div className="mt-6 pt-4 border-t border-emerald-500/20 text-center animate-in fade-in zoom-in duration-300">
                <p className="text-emerald-400 font-bold bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] inline-block">
                  {successMessage}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* My Cards */}
            <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Ticket className="w-5 h-5 text-[#F5C542]" /> My Cards
                </h2>
              {totalCardsCount > 0 && (
                <Link href="/game" className="px-3 py-1.5 bg-[#F5C542] hover:bg-yellow-500 rounded-md text-xs font-bold text-black transition-colors shadow-lg shadow-[#F5C542]/20">
                  Play All
                </Link>
              )}
            </div>
            
            <div className="space-y-3">
              {myCards.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border-t border-white/5 mt-2">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No cards purchased yet.</p>
                </div>
              ) : (
                myCards.map((card, idx) => {
                   const cInfo = cardTypes.find(c => c.id === card.id);
                   const tColor = cInfo ? cInfo.color : 'text-white';
                   return (
                    <div key={idx} className="flex justify-between items-center bg-[#0B1220]/50 border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                      <div className="flex flex-col">
                         <span className="font-bold text-white mb-0.5">{card.type}</span>
                         {cInfo && <span className={`text-[10px] font-black tracking-widest ${tColor} uppercase`}>{cInfo.tier}</span>}
                      </div>
                      <span className={`bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm font-black ${tColor}`}>
                        x{card.quantity}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-[#4F9CFF]" />
              <h2 className="text-xl font-bold text-white">Recent Plays</h2>
            </div>

            <div className="space-y-4">
              {recentGames.map((game) => (
                <div key={game.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-default bg-[#0B1220]/30">
                  <div>
                    <h4 className="font-bold text-sm text-white">{game.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{game.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm text-${game.status}-400 filter drop-shadow-md`}>{game.amount}</p>
                    <p className="text-[10px] tracking-wider uppercase font-bold text-slate-500">{game.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Invite & Earn */}
          <div className="bg-gradient-to-br from-[#1A1B3A]/80 to-[#11162A] border border-[#4F9CFF]/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(79,156,255,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F9CFF] opacity-10 rounded-full blur-2xl -mt-10 -mr-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Users className="w-5 h-5 text-[#4F9CFF]" />
              <h2 className="text-xl font-bold text-white">Invite & Earn</h2>
            </div>
            
            <div className="space-y-5 relative z-10">
               <div>
                  <p className="text-xs text-[#4F9CFF] font-bold uppercase tracking-wider mb-2">Your Referral Link</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                     <div className="bg-[#0B1220]/60 border border-[#4F9CFF]/30 rounded-xl px-4 py-3 flex items-center justify-between flex-1 overflow-hidden">
                       <span className="font-mono text-emerald-400 text-xs tracking-wide truncate mr-4">{refLink}</span>
                       <button onClick={handleCopyCode} className="text-slate-400 hover:text-[#4F9CFF] transition-colors shrink-0" title="Copy Referral Link">
                         <Copy className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                 <div className="text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Referrals</p>
                    <p className="text-2xl font-black text-white mt-1">{refCount}</p>
                 </div>
                 <div className="text-center sm:text-left border-l border-white/5 pl-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Earned</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-wide mt-1">Rs {refEarnings}</p>
                 </div>
               </div>
               
               <div className="space-y-3 pt-2">
                 <button onClick={handleShareEarn} disabled={shareCountToday >= 5} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0B1220] border border-white/10 hover:border-[#4F9CFF]/50 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                   <Share2 className="w-4 h-4 text-[#4F9CFF]" />
                   Share & Earn Rs 1 ({shareCountToday}/5 Today)
                 </button>
                 <button onClick={simulateReferralDeposit} className="w-full text-center text-xs text-slate-500 hover:text-white underline underline-offset-2 transition-colors">
                   Demo: Simulate Friend Deposit
                 </button>
                 <p className="text-center text-[10px] text-slate-500">Reward given only when referred user makes a deposit.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
      
      {showAddFunds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1B3A] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAddFunds(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-[#0B1220] p-2 rounded-full border border-white/10 transition-colors">
               <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-white mb-2">Add Funds</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the amount you wish to deposit. Admin approval is required for demo purposes.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#4F9CFF] opacity-80 block mb-2">Deposit Amount (Rs)</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[#0B1220]/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none"
                />
                <p className="text-xs text-slate-500 font-medium mt-2">Minimum deposit: Rs 100</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#4F9CFF] opacity-80 block mb-2">Payment Method</label>
                <input 
                  type="text" 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g. Bank Transfer, UPI, etc."
                  className="w-full bg-[#0B1220]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none"
                />
              </div>
              <button 
                onClick={handleDepositSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] text-white rounded-xl font-black transition-all shadow-[0_0_15px_rgba(79,156,255,0.3)]"
              >
                Submit Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
