import React, { useState, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
  Zap
} from 'lucide-react';
import localLoadingImg from '../assets/images/user_login_loading_img.png';

const REMOTE_IMAGE_URL = 'https://cdn.phototourl.com/member/2026-09-23-ef215045-893a-428b-88b9-1650b6fe363c.png';

interface Props {
  username: string;
  onLogout: () => void;
  onOpenCode: () => void;
  lang?: 'en' | 'sw';
}

export const DashboardPreview: React.FC<Props> = ({ 
  username, 
  onLogout, 
  onOpenCode, 
  lang = 'sw' 
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(12);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imgSrc, setImgSrc] = useState(REMOTE_IMAGE_URL);
  const [imageFullyLoaded, setImageFullyLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSw = lang === 'sw';

  const steps = isSw ? [
    'Inathibitisha utambulisho wa ' + (username || 'debbydm123') + '...',
    'Inapakia rasilimali za picha ya mfumo wa JACH...',
    'Inatayarisha dashibodi ya kidijitali...',
    'Kazi imekamilika! Karibu kwenye mfumo.'
  ] : [
    'Authenticating credentials for ' + (username || 'debbydm123') + '...',
    'Fetching JACH system interface assets...',
    'Configuring secure portal dashboard...',
    'Complete! Welcome to JACH System.'
  ];

  // Simulated smooth loading progression & image preloading
  const startLoadingSequence = () => {
    setLoading(true);
    setProgress(15);
    setLoadingStep(0);
    setImageFullyLoaded(false);

    // Preload image
    const img = new Image();
    img.src = REMOTE_IMAGE_URL;
    img.onload = () => {
      setImageFullyLoaded(true);
    };
    img.onerror = () => {
      setImgSrc(localLoadingImg);
      setImageFullyLoaded(true);
    };

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
          }, 350);
          return 100;
        }
        const increment = Math.floor(Math.random() * 15) + 10;
        const nextVal = Math.min(prev + increment, 98);
        
        if (nextVal > 30 && nextVal <= 65) setLoadingStep(1);
        else if (nextVal > 65 && nextVal <= 90) setLoadingStep(2);
        else if (nextVal > 90) setLoadingStep(3);

        return nextVal;
      });
    }, 180);
  };

  useEffect(() => {
    startLoadingSequence();
  }, []);

  const loginTime = new Date().toLocaleTimeString(isSw ? 'sw-TZ' : 'en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="w-full max-w-4xl mx-auto z-10 relative animate-in fade-in zoom-in-95 duration-300">
      
      {/* ======================================================================= */}
      {/* 1. LOADING STATE OVERLAY (INAPAKIA PICHA YA MFUMO) */}
      {/* ======================================================================= */}
      {loading ? (
        <div className="glass-panel-zamboo rounded-[34px] p-8 sm:p-12 border border-[#F6BA35]/60 shadow-[0_0_50px_rgba(245,184,46,0.3)] text-white text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#F6BA35]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Honeybee Hexagon Loader */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-[#F6BA35] flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(245,184,46,0.5)]">
              <svg viewBox="0 0 100 90" className="w-11 h-11 text-[#F6BA35] animate-bounce" fill="none">
                <path d="M50 4L90 28V68L50 88L10 68V28L50 4Z" stroke="#F6BA35" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M50 4V24M22 35L42 24M78 35L58 24" stroke="#F6BA35" strokeWidth="3"/>
                <circle cx="50" cy="36" r="6" fill="#F6BA35"/>
                <path d="M44 42C30 38 20 44 24 55C27 63 38 60 44 48" stroke="#F6BA35" strokeWidth="3" fill="rgba(245,184,46,0.3)"/>
                <path d="M56 42C70 38 80 44 76 55C73 63 62 60 56 48" stroke="#F6BA35" strokeWidth="3" fill="rgba(245,184,46,0.3)"/>
              </svg>
            </div>
            {/* Spinning Ring */}
            <div className="absolute -inset-2 border-2 border-dashed border-[#F6BA35]/50 rounded-3xl animate-spin [animation-duration:8s] pointer-events-none" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2 tracking-wide">
            {isSw ? 'Inapakia Mfumo...' : 'Loading System...'}
          </h2>
          
          <p className="text-sm font-medium text-amber-200/90 mb-5 max-w-md h-6 flex items-center justify-center">
            {steps[loadingStep]}
          </p>

          {/* Dynamic Progress Bar */}
          <div className="w-full max-w-md bg-stone-900/80 border border-amber-400/30 rounded-full h-3 p-0.5 mb-3 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#F6BA35] via-amber-400 to-[#F5A81D] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,184,46,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-amber-200/80 mb-6">
            <span>{isSw ? 'Mtumiaji' : 'User'}: {username || 'debbydm123'}</span>
            <span className="font-bold text-[#F6BA35]">{progress}%</span>
          </div>

          {/* Shimmering Thumbnail Preview Container of the requested image */}
          <div className="relative w-full max-w-lg h-36 rounded-2xl overflow-hidden border border-amber-400/30 bg-stone-950/70 p-1 backdrop-blur-md">
            <img 
              src={imgSrc} 
              alt="Loading preview"
              className={`w-full h-full object-cover rounded-xl filter blur-sm transition-all duration-700 opacity-60 scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="text-xs text-amber-200/90 flex items-center gap-2 font-medium px-3 py-1.5 rounded-full bg-stone-900/80 border border-amber-400/40">
                <Sparkles className="w-3.5 h-3.5 text-[#F6BA35] animate-spin" />
                {isSw ? 'Picha ya Mfumo Inapakiwa...' : 'Loading Interface Asset...'}
              </span>
            </div>
          </div>

        </div>
      ) : (

        /* ===================================================================== */
        /* 2. AUTHENTICATED DASHBOARD (SHOWING THE FULL REQUESTED IMAGE) */
        /* ===================================================================== */
        <div className="glass-panel-zamboo rounded-[34px] p-6 sm:p-8 border border-[#F6BA35]/60 shadow-[0_0_50px_rgba(245,184,46,0.35)] text-white">
          
          {/* Top Status & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-amber-400/20">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-xs sm:text-sm font-semibold text-amber-200">
                {isSw 
                  ? 'Umeingia Kikamilifu · JACH SYSTEM' 
                  : 'Authenticated · JACH SYSTEM'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-[#F6BA35] uppercase tracking-wider">
                {username || 'debbydm123'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startLoadingSequence}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={isSw ? 'Pakia Upya Uhuishaji' : 'Reload Animation'}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#F6BA35]" />
                <span className="hidden sm:inline">{isSw ? 'Pakia Upya' : 'Reload'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>{isSw ? 'Toka' : 'Logout'}</span>
              </button>
            </div>
          </div>

          {/* User Welcome Banner */}
          <div className="py-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {isSw ? 'Karibu' : 'Welcome'}, <span className="text-[#F6BA35]">{username || 'debbydm123'}</span>!
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 mt-1">
                {isSw 
                  ? 'Mfumo wako wa JACH umepakiwa kikamilifu ukiwa na picha yako rasmi.' 
                  : 'Your JACH system portal has loaded successfully with your official interface image.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-stone-900/60 px-3 py-1.5 rounded-xl border border-amber-400/20 text-amber-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isSw ? 'Kipindi Kilicholindwa' : 'Secure Session'}</span>
              <span className="text-amber-100/60">· {loginTime}</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* THE USER'S REQUESTED IMAGE HERO DISPLAY */}
          {/* =================================================================== */}
          <div className="mt-2 mb-6 relative rounded-2xl overflow-hidden border-2 border-[#F6BA35]/50 shadow-[0_15px_35px_rgba(0,0,0,0.6)] group">
            
            {/* Action Bar on top of image */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 border border-amber-400/40 text-amber-200 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer"
                title={isSw ? 'Fungua Picha Kubwa' : 'Expand Fullscreen'}
              >
                <Maximize2 className="w-4 h-4 text-[#F6BA35]" />
              </button>
            </div>

            {/* Image */}
            <div className="relative bg-stone-950/80 aspect-[16/9] w-full flex items-center justify-center overflow-hidden">
              <img 
                src={imgSrc} 
                alt="JACH System Interface"
                onError={() => setImgSrc(localLoadingImg)}
                className="w-full h-full object-contain transform group-hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Image caption badge */}
            <div className="p-3 bg-stone-950/85 backdrop-blur-md border-t border-amber-400/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">{isSw ? 'Picha Rasmi ya Mfumo Imepakiwa' : 'Official System Asset Loaded'}</span>
                <span className="text-[10px] text-amber-100/60 font-mono">(1672 × 940 px)</span>
              </div>
              <span className="text-[11px] text-[#F6BA35] font-medium">
                cdn.phototourl.com
              </span>
            </div>

          </div>

          {/* System Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-400/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F6BA35]/20 text-[#F6BA35]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200/70">{isSw ? 'Jina la Mtumiaji' : 'Username'}</div>
                <div className="text-xs font-bold text-white font-mono">{username || 'debbydm123'}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-400/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200/70">{isSw ? 'Usalama wa Nenosiri' : 'Password Hash'}</div>
                <div className="text-xs font-bold text-white font-mono">Bcrypt (Verified)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-400/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-[#F6BA35]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200/70">{isSw ? 'Haki ya Kuingia' : 'Access Level'}</div>
                <div className="text-xs font-bold text-white">Full Administrator</div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onOpenCode}
              className="btn-honey-gold w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-stone-950 text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Code2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isSw ? 'Tazama Msimbo wa Laravel (Blade/PHP)' : 'View Laravel Source Code'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{isSw ? 'Toka' : 'Logout'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. FULLSCREEN LIGHTBOX MODAL */}
      {/* ======================================================================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl flex items-center justify-between pb-4">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-[#F6BA35]" />
              <span className="font-bold text-sm sm:text-base">
                {isSw ? 'Mwonekano Kamili wa Picha ya Mfumo (debbydm123)' : 'Full System Interface View'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition-all cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full max-w-6xl max-h-[80vh] overflow-auto rounded-2xl border border-amber-400/40 p-1 bg-stone-900 flex items-center justify-center shadow-2xl">
            <img 
              src={imgSrc} 
              alt="Fullscreen System Interface"
              className="max-w-full max-h-[78vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
