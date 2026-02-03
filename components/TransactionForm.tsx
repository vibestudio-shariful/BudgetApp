
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Transaction) => void;
  t: (key: string) => string;
  defaultDate?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, t, defaultDate }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    onAdd({
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      category,
      date,
      note
    });

    setAmount('');
    setCategory('');
    setNote('');
  };

  const categories = type === 'INCOME' 
    ? ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
    : ['Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setType('INCOME')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${type === 'INCOME' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
        >
          {t('income')}
        </button>
        <button
          type="button"
          onClick={() => setType('EXPENSE')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${type === 'EXPENSE' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
        >
          {t('expense')}
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('amount')}</label>
        <input
          required
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          >
            <option value="">Select</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('note')}</label>
        <textarea
          placeholder="What was this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
      >
        {t('save')}
      </button>
    </form>
  );
};

export default TransactionForm;
