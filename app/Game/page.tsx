'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Trophy, Sparkles, Loader2 } from 'lucide-react';

function ScratchCard({ name, reward, tier, color, onComplete }: { name: string, reward: number, tier: string, color: string, onComplete: (amt: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create gradient background for the scratch overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1E293B'); // slate-800
    gradient.addColorStop(0.5, '#334155'); // slate-700
    gradient.addColorStop(1, '#0F172A'); // slate-900
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add pattern
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for(let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add text overlay
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0; // reset
  }, []);

  const handleDraw = (e: any) => {
    if (!isDrawing || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX || e.pageX;
      clientY = e.clientY || e.pageY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, 2 * Math.PI);
    ctx.fill();

    // eslint-disable-next-line react-hooks/purity
    if (Math.random() < 0.15) {
       checkCompletion();
    }
  };

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;

    for (let i = 3; i < imageData.length; i += 16) { 
      if (imageData[i] < 128) transparent++;
    }

    const totalPixels = imageData.length / 16;
    if (transparent / totalPixels > 0.40) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsRevealed(true);
      onComplete(reward);
    }
  };

  return (
    <div className={`relative w-full aspect-[4/5] bg-[#0B1220]/90 rounded-2xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col select-none group backdrop-blur-xl ring-1 ring-white/10 hover:ring-[#4F9CFF]/30 transition-all`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className={`p-3 text-center border-b border-white/10 bg-[#1A1B3A]/80 relative`}>
        <div className={`absolute top-0 w-full h-1 left-0 bg-current opacity-80 ${color} shadow-[0_0_15px_currentColor]`} />
        <h3 className="font-bold text-white text-lg mt-1 filter drop-shadow-md">{name}</h3>
        <p className={`text-[10px] font-black tracking-widest ${color} uppercase mt-0.5 filter drop-shadow-sm`}>{tier} TIER</p>
      </div>
      
      <div className="flex-1 relative p-3">
        <div className={`absolute inset-3 flex flex-col items-center justify-center bg-[#0B1220] rounded-xl border-2 border-dashed ${reward > 0 ? color.replace('text-', 'border-') : 'border-slate-800'}`}>
           {reward > 0 ? (
             <div className="text-center animate-in zoom-in duration-500 scale-100">
               <Sparkles className={`w-8 h-8 mx-auto mb-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${color}`} />
               <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${color}`}>WINNER!</span>
               <span className="text-3xl font-black text-white filter drop-shadow-lg">Rs {reward}</span>
             </div>
           ) : (
             <div className="text-center opacity-50 grayscale">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">NO WIN</span>
               <span className="text-2xl font-black text-slate-600">Rs 0</span>
             </div>
           )}
        </div>
        
        <canvas
          ref={canvasRef}
          width={250}
          height={250}
          className={`absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] rounded-xl cursor-crosshair transition-opacity duration-700 shadow-inner touch-none ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:brightness-110'}`}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={handleDraw}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={handleDraw}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  )
}

export default function GamePage() {
  const router = useRouter();
  const [cards, setCards] = useState<{uniqueId: string, name: string, reward: number, tier: string, color: string}[]>([]);
  const [sessionWin, setSessionWin] = useState(0);
  const [cardsScratched, setCardsScratched] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth');
      } else {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Generate actual playing cards dynamically based on localStorage quantities
    const loadedCards: {uniqueId: string, name: string, reward: number, tier: string, color: string}[] = [];
    const cardIds = ['rs10', 'rs20', 'rs50', 'rs100', 'free'];
    
    let indexCount = 0;
    cardIds.forEach(id => {
      const qtyStr = localStorage.getItem('demo_card_' + id);
      const qty = qtyStr ? parseInt(qtyStr) : 0;
      
      const tInfo = id === 'rs10' ? { t: 'BRONZE', c: 'text-amber-600' } :
                    id === 'rs20' ? { t: 'SILVER', c: 'text-slate-300' } :
                    id === 'rs50' ? { t: 'GOLD', c: 'text-[#F5C542]' } :
                    id === 'rs100'? { t: 'PLATINUM', c: 'text-cyan-300' } :
                                    { t: 'FREE', c: 'text-emerald-400' };
      
      let assignedRewards: number[] = [];
      try {
        assignedRewards = JSON.parse(localStorage.getItem('demo_assigned_rewards_' + id) || '[]');
      } catch(e) {}
      
      const distStr = localStorage.getItem('demo_distribution_' + id);
      
      for (let i = 0; i < qty; i++) {
        let reward = 0;
        
         if (distStr && assignedRewards.length > i) {
            reward = assignedRewards[i] || 0; // Read from array directly by index
         } else {
           // Fallback Result Logic: 60% Lose, 40% Win
           const isWin = Math.random() < 0.4;
           if (isWin) {
             const customFreeMax = Number(localStorage.getItem('admin_free_card_reward') || '20');
             const max = id === 'rs10' ? 50 : (id === 'rs20' ? 100 : (id === 'rs50' ? 300 : (id === 'rs100' ? 500 : customFreeMax)));
             const min = id === 'rs10' ? 10 : (id === 'rs20' ? 20 : (id === 'rs50' ? 50 : (id === 'rs100' ? 100 : 5)));
             
             // safety check for free card where max might be lower than min
             const safeMax = Math.max(min, max);
             const range = (safeMax - min) / 10;
             reward = min + Math.floor(Math.random() * (range + 1)) * 10;
           }
         }

        loadedCards.push({
          uniqueId: id + '_' + indexCount++,
          name: tInfo.t.charAt(0) + tInfo.t.slice(1).toLowerCase(),
          reward: reward,
          tier: tInfo.t,
          color: tInfo.c
        });
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(loadedCards);
  }, []);

  const handleComplete = (amt: number) => {
    setSessionWin(prev => prev + amt);
    setCardsScratched(prev => prev + 1);
  };

  const syncBalance = () => {
    // Inject winnings back into balance
    if (sessionWin > 0) {
      const currentBalance = Number(localStorage.getItem('demo_balance') || '1000');
      localStorage.setItem('demo_balance', (currentBalance + sessionWin).toString());
    }
    // Burn played cards out from storage
    ['rs10', 'rs20', 'rs50', 'rs100', 'free'].forEach(id => {
      localStorage.setItem('demo_card_' + id, '0');
      localStorage.setItem('demo_assigned_rewards_' + id, '[]');
    });
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-transparent text-slate-50 min-h-[calc(100vh-16rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-[#4F9CFF] opacity-50" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-transparent text-slate-50 min-h-[calc(100vh-16rem)]">
        <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 p-10 rounded-3xl flex flex-col items-center max-w-md w-full shadow-2xl">
           <Trophy className="w-20 h-20 text-[#4F9CFF] mb-6 mx-auto opacity-80" />
           <h1 className="text-3xl font-black mb-2 text-center text-white">No Cards Available</h1>
           <p className="text-[#4F9CFF] opacity-80 mb-8 text-center">You haven&apos;t purchased any scratch cards yet. Go back to your dashboard to buy some!</p>
           <Link href="/dashboard" className="px-8 py-3.5 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] rounded-xl font-bold flex items-center justify-center gap-2 w-full transition-all shadow-lg shadow-[#4F9CFF]/20">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
           </Link>
        </div>
      </div>
    );
  }

  const allDone = cardsScratched === cards.length;

  return (
    <div className="flex-1 flex flex-col p-4 bg-transparent text-slate-50 min-h-[calc(100vh-16rem)] pb-32 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-[#1A1B3A]/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-white">Scratch Session</h1>
            <p className="text-[#4F9CFF] opacity-80 font-medium mt-1">Start scratching your cards</p>
          </div>
          <Link href="/dashboard" onClick={syncBalance} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg font-bold text-sm border border-white/10 flex items-center gap-2 transition-colors">
            Return to Dashboard
          </Link>
        </div>

        {/* Responsive Grid scaling based on screen size */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto items-center justify-center pb-10">
          {cards.map((card) => (
             <div key={card.uniqueId} className="flex justify-center w-full">
               <ScratchCard name={card.name} reward={card.reward} tier={card.tier} color={card.color} onComplete={handleComplete} />
             </div>
          ))}
        </div>
        
      </div>

      {/* Sticky Bottom UI Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220]/80 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[#4F9CFF] text-sm font-bold uppercase tracking-widest mb-1 opacity-80 flex items-center gap-2 justify-center sm:justify-start">
              <Trophy className="w-4 h-4" /> Session Summary
            </p>
            <p className="text-3xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
              Total Win: <span className="text-[#F5C542]">Rs {sessionWin}</span>
            </p>
            <p className="text-xs text-[#4F9CFF] opacity-60 font-bold mt-1 uppercase tracking-wider">Cards revealed: {cardsScratched} / {cards.length}</p>
          </div>
          
          {allDone && (
            <Link href="/dashboard" onClick={syncBalance} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center justify-center gap-2 animate-in zoom-in shadow-lg shadow-emerald-500/20 text-white uppercase tracking-wider">
              Collect Winnings <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
