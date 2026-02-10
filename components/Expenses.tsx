
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, BusinessProfile } from '../types';
import { Wallet, Plus, Search, Filter, Trash2, Calendar, Tag, CreditCard, ChevronDown } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  businessProfile: BusinessProfile | null;
}

const CATEGORIES: ExpenseCategory[] = ['Logistics', 'Marketing', 'Supplies', 'Rent', 'Utilities', 'Salary', 'Other'];

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, businessProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'All'>('All');

  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'timestamp'>>({
    amount: 0,
    category: 'Other',
    description: ''
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, filterCategory]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    onAddExpense({
      ...formData,
      timestamp: new Date().toISOString()
    });
    setFormData({ amount: 0, category: 'Other', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Expenses</h1>
          <p className="text-gray-500 mt-1">Track overheads to see your true net profit.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="h-12 px-6 bg-white text-black font-bold rounded-2xl flex items-center justify-center space-x-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>New Expense</span>
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-border p-6 rounded-[32px] bg-gradient-to-br from-red-500/5 to-transparent">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Overhead</p>
          <p className="text-3xl font-black font-mono text-red-400">{currency}{totalSpent.toLocaleString()}</p>
        </div>
        <div className="cyber-border p-6 rounded-[32px]">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Top Category</p>
          <p className="text-2xl font-bold">
            {expenses.length > 0 ? CATEGORIES.reduce((a, b) => 
              expenses.filter(e => e.category === a).length > expenses.filter(e => e.category === b).length ? a : b
            ) : 'None'}
          </p>
        </div>
        <div className="cyber-border p-6 rounded-[32px]">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Expense Count</p>
          <p className="text-2xl font-bold">{expenses.length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search descriptions..."
            className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none appearance-none font-bold text-sm pr-12"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Expense List */}
      <div className="cyber-border rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 bg-white/[0.01]">
              <th className="px-6 py-5">Item / Description</th>
              <th className="px-6 py-5">Category</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic text-sm">No expenses logged yet.</td>
              </tr>
            ) : (
              filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-sm">{expense.description}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs text-gray-500">{new Date(expense.timestamp).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="font-mono font-black text-red-400">-{currency}{expense.amount}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Wallet className="text-red-400" />
                Add New Expense
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount ({currency})</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="number" 
                    required
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 outline-none focus:border-red-500/50 transition-all font-mono font-black text-xl text-red-400"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <select 
                    className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl pl-12 pr-6 outline-none focus:border-white appearance-none font-bold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-medium"
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center space-x-2 shadow-xl"
              >
                <span>Record Expense</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
