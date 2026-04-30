'use client';

import { useState, useEffect } from 'react';
import { CreditCard, History, Plus, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const loadData = () => {
    setBalance(Number(localStorage.getItem('demo_balance') || '1000'));
    const txs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
    setTransactions(txs.reverse()); // Newest first
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // Poll for updates in case the admin approves on another screen
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (amt <= 0 || isNaN(amt)) {
       setMessage('Please enter a valid amount.');
       setTimeout(() => setMessage(''), 3000);
       return;
    }
    
    if (amt < 100) {
      setMessage('Minimum deposit amount is Rs 100');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newTx = {
       id: Math.floor(Math.random() * 1000000).toString(),
       type: 'Deposit',
       amount: amt,
       status: 'pending',
       date: new Date().toLocaleString(),
       userMobile: '03112233445' // Demo static user
    };

    const currentTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
    currentTxs.push(newTx);
    localStorage.setItem('demo_transactions', JSON.stringify(currentTxs));
    
    setDepositAmount('');
    setMessage(`Deposit request of Rs ${amt} sent successfully. Pending admin approval.`);
    setTimeout(() => setMessage(''), 5000);
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 mt-4 min-h-[calc(100vh-16rem)]">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">My Wallet</h1>
        <p className="text-[#4F9CFF] opacity-80 text-sm font-medium">Manage your funds and view transaction history.</p>
      </div>

      <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4F9CFF] to-indigo-600 opacity-10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[#4F9CFF] opacity-80 font-bold mb-1 uppercase tracking-widest text-xs">Available Balance</p>
          <h2 className="text-5xl font-black text-white filter drop-shadow-lg">Rs {balance}</h2>
        </div>

        <div className="w-full md:w-auto relative z-10">
          <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="number" 
              placeholder="Enter amount (Rs)" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-[#0B1220]/60 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4F9CFF]/50 w-full md:w-56 placeholder-slate-500 font-bold"
            />
            <p className="text-xs text-slate-500 font-medium absolute -bottom-5 left-2">Minimum deposit: Rs 100</p>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Add Funds
            </button>
          </form>
          {message && (
            <p className="text-xs font-bold text-[#4F9CFF] mt-3 bg-[#4F9CFF]/10 p-3 rounded-lg border border-[#4F9CFF]/20">{message}</p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#1A1B3A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#0B1220]/50 rounded-lg border border-white/5">
            <History className="w-5 h-5 text-[#F5C542]" />
          </div>
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
           <div className="text-center py-12 text-slate-500 border-t border-white/5 mt-4">
             <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="font-medium">No transactions found.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#4F9CFF] opacity-80 uppercase font-black tracking-widest bg-[#0B1220]/40">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl border-b border-white/5">Transaction ID</th>
                  <th className="px-6 py-4 border-b border-white/5">Type</th>
                  <th className="px-6 py-4 border-b border-white/5">Amount</th>
                  <th className="px-6 py-4 border-b border-white/5">Date</th>
                  <th className="px-6 py-4 rounded-tr-xl border-b border-white/5">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                    <td className="px-6 py-4 font-mono text-slate-500">#{tx.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{tx.type}</td>
                    <td className="px-6 py-4 font-black text-white">Rs {tx.amount}</td>
                    <td className="px-6 py-4 text-slate-400 font-medium truncate max-w-[150px]">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-[#0B1220]/40 border border-white/5 px-3 py-1.5 rounded-lg w-fit">
                        {getStatusIcon(tx.status)}
                        <span className="capitalize text-slate-300 font-bold text-xs tracking-wider">{tx.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
