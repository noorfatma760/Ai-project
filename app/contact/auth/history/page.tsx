'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const q = query(
          collection(db, 'transactions'),
          where('uid', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const txs: any[] = [];
        querySnapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by date descending (we use JS sort since we might want to avoid composite index requirements for simple queries)
        txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(txs);
      } catch (err) {
        console.error("Error fetching history: ", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020813] font-sans selection:bg-[#4F9CFF]/30 text-slate-300 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 pt-32 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white filter drop-shadow-md">Transaction History</h1>
            <p className="text-[#4F9CFF] opacity-80 text-sm font-medium mt-1">Track all your purchases, deposits, and rewards.</p>
          </div>
        </div>

        <div className="bg-[#1A1B3A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(79,156,255,0.1)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Clock className="w-10 h-10 animate-pulse mb-4 opacity-50" />
              <p className="font-medium animate-pulse">Loading history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold text-lg text-white mb-2">No Transactions Yet</p>
              <p className="text-sm max-w-sm mb-6">Your history is currently empty. Purchase scratch cards or make a deposit to see them here.</p>
              <Link href="/dashboard" className="px-6 py-3 bg-[#0B1220] border border-white/10 hover:border-[#4F9CFF]/50 text-white rounded-xl font-bold transition-all shadow-lg">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-400">
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold">Type</th>
                    <th className="pb-4 font-bold text-right">Details</th>
                    <th className="pb-4 font-bold text-right">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <motion.tr 
                      key={tx.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 text-sm font-medium text-slate-300">
                        {new Date(tx.createdAt).toLocaleDateString()} <span className="text-slate-500 ml-1">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          tx.type === 'referral' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {tx.type || 'scratch'}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm">
                        {tx.type === 'deposit' ? (
                          <span className="text-white font-bold">+Rs {tx.amount}</span>
                        ) : tx.type === 'referral' ? (
                          <span className="text-white font-bold">Earned from Invite</span>
                        ) : (
                          <span className="text-slate-400">Bought Rs {tx.price || tx.amount} Card</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {tx.reward !== undefined && tx.reward > 0 ? (
                          <span className="font-black text-emerald-400">+Rs {tx.reward}</span>
                        ) : tx.type === 'referral' || tx.type === 'deposit' ? (
                          <span className="font-black text-emerald-400">+Rs {tx.amount}</span>
                        ) : (
                          <span className="text-slate-600 font-medium tracking-wide text-xs">NO WIN</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
