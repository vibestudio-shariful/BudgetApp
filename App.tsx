
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, History, CreditCard, User, Globe, Save, Upload, PlusCircle, Camera, Check, Landmark, FileJson, FileSpreadsheet, X as CloseIcon } from 'lucide-react';
import { Transaction, Debt, Language, UserProfile, SavingsEntry } from './types';
import { translations } from './i18n';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import HistoryView from './components/History';
import DebtTracker from './components/DebtTracker';
import About from './components/About';
import Savings from './components/Savings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'debts' | 'savings' | 'about'>('dashboard');
  const [language, setLanguage] = useState<Language>('bn');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savings, setSavings] = useState<SavingsEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: '',
    image: null,
    isSetup: false
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedDebts = localStorage.getItem('debts');
    const savedSavings = localStorage.getItem('savings');
    const savedLang = localStorage.getItem('language') as Language;
    const savedUser = localStorage.getItem('userProfile');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    if (savedSavings) setSavings(JSON.parse(savedSavings));
    if (savedLang) setLanguage(savedLang || 'bn');
    if (savedUser) setUserProfile(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('debts', JSON.stringify(debts));
    localStorage.setItem('savings', JSON.stringify(savings));
    localStorage.setItem('language', language);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [transactions, debts, savings, language, userProfile]);

  const t = useCallback((key: string) => translations[key]?.[language] || key, [language]);

  const saveToDevice = async (content: string, fileName: string, mimeType: string) => {
    // Attempting Folder Selection via modern Browser API
    if ('showSaveFilePicker' in (window as any)) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: mimeType === 'application/json' ? 'JSON Backup' : 'Excel/CSV Report',
            accept: { [mimeType]: [mimeType === 'application/json' ? '.json' : '.csv'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        alert(t('exportSuccess'));
        return true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return false;
        console.error('File Picker failed, falling back to download', err);
      }
    }

    // Fallback standard download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    alert(t('exportSuccess'));
    return true;
  };

  const handleFullBackup = async () => {
    const data = JSON.stringify({ transactions, debts, savings, userProfile }, null, 2);
    const fileName = `FinancePro_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    await saveToDevice(data, fileName, 'application/json');
    setShowBackupModal(false);
  };

  const convertToCSV = (data: any[], headers: string[]) => {
    const rows = data.map(obj => 
      headers.map(header => {
        const value = obj[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExportCSV = async (type: 'transactions' | 'savings' | 'debts') => {
    let csvContent = '';
    let fileName = '';
    
    if (type === 'transactions') {
      csvContent = convertToCSV(transactions, ['date', 'type', 'category', 'amount', 'note']);
      fileName = `Transactions_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'savings') {
      csvContent = convertToCSV(savings, ['date', 'source', 'amount']);
      fileName = `Savings_Capital_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csvContent = convertToCSV(debts, ['date', 'type', 'personName', 'amount', 'status', 'note']);
      fileName = `Debts_Report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    await saveToDevice(csvContent, fileName, 'text/csv');
    setShowBackupModal(false);
  };

  const restoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) setTransactions(data.transactions);
        if (data.debts) setDebts(data.debts);
        if (data.savings) setSavings(data.savings);
        if (data.userProfile) setUserProfile(data.userProfile);
        alert(t('importSuccess'));
      } catch (err) {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    setShowAddModal(false);
  };

  const addDebt = (debt: Debt) => setDebts([debt, ...debts]);
  const addSavingsEntry = (entry: SavingsEntry) => setSavings([entry, ...savings]);

  const deleteTransaction = (id: string) => {
    if (confirm(t('confirmDelete'))) setTransactions(transactions.filter(t => t.id !== id));
  };

  const deleteDebt = (id: string) => {
    if (confirm(t('confirmDelete'))) setDebts(debts.filter(d => d.id !== id));
  };

  const deleteSavings = (id: string) => {
    if (confirm(t('confirmDelete'))) setSavings(savings.filter(s => s.id !== id));
  };

  const settleDebt = (id: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, status: 'SETTLED' } : d));
  };

  const monthlyTotals = useMemo(() => {
    const monthTransactions = transactions.filter(tr => tr.date.startsWith(selectedMonth));
    const income = monthTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
    const lend = debts.filter(d => d.type === 'LEND' && d.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
    const borrow = debts.filter(d => d.type === 'BORROW' && d.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
    const totalCapital = savings.reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      debt: borrow - lend,
      capital: totalCapital,
      filteredTransactions: monthTransactions
    };
  }, [transactions, debts, savings, selectedMonth]);

  if (!userProfile.isSetup) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-8 animate-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('welcome')}</h2>
            <p className="text-slate-500 text-sm">{t('welcomeDesc')}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-indigo-50 overflow-hidden shadow-inner flex items-center justify-center">
                {userProfile.image ? (
                  <img src={userProfile.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg border-2 border-white">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setUserProfile(prev => ({ ...prev, image: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('name')}</label>
              <input 
                type="text" 
                value={userProfile.name} 
                onChange={e => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('age')}</label>
                <input type="number" value={userProfile.age} onChange={e => setUserProfile(prev => ({ ...prev, age: e.target.value }))} className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('email')}</label>
                <input type="email" value={userProfile.email} onChange={e => setUserProfile(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>
          </div>
          <button onClick={() => setUserProfile(prev => ({ ...prev, isSetup: true }))} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
            {t('getStarted')} <Check className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 md:pt-16">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-indigo-700 flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> <span className="hidden sm:inline tracking-tight">{t('appTitle')}</span>
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center gap-2 transition-colors border border-slate-100">
            <Globe className="w-5 h-5 text-indigo-600" /> <span className="text-xs font-black text-slate-600 uppercase">{language}</span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button onClick={() => setShowBackupModal(true)} className="p-2 rounded-2xl hover:bg-slate-100 text-slate-600 transition-colors">
            <Save className="w-5 h-5" />
          </button>
          <label className="p-2 rounded-2xl hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors"><Upload className="w-5 h-5" /><input type="file" className="hidden" onChange={restoreData} accept=".json" /></label>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 mt-16 md:mt-4">
        {activeTab === 'dashboard' && <Dashboard totals={monthlyTotals} transactions={monthlyTotals.filteredTransactions} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} t={t} />}
        {activeTab === 'history' && <HistoryView transactions={transactions} deleteTransaction={deleteTransaction} t={t} />}
        {activeTab === 'debts' && <DebtTracker debts={debts} addDebt={addDebt} settleDebt={settleDebt} deleteDebt={deleteDebt} t={t} />}
        {activeTab === 'savings' && <Savings savings={savings} addSavings={addSavingsEntry} deleteSavings={deleteSavings} t={t} />}
        {activeTab === 'about' && <About t={t} userProfile={userProfile} onProfileUpdate={setUserProfile} />}
      </main>

      {['dashboard', 'history'].includes(activeTab) && (
        <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-40 md:bottom-10"><PlusCircle className="w-10 h-10" /></button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-20 shadow-lg z-50 md:top-16 md:bottom-auto md:h-14">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
          { id: 'history', icon: History, label: t('history') },
          { id: 'debts', icon: CreditCard, label: t('debts') },
          { id: 'savings', icon: Landmark, label: t('savings') },
          { id: 'about', icon: User, label: t('about') },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-105 font-bold' : 'text-slate-400'}`}>
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-indigo-50' : ''}`} />
            <span className="text-[9px] uppercase tracking-wider font-black">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Backup/Export Selection Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{t('selectExportFormat')}</h2>
              <button onClick={() => setShowBackupModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><CloseIcon className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleFullBackup}
                className="w-full bg-slate-50 hover:bg-indigo-50 p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all flex items-center gap-5 text-left group"
              >
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileJson className="w-7 h-7" /></div>
                <div>
                  <p className="font-black text-slate-800 text-lg">{t('fullBackupJSON')}</p>
                  <p className="text-slate-400 text-sm">Required for full data restore</p>
                </div>
              </button>

              <div className="grid grid-cols-1 gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-2">Reports (Excel Compatible)</p>
                {[
                  { id: 'transactions', label: t('transactionsCSV'), icon: FileSpreadsheet, color: 'emerald' },
                  { id: 'savings', label: t('savingsCSV'), icon: FileSpreadsheet, color: 'purple' },
                  { id: 'debts', label: t('debtsCSV'), icon: FileSpreadsheet, color: 'amber' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleExportCSV(item.id as any)}
                    className="w-full bg-slate-50 hover:bg-slate-100 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 text-left transition-all"
                  >
                    <div className={`w-10 h-10 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center`}><item.icon className="w-5 h-5" /></div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-800">{t('addTransaction')}</h2><button onClick={() => setShowAddModal(false)} className="text-3xl text-slate-400">&times;</button></div>
            <TransactionForm onAdd={addTransaction} t={t} defaultDate={selectedMonth === new Date().toISOString().slice(0, 7) ? undefined : `${selectedMonth}-01`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
