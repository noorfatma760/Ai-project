'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BarChart, Settings, Users, CreditCard, Lock, ArrowRight, ShieldAlert, CheckCircle, XCircle, Gift, Trash2, Plus, Activity } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('analytics');

  // Distribution Control State
  const [distributionType, setDistributionType] = useState('rs10');
  const [distItems, setDistItems] = useState<{ id: number, prize: string, count: number }[]>([]);
  const [targetBucket, setTargetBucket] = useState<number>(1000);
  const [distMsg, setDistMsg] = useState('');
  const [distError, setDistError] = useState(false);

  // Free Card Settings State
  const [freeTimerHours, setFreeTimerHours] = useState(24);
  const [freeRewardAmount, setFreeRewardAmount] = useState(20);
  const [freeSettingsMsg, setFreeSettingsMsg] = useState('');

  // App Data State
  const [depositTxs, setDepositTxs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Static Analytics Configuration
  const analyticsData = [
    { id: 'rs10', name: 'Rs 10 Cards', sold: 120, users: 30, revenue: 1200 },
    { id: 'rs20', name: 'Rs 20 Cards', sold: 45, users: 15, revenue: 900 },
    { id: 'rs50', name: 'Rs 50 Cards', sold: 200, users: 80, revenue: 10000 },
    { id: 'rs100', name: 'Rs 100 Cards', sold: 10, users: 5, revenue: 1000 },
  ];

  const cardConfigs: Record<string, number[]> = {
    'rs10': [0, 10, 20, 25, 50],
    'rs20': [0, 20, 40, 50, 100],
    'rs50': [0, 50, 100, 150, 300],
    'rs100': [0, 100, 200, 250, 500]
  };

  function loadDistribution(type: string) {
    setDistributionType(type);
    const loaded = JSON.parse(localStorage.getItem('demo_distribution_' + type) || '{}');
    const target = parseInt(localStorage.getItem('demo_target_bucket_' + type) || '1000') || 1000;
    
    // Sort keys numerically to maintain a sensible order
    const keys = Object.keys(loaded).sort((a,b) => parseInt(a) - parseInt(b));
    const items = keys.map((key, idx) => ({ id: idx, prize: key, count: loaded[key] }));
    
    setDistItems(items);
    setTargetBucket(target > 0 ? target : 1000);
    setDistMsg('');
  }

  const loadAdminData = async () => {
    if (!localStorage.getItem('demo_distribution_rs10')) {
      localStorage.setItem('demo_distribution_rs10', JSON.stringify({ '0': 500, '10': 300, '20': 100, '25': 40, '50': 60 }));
      localStorage.setItem('demo_distribution_rs20', JSON.stringify({ '0': 500, '20': 300, '40': 100, '50': 40, '100': 60 }));
      localStorage.setItem('demo_distribution_rs50', JSON.stringify({ '0': 500, '50': 300, '100': 100, '150': 40, '300': 60 }));
      localStorage.setItem('demo_distribution_rs100', JSON.stringify({ '0': 500, '100': 300, '200': 100, '250': 40, '500': 60 }));
    }

    if (!localStorage.getItem('demo_users')) {
      localStorage.setItem('demo_users', JSON.stringify([
        { mobile: '03112233445', status: 'active', joined: '2023-10-15' },
        { mobile: '03009988776', status: 'blocked', joined: '2023-10-10' },
        { mobile: '03456677889', status: 'active', joined: '2023-11-01' },
      ]));
    }

    if (!localStorage.getItem('admin_free_card_timer')) {
      localStorage.setItem('admin_free_card_timer', '24');
    }
    if (!localStorage.getItem('admin_free_card_reward')) {
      localStorage.setItem('admin_free_card_reward', '20');
    }

    setFreeTimerHours(Number(localStorage.getItem('admin_free_card_timer') || '24'));
    setFreeRewardAmount(Number(localStorage.getItem('admin_free_card_reward') || '20'));

    setUsersList(JSON.parse(localStorage.getItem('demo_users') || '[]'));
    loadDistribution('rs10');
    
    // Load both local storage transactions and firebase deposits
    const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
    setDepositTxs(localTxs);

    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, doc, getDoc } = await import('firebase/firestore');
      const depsSnap = await getDocs(collection(db, 'deposits'));
      
      const promises = depsSnap.docs.map(async (d) => {
        const data = d.data();
        let userEmail = data.uid.substring(0, 8) + '...';
        try {
          const uDoc = await getDoc(doc(db, 'users', data.uid));
          if (uDoc.exists() && uDoc.data().email) {
            userEmail = uDoc.data().email;
          }
        } catch(e) {}
         
        return {
          id: d.id,
          type: 'deposit',
          amount: data.amount,
          status: data.status,
          date: data.createdAt,
          uid: data.uid,
          userMobile: userEmail
        };
      });
      const fbDeps = await Promise.all(promises);
      
      setDepositTxs(prev => {
         const all = [...localTxs, ...fbDeps];
         return all.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    } catch(e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/');
      } else if (user.email !== 'admin@example.com') {
        router.replace('/');
      } else {
        setIsAuth(true);
        loadAdminData();
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('demo_admin_auth', 'true');
      setIsAuth(true);
      setLoginError('');
      loadAdminData();
    } else {
      setLoginError('Invalid credentials. Use admin / admin123');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleDistCountChange = (id: number, val: string) => {
    const parsed = parseInt(val) || 0;
    setDistItems(prev => prev.map(item => item.id === id ? { ...item, count: parsed } : item));
  };
  
  const handleDistPrizeChange = (id: number, newPrize: string) => {
    setDistItems(prev => prev.map(item => item.id === id ? { ...item, prize: newPrize } : item));
  };

  const handleDistDelete = (id: number) => {
    setDistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDistAdd = () => {
    const newId = distItems.length > 0 ? Math.max(...distItems.map(d => d.id)) + 1 : 0;
    setDistItems(prev => [...prev, { id: newId, prize: '0', count: 0 }]);
  };

  const saveDistribution = () => {
    if (targetBucket <= 0) {
      setDistError(true);
      setDistMsg('Target bucket must be greater than 0.');
      return;
    }

    const total = distItems.reduce((a, b) => a + b.count, 0);
    if (total !== targetBucket) {
      setDistError(true);
      setDistMsg(`Total cards must equal ${targetBucket}. Current total is ${total}.`);
      return;
    }
    
    const objToSave: Record<string, number> = {};
    distItems.forEach(item => {
       const p = parseInt(item.prize) || 0;
       objToSave[p.toString()] = (objToSave[p.toString()] || 0) + item.count;
    });

    localStorage.setItem('demo_target_bucket_' + distributionType, targetBucket.toString());
    localStorage.setItem('demo_distribution_' + distributionType, JSON.stringify(objToSave));
    localStorage.removeItem('demo_live_pool_' + distributionType); // Reset the global loop when config changes
    
    // Reload items to unify any dupe prizes user might have created
    const keys = Object.keys(objToSave).sort((a,b) => parseInt(a) - parseInt(b));
    const newItems = keys.map((key, idx) => ({ id: idx, prize: key, count: objToSave[key] }));
    setDistItems(newItems);
    
    setDistError(false);
    setDistMsg('Distribution saved successfully!');
    setTimeout(() => setDistMsg(''), 3000);
  };

  const approveDeposit = async (id: string, amount: number, uid?: string) => {
    if (!uid) {
      let txs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      let idx = txs.findIndex((t: any) => t.id === id);
      if (idx > -1) {
        txs[idx].status = 'approved';
        localStorage.setItem('demo_transactions', JSON.stringify(txs));

        let bal = Number(localStorage.getItem('demo_balance') || '1000');
        localStorage.setItem('demo_balance', (bal + amount).toString());

        setDepositTxs(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
      }
      return;
    }
    
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc, increment, addDoc, collection } = await import('firebase/firestore');
      await updateDoc(doc(db, 'deposits', id), { status: 'approved' });
      await updateDoc(doc(db, 'users', uid), { balance: increment(amount) });
      await addDoc(collection(db, 'transactions'), {
        uid: uid,
        type: 'deposit',
        amount: amount,
        createdAt: new Date().toISOString()
      });
      setDepositTxs(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    } catch (e) {
      console.error(e);
      alert('Error approving');
    }
  };

  const rejectDeposit = async (id: string, uid?: string) => {
    if (!uid) {
      let txs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      let idx = txs.findIndex((t: any) => t.id === id);
      if (idx > -1) {
        txs[idx].status = 'rejected';
        localStorage.setItem('demo_transactions', JSON.stringify(txs));
        setDepositTxs(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
      }
      return;
    }

    try {
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'deposits', id), { status: 'rejected' });
      setDepositTxs(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    } catch(e) {
      console.error(e);
      alert('Error rejecting');
    }
  };

  const toggleUserStatus = (mobile: string) => {
    let users = [...usersList];
    let idx = users.findIndex(u => u.mobile === mobile);
    if (idx > -1) {
      users[idx].status = users[idx].status === 'active' ? 'blocked' : 'active';
      localStorage.setItem('demo_users', JSON.stringify(users));
      setUsersList(users);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-transparent min-h-[calc(100vh-16rem)]">
        <div className="w-8 h-8 rounded-full border-4 border-[#4F9CFF] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-transparent min-h-[calc(100vh-16rem)]">
        <div className="w-full max-w-md bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#4F9CFF] opacity-10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none" />
          <div className="flex items-center justify-center w-16 h-16 bg-[#0B1220]/60 border border-white/10 rounded-2xl mb-6 mx-auto relative z-10 shadow-inner">
            <Lock className="w-8 h-8 text-[#4F9CFF]" />
          </div>
          <h1 className="text-2xl font-black text-center text-white mb-2 relative z-10">Admin Panel</h1>
          <p className="text-[#4F9CFF] opacity-80 text-center text-sm mb-8 font-medium">Sign in with admin / admin123</p>
          
          <form className="space-y-4 relative z-10" onSubmit={handleLogin}>
            <div>
              <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-[#0B1220]/60 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4F9CFF]/50 font-bold placeholder-slate-500" />
            </div>
            <div>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-[#0B1220]/60 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4F9CFF]/50 font-bold placeholder-slate-500" />
            </div>
            {loginError && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">{loginError}</p>}
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] text-white rounded-xl font-black transition-all shadow-[0_0_15px_rgba(79,156,255,0.3)]">Secure Login</button>
          </form>
        </div>
      </div>
    );
  }

  const saveFreeCardSettings = () => {
    localStorage.setItem('admin_free_card_timer', freeTimerHours.toString());
    localStorage.setItem('admin_free_card_reward', freeRewardAmount.toString());
    setFreeSettingsMsg('Free card settings saved!');
    setTimeout(() => setFreeSettingsMsg(''), 3000);
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart className="w-5 h-5"/> },
    { id: 'pool-stats', label: 'Pool Stats', icon: <Activity className="w-5 h-5"/> },
    { id: 'distribution', label: 'Card Control', icon: <Settings className="w-5 h-5"/> },
    { id: 'freecard', label: 'Free Card', icon: <Gift className="w-5 h-5"/> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5"/> },
    { id: 'deposits', label: 'Deposits', icon: <CreditCard className="w-5 h-5"/> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-16rem)] w-full max-w-[1600px] mx-auto border-x border-t border-white/5 bg-[#0B1220]/50 backdrop-blur-sm">
      <aside className="w-full md:w-64 border-r border-white/10 bg-[#11162A]/60 flex flex-col p-4 shrink-0 shadow-2xl">
        <div className="flex items-center gap-2 px-3 mb-8 mt-2">
          <ShieldAlert className="w-6 h-6 text-[#4F9CFF] filter drop-shadow-md" />
          <span className="font-black text-white tracking-wide uppercase text-sm">Admin System</span>
        </div>
        <nav className="space-y-2 flex-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#4F9CFF]/10 text-[#4F9CFF] border-l-4 border-[#4F9CFF] shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <Link href="/admin/analytics" className="w-full mt-4 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-amber-400 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/30">
            <BarChart className="w-5 h-5"/> Super Analytics
          </Link>
        </nav>
        <button onClick={handleLogout} className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 border border-white/10 bg-[#0B1220]/60 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors font-bold shadow-lg">
          Logout <ArrowRight className="w-4 h-4" />
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Purchase Analytics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
              {analyticsData.map((data) => (
                <div key={data.id} className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-[#4F9CFF] opacity-5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`} />
                  <h3 className="font-black text-lg text-white mb-4 border-b border-white/10 pb-3 relative z-10">{data.name}</h3>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#4F9CFF] opacity-80 font-bold uppercase tracking-wider text-[10px]">Total Sold</span>
                      <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/5">{data.sold}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#4F9CFF] opacity-80 font-bold uppercase tracking-wider text-[10px]">Active Users</span>
                      <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/5">{data.users}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 mt-1 border-t border-white/5">
                      <span className="text-[#4F9CFF] opacity-80 font-bold uppercase tracking-wider text-[10px]">Gross Revenue</span>
                      <span className="font-black text-[#F5C542]">Rs {data.revenue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-black text-white">Card Distribution Control</h1>
            <div className="flex flex-wrap gap-3 mb-6">
               {Object.keys(cardConfigs).map(key => (
                 <button key={key} onClick={() => loadDistribution(key)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border shadow-lg ${distributionType === key ? 'bg-gradient-to-r from-[#4F9CFF] to-indigo-600 text-white border-transparent' : 'bg-[#0B1220]/60 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                   {key.toUpperCase().replace('RS', 'Rs ')} Card
                 </button>
               ))}
            </div>

             <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
               <div className="grid grid-cols-[1fr_1fr_auto] gap-4 text-xs font-black uppercase tracking-widest text-[#4F9CFF] opacity-80 mb-4 px-2 relative z-10">
                 <span>Reward Prize</span>
                 <span>Cards in Pool</span>
                 <span className="w-8"></span>
               </div>
               
               <div className="space-y-3 mb-8 relative z-10">
                 {distItems.map(item => (
                   <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center bg-[#0B1220]/60 p-4 rounded-2xl border border-white/5">
                     <div className="flex items-center">
                       <span className={`font-black tracking-wide ${parseInt(item.prize) === 0 ? 'text-slate-500' : 'text-emerald-400'} text-lg mr-2`}>Rs</span>
                       <input type="number" min="0" value={item.prize} onChange={(e) => handleDistPrizeChange(item.id, e.target.value)} className={`bg-[#1A1B3A] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none w-24 shadow-inner ${parseInt(item.prize) === 0 ? 'text-slate-500' : 'text-emerald-400'}`} />
                     </div>
                     <input type="number" min="0" value={item.count} onChange={(e) => handleDistCountChange(item.id, e.target.value)} className="bg-[#1A1B3A] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none w-full shadow-inner" />
                     <button onClick={() => handleDistDelete(item.id)} className="w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl transition-colors border border-rose-500/20">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 <button onClick={handleDistAdd} className="w-full py-4 border border-dashed border-[#4F9CFF]/30 rounded-2xl flex flex-col items-center justify-center text-[#4F9CFF] opacity-60 hover:opacity-100 hover:bg-[#4F9CFF]/5 hover:border-[#4F9CFF] transition-all gap-2">
                   <Plus className="w-5 h-5" />
                   <span className="font-bold text-sm tracking-widest uppercase">Add New Reward Option</span>
                 </button>
               </div>

               <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 relative z-10">
                 <div className="font-bold text-lg text-white flex items-center gap-2">
                   <span className="text-[#4F9CFF] opacity-80 uppercase text-xs tracking-widest mr-2">Total Bucket: </span>
                   <span className={`font-black text-xl px-3 py-1 bg-[#0B1220] rounded-lg border border-white/10 ${distItems.reduce((a,b)=>a+b.count,0) === targetBucket ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]'}`}>{distItems.reduce((a,b)=>a+b.count,0)}</span> <span className="text-sm">/</span>
                   <input type="number" min="1" value={targetBucket} onChange={(e) => setTargetBucket(parseInt(e.target.value) || 0)} className="bg-[#1A1B3A] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none w-24 shadow-inner" />
                 </div>
                 <button onClick={saveDistribution} className="px-8 py-3.5 bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] text-white rounded-xl font-black transition-all shadow-[0_0_15px_rgba(79,156,255,0.3)]">
                   Save Configuration
                 </button>
               </div>
               
               {distMsg && (
                 <div className={`mt-6 p-4 rounded-xl text-sm font-bold border relative z-10 flex items-center justify-center shadow-lg ${distError ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>{distMsg}</div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'freecard' && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
               <Gift className="w-6 h-6 text-[#4F9CFF]" /> Free Card Settings
            </h1>
            
            <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
               <div className="space-y-6 relative z-10">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0B1220]/60 p-5 rounded-2xl border border-white/5">
                   <div>
                     <span className="font-black tracking-wide text-white text-lg drop-shadow-md">Timer (Hours)</span>
                     <p className="text-xs text-slate-400 mt-1">Time to wait before a user can claim another free card.</p>
                   </div>
                   <input type="number" min="0" value={freeTimerHours} onChange={(e) => setFreeTimerHours(Number(e.target.value) || 0)} className="bg-[#1A1B3A] border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none w-full shadow-inner" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0B1220]/60 p-5 rounded-2xl border border-white/5">
                   <div>
                     <span className="font-black tracking-wide text-[#F5C542] text-lg drop-shadow-md">Reward Amount</span>
                     <p className="text-xs text-slate-400 mt-1">Maximum amount a user can win from the free card.</p>
                   </div>
                   <input type="number" min="0" value={freeRewardAmount} onChange={(e) => setFreeRewardAmount(Number(e.target.value) || 0)} className="bg-[#1A1B3A] border border-white/10 rounded-xl px-4 py-3 text-[#F5C542] font-mono focus:ring-2 focus:ring-[#4F9CFF]/50 outline-none w-full shadow-inner" />
                 </div>
                 
               </div>

               <div className="flex justify-end pt-6 border-t border-white/10 relative z-10 mt-6">
                 <button onClick={saveFreeCardSettings} className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] w-full sm:w-auto">
                   Save Settings
                 </button>
               </div>
               
               {freeSettingsMsg && (
                 <div className="mt-6 p-4 rounded-xl text-sm font-bold border relative z-10 flex items-center justify-center shadow-lg bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                   {freeSettingsMsg}
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'pool-stats' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Pool Statistics & History</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['rs10', 'rs20', 'rs50', 'rs100'].map(id => {
                const target = Number(localStorage.getItem('demo_target_bucket_' + id) || '1000') || 1000;
                let remaining = target;
                
                const liveStr = localStorage.getItem('demo_live_pool_' + id);
                if (liveStr) {
                  remaining = Object.values(JSON.parse(liveStr)).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;
                }
                const used = target - remaining;

                return (
                  <div key={id} className="relative bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col group shadow-xl">
                    <h3 className="text-[#4F9CFF] font-bold text-lg uppercase tracking-wider mb-4">{id.toUpperCase()} Pool</h3>
                    
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-slate-400 text-sm">Remaining</span>
                       <span className="text-white font-bold">{remaining}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-slate-400 text-sm">Used (Purchased)</span>
                       <span className="text-white font-bold">{used}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                       <span className="text-slate-400 text-sm font-medium">Total Capacity</span>
                       <span className="text-emerald-400 font-bold">{target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                 Pool History
                 <span className="bg-[#4F9CFF]/10 text-[#4F9CFF] px-3 py-1 rounded-lg text-sm">
                   Pools completed today: {
                     (() => {
                       const historyObj = JSON.parse(localStorage.getItem('demo_pool_history') || '[]');
                       return historyObj.filter((h: any) => new Date(h.date).toLocaleDateString() === new Date().toLocaleDateString()).length;
                     })()
                   }
                 </span>
               </h2>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#4F9CFF] opacity-80 uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">Date / Time</th>
                        <th className="px-4 py-3">Card Type</th>
                        <th className="px-4 py-3 text-right">Pool Size Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                         const historyObj = JSON.parse(localStorage.getItem('demo_pool_history') || '[]');
                         if (historyObj.length === 0) {
                           return <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No pool completions yet.</td></tr>;
                         }
                         return historyObj.slice().reverse().map((h: any, i: number) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                             <td className="px-4 py-4 text-slate-300">{new Date(h.date).toLocaleString()}</td>
                             <td className="px-4 py-4 font-bold text-white uppercase">{h.cardType}</td>
                             <td className="px-4 py-4 text-right text-emerald-400 font-medium">{h.totalCards} cards</td>
                           </tr>
                         ));
                      })()}
                    </tbody>
                 </table>
               </div>
            </div>

          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase">
                  <tr>
                    <th className="px-6 py-4">Mobile Number</th><th className="px-6 py-4">Joined Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr, i) => (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-mono font-medium text-white">{usr.mobile}</td>
                      <td className="px-6 py-4 text-slate-400">{usr.joined}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${usr.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{usr.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => toggleUserStatus(usr.mobile)} className={`text-sm font-medium hover:underline ${usr.status==='active' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {usr.status === 'active' ? 'Block User' : 'Unblock User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Deposit Approvals</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase">
                  <tr>
                    <th className="px-6 py-4">ID</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 flex-1">Status</th><th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {depositTxs.filter(t => t.type.toLowerCase() === 'deposit').length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No deposit requests found.</td></tr>
                  )}
                  {depositTxs.filter(t => t.type.toLowerCase() === 'deposit').map((tx, i) => (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-mono text-slate-500">#{tx.id}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{tx.userMobile || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold text-white">Rs {tx.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 w-max rounded-md text-xs font-bold uppercase flex items-center ${tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {tx.status === 'pending' ? (
                          <>
                            <button onClick={()=>approveDeposit(tx.id, tx.amount, tx.uid)} className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={()=>rejectDeposit(tx.id, tx.uid)} className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"><XCircle className="w-5 h-5" /></button>
                          </>
                        ) : (<span className="text-slate-500 text-xs font-medium px-2 py-1">Processed</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
