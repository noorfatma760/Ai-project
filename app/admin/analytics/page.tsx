'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Users, CreditCard, Gift, Ticket, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepositsAmount: 0,
    totalScratchCards: 0,
    totalReferralRewards: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== 'admin@example.com') {
        router.replace('/');
        return;
      }

      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const txsSnap = await getDocs(collection(db, 'transactions'));
        const depositsSnap = await getDocs(collection(db, 'deposits'));

        let tScratchCards = 0;
        let tReferralRewards = 0;
        let tTransactions = 0;
        let tDepositsAmount = 0;

        txsSnap.forEach(doc => {
          const data = doc.data();
          tTransactions++;
          if (data.type === 'referral') {
            tReferralRewards += Number(data.amount) || 0;
          } else if (!data.type || data.type === 'scratch') {
            tScratchCards++;
          }
        });

        depositsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'approved') {
            tDepositsAmount += Number(data.amount) || 0;
          }
        });

        setStats({
          totalUsers: usersSnap.size,
          totalDepositsAmount: tDepositsAmount,
          totalScratchCards: tScratchCards,
          totalReferralRewards: tReferralRewards,
          totalTransactions: tTransactions,
        });

      } catch (err) {
        console.error("Error fetching analytics", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020813] font-sans selection:bg-[#4F9CFF]/30 text-slate-300 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 pt-32 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white filter drop-shadow-md">Platform Analytics</h1>
            <p className="text-[#4F9CFF] opacity-80 text-sm font-medium mt-1">Platform overview and statistics</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Activity className="w-10 h-10 animate-spin text-[#4F9CFF] opacity-50" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F9CFF]/10 rounded-full blur-3xl group-hover:bg-[#4F9CFF]/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#4F9CFF]/10 rounded-xl">
                  <Users className="w-6 h-6 text-[#4F9CFF]" />
                </div>
                <h3 className="text-lg font-bold text-white">Total Users</h3>
              </div>
              <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Total Deposits</h3>
              </div>
              <p className="text-4xl font-black text-white">Rs {stats.totalDepositsAmount}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Approved Only</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Ticket className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Scratch Cards</h3>
              </div>
              <p className="text-4xl font-black text-white">{stats.totalScratchCards}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Cards Sold</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <Gift className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Referral Rewards</h3>
              </div>
              <p className="text-4xl font-black text-white">Rs {stats.totalReferralRewards}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Total Given</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Total Transactions</h3>
              </div>
              <p className="text-4xl font-black text-white">{stats.totalTransactions}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">All Activities</p>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
