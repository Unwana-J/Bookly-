
import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  LayoutDashboard,
  Sparkles,
  Wallet,
  History,
  AlertTriangle,
  X,
  LogOut,
  ChevronRight,
  Bell,
  Check,
  CreditCard,
  BookText,
  TrendingUp,
  Package
} from 'lucide-react';
import { Product, Customer, Transaction, AppView, SalesSource, ExtractedSale, ExtractedProduct, BusinessProfile, Expense, ExtractedExpense, FilterState, Notification, TransactionStatus, WalletProfile, WalletTransaction } from './types';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import HoverBot from './components/HoverBot';
import Expenses from './components/Expenses';
import SalesView from './components/SalesView';
import LedgerView from './components/LedgerView';
import AssetsView from './components/AssetsView';
import AddProductModal from './components/AddProductModal';
import AddCustomerModal from './components/AddCustomerModal';
import InvoiceModal from './components/InvoiceModal';
import EditTransactionModal from './components/EditTransactionModal';
import ConfirmSaleModal from './components/ConfirmSaleModal';
import ManualEntryModal from './components/ManualEntryModal';
import { InvoiceGenerator } from './components/InvoiceGenerator';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isHoverBotActive, setIsHoverBotActive] = useState(false);
  const [isMobileFloatingBotOpen, setIsMobileFloatingBotOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isManualSaleModalOpen, setIsManualSaleModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingSale, setPendingSale] = useState<ExtractedSale | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    customerHandles: [], platforms: [], status: [], dateRange: { start: '', end: '' }, months: [], productNames: [], tiers: []
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const notify = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    if (businessProfile && !businessProfile.notificationsEnabled) return;
    const newNote: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title, message, type, timestamp: Date.now()
    };
    setNotifications(prev => [newNote, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNote.id));
    }, 5000);
  };

  const handleWalletCreate = (data: any) => {
    if (!businessProfile) return;

    const newWallet: WalletProfile = {
      id: Math.random().toString(36).substr(2, 9),
      enabled: true,
      balance: 0,
      currency: businessProfile.currency,
      accountName: data.businessName,
      accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bankName: 'Bookly Bank',
      kycStatus: 'verified',
      kycData: {
        fullName: data.fullName,
        dob: data.dob,
        bvn: data.bvn
      },
      pinSet: true,
      transactions: []
    };

    setBusinessProfile({
      ...businessProfile,
      wallet: newWallet
    });

    notify('Wallet Created!', `Your business wallet ${newWallet.accountNumber} is now active.`, 'success');
  };

  const handleWalletTransfer = (amount: number, recipient: string, category: string, description: string) => {
    if (!businessProfile?.wallet) return;

    const newTransaction: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      type: 'debit',
      description,
      timestamp: new Date().toISOString(),
      reference: `TXN${Date.now()}`,
      status: 'success',
      category: category as any,
      recipient
    };

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      category: category as any,
      description,
      timestamp: new Date().toISOString()
    };

    setBusinessProfile({
      ...businessProfile,
      wallet: {
        ...businessProfile.wallet,
        balance: businessProfile.wallet.balance - amount,
        transactions: [newTransaction, ...businessProfile.wallet.transactions]
      }
    });

    setExpenses(prev => [newExpense, ...prev]);
    notify('Transfer Complete', `${businessProfile.currency} ${amount.toFixed(2)} sent to ${recipient}`, 'success');
  };

  const handleLogout = () => {
    setBusinessProfile(null);
    setView('onboarding');
    setIsHoverBotActive(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.isArchived) return false;
      if (filters.platforms.length > 0 && !filters.platforms.includes(t.source)) return false;
      if (filters.status.length > 0 && !filters.status.includes(t.status)) return false;
      if (filters.productNames.length > 0 && !filters.productNames.includes(t.productName)) return false;
      if (filters.customerHandles.length > 0 && !filters.customerHandles.includes(t.customerHandle)) return false;
      return true;
    });
  }, [transactions, filters]);

  const commitSale = (saleData: ExtractedSale) => {
    const timestamp = new Date().toISOString();
    const newTransactions: Transaction[] = [];

    // Handle new flat format or legacy customers array
    const ordersToProcess = saleData.orderItems ? [{
      handle: saleData.customerName || saleData.customerHandle || 'Customer',
      items: saleData.orderItems,
      deliveryFee: saleData.deliveryFee || 0,
      paymentMethod: saleData.paymentMethod || 'Cash/Transfer',
      platform: saleData.platform || 'WhatsApp',
      orderTotal: saleData.total
    }] : (saleData as any).customers || [];

    ordersToProcess.forEach((customer: any) => {
      const source = customer.platform || businessProfile?.defaultSalesSource || 'WhatsApp';
      const paymentMethod = customer.paymentMethod || 'Cash/Transfer';
      const deliveryFee = customer.deliveryFee || 0;
      const feePercent = paymentMethod === 'Bookly Wallet' ? 0.025 : 0;

      const items = customer.items || customer.orderItems || [];

      items.forEach((item: any) => {
        const productName = item.productName || '';
        const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase())) || products[0] || { id: 'temp', price: 0, costPrice: 0, name: productName };
        const qty = item.quantity || 1;

        const basePrice = typeof item.unitPrice === 'number' ? item.unitPrice : product.price;
        const subtotal = basePrice * qty;
        const fee = subtotal * feePercent;
        const total = subtotal + fee + (newTransactions.length === 0 ? deliveryFee : 0);

        const newT: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          customerId: 'new',
          customerHandle: customer.handle || customer.customerName || 'Customer',
          productId: product.id,
          productName: product.name || productName,
          quantity: qty,
          total,
          costTotal: (product.costPrice || 0) * qty,
          deliveryFee: newTransactions.length === 0 ? deliveryFee : 0,
          timestamp,
          status: 'confirmed',
          source: source as any,
          paymentMethod,
          fee,
          isArchived: false,
          editHistory: [],
          items: items.map((i: any) => ({
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          }))
        };

        newTransactions.push(newT);

        if (product.id !== 'temp') {
          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - qty), totalSales: p.totalSales + qty } : p));
        }
      });

      const handle = customer.handle || customer.customerName || 'Customer';
      const existingC = customers.find(c => c.handle === handle);
      const val = customer.orderTotal || 0;
      if (existingC) {
        setCustomers(prev => prev.map(c => c.handle === handle ? { ...c, orderCount: c.orderCount + 1, ltv: c.ltv + val, lastActive: 'Just now' } : c));
      } else if (handle) {
        setCustomers(prev => [{ id: Math.random().toString(36).substr(2, 9), handle: handle, name: handle.replace('@', ''), orderCount: 1, ltv: val, channel: source, lastActive: 'Just now' }, ...prev]);
        notify("New Customer", `Profile created for ${handle}`, "info");
      }
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
      setViewingTransaction(newTransactions[0]);
      setShowInvoice(true); // Automatically show invoice for the new order
      notify("Order Finalized", `${newTransactions.length} items logged successfully.`, "success");
    }

    setPendingSale(null);
    setIsHoverBotActive(false);
  };

  const handleUpdateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    notify("Ledger Updated", `Transaction ${id.substr(0, 4)} marked as ${status}`, "success");
  };

  const handleUpdateStock = (newProducts: Product[]) => {
    setProducts(newProducts);
    notify("Stock Updated", "Inventory changes saved.", "success");
  };

  if (view === 'onboarding') {
    return <Onboarding onComplete={(profile) => {
      setBusinessProfile({ ...profile, notificationsEnabled: true });
      setView('dashboard');
    }} />;
  }

  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#0F172A] font-sans flex flex-col md:flex-row">

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
        {notifications.map(note => (
          <div key={note.id} className="pointer-events-auto bg-[#0f0f0f] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px] animate-in slide-in-from-right duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${note.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-400'}`}>
              {note.type === 'success' ? <Check size={20} /> : <Bell size={20} />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{note.title}</h4>
              <p className="text-xs text-slate-400">{note.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-24 lg:w-32 fixed left-0 top-0 bottom-0 bg-[#0F172A] border-r border-white/10 items-center py-8 z-[50]">
        <div className="mb-12">
          <div className="w-12 h-12 bg-[#2DD4BF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)]">
            <span className="text-[#0F172A] font-black text-xl">B.</span>
          </div>
        </div>

        <div className="space-y-4 w-full px-4 flex flex-col items-center">
          <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={24} />} onClick={() => setView('dashboard')} label="Overview" />
          <NavItem active={view === 'finance'} icon={<TrendingUp size={24} />} onClick={() => setView('finance')} label="Finance" />
          <NavItem active={view === 'assets'} icon={<ShoppingBag size={24} />} onClick={() => setView('assets')} label="Assets" />
          <NavItem active={view === 'orders'} icon={<Package size={24} />} onClick={() => setView('orders')} label="Orders" />
          <NavItem active={view === 'settings'} icon={<SettingsIcon size={24} />} onClick={() => setView('settings')} label="Setup" />

          <div className="mt-auto space-y-4">
            <button
              onClick={() => setIsHoverBotActive(!isHoverBotActive)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isHoverBotActive ? 'bg-[#2DD4BF] text-[#0F172A]' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
            >
              <Sparkles size={24} />
            </button>
            <button onClick={handleLogout} className="w-12 h-12 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-500/20 transition-all"><LogOut size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0F172A] border-t border-white/10 flex items-center justify-around px-6 z-[200]">
        <MobileNavItem active={view === 'dashboard'} icon={<LayoutDashboard size={24} />} onClick={() => setView('dashboard')} />
        <MobileNavItem active={view === 'finance'} icon={<TrendingUp size={24} />} onClick={() => setView('finance')} />
        <MobileNavItem active={view === 'assets'} icon={<ShoppingBag size={24} />} onClick={() => setView('assets')} />
        <MobileNavItem active={view === 'orders'} icon={<Package size={24} />} onClick={() => setView('orders')} />
        <MobileNavItem active={view === 'settings'} icon={<SettingsIcon size={24} />} onClick={() => setView('settings')} />
      </nav>

      {/* Mobile Floating AI Bot Modal */}
      {isMobileFloatingBotOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[300] flex items-end">
          <div className="w-full bg-[#0F172A] rounded-t-3xl border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2DD4BF] rounded-lg flex items-center justify-center">
                  <Sparkles size={20} className="text-[#0F172A]" />
                </div>
                <h3 className="text-white font-black">AI Assistant</h3>
              </div>
              <button onClick={() => setIsMobileFloatingBotOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="h-[60vh] overflow-hidden">
              <HoverBot inventory={products} onConfirmSale={(s) => { setPendingSale(s); setIsMobileFloatingBotOpen(false); }} onConfirmProduct={(p) => { handleUpdateStock([...products, { ...p, id: Math.random().toString(), totalSales: 0 }]); setIsMobileFloatingBotOpen(false); }} onConfirmExpense={(e) => { setExpenses(prev => [{ ...e, id: Math.random().toString(), timestamp: new Date().toISOString() }, ...prev]); setIsMobileFloatingBotOpen(false); }} isActive={true} setIsActive={setIsMobileFloatingBotOpen} businessProfile={businessProfile} customers={customers} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating AI Bot Button */}
      <button
        onClick={() => setIsMobileFloatingBotOpen(!isMobileFloatingBotOpen)}
        className="md:hidden fixed bottom-24 right-6 z-[250] w-14 h-14 rounded-2xl bg-[#2DD4BF] text-[#0F172A] flex items-center justify-center shadow-2xl hover:shadow-xl transition-all"
      >
        <Sparkles size={28} />
      </button>

      <main className="flex-1 px-6 md:px-8 md:pl-28 lg:pl-32 max-w-[1440px] mx-auto w-full pt-16 md:pt-16 pb-32 md:pb-8 min-h-screen">
        {view === 'dashboard' && <Dashboard products={products} customers={customers} transactions={filteredTransactions.filter(t => !t.isArchived)} expenses={expenses} onNavigate={setView} businessProfile={businessProfile} onOpenManualSale={() => setIsManualSaleModalOpen(true)} />}
        {view === 'finance' && (
          <LedgerView
            transactions={transactions}
            expenses={expenses}
            filters={filters}
            setFilters={setFilters}
            products={products}
            customers={customers}
            vipThreshold={businessProfile?.vipThreshold || 5}
            onViewInvoice={setViewingTransaction}
            onArchive={(id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t))}
            onEdit={setEditingTransaction}
            currency={currency}
            onStatusChange={handleUpdateTransactionStatus}
            onAddExpense={(e) => setExpenses(prev => [{ ...e, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...prev])}
            businessProfile={businessProfile!}
            onWalletCreate={handleWalletCreate}
            onWalletTransfer={handleWalletTransfer}
          />
        )}
        {view === 'assets' && (
          <AssetsView
            products={products}
            customers={customers}
            transactions={transactions}
            onOpenAddProduct={() => setIsAddProductModalOpen(true)}
            onOpenAddCustomer={() => setIsAddCustomerModalOpen(true)}
            setProducts={handleUpdateStock}
            businessProfile={businessProfile}
            onViewInvoice={setViewingTransaction}
          />
        )}
        {view === 'orders' && (
          <SalesView
            transactions={transactions}
            filters={filters}
            setFilters={setFilters}
            products={products}
            customers={customers}
            vipThreshold={businessProfile?.vipThreshold || 5}
            onViewInvoice={setViewingTransaction}
            onArchive={(id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t))}
            onEdit={setEditingTransaction}
            currency={currency}
            onStatusChange={handleUpdateTransactionStatus}
            onAddOrder={order => {
              const id = 'order_' + Math.random().toString(36).substr(2, 9);
              const now = new Date().toISOString();
              const transaction: Transaction = {
                id,
                customerId: '',
                customerHandle: order.customerName || 'Walk-in Customer',
                productId: '',
                productName: order.product,
                quantity: order.quantity,
                total: order.total,
                costTotal: 0,
                deliveryFee: 0,
                timestamp: now,
                status: order.isPaid ? 'paid' : 'unpaid',
                source: order.source as SalesSource,
                paymentMethod: order.isPaid ? 'Cash/Transfer' : 'Bookly Wallet',
                editHistory: [],
                items: [{ productName: order.product, quantity: order.quantity, unitPrice: order.unitPrice }],
                isArchived: false,
                fee: 0
              };
              setTransactions(prev => [transaction, ...prev]);

              // Sync product stock and sales
              setProducts(prev => prev.map(p =>
                p.name === order.product ? { ...p, stock: Math.max(0, p.stock - order.quantity), totalSales: p.totalSales + order.quantity } : p
              ));

              // Auto-generate document
              if (order.isPaid) {
                setViewingTransaction(transaction); // Receipt
              } else {
                setViewingTransaction(transaction); // Invoice
              }
            }}
          />
        )}
        {view === 'crm' && <CRM customers={customers} transactions={transactions} businessProfile={businessProfile} onOpenAddCustomer={() => setIsAddCustomerModalOpen(true)} onViewInvoice={setViewingTransaction} />}
        {view === 'inventory' && <Inventory products={products} setProducts={handleUpdateStock} onOpenAddProduct={() => setIsAddProductModalOpen(true)} businessProfile={businessProfile} />}
        {view === 'settings' && <Settings businessProfile={businessProfile} setBusinessProfile={setBusinessProfile} />}
      </main>

      <>
        <HoverBot inventory={products} onConfirmSale={(s) => setPendingSale(s)} onConfirmProduct={(p) => handleUpdateStock([...products, { ...p, id: Math.random().toString(), totalSales: 0 }])} onConfirmExpense={(e) => setExpenses(prev => [{ ...e, id: Math.random().toString(), timestamp: new Date().toISOString() }, ...prev])} isActive={isHoverBotActive} setIsActive={setIsHoverBotActive} businessProfile={businessProfile} customers={customers} />
        <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onAdd={(p) => handleUpdateStock([...products, { ...p, id: Math.random().toString(), totalSales: 0 }])} />
        <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} onAdd={(c) => setCustomers(prev => [{ ...c, id: Math.random().toString(), orderCount: 0, ltv: 0, lastActive: 'New' }, ...prev])} />
        <ManualEntryModal isOpen={isManualSaleModalOpen} onClose={() => setIsManualSaleModalOpen(false)} inventory={products} onConfirm={(s) => setPendingSale(s)} businessProfile={businessProfile} customers={customers} />
        <InvoiceModal isOpen={!!viewingTransaction} onClose={() => setViewingTransaction(null)} transaction={viewingTransaction} businessProfile={businessProfile} customer={customers.find(c => c.handle === viewingTransaction?.customerHandle) || null} />
        {editingTransaction && <EditTransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} transaction={editingTransaction} onUpdate={(id, updates) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))} />}
        {viewingTransaction && showInvoice && businessProfile && (
          <InvoiceGenerator
            transaction={viewingTransaction}
            businessProfile={businessProfile}
            onClose={() => setShowInvoice(false)}
          />
        )}
        {pendingSale && <ConfirmSaleModal isOpen={!!pendingSale} onClose={() => setPendingSale(null)} onConfirm={(editedData) => commitSale(editedData)} saleData={pendingSale} products={products} businessProfile={businessProfile} />}
      </>
    </>
  );
};

const NavItem: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void, label: string }> = ({ active, icon, onClick, label }) => (
  <button onClick={onClick} className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${active ? 'bg-[#2DD4BF] text-[#0F172A]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
    {icon}
    <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[200]">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${active ? 'bg-[#2DD4BF] text-[#0F172A]' : 'text-slate-400'}`}>{icon}</button>
);

export default App;
