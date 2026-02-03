
import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Transaction } from '../types';

interface HistoryProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  t: (key: string) => string;
}

const History: React.FC<HistoryProps> = ({ transactions, deleteTransaction, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             item.note.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || item.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.amount - a.amount;
      });
  }, [transactions, searchTerm, filterType, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                filterType === type 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {type === 'ALL' ? 'All' : t(type.toLowerCase())}
            </button>
          ))}
          <div className="flex-1"></div>
          <button 
            onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 whitespace-nowrap flex items-center gap-2"
          >
            Sort by {sortBy === 'date' ? t('date') : t('amount')}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group transition-all hover:shadow-md">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.category.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{item.category}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString()}
                    {item.note && <span className="truncate max-w-[150px]">• {item.note}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold text-lg ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'INCOME' ? '+' : '-'} ৳{item.amount.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => deleteTransaction(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p>No transactions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
