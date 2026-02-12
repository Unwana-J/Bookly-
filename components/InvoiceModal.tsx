
import React, { useRef } from 'react';
import { Transaction, BusinessProfile, Customer } from '../types';
import { X, Download, Share2, Printer, CheckCircle2, Globe, Phone, Mail, MapPin, Check } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  businessProfile: BusinessProfile | null;
  customer: Customer | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, transaction, businessProfile, customer }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';
  const subtotal = transaction.total;
  const dateStr = new Date(transaction.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Invoice from ${businessProfile?.name || 'Bookly Store'}\n\n` +
      `Item: ${transaction.productName}\n` +
      `Quantity: ${transaction.quantity}\n` +
      `Total: ${currency}${transaction.total}\n\n` +
      `Thank you for your purchase!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${transaction.id.toUpperCase()}`,
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Invoice text copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col bg-white text-black rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">

        {/* Header Actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Finalized</p>
              <h2 className="text-lg font-black leading-tight">{transaction.status === 'paid' ? 'Sale Receipt' : 'Sales Invoice'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
              title="Share Invoice"
            >
              <Share2 size={20} className="text-black" />
            </button>
            <button
              onClick={handlePrint}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
              title="Download/Print"
            >
              <Download size={20} className="text-black" />
            </button>
            <button
              onClick={onClose}
              className="ml-2 px-4 h-11 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all"
            >
              <Check size={16} /> <span>Done</span>
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-print-area" id="invoice-content">
          <div className="space-y-12">
            {/* Branding & Info */}
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4">
                {businessProfile?.logo ? (
                  <img src={businessProfile.logo} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center text-3xl font-black transform -rotate-6">B</div>
                )}
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">{businessProfile?.name || 'Business Name'}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-500 font-medium">
                    <p className="flex items-center gap-2"><Mail size={12} /> {businessProfile?.email}</p>
                    <p className="flex items-center gap-2"><Phone size={12} /> {businessProfile?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">{transaction.status === 'paid' ? 'Receipt' : 'Invoice'}</p>
                <p className="text-lg font-mono font-bold text-[#0F172A] mt-1 uppercase tracking-tighter">#{transaction.id.substr(0, 8)}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-4">Date Issued</p>
                <p className="font-bold">{dateStr}</p>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8 border-y border-gray-100">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Billed To</p>
                <div className="space-y-2">
                  <h4 className="text-lg font-black">{customer?.name || transaction.customerHandle}</h4>
                  <p className="text-sm font-mono text-gray-500">{transaction.customerHandle}</p>
                  {transaction.address && (
                    <p className="text-sm text-gray-500 leading-relaxed mt-2 max-w-xs flex items-start gap-2">
                      <MapPin size={14} className="mt-1 shrink-0" />
                      {transaction.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4 md:text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order Method</p>
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Globe size={14} className="text-gray-400" />
                  <span className="text-sm font-bold">{transaction.source}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="space-y-6">
              <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Amount</div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-12 items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="col-span-6">
                    <p className="font-black text-sm">{transaction.productName}</p>
                    {transaction.variant && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Variant: {transaction.variant}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-mono font-bold text-sm">
                    {transaction.quantity}
                  </div>
                  <div className="col-span-4 text-right font-mono font-black text-sm">
                    {currency}{(transaction.total / (transaction.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-8">
              <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-mono font-bold">{currency}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Taxes & Fees</span>
                  <span className="font-mono font-bold">{currency}0.00</span>
                </div>
                <div className="h-[1px] bg-gray-100 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-black font-black uppercase tracking-widest text-sm">Total Due</span>
                  <span className="font-mono font-black text-2xl">{currency}{transaction.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-12 text-center space-y-4">
              <p className="text-sm font-medium text-gray-400 italic">"{businessProfile?.receiptFooter || 'Thank you for your business!'}"</p>
              <div className="flex flex-col items-center gap-1 opacity-20">
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">Powered by Bookly AI</p>
                <div className="h-[1px] w-12 bg-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Footer */}
        <div className="p-6 border-t border-gray-100 flex flex-col gap-3 md:hidden">
          <button
            onClick={handleShare}
            className="w-full h-14 bg-black text-white font-black rounded-2xl flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> Send to Customer
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%;
            padding: 40px !important;
          }
        }
        .custom-print-area {
          scrollbar-width: thin;
          scrollbar-color: #eee transparent;
        }
      `}</style>
    </div>
  );
};

export default InvoiceModal;
