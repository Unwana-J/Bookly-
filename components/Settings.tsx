
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
  Layout,
  ToggleLeft,
  ToggleRight,
  Eye,
  TrendingUp,
  Trophy,
  Zap,
  Package,
  PieChart
} from 'lucide-react';
import { BusinessProfile, SalesSource, DashboardWidgets } from '../types';

interface SettingsProps {
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
}

type EditSection = 'profile' | 'branding' | 'financials' | 'notifications' | 'security' | 'platforms' | 'widgets' | 'overlay' | 'none';

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const Settings: React.FC<SettingsProps> = ({ businessProfile, setBusinessProfile }) => {
  const [activeEdit, setActiveEdit] = useState<EditSection>('none');

  if (!businessProfile) return null;

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBusinessProfile({
      ...businessProfile,
      defaultSalesSource: e.target.value as SalesSource
    });
  };


  const toggleNotifications = () => {
    setBusinessProfile({
      ...businessProfile,
      notificationsEnabled: !businessProfile.notificationsEnabled
    });
  };

  const handleSave = (updates: Partial<BusinessProfile>) => {
    const updatedProfile = {
      ...businessProfile,
      ...updates
    };

    // If currency is being updated and wallet exists, update wallet currency too
    if (updates.currency && businessProfile.wallet) {
      updatedProfile.wallet = {
        ...businessProfile.wallet,
        currency: updates.currency
      };
    }

    setBusinessProfile(updatedProfile);
    setActiveEdit('none');
  };

  const toggleWidget = (key: keyof DashboardWidgets) => {
    setBusinessProfile({
      ...businessProfile,
      dashboardWidgets: {
        ...businessProfile.dashboardWidgets,
        [key]: !businessProfile.dashboardWidgets[key]
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your professional identity and data rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SectionTitle title="Business Profile" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <SettingsItem icon={<Store size={20} />} label="Identity" sub={businessProfile.name} onClick={() => setActiveEdit('profile')} />
            <SettingsItem icon={<Palette size={20} />} label="Branding" sub="Logo & Receipt Customization" onClick={() => setActiveEdit('branding')} />
          </div>

          <SectionTitle title="Dashboard Layout" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm p-2">
            <div className="space-y-1">
              <WidgetToggle
                icon={<Eye size={18} />}
                label="Summary Stat Cards"
                active={businessProfile.dashboardWidgets?.statCards}
                onToggle={() => toggleWidget('statCards')}
              />
              <WidgetToggle
                icon={<TrendingUp size={18} />}
                label="Revenue Trend Chart"
                active={businessProfile.dashboardWidgets?.revenueTrend}
                onToggle={() => toggleWidget('revenueTrend')}
              />
              <WidgetToggle
                icon={<Trophy size={18} />}
                label="Top Performer Badge"
                active={businessProfile.dashboardWidgets?.topPerformer}
                onToggle={() => toggleWidget('topPerformer')}
              />
              <WidgetToggle
                icon={<Zap size={18} />}
                label="Quick Action Buttons"
                active={businessProfile.dashboardWidgets?.quickActions}
                onToggle={() => toggleWidget('quickActions')}
              />
              <WidgetToggle
                icon={<Package size={18} />}
                label="Inventory Health Status"
                active={businessProfile.dashboardWidgets?.inventoryHealth}
                onToggle={() => toggleWidget('inventoryHealth')}
              />
              <WidgetToggle
                icon={<PieChart size={18} />}
                label="Channel Split Pie Chart"
                active={businessProfile.dashboardWidgets?.channels}
                onToggle={() => toggleWidget('channels')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle title="Financials & Rules" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <SettingsItem icon={<CreditCard size={20} />} label="Currency" sub={businessProfile.currency} onClick={() => setActiveEdit('financials')} />
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center"><Tag size={20} /></div>
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

          <SectionTitle title="Preferences & Notifications" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><Bell size={20} /></div>
                <div>
                  <p className="font-bold text-sm">In-app Notifications</p>
                  <p className="text-xs text-gray-500">Sale, Stock & CRM alerts</p>
                </div>
              </div>
              <button onClick={toggleNotifications} className={`w-12 h-6 rounded-full relative transition-colors ${businessProfile.notificationsEnabled ? 'bg-[#2DD4BF]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${businessProfile.notificationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <SettingsItem icon={<Smartphone size={20} />} label="Social App Overlay" sub="Manage floating icon visibility on social apps" onClick={() => setActiveEdit('overlay')} />
            <SettingsItem icon={<Lock size={20} />} label="Storage Mode" sub={businessProfile.persistenceMode === 'cloud' ? 'Cloud Sync Enabled' : 'Local Device Only'} onClick={() => setActiveEdit('security')} />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Compliance Shield Active</span>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed italic">Last updated: {businessProfile.consentTimestamp ? new Date(businessProfile.consentTimestamp).toLocaleDateString() : 'Initial Setup'}</p>
            </div>
          </div>
        </div>
      </div>


      <SettingsModal
        isOpen={activeEdit !== 'none'}
        section={activeEdit}
        onClose={() => setActiveEdit('none')}
        profile={businessProfile}
        onSave={handleSave}
      />
    </div >
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">{title}</h2>
);

const SettingsItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => (
  <button onClick={onClick} className="w-full p-5 flex items-center justify-between hover:bg-[#0F172A]/[0.02] transition-all group text-left">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-[#0F172A]/5 text-[#0F172A] rounded-xl flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">{icon}</div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

const WidgetToggle: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onToggle: () => void }> = ({ icon, label, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
    </div>
    <button
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-[#2DD4BF]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  </div>
);

export default Settings;

const SettingsModal: React.FC<{
  isOpen: boolean;
  section: EditSection;
  onClose: () => void;
  profile: BusinessProfile;
  onSave: (updates: Partial<BusinessProfile>) => void;
}> = ({ isOpen, section, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logo: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  // Reset form when section changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({});
    }
  }, [isOpen, section]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getTitle = () => {
    switch (section) {
      case 'profile': return 'Edit Identity';
      case 'branding': return 'Brand Customization';
      case 'financials': return 'Financial Settings';
      case 'security': return 'Data Security';
      case 'overlay': return 'Social App Overlay';
      default: return 'Settings';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-[#0F172A]">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {section === 'profile' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Name</label>
                <input
                  type="text"
                  defaultValue={profile.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-bold text-[#0F172A]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  defaultValue={profile.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={profile.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                />
              </div>
            </>
          )}

          {section === 'branding' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receipt Footer Message</label>
                <input
                  type="text"
                  defaultValue={profile.receiptFooter}
                  onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                  placeholder="Thank you for your patronage!"
                />
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2 cursor-pointer hover:bg-slate-100 hover:border-[#2DD4BF] transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {formData.logo || profile.logo ? (
                  <>
                    <img src={formData.logo || profile.logo} alt="Business Logo" className="w-16 h-16 mx-auto rounded-xl object-cover border border-slate-200" />
                    <p className="text-xs font-bold text-slate-600">Click to change logo</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                      <Camera size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Upload Logo</p>
                    <p className="text-[10px] text-slate-400">Recommended: 500x500px PNG</p>
                  </>
                )}
              </div>
            </>
          )}

          {section === 'financials' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Store Currency</label>
              <select
                defaultValue={profile.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
              >
                <option value="NGN">NGN (Nigerian Naira)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GHS">GHS (Ghanaian Cedi)</option>
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="ZAR">ZAR (South African Rand)</option>
              </select>
            </div>
          )}

          {section === 'security' && (
            <div className="space-y-4">
              <div
                onClick={() => setFormData({ ...formData, persistenceMode: 'cloud' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${formData.persistenceMode === 'cloud' || (!formData.persistenceMode && profile.persistenceMode === 'cloud') ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]' : 'bg-white border-slate-200 hover:border-[#2DD4BF]/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Cloud size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">Cloud Sync</p>
                    <p className="text-xs text-slate-500">Backup data to secure server</p>
                  </div>
                </div>
                {(formData.persistenceMode === 'cloud' || (!formData.persistenceMode && profile.persistenceMode === 'cloud')) && <Check size={20} className="text-[#2DD4BF]" />}
              </div>

              <div
                onClick={() => setFormData({ ...formData, persistenceMode: 'local' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${formData.persistenceMode === 'local' || (!formData.persistenceMode && profile.persistenceMode === 'local') ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]' : 'bg-white border-slate-200 hover:border-[#2DD4BF]/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">Local Device Only</p>
                    <p className="text-xs text-slate-500">Data never leaves this browser</p>
                  </div>
                </div>
                {(formData.persistenceMode === 'local' || (!formData.persistenceMode && profile.persistenceMode === 'local')) && <Check size={20} className="text-[#2DD4BF]" />}
              </div>
            </div>
          )}

          {section === 'overlay' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Select the social media apps where you want the Bookly AI floating icon to appear.
                When deactivated, the overlay will be hidden for that specific app.
              </p>

              {[
                { key: 'instagram', label: 'Instagram' },
                { key: 'whatsapp', label: 'WhatsApp' },
                { key: 'tiktok', label: 'TikTok' },
                { key: 'twitter', label: '(X) Twitter' }
              ].map((app) => (
                <div key={app.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-[#0F172A]">{app.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentOverlay = formData.socialOverlay || profile.socialOverlay || { instagram: true, whatsapp: true, tiktok: true, twitter: true };
                      setFormData({
                        ...formData,
                        socialOverlay: {
                          ...currentOverlay,
                          [app.key]: !currentOverlay[app.key as keyof typeof currentOverlay]
                        }
                      });
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors ${(formData.socialOverlay || profile.socialOverlay || { instagram: true, whatsapp: true, tiktok: true, twitter: true })[app.key as keyof typeof formData.socialOverlay] ? 'bg-[#2DD4BF]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${(formData.socialOverlay || profile.socialOverlay || { instagram: true, whatsapp: true, tiktok: true, twitter: true })[app.key as keyof typeof formData.socialOverlay] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-16 bg-[#2DD4BF] text-[#0F172A] font-black rounded-3xl flex items-center justify-center space-x-2 mt-2 hover:shadow-lg hover:bg-[#20c9e6] active:scale-95 transition-all"
          >
            <Check size={20} />
            <span>Save Changes</span>
          </button>
        </form>
      </div >
    </div >
  );
};
