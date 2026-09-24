import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  Code2,
  Layers
} from 'lucide-react';
import localLoadingImg from '../assets/images/user_login_loading_img.png';

const IMAGE_URL = 'https://cdn.phototourl.com/member/2026-09-23-ef215045-893a-428b-88b9-1650b6fe363c.png';

interface Props {
  username: string;
  onLogout: () => void;
  onOpenCode: () => void;
  lang?: 'en' | 'sw';
}

export const ImageLoadingScreen: React.FC<Props> = ({
  username = 'debbydm123',
  onLogout,
  onOpenCode,
  lang = 'sw',
}) => {
  const [progress, setProgress] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(IMAGE_URL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const isSw = lang === 'sw';

  const statusMessages = isSw ? [
    'Inathibitisha akaunti ya ' + username + '...',
    'Inapakia rasilimali na kiolesura cha mfumo...',
    'Inakamilisha muundo wa JACH System...',
    'Mfumo umepakiwa kikamilifu! Karibu.'
  ] : [
    'Verifying credentials for ' + username + '...',
    'Loading system interface & graphics...',
    'Finalizing JACH System configuration...',
    'Loaded successfully! Welcome.'
  ];

  // Start / restart loading animation
  const handleReload = () => {
    setIsLoading(true);
    setProgress(5);
    setStatusIndex(0);
  };

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            setStatusIndex(3);
          }, 400);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 8) + 4;
        const capped = Math.min(next, 98);

        if (capped > 25 && capped <= 60) setStatusIndex(1);
        else if (capped > 60 && capped < 95) setStatusIndex(2);

        return capped;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="relative w-full max-w-6xl mx-auto z-10 flex flex-col items-center justify-center p-2 sm:p-4 my-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 px-3 py-2.5 rounded-2xl bg-stone-950/70 backdrop-blur-xl border border-amber-400/30 shadow-lg">
        
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${isLoading ? 'bg-[#F6BA35] animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {isLoading 
                ? (isSw ? 'Picha Inapakia (Loading...)' : 'Loading Interface...')
                : (isSw ? 'Mfumo Umepakiwa Kikamilifu' : 'Interface Loaded')}
            </span>
            <span className="text-[10px] text-amber-200/80 font-mono">
              {isSw ? 'Mtumiaji' : 'User'}: <strong className="text-[#F6BA35]">{username}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reload Loading Button */}
          <button
            type="button"
            onClick={handleReload}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title={isSw ? 'Pakia Upya' : 'Reload'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F6BA35] ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSw ? 'Pakia Upya' : 'Reload'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-amber-400/30 text-amber-200 hover:text-white transition-all cursor-pointer"
            title={isSw ? 'Skrini Nzima' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-[#F6BA35]" />}
          </button>

          {/* View Laravel Code */}
          <button
            type="button"
            onClick={onOpenCode}
            className="px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#F6BA35]" />
            <span className="hidden md:inline">{isSw ? 'Msimbo wa Laravel' : 'Laravel Code'}</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 hover:text-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{isSw ? 'Toka' : 'Logout'}</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* THE IMAGE ITSELF AS THE MAIN LOADING VIEW */}
      {/* ========================================================================= */}
      <div className={`relative w-full rounded-3xl overflow-hidden border-2 border-[#F6BA35]/60 shadow-[0_0_60px_rgba(245,184,46,0.35)] bg-stone-950/90 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 max-w-none max-h-none flex flex-col justify-center' : ''}`}>
        
        {/* Main Image */}
        <div className="relative w-full aspect-[16/9] max-h-[75vh] flex items-center justify-center overflow-hidden bg-stone-950">
          <img
            src={imgSrc}
            alt="JACH System Loading Interface"
            onError={() => setImgSrc(localLoadingImg)}
            className={`w-full h-full object-contain transition-all duration-700 ${isLoading ? 'scale-[1.01] filter brightness-95' : 'scale-100 filter brightness-100'}`}
          />

          {/* Sweeping Shimmer Scan Light when Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
          )}

          {/* Center Loading Badge & Spinner on the Image */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 select-none">
              
              {/* Glowing Honey Hexagon Spinner */}
              <div className="relative mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-950/90 border-2 border-[#F6BA35] flex items-center justify-center shadow-[0_0_30px_rgba(245,184,46,0.7)]">
                  <svg viewBox="0 0 100 90" className="w-10 h-10 sm:w-12 sm:h-12 text-[#F6BA35] animate-bounce" fill="none">
                    <path d="M50 4L90 28V68L50 88L10 68V28L50 4Z" stroke="#F6BA35" strokeWidth="4" strokeLinejoin="round"/>
                    <circle cx="50" cy="36" r="6" fill="#F6BA35"/>
                    <ellipse cx="50" cy="55" rx="8" ry="10" fill="#F6BA35"/>
                  </svg>
                </div>
                {/* Rotating Dashed Amber Halo */}
                <div className="absolute -inset-2 border-2 border-dashed border-[#F6BA35] rounded-3xl animate-spin [animation-duration:5s] pointer-events-none" />
              </div>

              {/* Status Message */}
              <div className="px-4 py-2 rounded-2xl bg-stone-950/85 border border-amber-400/50 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F6BA35] animate-spin" />
                  {isSw ? 'Inapakia...' : 'Loading...'} <span className="text-[#F6BA35] font-mono">{progress}%</span>
                </span>
                <span className="text-xs text-amber-200/90 mt-1 font-medium">
                  {statusMessages[statusIndex]}
                </span>
              </div>

            </div>
          )}

          {/* Success Flash Toast when finished loading */}
          {!isLoading && (
            <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-emerald-400/60 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isSw ? 'Picha Imepakiwa Kikamilifu' : 'Image Loaded Successfully'}</span>
            </div>
          )}

        </div>

        {/* Dynamic Loading Progress Bar Along Bottom Edge */}
        <div className="w-full bg-stone-950 border-t border-amber-400/30 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="w-full sm:flex-1">
            <div className="flex items-center justify-between text-xs text-amber-200 mb-1.5">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isLoading 
                  ? (isSw ? 'Hali: Inapakia rasilimali...' : 'Status: Loading assets...') 
                  : (isSw ? 'Hali: Imekamilika na Inafanya Kazi' : 'Status: Ready')}
              </span>
              <span className="font-mono font-bold text-[#F6BA35]">{progress}%</span>
            </div>

            {/* Glowing Golden Progress Bar */}
            <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-amber-400/30 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#F6BA35] via-amber-400 to-[#F5A81D] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(245,184,46,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-amber-100/70 font-mono">
              cdn.phototourl.com
            </span>
          </div>

        </div>

      </div>

      {/* Close button if in fullscreen mode */}
      {isFullscreen && (
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          className="fixed top-6 right-6 z-50 p-2.5 rounded-2xl bg-stone-900/90 text-white border border-amber-400/50 hover:bg-stone-800 transition-all cursor-pointer shadow-2xl"
        >
          <Minimize2 className="w-6 h-6 text-[#F6BA35]" />
        </button>
      )}

    </div>
  );
};
