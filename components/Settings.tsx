
import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Globe, 
  Smartphone, 
  Bell, 
  Shield, 
  Palette,
  ChevronRight,
  Store,
  Tag,
  Star,
  X,
  Check,
  Camera,
  Mail,
  Phone as PhoneIcon,
  Cloud,
  Database,
  Lock,
  Crown,
  Layout
} from 'lucide-react';
import { BusinessProfile, SalesSource } from '../types';

interface SettingsProps {
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
}

type EditSection = 'profile' | 'branding' | 'financials' | 'notifications' | 'security' | 'platforms' | 'subscription' | 'none';

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];
const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'NGN', symbol: '₦' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'GHS', symbol: '₵' },
];

const Settings: React.FC<SettingsProps> = ({ businessProfile, setBusinessProfile }) => {
  const [activeEdit, setActiveEdit] = useState<EditSection>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!businessProfile) return null;

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBusinessProfile({
      ...businessProfile,
      defaultSalesSource: e.target.value as SalesSource
    });
  };

  const togglePlatform = (id: SalesSource) => {
    setBusinessProfile({
      ...businessProfile,
      activePlatforms: businessProfile.activePlatforms.includes(id)
        ? businessProfile.activePlatforms.filter(p => p !== id)
        : [...businessProfile.activePlatforms, id]
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert("Only JPG and PNG formats are accepted.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessProfile({ ...businessProfile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your professional identity and data rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SectionTitle title="Business Profile" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white">
            <SettingsItem 
              icon={<Store size={20} />} 
              label="Identity" 
              sub={businessProfile.name} 
              onClick={() => setActiveEdit('profile')}
            />
            <SettingsItem 
              icon={<Palette size={20} />} 
              label="Branding" 
              sub="Logo & Receipt Customization" 
              onClick={() => setActiveEdit('branding')}
            />
            <SettingsItem 
              icon={<Layout size={20} />} 
              label="Sales Platforms" 
              sub={`${businessProfile.activePlatforms.length} active channels`} 
              onClick={() => setActiveEdit('platforms')}
            />
          </div>

          <SectionTitle title="Financials & Rules" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white">
            <SettingsItem 
              icon={<CreditCard size={20} />} 
              label="Currency" 
              sub={businessProfile.currency} 
              onClick={() => setActiveEdit('financials')}
            />
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Default Channel</p>
                  <p className="text-xs text-gray-500">For unsourced orders</p>
                </div>
              </div>
              <select 
                value={businessProfile.defaultSalesSource || 'Other'}
                onChange={handleSourceChange}
                className="bg-white border border-[#0F172A]/10 rounded-xl text-xs font-bold px-3 py-2 outline-none"
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle title="Privacy & Compliance" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white">
            <div className="p-5">
               <div className="flex items-center gap-3 mb-2">
                 <Shield size={18} className="text-emerald-500" />
                 <span className="text-xs font-black uppercase tracking-widest">Compliance Active</span>
               </div>
               <p className="text-[10px] text-gray-500 leading-relaxed">
                 Consented on: <span className="font-bold">{businessProfile.consentTimestamp ? new Date(businessProfile.consentTimestamp).toLocaleDateString() : 'N/A'}</span>
               </p>
            </div>
            <SettingsItem 
              icon={<Bell size={20} />} 
              label="Stock Alerts" 
              sub={`Below ${businessProfile.stockThreshold} units`} 
              onClick={() => setActiveEdit('notifications')}
            />
            <SettingsItem 
              icon={<Lock size={20} />} 
              label="Storage" 
              sub={businessProfile.persistenceMode === 'cloud' ? 'Cloud Sync' : 'Device Only'} 
              onClick={() => setActiveEdit('security')}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {activeEdit !== 'none' && (
        <div className="fixed inset-0 z-[400] bg-[#0F172A]/40 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#0F172A]/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-[#0F172A]/5 flex items-center justify-between">
              <h3 className="text-xl font-black">{activeEdit.toUpperCase()}</h3>
              <button onClick={() => setActiveEdit('none')} className="p-2 hover:bg-[#0F172A]/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {activeEdit === 'profile' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Business Name</label>
                    <input 
                      type="text"
                      value={businessProfile.name}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                      className="w-full h-14 bg-[#0F172A]/5 border border-[#0F172A]/10 rounded-2xl px-4 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Email</label>
                    <input 
                      type="email"
                      value={businessProfile.email}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                      className="w-full h-14 bg-[#0F172A]/5 border border-[#0F172A]/10 rounded-2xl px-4 font-bold"
                    />
                  </div>
                </div>
              )}

              {activeEdit === 'branding' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-28 h-28 bg-[#0F172A]/5 border-2 border-dashed border-[#0F172A]/10 rounded-[40px] flex flex-col items-center justify-center overflow-hidden"
                    >
                      {businessProfile.logo ? (
                        <img src={businessProfile.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={28} className="text-gray-400" />
                      )}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png" onChange={handleLogoUpload} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Receipt Footer</label>
                    <textarea 
                      value={businessProfile.receiptFooter}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, receiptFooter: e.target.value })}
                      className="w-full h-32 p-4 bg-[#0F172A]/5 border border-[#0F172A]/10 rounded-2xl text-sm"
                    />
                  </div>
                </div>
              )}

              {activeEdit === 'platforms' && (
                <div className="space-y-3">
                  {SOURCES.map(source => (
                    <button 
                      key={source}
                      onClick={() => togglePlatform(source)}
                      className={`w-full h-14 px-6 rounded-2xl border flex items-center justify-between transition-all ${
                        businessProfile.activePlatforms.includes(source)
                          ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#0F172A]'
                          : 'bg-white border-[#0F172A]/10 text-gray-400'
                      }`}
                    >
                      <span className="font-bold text-sm">{source}</span>
                      {businessProfile.activePlatforms.includes(source) && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}

              {activeEdit === 'financials' && (
                <div className="space-y-2">
                  {CURRENCIES.map(curr => (
                    <button 
                      key={curr.code}
                      onClick={() => setBusinessProfile({ ...businessProfile, currency: curr.code })}
                      className={`w-full h-14 px-6 rounded-2xl border flex items-center justify-between ${
                        businessProfile.currency === curr.code ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]' : 'bg-white border-[#0F172A]/10'
                      }`}
                    >
                      <span className="font-bold">{curr.code} ({curr.symbol})</span>
                      {businessProfile.currency === curr.code && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-[#0F172A]/5">
              <button 
                onClick={() => setActiveEdit('none')}
                className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">{title}</h2>
);

const SettingsItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full p-5 flex items-center justify-between hover:bg-[#0F172A]/[0.02] transition-all group"
  >
    <div className="flex items-center space-x-4 text-left">
      <div className="w-10 h-10 bg-[#0F172A]/5 text-[#0F172A] rounded-xl flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

export default Settings;
