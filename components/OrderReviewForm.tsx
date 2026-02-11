import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ExtractedSale, BusinessProfile, Product, Customer, OrderItem, SalesSource } from '../types';

interface OrderReviewFormProps {
    extractedSale: ExtractedSale;
    onChange: (updated: ExtractedSale) => void;
    businessProfile: BusinessProfile;
    products: Product[];
    customers: Customer[];
}

export const OrderReviewForm: React.FC<OrderReviewFormProps> = ({
    extractedSale,
    onChange,
    businessProfile,
    products,
    customers
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

    const updateField = (field: keyof ExtractedSale, value: any) => {
        onChange({ ...extractedSale, [field]: value });
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const updatedItems = [...(extractedSale.orderItems || [])];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const total = subtotal + (extractedSale.deliveryFee || 0);

        onChange({
            ...extractedSale,
            orderItems: updatedItems,
            total
        });
    };

    const addItem = () => {
        const newItem: OrderItem = {
            productName: '',
            quantity: 1,
            unitPrice: 0
        };
        const updatedItems = [...(extractedSale.orderItems || []), newItem];
        onChange({ ...extractedSale, orderItems: updatedItems });
    };

    const removeItem = (index: number) => {
        const updatedItems = extractedSale.orderItems.filter((_, i) => i !== index);
        const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const total = subtotal + (extractedSale.deliveryFee || 0);

        onChange({
            ...extractedSale,
            orderItems: updatedItems,
            total
        });
    };

    const updateDeliveryFee = (fee: number) => {
        const subtotal = (extractedSale.orderItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const total = subtotal + fee;

        onChange({
            ...extractedSale,
            deliveryFee: fee,
            total
        });
    };

    const validate = (): boolean => {
        const newErrors: string[] = [];

        if (!extractedSale.customerName?.trim()) {
            newErrors.push('Customer name is required');
        }
        if (!extractedSale.orderItems || extractedSale.orderItems.length === 0) {
            newErrors.push('At least one item is required');
        }
        extractedSale.orderItems?.forEach((item, i) => {
            if (!item.productName?.trim()) {
                newErrors.push(`Item ${i + 1}: Product name is required`);
            }
            if (item.quantity <= 0) {
                newErrors.push(`Item ${i + 1}: Quantity must be positive`);
            }
            if (item.unitPrice < 0) {
                newErrors.push(`Item ${i + 1}: Price cannot be negative`);
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    return (
        <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Customer Name *
                </label>
                <input
                    type="text"
                    value={extractedSale.customerName || ''}
                    onChange={e => updateField('customerName', e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                    placeholder="Enter customer name"
                />
            </div>

            {/* Order Items */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Order Items *
                    </label>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] text-[#0F172A] font-bold text-sm rounded-xl hover:shadow-md active:scale-95 transition-all"
                    >
                        <Plus size={16} />
                        Add Item
                    </button>
                </div>

                {extractedSale.orderItems?.map((item, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-3">
                                <input
                                    type="text"
                                    value={item.productName}
                                    onChange={e => updateItem(index, 'productName', e.target.value)}
                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                                    placeholder="Product name"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-mono font-bold text-[#0F172A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                            Unit Price ({currency})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-mono font-bold text-[#0F172A]"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 font-bold">Subtotal: </span>
                                    <span className="text-sm font-black text-[#0F172A] font-mono">
                                        {currency}{(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                                <Trash2 size={18} className="text-slate-400 group-hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}

                {(!extractedSale.orderItems || extractedSale.orderItems.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No items added yet. Click "Add Item" to get started.
                    </div>
                )}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Delivery Fee ({currency})
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={extractedSale.deliveryFee || 0}
                        onChange={e => {
                            const fee = parseFloat(e.target.value) || 0;
                            updateDeliveryFee(fee);
                        }}
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-mono font-bold text-[#0F172A]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Payment Method
                    </label>
                    <select
                        value={extractedSale.paymentMethod || 'cash'}
                        onChange={e => updateField('paymentMethod', e.target.value)}
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                    >
                        <option value="cash">Cash</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="wallet">Mobile Wallet</option>
                    </select>
                </div>
            </div>

            {/* Platform/Source */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Platform/Source
                </label>
                <select
                    value={extractedSale.platform || 'whatsapp'}
                    onChange={e => updateField('platform', e.target.value as SalesSource)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="in-person">In-Person</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {/* Total */}
            <div className="bg-[#2DD4BF]/10 border-2 border-[#2DD4BF] rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Total Amount</span>
                    <span className="text-3xl font-black text-[#0F172A] font-mono">
                        {currency}{(extractedSale.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertCircle size={18} />
                        <span>Please fix the following errors:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {errors.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
