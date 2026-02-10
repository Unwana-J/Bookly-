import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft,
  Smartphone, 
  Zap, 
  Mail,
  Camera,
  Briefcase,
  User,
  Fingerprint,
  Lock,
  ArrowLeft,
  X,
  Globe,
  Loader2,
  Check,
  Eye,
  EyeOff,
  MessageCircle,
  Instagram,
  Facebook,
  Store,
  Phone,
  FileText,
  ExternalLink
} from 'lucide-react';
import { BusinessProfile, SalesSource } from '../types';

interface OnboardingProps {
  onComplete: (profile: BusinessProfile) => void;
}

type OnboardingStep = 'auth_choice' | 'signup' | 'login' | 'otp' | 'consent' | 'platforms' | 'profile';
type LegalDoc = 'none' | 'tos' | 'privacy';

const COUNTRIES = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
];

const PLATFORMS: { id: SalesSource; label: string; icon: React.ReactNode }[] = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
  { id: 'Instagram', label: 'Instagram', icon: <Instagram size={18} /> },
  { id: 'Facebook', label: 'Facebook', icon: <Facebook size={18} /> },
  { id: 'Walk-in', label: 'Walk-in Store', icon: <Store size={18} /> },
  { id: 'Phone Call', label: 'Phone Sales', icon: <Phone size={18} /> },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('auth_choice');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDoc>('none');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Consent State
  const [consentAI, setConsentAI] = useState(false);
  const [consentCustomer, setConsentCustomer] = useState(false);

  // Profile / Form State
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    email: '',
    phone: '',
    logo: '',
    currency: 'USD',
    receiptFooter: 'Thank you for your business!',
    archetype: '',
    vipThreshold: 5,
    stockThreshold: 5,
    persistenceMode: 'local',
    whatsappSyncEnabled: true,
    activePlatforms: ['WhatsApp']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const handleNext = () => {
    setAuthError('');
    if (step === 'auth_choice') return;
    
    if (step === 'signup' || step === 'login') {
      if (authMode === 'login' && !password) {
        setAuthError('Please enter your password');
        return;
      }
      setOtpTimer(300);
      setStep('otp');
      return;
    }
    
    if (step === 'otp') {
      if (otpTimer === 0) {
        setAuthError('OTP expired. Please resend.');
        return;
      }
      if (otpValue.some(v => v === '')) {
        setAuthError('Incomplete OTP');
        return;
      }
      
      if (authMode === 'signup') {
        setStep('consent');
      } else {
        // Redirection after login
        onComplete({
          ...profile,
          name: profile.name || 'Returning Vendor',
          archetype: profile.archetype || 'Retail',
          consentTimestamp: new Date().toISOString()
        });
      }
      return;
    }
    
    if (step === 'consent') {
      setStep('platforms');
      return;
    }

    if (step === 'platforms') {
      setStep('profile');
      return;
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGoogleLoading(false);
    setStep('consent');
  };

  const handleBack = () => {
    setAuthError('');
    if (step === 'signup' || step === 'login') setStep('auth_choice');
    if (step === 'otp') setStep(authMode === 'signup' ? 'signup' : 'login');
    if (step === 'consent') setStep('otp');
    if (step === 'platforms') setStep('consent');
    if (step === 'profile') setStep('platforms');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
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
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find(c => c.name === e.target.value) || COUNTRIES[0];
    setSelectedCountry(country);
    setProfile(prev => ({ ...prev, phone: country.code }));
  };

  const togglePlatform = (id: SalesSource) => {
    setProfile(prev => {
      const active = prev.activePlatforms.includes(id)
        ? prev.activePlatforms.filter(p => p !== id)
        : [...prev.activePlatforms, id];
      return { ...prev, activePlatforms: active };
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLegalAccept = () => {
    if (activeLegalDoc === 'privacy') {
      setConsentAI(true);
    } else if (activeLegalDoc === 'tos') {
      setConsentCustomer(true);
    }
    setActiveLegalDoc('none');
  };

  const renderAuthChoice = () => (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Scale your business via Chat.</h2>
        <p className="text-[#64748B] text-sm font-medium">Automate sales, inventory, and bookkeeping with Bookly AI.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => { setAuthMode('signup'); setStep('signup'); setProfile(p => ({ ...p, phone: selectedCountry.code })); }}
          className="w-full h-16 bg-[#2DD4BF] text-[#0F172A] font-black rounded-3xl flex items-center justify-center space-x-3 hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98]"
        >
          <Zap size={20} className="fill-current" />
          <span>Start Free</span>
        </button>
        
        <button 
          onClick={() => { setAuthMode('login'); setStep('login'); }}
          className="w-full h-16 bg-white border border-[#0F172A]/10 text-[#0F172A] font-bold rounded-3xl flex items-center justify-center hover:bg-[#F0FDF4] hover:border-[#2DD4BF] transition-all shadow-sm"
        >
          Sign In
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center justify-center space-x-4 opacity-10">
          <div className="h-[1px] flex-1 bg-[#0F172A]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Or social login</span>
          <div className="h-[1px] flex-1 bg-[#0F172A]" />
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl flex items-center justify-center space-x-3 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin text-[#2DD4BF]" size={20} />
          ) : (
            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
          )}
          <span className="font-bold text-sm text-[#0F172A]">
            {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#0F172A]">Create Account</h2>
        <p className="text-[#64748B] text-sm">Sign up with your business contact details.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input 
              type="email" 
              className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl pl-12 pr-6 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
              placeholder="Enter your email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Phone Number</label>
          <div className="flex gap-2">
            <select 
              className="w-24 h-14 bg-white border border-[#0F172A]/10 rounded-2xl px-2 outline-none focus:border-[#2DD4BF] font-bold text-sm"
              value={selectedCountry.name}
              onChange={handleCountryChange}
            >
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.code}</option>)}
            </select>
            <div className="relative flex-1">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input 
                type="tel" 
                className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl pl-12 pr-6 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
                placeholder="000 000 0000"
                value={profile.phone.replace(selectedCountry.code, '').trim()}
                onChange={(e) => setProfile({ ...profile, phone: selectedCountry.code + ' ' + e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        disabled={!profile.email || profile.phone.length < 7}
        onClick={handleNext}
        className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center space-x-2 disabled:opacity-20 transition-all active:scale-95 shadow-xl"
      >
        <span>Send Verification Code</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderLogin = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#0F172A]">Welcome Back</h2>
        <p className="text-[#64748B] text-sm">Sign in to access your ledger.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Email or Phone</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input 
              type="text" 
              className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl pl-12 pr-6 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
              placeholder="e.g. +234... or name@mail.com"
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes('@')) setProfile({...profile, email: val});
                else setProfile({...profile, phone: val});
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input 
              type={showPassword ? "text" : "password"}
              className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl pl-12 pr-12 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}

      <button 
        onClick={handleNext}
        className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all"
      >
        <span>Verify & Sign In</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderOTP = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#F0FDF4] border border-[#2DD4BF]/20 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <Shield className="text-[#2DD4BF]" size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">Verification</h2>
        <p className="text-[#64748B] text-sm leading-relaxed px-4">
          A code has been sent to 
          <span className="text-[#0F172A] block font-mono text-xs mt-1 font-bold">
            {profile.email || profile.phone}
          </span>
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        {otpValue.map((digit, i) => (
          <input 
            key={i}
            ref={(el) => (otpInputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            autoFocus={i === 0}
            className="w-14 h-16 bg-white border border-gray-100 rounded-2xl text-center text-3xl font-black outline-none focus:border-[#2DD4BF] transition-all text-[#0F172A]"
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className={`text-xs font-black uppercase tracking-widest ${otpTimer < 60 ? 'text-red-500' : 'text-[#64748B]'}`}>
            Expires in: {formatTimer(otpTimer)}
          </p>
        </div>

        <button 
          onClick={handleNext}
          disabled={otpValue.some(d => !d) || otpTimer === 0}
          className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center disabled:opacity-20 transition-all shadow-xl"
        >
          Confirm Code
        </button>
        {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
      </div>
    </div>
  );

  const renderConsent = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#0F172A]">Trust & Consent</h2>
        <p className="text-[#64748B] text-sm">Review how we process your business data.</p>
      </div>
      
      <div className="space-y-4 text-left">
        <div className="p-4 bg-[#F8FAFC] border border-gray-100 rounded-[32px] space-y-4">
          <label className="flex items-start space-x-4 cursor-pointer group p-3 rounded-2xl hover:bg-white transition-all">
            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consentAI ? 'bg-[#2DD4BF] border-[#2DD4BF]' : 'border-gray-200'}`}>
              {consentAI && <Check size={14} className="text-[#0F172A]" />}
            </div>
            <input type="checkbox" className="hidden" checked={consentAI} onChange={(e) => setConsentAI(e.target.checked)} />
            <span className="text-[11px] text-[#64748B] group-hover:text-[#0F172A] leading-relaxed font-medium">
              I consent to Bookly AI processing my texts/images to extract sales data as per the 
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveLegalDoc('privacy'); }}
                className="text-[#2DD4BF] font-black underline decoration-2 underline-offset-4 ml-1 hover:text-[#0F172A] transition-colors"
              >
                Privacy Policy
              </button>.
            </span>
          </label>

          <label className="flex items-start space-x-4 cursor-pointer group p-3 rounded-2xl hover:bg-white transition-all">
            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consentCustomer ? 'bg-[#2DD4BF] border-[#2DD4BF]' : 'border-gray-200'}`}>
              {consentCustomer && <Check size={14} className="text-[#0F172A]" />}
            </div>
            <input type="checkbox" className="hidden" checked={consentCustomer} onChange={(e) => setConsentCustomer(e.target.checked)} />
            <span className="text-[11px] text-[#64748B] group-hover:text-[#0F172A] leading-relaxed font-medium">
              I confirm I have customer permission to log their order details according to the 
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveLegalDoc('tos'); }}
                className="text-[#2DD4BF] font-black underline decoration-2 underline-offset-4 ml-1 hover:text-[#0F172A] transition-colors"
              >
                Terms of Service
              </button>.
            </span>
          </label>
        </div>

        <div className="px-4 text-[10px] text-[#64748B] font-medium italic text-center leading-relaxed">
          By continuing, you agree to our 
          <button onClick={() => setActiveLegalDoc('tos')} className="text-[#0F172A] font-bold mx-1">Terms</button> 
          and acknowledge the 
          <button onClick={() => setActiveLegalDoc('privacy')} className="text-[#0F172A] font-bold mx-1">Privacy Notice</button>.
        </div>
      </div>

      <button 
        disabled={!consentAI || !consentCustomer}
        onClick={handleNext}
        className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center disabled:opacity-20 transition-all shadow-xl active:scale-[0.98]"
      >
        Accept & Continue
      </button>
    </div>
  );

  const renderPlatforms = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-[#0F172A]">Sales Platforms</h2>
        <p className="text-[#64748B] text-sm">Where do your customers find you?</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PLATFORMS.map((platform) => (
          <button 
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`w-full h-16 px-6 rounded-3xl border flex items-center justify-between transition-all ${
              profile.activePlatforms.includes(platform.id)
                ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#0F172A]'
                : 'bg-white border-gray-100 text-[#64748B] hover:border-[#2DD4BF]/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={profile.activePlatforms.includes(platform.id) ? 'text-[#0F172A]' : 'text-gray-400'}>
                {platform.icon}
              </div>
              <span className="font-bold text-sm">{platform.label}</span>
            </div>
            {profile.activePlatforms.includes(platform.id) && <Check size={18} className="text-[#2DD4BF]" />}
          </button>
        ))}
      </div>

      <button 
        disabled={profile.activePlatforms.length === 0}
        onClick={handleNext}
        className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center disabled:opacity-20 transition-all shadow-xl"
      >
        Confirm Selection
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#0F172A]">Business Setup</h2>
        <p className="text-[#64748B] text-sm">Finalize your professional profile.</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 bg-white border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center hover:border-[#2DD4BF] transition-all overflow-hidden shadow-sm"
          >
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={28} className="text-[#64748B] mb-2" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Logo (JPG/PNG)</span>
              </>
            )}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png" onChange={handleLogoUpload} />
        </div>

        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Business Name *</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input 
                type="text" 
                className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl pl-12 pr-6 outline-none focus:border-[#2DD4BF] font-black text-[#0F172A]"
                placeholder="Business Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Currency *</label>
              <select 
                className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl px-4 outline-none focus:border-[#2DD4BF] font-black text-[#0F172A]"
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Archetype *</label>
              <select 
                className="w-full h-14 bg-white border border-[#0F172A]/10 rounded-2xl px-4 outline-none focus:border-[#2DD4BF] font-black text-[#0F172A]"
                value={profile.archetype}
                onChange={(e) => setProfile({ ...profile, archetype: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="Fashion">Fashion</option>
                <option value="Tech">Consumer Tech</option>
                <option value="Services">Services</option>
                <option value="Retail">General Retail</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button 
        disabled={!profile.name || !profile.archetype || !profile.currency}
        onClick={() => onComplete({
          ...profile,
          consentTimestamp: new Date().toISOString()
        })}
        className="w-full h-16 bg-[#2DD4BF] text-[#0F172A] font-black rounded-3xl flex items-center justify-center space-x-3 disabled:opacity-20 transition-all shadow-xl active:scale-95 mt-4"
      >
        <span>Complete Onboarding</span>
        <Check size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2DD4BF]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0F172A]/5 rounded-full blur-[100px]" />

      <div className="w-full max-sm:max-w-xs max-w-sm space-y-8 z-10">
        <div className="flex flex-col items-center text-center space-y-3 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-16 h-16 bg-[#0F172A] rounded-[24px] flex items-center justify-center mb-2 shadow-2xl transform -rotate-3 transition-transform hover:rotate-0">
            <span className="text-[#2DD4BF] text-3xl font-black">B</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none text-[#0F172A]">BOOKLY</h1>
        </div>

        <div className="cyber-border rounded-[48px] p-8 min-h-[500px] flex flex-col relative bg-white shadow-[0_50px_100px_-20px_rgba(15,23,42,0.1)]">
          {step !== 'auth_choice' && (
            <button 
              onClick={handleBack} 
              className="absolute top-8 left-8 w-10 h-10 bg-[#F8FAFC] rounded-full flex items-center justify-center transition-all z-20 border border-gray-100 hover:bg-[#F0FDF4] hover:border-[#2DD4BF]"
            >
              <ArrowLeft size={18} className="text-[#64748B]" />
            </button>
          )}

          <div className="flex-1 flex flex-col justify-center pt-8">
            {step === 'auth_choice' && renderAuthChoice()}
            {step === 'signup' && renderSignup()}
            {step === 'login' && renderLogin()}
            {step === 'otp' && renderOTP()}
            {step === 'consent' && renderConsent()}
            {step === 'platforms' && renderPlatforms()}
            {step === 'profile' && renderProfile()}
          </div>
        </div>
      </div>
      
      {activeLegalDoc !== 'none' && (
        <div className="fixed inset-0 z-[500] bg-[#0F172A]/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white border border-gray-100 rounded-[40px] flex flex-col max-h-[85vh] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F172A] text-[#2DD4BF] rounded-xl">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
                    {activeLegalDoc === 'tos' ? 'Terms of Service' : 'Privacy Policy'}
                  </h3>
                </div>
                <button onClick={() => setActiveLegalDoc('none')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-[#64748B]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 text-sm text-[#64748B] space-y-6 font-sans font-medium leading-relaxed custom-scrollbar">
                {activeLegalDoc === 'tos' ? (
                  <div className="space-y-4">
                    <p className="font-bold text-[#0F172A]">Welcome to Bookly AI.</p>
                    <p>These terms govern your use of the Bookly mobile utility and AI extraction engine.</p>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">1. Accuracy of Extraction</h4>
                      <p>Bookly utilizes advanced AI to parse dialogue. Users are responsible for verifying extracted data before committing to the ledger.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">2. Compliance</h4>
                      <p>Vendors must ensure they have necessary permissions from customers before logging data into the Bookly CRM.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">3. Usage Restrictions</h4>
                      <p>Any misuse of the AI to process unauthorized or illegal data will result in immediate termination of access.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="font-bold text-[#0F172A]">Your Privacy Matters.</p>
                    <p>We take data security seriously. Here is how we handle your business information:</p>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">1. Data Processing</h4>
                      <p>Unstructured chat data is processed in real-time by the Gemini AI Engine to facilitate structured bookkeeping.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">2. Retention</h4>
                      <p>Business logs and customer profiles are stored locally on your device or synced with your chosen project project based on your settings.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0F172A] uppercase text-[10px] tracking-widest">3. Third-party Sharing</h4>
                      <p>We do not sell your business data. AI processing is conducted securely through Google's GenAI SDK.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-gray-100 bg-[#F8FAFC]">
                <button 
                  onClick={handleLegalAccept} 
                  className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} className="text-[#2DD4BF]" />
                  <span>I Understand & Agree</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;