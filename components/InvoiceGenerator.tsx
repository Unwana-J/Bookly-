import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';
import { getCurrencySymbol } from '../utils/currency';
import jsPDF from 'jspdf';

interface InvoiceGeneratorProps {
    transaction: Transaction;
    businessProfile: BusinessProfile;
    onClose: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
    transaction,
    businessProfile,
    onClose
}) => {
    const currencySymbol = getCurrencySymbol(businessProfile.currency);
    const invoiceDate = new Date(transaction.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(businessProfile.name, 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Email: ${businessProfile.email || 'N/A'}`, 20, 28);
        doc.text(`Phone: ${businessProfile.phone || 'N/A'}`, 20, 34);

        // Document Title
        const isPaid = transaction.status === 'paid';
        const docTitle = isPaid ? 'SALE RECEIPT' : 'INVOICE';

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(docTitle, 20, 50);

        // Invoice Details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${isPaid ? 'Receipt' : 'Invoice'} #: ${transaction.id.substring(0, 8).toUpperCase()}`, 20, 60);
        doc.text(`Date: ${invoiceDate}`, 20, 66);
        doc.text(`Customer: ${transaction.customerHandle}`, 20, 72);

        // Items Table Header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, 90);
        doc.text('Qty', 120, 90);
        doc.text('Price', 150, 90);
        doc.text('Total', 180, 90);

        // Items
        doc.setFont('helvetica', 'normal');
        let yPos = 100;

        if (transaction.items && transaction.items.length > 0) {
            transaction.items.forEach((item) => {
                const itemTotal = item.quantity * (item.unitPrice || 0);
                doc.text(item.productName, 20, yPos);
                doc.text(item.quantity.toString(), 120, yPos);
                doc.text(`${currencySymbol}${(item.unitPrice || 0).toFixed(2)}`, 150, yPos);
                doc.text(`${currencySymbol}${itemTotal.toFixed(2)}`, 180, yPos);
                yPos += 8;
            });
        } else {
            doc.text(transaction.productName || 'Product', 20, yPos);
            doc.text(transaction.quantity.toString(), 120, yPos);
            const unitPrice = transaction.total / transaction.quantity;
            doc.text(`${currencySymbol}${unitPrice.toFixed(2)}`, 150, yPos);
            doc.text(`${currencySymbol}${transaction.total.toFixed(2)}`, 180, yPos);
            yPos += 8;
        }

        // Totals
        yPos += 10;
        doc.line(20, yPos, 200, yPos);
        yPos += 8;

        const subtotal = transaction.total - (transaction.deliveryFee || 0);
        doc.text('Subtotal:', 150, yPos);
        doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, 180, yPos);
        yPos += 6;

        if (transaction.deliveryFee && transaction.deliveryFee > 0) {
            doc.text('Delivery Fee:', 150, yPos);
            doc.text(`${currencySymbol}${transaction.deliveryFee.toFixed(2)}`, 180, yPos);
            yPos += 6;
        }

        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 150, yPos);
        doc.text(`${currencySymbol}${transaction.total.toFixed(2)}`, 180, yPos);

        // Payment Status
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment Status: ${transaction.status || 'Completed'}`, 20, yPos);

        // Footer
        yPos += 20;
        doc.setFontSize(9);
        doc.text(businessProfile.receiptFooter || 'Thank you for your business!', 20, yPos);

        // Save PDF
        doc.save(`Invoice_${transaction.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    const subtotal = transaction.total - (transaction.deliveryFee || 0);

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <h2 className="text-2xl font-black text-[#0F172A]">{transaction.status === 'paid' ? 'Sale Receipt' : 'Invoice'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Invoice Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 print:p-0" id="invoice-content">
                    <div className="space-y-8">
                        {/* Business Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                {businessProfile.logo && (
                                    <img src={businessProfile.logo} alt={businessProfile.name} className="h-12 mb-3" />
                                )}
                                <h3 className="text-2xl font-black text-[#0F172A]">{businessProfile.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{businessProfile.email}</p>
                                <p className="text-sm text-slate-500">{businessProfile.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">{transaction.status === 'paid' ? 'Receipt' : 'Invoice'}</p>
                                <p className="text-lg font-mono font-bold text-[#0F172A] mt-1">
                                    #{transaction.id.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-sm text-slate-500 mt-2">{invoiceDate}</p>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-slate-50 rounded-2xl p-5">
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-2">Bill To</p>
                            <p className="text-lg font-bold text-[#0F172A]">{transaction.customerHandle}</p>
                        </div>

                        {/* Items Table */}
                        <div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="text-left py-3 text-xs uppercase tracking-widest text-slate-500 font-black">Item</th>
                                        <th className="text-center py-3 text-xs uppercase tracking-widest text-slate-500 font-black">Qty</th>
                                        <th className="text-right py-3 text-xs uppercase tracking-widest text-slate-500 font-black">Price</th>
                                        <th className="text-right py-3 text-xs uppercase tracking-widest text-slate-500 font-black">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transaction.items && transaction.items.length > 0 ? (
                                        transaction.items.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-100">
                                                <td className="py-4 font-medium text-[#0F172A]">{item.productName}</td>
                                                <td className="py-4 text-center font-mono">{item.quantity}</td>
                                                <td className="py-4 text-right font-mono">
                                                    {currencySymbol}{(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 text-right font-mono font-bold">
                                                    {currencySymbol}{(item.quantity * (item.unitPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="border-b border-slate-100">
                                            <td className="py-4 font-medium text-[#0F172A]">{transaction.productName}</td>
                                            <td className="py-4 text-center font-mono">{transaction.quantity}</td>
                                            <td className="py-4 text-right font-mono">
                                                {currencySymbol}{(transaction.total / transaction.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 text-right font-mono font-bold">
                                                {currencySymbol}{transaction.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-mono font-bold">{currencySymbol}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {transaction.deliveryFee && transaction.deliveryFee > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Delivery Fee</span>
                                    <span className="font-mono font-bold">{currencySymbol}{transaction.deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
                                <span className="text-lg font-black text-[#0F172A]">Total</span>
                                <span className="text-2xl font-black text-[#0F172A] font-mono">
                                    {currencySymbol}{transaction.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                            <p className="text-sm font-bold text-emerald-700">
                                Payment Status: <span className="uppercase">{transaction.status || 'Completed'}</span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-6 border-t border-slate-200">
                            <p className="text-sm text-slate-500">{businessProfile.receiptFooter}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-100 bg-slate-50/30 flex-shrink-0 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 h-14 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        <Printer size={20} />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-8 h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl hover:shadow-lg active:scale-95 transition-all"
                    >
                        <Download size={20} />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
