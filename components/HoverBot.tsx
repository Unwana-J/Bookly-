
import React, { useState, useRef, useEffect } from 'react';
import { Product, ExtractionResult, ExtractedSale, ExtractedProduct, BusinessProfile, Customer, ExtractedExpense } from '../types';
import { analyzeIntentAndExtract } from '../services/geminiService';
import { 
  X, Sparkles, Check, Mic, MicOff, Send, Zap, 
  Camera, RefreshCw, Minus, Maximize2, ChevronDown,
  ShoppingCart, Wallet, Package, Scan, AlertCircle,
  Minimize2, ExternalLink, HelpCircle, ArrowRight
} from 'lucide-react';

interface HoverBotProps {
  inventory: Product[];
  onConfirmSale: (saleData: ExtractedSale) => void;
  onConfirmProduct: (productData: ExtractedProduct) => void;
  onConfirmExpense: (expenseData: ExtractedExpense) => void;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  businessProfile?: BusinessProfile | null;
  customers: Customer[];
}

type UIMode = 'minimized' | 'compact' | 'maxi';

const HoverBot: React.FC<HoverBotProps> = ({ inventory, onConfirmSale, onConfirmProduct, onConfirmExpense, isActive, setIsActive, businessProfile }) => {
  const [uiMode, setUiMode] = useState<UIMode>('compact');
  const [step, setStep] = useState<'idle' | 'analyzing' | 'verification' | 'success'>('idle');
  const [currentText, setCurrentText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAnalyze = async (imageBase64?: string) => {
    if (!currentText.trim() && !imageBase64) return;
    
    setError(null);
    setStep('analyzing');
    setUiMode('maxi');
    
    try {
      const inputs = imageBase64 ? [{ imageBase64 }] : [{ text: currentText }];
      const data = await analyzeIntentAndExtract(inputs, inventory);
      
      if (data && data.intent) {
        setExtractedData(data);
        setStep('verification');
      } else {
        setError("AI couldn't parse the intent. Try more details.");
        setStep('idle');
      }
    } catch (e) {
      setError("Sync failed. Check connection.");
      setStep('idle');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setUiMode('maxi');
      }
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
    stopCamera();
    handleAnalyze(base64);
  };

  const handleCommit = () => {
    if (!extractedData) return;
    
    if (extractedData.intent === 'sale') {
      onConfirmSale(extractedData as ExtractedSale);
      setIsActive(false); // Close bot immediately to show confirmation modal
    } else if (extractedData.intent === 'product') {
      onConfirmProduct(extractedData as ExtractedProduct);
      showSuccess();
    } else if (extractedData.intent === 'expense') {
      onConfirmExpense(extractedData as ExtractedExpense);
      showSuccess();
    }
  };

  const showSuccess = () => {
    setStep('success');
    setTimeout(() => {
      reset();
      setIsActive(false);
    }, 1500);
  };

  const reset = () => {
    setStep('idle');
    setCurrentText('');
    setExtractedData(null);
    setIsCameraActive(false);
    setError(null);
    setUiMode('compact');
  };

  if (!isActive) return null;

  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  return (
    <div className={`fixed z-[400] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${uiMode === 'minimized' 
        ? 'bottom-20 right-8 w-16 h-16' 
        : uiMode === 'compact'
          ? 'bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xl h-16' 
          : 'bottom-20 right-6 left-6 md:left-auto md:w-[450px] h-[80vh]'}
    `}>
      
      {uiMode === 'minimized' ? (
        <button 
          onClick={() => setUiMode('compact')}
          className="w-16 h-16 bg-[#0F172A] border-2 border-[#2DD4BF] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.4)] text-[#2DD4BF] hover:scale-110 active:scale-95 transition-all"
        >
          <Sparkles size={28} className="animate-pulse" />
        </button>
      ) : (
        <div className={`w-full bg-[#0F172A] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-500
          ${uiMode === 'compact' ? 'rounded-[24px]' : 'rounded-[40px]'} h-full overflow-hidden
        `}>
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2DD4BF] rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-[#0F172A]" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Bookly AI</h3>
            </div>
            <div className="flex items-center gap-1">
              {uiMode === 'compact' ? (
                <button onClick={() => setUiMode('maxi')} className="p-2 text-slate-400 hover:text-white transition-colors"><Maximize2 size={16} /></button>
              ) : (
                <button onClick={() => setUiMode('compact')} className="p-2 text-slate-400 hover:text-white transition-colors"><Minimize2 size={16} /></button>
              )}
              <button onClick={() => setIsActive(false)} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
            {isCameraActive ? (
              <div className="h-full flex flex-col space-y-4">
                <div className="flex-1 relative rounded-3xl overflow-hidden bg-black border border-white/10 shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-[#2DD4BF]/20 rounded-3xl pointer-events-none" />
                </div>
                <button onClick={capturePhoto} className="h-16 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                  <Scan size={24} /> <span>Capture & Scan</span>
                </button>
              </div>
            ) : step === 'idle' ? (
              <div className="h-full flex flex-col justify-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                <textarea 
                  autoFocus
                  className="flex-1 w-full p-6 bg-white/[0.03] border border-white/10 rounded-[32px] outline-none text-sm placeholder:text-slate-600 resize-none text-white font-medium focus:border-[#2DD4BF]/50 transition-all shadow-inner"
                  placeholder="Paste customer chat text here. AI will extract items, quantities, and totals instantly."
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={() => handleAnalyze()} disabled={!currentText.trim()} className="flex-1 h-16 bg-[#2DD4BF] text-[#0F172A] font-black rounded-[24px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                    <Zap size={20} /> Extract Sales Data
                  </button>
                  <button onClick={startCamera} className="w-16 h-16 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-white hover:bg-white/10 transition-all">
                    <Camera size={24} />
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs font-bold text-center animate-bounce">{error}</p>}
              </div>
            ) : step === 'analyzing' ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                   <RefreshCw size={56} className="text-[#2DD4BF] animate-spin" />
                   <Sparkles size={24} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black text-white uppercase tracking-[0.3em] text-sm">Processing Intelligence</p>
                  <p className="text-slate-400 text-xs italic">Structuring your unstructured data...</p>
                </div>
              </div>
            ) : step === 'verification' && extractedData ? (
              <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-6 overflow-y-auto shadow-inner">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${extractedData.intent === 'sale' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {extractedData.intent === 'sale' ? <ShoppingCart size={16} /> : <HelpCircle size={16} />}
                      </div>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{extractedData.intent} Intent</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${extractedData.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {extractedData.confidence} Confidence
                    </span>
                  </div>

                  {extractedData.intent === 'inquiry' && extractedData.suggestedActions && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Suggested Responses:</p>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.suggestedActions.map((action, i) => (
                          <button key={i} className="px-4 py-2 bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 text-[#2DD4BF] rounded-xl text-[10px] font-black uppercase hover:bg-[#2DD4BF] hover:text-[#0F172A] transition-all">
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {extractedData.intent === 'sale' && (extractedData as ExtractedSale).customers?.map((cust, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                         <p className="text-xs font-black text-[#2DD4BF]">{cust.handle || 'Unidentified Guest'}</p>
                         <p className="text-[10px] font-black text-slate-500 uppercase">{cust.platform || 'General'}</p>
                      </div>
                      <div className="space-y-2">
                        {cust.items?.map((item, j) => (
                          <div key={j} className="flex justify-between items-center text-[11px] bg-white/[0.02] p-3 rounded-xl border border-white/5">
                            <span className="text-slate-300 font-medium">{item.productName} <span className="text-white font-black ml-1">x{item.quantity}</span></span>
                            <span className="font-mono text-[#2DD4BF] font-black">{currency}{(item.unitPrice || 0) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {extractedData.confidence === 'low' && (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                      <AlertCircle size={18} className="text-amber-500 shrink-0" />
                      <p className="text-[10px] text-amber-500 font-bold leading-tight uppercase tracking-tight">Manual audit required for low confidence fields.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {extractedData.intent !== 'inquiry' ? (
                    <button onClick={handleCommit} className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                      <Check size={20} /> Review & Confirm
                    </button>
                  ) : (
                    <button onClick={reset} className="w-full h-16 bg-white/5 border border-white/10 text-white font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                      <ArrowRight size={20} /> Back to Capture
                    </button>
                  )}
                  <button onClick={reset} className="w-full h-10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Discard Result</button>
                </div>
              </div>
            ) : step === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-[#2DD4BF] rounded-[40px] flex items-center justify-center shadow-[0_0_60px_rgba(45,212,191,0.3)] transform rotate-12">
                  <Check size={48} className="text-[#0F172A]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-black text-white">Capture Successful</p>
                  <p className="text-xs text-slate-400 font-medium italic">Your ledger has been updated.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverBot;
