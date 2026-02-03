
import React, { useState } from 'react';
import { Landmark, PlusCircle, Trash2, Calendar, Wallet } from 'lucide-react';
import { SavingsEntry } from '../types';

interface SavingsProps {
  savings: SavingsEntry[];
  addSavings: (entry: SavingsEntry) => void;
  deleteSavings: (id: string) => void;
  t: (key: string) => string;
}

const Savings: React.FC<SavingsProps> = ({ savings, addSavings, deleteSavings, t }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount) return;
    addSavings({ id: crypto.randomUUID(), source, amount: parseFloat(amount), date });
    setSource('');
    setAmount('');
  };

  const totalCapital = savings.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col items-center justify-center space-y-2">
        <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mb-2"><Landmark className="w-8 h-8" /></div>
        <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest">{t('totalCapital')}</p>
        <h2 className="text-4xl font-black">৳ {totalCapital.toLocaleString()}</h2>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-indigo-500" /> {t('addSavings')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('source')}</label>
              <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Ex: Bank Deposit, Cash Box" className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('amount')}</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('date')}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">{t('save')}</button>
        </form>
      </div>

      <div className="space-y-3">
        {savings.length > 0 ? (
          savings.map(entry => (
            <div key={entry.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Landmark className="w-6 h-6" /></div>
                <div>
                  <p className="font-black text-slate-800 text-lg">{entry.source}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mt-1"><Calendar className="w-3 h-3" /> {new Date(entry.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-indigo-600 text-xl">৳{entry.amount.toLocaleString()}</p>
                <button onClick={() => deleteSavings(entry.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))
        ) : <div className="p-12 text-center text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">সঞ্চয়ের কোনো রেকর্ড পাওয়া যায়নি</div>}
      </div>
    </div>
  );
};

export default Savings;
