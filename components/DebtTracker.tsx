
import React, { useState } from 'react';
import { Debt, DebtType } from '../types';
import { Handshake, Trash2, CheckCircle, Clock } from 'lucide-react';

interface DebtTrackerProps {
  debts: Debt[];
  addDebt: (debt: Debt) => void;
  settleDebt: (id: string) => void;
  deleteDebt: (id: string) => void;
  t: (key: string) => string;
}

const DebtTracker: React.FC<DebtTrackerProps> = ({ debts, addDebt, settleDebt, deleteDebt, t }) => {
  const [type, setType] = useState<DebtType>('LEND');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount) return;

    addDebt({
      id: crypto.randomUUID(),
      type,
      personName: person,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      note,
      status: 'PENDING'
    });

    setPerson('');
    setAmount('');
    setNote('');
  };

  const pendingDebts = debts.filter(d => d.status === 'PENDING');
  const settledDebts = debts.filter(d => d.status === 'SETTLED');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Handshake className="w-6 h-6 text-amber-500" />
          {t('addTransaction')} ({t('debts')})
        </h3>
        <form onSubmit={handleAddDebt} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('LEND')}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${type === 'LEND' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              {t('lend')}
            </button>
            <button
              type="button"
              onClick={() => setType('BORROW')}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${type === 'BORROW' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
            >
              {t('borrow')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('person')}
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="number"
              placeholder={t('amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <input
            type="text"
            placeholder={t('note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">
            {t('save')}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 px-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending
        </h4>
        {pendingDebts.length > 0 ? (
          pendingDebts.map(debt => (
            <div key={debt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${debt.type === 'LEND' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">{debt.personName}</p>
                  <p className="text-xs text-slate-500">{t(debt.type.toLowerCase())} • {new Date(debt.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-bold ${debt.type === 'LEND' ? 'text-indigo-600' : 'text-amber-600'}`}>৳ {debt.amount.toLocaleString()}</p>
                </div>
                <button onClick={() => settleDebt(debt.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Settle">
                  <CheckCircle className="w-6 h-6" />
                </button>
                <button onClick={() => deleteDebt(debt.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
            No pending debts
          </div>
        )}

        {settledDebts.length > 0 && (
          <>
            <h4 className="font-bold text-slate-800 px-2 pt-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Settled
            </h4>
            <div className="opacity-60 grayscale scale-[0.98] origin-top transition-all hover:grayscale-0 hover:opacity-100">
              {settledDebts.map(debt => (
                <div key={debt.id} className="bg-slate-50 p-4 rounded-2xl mb-2 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-200 text-slate-400">
                      <Handshake className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold line-through">{debt.personName}</p>
                      <p className="text-xs text-slate-500">{new Date(debt.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-400">৳ {debt.amount.toLocaleString()}</p>
                    <button onClick={() => deleteDebt(debt.id)} className="p-2 text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebtTracker;
