
import React, { useState } from 'react';
import { Transaction, SalesSource } from '../types';
import { X, Save, History } from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onUpdate: (id: string, updates: Partial<Transaction>, changeDesc: string) => void;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, onUpdate }) => {
  const [formData, setFormData] = useState({
    total: transaction.total,
    quantity: transaction.quantity,
    source: transaction.source,
    productName: transaction.productName
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const changes = [];
    if (formData.total !== transaction.total) changes.push(`Total ${transaction.total} -> ${formData.total}`);
    if (formData.quantity !== transaction.quantity) changes.push(`Qty ${transaction.quantity} -> ${formData.quantity}`);
    if (formData.source !== transaction.source) changes.push(`Source ${transaction.source} -> ${formData.source}`);

    if (changes.length > 0) onUpdate(transaction.id, formData, `Update: ${changes.join(', ')}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[40px] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Entry</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantity</label>
            <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Price</label>
            <input type="number" value={formData.total} onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none font-bold text-emerald-400" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Source</label>
            <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value as SalesSource})} className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 outline-none font-bold">
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
