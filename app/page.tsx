'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

const mockCards = [
  { id: 1, name: "Golden Fortune", price: "$5", topPrize: "$50,000", color: "from-amber-400 to-yellow-600" },
  { id: 2, name: "Neon Nights", price: "$2", topPrize: "$10,000", color: "from-purple-500 to-pink-600" },
  { id: 3, name: "Cyber Jackpot", price: "$10", topPrize: "$250,000", color: "from-cyan-400 to-blue-600" },
];

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && !localStorage.getItem('demo_referred_by')) {
         localStorage.setItem('demo_referred_by', ref);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8 flex flex-col items-center justify-centertext-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-cover bg-center -z-20" style={{ backgroundImage: "url('https://picsum.photos/seed/casino/1920/1080?blur=10')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#11162A]/80 to-[#0B1220] -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4F9CFF]/10 border border-[#4F9CFF]/20 mb-8 shadow-[0_0_15px_rgba(79,156,255,0.2)]">
            <Sparkles className="w-4 h-4 text-[#4F9CFF]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F9CFF]">New Premium Series Live Now!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            Instant Wins. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F9CFF] to-indigo-500 filter drop-shadow-lg">
              Infinite Thrills.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Experience the ultimate digital scratch card platform. Secure, provably fair, and gorgeously designed for the modern player.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#4F9CFF] to-indigo-600 hover:from-indigo-500 hover:to-[#4F9CFF] text-white font-black text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,156,255,0.4)] hover:shadow-[0_0_30px_rgba(79,156,255,0.6)] border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              <span>Play Now</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/auth" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-bold text-lg transition-all flex items-center justify-center"
            >
              Log In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Cards Grid */}
      <section className="px-4 py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Premium Games</h2>
              <p className="text-[#4F9CFF] opacity-80 font-medium tracking-wide">Discover our most lucrative scratch cards</p>
            </div>
            <Link href="/dashboard" className="hidden md:flex items-center text-[#4F9CFF] hover:text-indigo-400 transition-colors font-bold uppercase text-sm tracking-widest group">
              See All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative rounded-3xl p-1 overflow-hidden backdrop-blur-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="relative bg-[#0B1220]/80 rounded-[1.4rem] p-6 h-full border border-white/10 flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
                  <div className={`absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
                  <div className="absolute top-0 right-0 p-6 z-10">
                    <div className="px-4 py-1.5 bg-black/40 border border-white/10 rounded-full text-xs font-black text-white tracking-widest uppercase">
                      {card.price} / Ticket
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} border border-white/20 flex items-center justify-center mb-12 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10`}>
                    <Trophy className="w-8 h-8 text-white filter drop-shadow-md" />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Top Prize</p>
                    <h3 className="text-4xl font-black tracking-tight text-white mb-4 filter drop-shadow-lg">{card.topPrize}</h3>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
                      <span className="font-black text-lg tracking-wide">{card.name}</span>
                      <button className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:${card.color} group-hover:border-transparent transition-all text-white shadow-lg`}>
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Zap />, title: "Instant Payouts", desc: "Win and withdraw your funds instantly to your connected crypto wallet or bank." },
              { icon: <Shield />, title: "Provably Fair", desc: "Every scratch card is generated using verifiable cryptographic algorithms." },
              { icon: <Trophy />, title: "Daily Jackpots", desc: "Join the daily pool and stand a chance to win massive progressive jackpots." },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-lg bg-indigo-600/20 text-indigo-500 border border-indigo-500/20">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
