
import React, { useState } from 'react';
import { Customer, SalesSource } from '../types';
import { X, User, MessageCircle, MapPin, Check, AtSign, Globe } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id' | 'orderCount' | 'ltv' | 'lastActive'>) => void;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    channel: 'WhatsApp' as SalesSource,
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.handle) return;
    
    // Ensure handle starts with @
    const handle = formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`;

    onAdd({
      ...formData,
      handle
    });

    // Reset
    setFormData({ name: '', handle: '', channel: 'WhatsApp', address: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="text-emerald-400" />
            New Customer Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-bold"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <AtSign size={10} /> Social Handle
            </label>
            <input 
              type="text" 
              required
              value={formData.handle}
              onChange={e => setFormData({...formData, handle: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-mono font-bold text-emerald-400"
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Globe size={10} /> Primary Sales Channel
            </label>
            <select 
              value={formData.channel}
              onChange={e => setFormData({...formData, channel: e.target.value as SalesSource})}
              className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-bold"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={10} /> Default Shipping Address
            </label>
            <textarea 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full h-24 p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white transition-all text-sm resize-none font-medium"
              placeholder="123 Main St, City, Country..."
            />
          </div>

          <button 
            type="submit"
            className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center space-x-2 mt-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <Check size={20} />
            <span>Create Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
