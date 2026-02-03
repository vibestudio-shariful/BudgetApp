
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Handshake, ChevronLeft, ChevronRight, Calendar, Landmark } from 'lucide-react';
import { Transaction } from '../types';

interface DashboardProps {
  totals: {
    income: number;
    expense: number;
    balance: number;
    debt: number;
    capital: number;
  };
  transactions: Transaction[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  t: (key: string) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ totals, transactions, selectedMonth, setSelectedMonth, t }) => {
  const chartData = [
    { name: t('income'), value: totals.income, color: '#10b981' },
    { name: t('expense'), value: totals.expense, color: '#f43f5e' }
  ];

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const currentMonthDisplay = () => {
    const [year, month] = selectedMonth.split('-');
    return `${t(monthNames[parseInt(month) - 1])} ${year}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /><span className="font-bold text-slate-700 text-lg">{currentMonthDisplay()}</span></div>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('income')}</span></div>
          <p className="text-lg font-bold">৳{totals.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 mb-2"><TrendingDown className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('expense')}</span></div>
          <p className="text-lg font-bold">৳{totals.expense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-2"><Wallet className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('currentBalance')}</span></div>
          <p className="text-lg font-bold">৳{totals.balance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-amber-600 mb-2"><Handshake className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('totalDebt')}</span></div>
          <p className="text-lg font-bold">৳{totals.debt.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-purple-600 mb-2"><Landmark className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('totalCapital')}</span></div>
          <p className="text-lg font-bold text-purple-700">৳{totals.capital.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">{t('income')} vs {t('expense')}</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" /><YAxis />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Monthly Split</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {totals.income + totals.expense > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            ) : <div className="text-slate-400 text-sm">No data for this month</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
