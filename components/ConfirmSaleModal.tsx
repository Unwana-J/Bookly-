
import React, { useState, useEffect } from 'react';
import { ExtractedSale, Product, BusinessProfile, SalesSource } from '../types';
import { X, Check, ShoppingCart, User, AlertCircle, AlertTriangle, Plus, Trash2, Tag } from 'lucide-react';

interface ConfirmSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalData: ExtractedSale) => void;
  saleData: ExtractedSale;
  products: Product[];
  businessProfile: BusinessProfile | null;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({ 
  isOpen, onClose, onConfirm, saleData, products, businessProfile 
}) => {
  const [localData, setLocalData] = useState<ExtractedSale>(saleData);

  useEffect(() => {
    setLocalData(saleData);
  }, [saleData]);

  if (!isOpen) return null;
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';
  const isLowConfidence = localData.confidence === 'low';

  const updateCustomer = (idx: number, field: string, value: any) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[idx] = { ...newCustomers[idx], [field]: value };
    setLocalData({ ...localData, customers: newCustomers });
  };

  const updateItem = (custIdx: number, itemIdx: number, field: string, value: any) => {
    const newCustomers = [...(localData.customers || [])];
    const newItems = [...newCustomers[custIdx].items];
    newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
    
    // Recalculate order total if price or qty changed
    if (field === 'unitPrice' || field === 'quantity') {
      const total = newItems.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
      newCustomers[custIdx].orderTotal = total;
    }

    newCustomers[custIdx].items = newItems;
    setLocalData({ ...localData, customers: newCustomers });
  };

  const removeItem = (custIdx: number, itemIdx: number) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[custIdx].items = newCustomers[custIdx].items.filter((_, i) => i !== itemIdx);
    const total = newCustomers[custIdx].items.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
    newCustomers[custIdx].orderTotal = total;
    setLocalData({ ...localData, customers: newCustomers });
  };

  const addItem = (custIdx: number) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[custIdx].items.push({ productName: 'New Product', quantity: 1, unitPrice: 0 });
    setLocalData({ ...localData, customers: newCustomers });
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0f0f0f] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isLowConfidence ? 'bg-amber-500' : 'bg-emerald-500'}`}>
              <ShoppingCart size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Review & Edit Order</h2>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                AI Confidence: <span className={isLowConfidence ? 'text-amber-500' : 'text-emerald-500'}>{localData.confidence}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {isLowConfidence && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-500 leading-tight">
                Some details might be unclear. Please verify items and quantities before confirming.
              </p>
            </div>
          )}

          {localData.customers?.map((c, custIdx) => (
            <div key={custIdx} className="p-6 bg-white/[0.03] rounded-[32px] border border-white/10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Customer Handle</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      value={c.handle}
                      onChange={(e) => updateCustomer(custIdx, 'handle', e.target.value)}
                      className="w-full h-11 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white font-bold outline-none focus:border-[#2DD4BF]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source Platform</label>
                  <select 
                    value={c.platform || 'WhatsApp'}
                    onChange={(e) => updateCustomer(custIdx, 'platform', e.target.value)}
                    className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold outline-none focus:border-[#2DD4BF]"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Items</p>
                  <button onClick={() => addItem(custIdx)} className="text-[10px] font-black text-[#2DD4BF] uppercase flex items-center gap-1">
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                
                {c.items?.map((item, itemIdx) => (
                  <div key={itemIdx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input 
                        type="text"
                        value={item.productName}
                        onChange={(e) => updateItem(custIdx, itemIdx, 'productName', e.target.value)}
                        className="w-full h-10 bg-black/20 border border-white/5 rounded-lg px-3 text-[11px] text-white"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(custIdx, itemIdx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full h-10 bg-black/20 border border-white/5 rounded-lg px-2 text-[11px] text-white text-center"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">{currency}</span>
                        <input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(custIdx, itemIdx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full h-10 bg-black/20 border border-white/5 rounded-lg pl-5 pr-2 text-[11px] text-white font-mono"
                          placeholder="Price"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeItem(custIdx, itemIdx)} className="text-red-500/50 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subtotal</span>
                <span className="text-xl font-black text-[#2DD4BF] font-mono">{currency}{c.orderTotal?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3">
          <button 
            onClick={() => onConfirm(localData)} 
            className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.01] active:scale-95 transition-all"
          >
            <Check size={20} /> Confirm & Generate Invoice
          </button>
          <button onClick={onClose} className="w-full h-10 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-colors">
            Discard & Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaleModal;
