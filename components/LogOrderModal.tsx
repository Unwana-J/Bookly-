import React, { useState } from 'react';
import { Product, Customer } from '../types';

interface LogOrderModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSubmit: (order: any) => void;
}


const SOURCES = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const LogOrderModal: React.FC<LogOrderModalProps> = ({ open, onClose, products, customers, onSubmit }) => {
  const [isPaid, setIsPaid] = useState(true);
  const [source, setSource] = useState('WhatsApp');
  const [productInput, setProductInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showAddToInventory, setShowAddToInventory] = useState(false);

  // Filter products for dropdown search
  const filteredProducts = productInput
    ? products.filter(p => p.name.toLowerCase().includes(productInput.toLowerCase()))
    : products;

  // Handle product selection or custom entry
  const handleProductChange = (value: string) => {
    setProductInput(value);
    const found = products.find(p => p.name.toLowerCase() === value.toLowerCase());
    if (found) {
      setSelectedProduct(found);
      setUnitPrice(found.unitPrice || 0);
    } else {
      setSelectedProduct(null);
      setUnitPrice(0);
    }
  };

  // Handle Save
  const handleSave = () => {
    const isCustom = !selectedProduct && productInput.trim() !== '';
    if (isCustom) setShowAddToInventory(true);
    const order = {
      product: selectedProduct ? selectedProduct.name : productInput,
      isCustom,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      customerName,
      date,
      isPaid,
      source,
    };
    onSubmit(order);
    onClose();
  };

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl relative max-h-[85vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Add New Order</h2>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {/* Payment Status Toggle */}
          <div className="flex items-center gap-4">
            <label className="font-semibold">Payment Status:</label>
            <button type="button" className={`px-4 py-2 rounded-l-lg font-bold ${isPaid ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`} onClick={() => setIsPaid(true)}>Paid</button>
            <button type="button" className={`px-4 py-2 rounded-r-lg font-bold ${!isPaid ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`} onClick={() => setIsPaid(false)}>Unpaid</button>
          </div>
          {/* Source Dropdown */}
          <div>
            <label className="block font-semibold mb-1">Source</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              {SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* Product Dropdown/Search */}
          <div>
            <label className="block font-semibold mb-1">Product/Service</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Search or enter product/service"
              value={productInput}
              onChange={e => handleProductChange(e.target.value)}
              list="product-list"
              required
            />
            <datalist id="product-list">
              {filteredProducts.map(p => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
          {/* Quantity */}
          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          {/* Unit Price */}
          <div>
            <label className="block font-semibold mb-1">Unit Price</label>
            <input
              type="number"
              min={0}
              className="w-full border rounded-lg px-3 py-2"
              value={unitPrice}
              onChange={e => setUnitPrice(Number(e.target.value))}
              required
            />
          </div>
          {/* Total */}
          <div>
            <label className="block font-semibold mb-1">Total</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={quantity * unitPrice}
              readOnly
            />
          </div>
          {/* Customer Name */}
          <div>
            <label className="block font-semibold mb-1">Customer Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter customer name (optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          {/* Date of Sale */}
          <div>
            <label className="block font-semibold mb-1">Date of Sale</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Save Order</button>
          </div>
        </form>
        {/* Prompt to add custom item to inventory */}
        {showAddToInventory && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p>Would you like to add this item to inventory?</p>
            <div className="flex gap-2 mt-2">
              <button className="bg-emerald-600 text-white px-4 py-1 rounded" onClick={() => { setShowAddToInventory(false); /* handle add to inventory here */ }}>Yes</button>
              <button className="bg-gray-200 px-4 py-1 rounded" onClick={() => setShowAddToInventory(false)}>No</button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default LogOrderModal;
