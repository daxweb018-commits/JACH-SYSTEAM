import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Leaf,
  Sparkles,
  Users
} from 'lucide-react';
import { ZambooLogo } from './ZambooLogo';
import { useSystem } from '../context/SystemContext';

interface Props {
  onLoginSuccess: (username: string) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: (email: string) => void;
  onOpenLaravelCode: () => void;
  lang?: 'en' | 'sw';
  onToggleLang?: () => void;
}

interface WaterDrop {
  id: number;
  left: string;
  top: string;
  size: number;
  tx: number;
  ty: number;
  duration: number;
  delay: number;
  rotate: number;
}

const WATER_DROPLETS: WaterDrop[] = [
  // Left spray (water flung violently to the left)
  { id: 1, left: '0%', top: '15%', size: 6, tx: -75, ty: -35, duration: 0.44, delay: 0.02, rotate: -25 },
  { id: 2, left: '0%', top: '28%', size: 8, tx: -105, ty: -15, duration: 0.46, delay: 0.05, rotate: -40 },
  { id: 3, left: '0%', top: '42%', size: 5, tx: -85, ty: 10, duration: 0.40, delay: 0.08, rotate: -55 },
  { id: 4, left: '0%', top: '56%', size: 7, tx: -115, ty: 20, duration: 0.47, delay: 0.03, rotate: -35 },
  { id: 5, left: '0%', top: '70%', size: 4, tx: -70, ty: 35, duration: 0.42, delay: 0.07, rotate: -60 },
  { id: 6, left: '0%', top: '85%', size: 5, tx: -90, ty: 50, duration: 0.45, delay: 0.04, rotate: -70 },
  { id: 7, left: '2%', top: '35%', size: 3, tx: -125, ty: -5, duration: 0.38, delay: 0.06, rotate: -15 },
  { id: 8, left: '1%', top: '65%', size: 3, tx: -120, ty: 25, duration: 0.39, delay: 0.05, rotate: -20 },

  // Right spray (water flung violently to the right)
  { id: 9, left: '100%', top: '15%', size: 6, tx: 80, ty: -35, duration: 0.44, delay: 0.03, rotate: 25 },
  { id: 10, left: '100%', top: '28%', size: 8, tx: 110, ty: -15, duration: 0.47, delay: 0.06, rotate: 35 },
  { id: 11, left: '100%', top: '42%', size: 5, tx: 90, ty: 10, duration: 0.41, delay: 0.02, rotate: 50 },
  { id: 12, left: '100%', top: '56%', size: 7, tx: 120, ty: 20, duration: 0.48, delay: 0.07, rotate: 40 },
  { id: 13, left: '100%', top: '70%', size: 4, tx: 75, ty: 35, duration: 0.42, delay: 0.04, rotate: 60 },
  { id: 14, left: '100%', top: '85%', size: 5, tx: 95, ty: 50, duration: 0.45, delay: 0.05, rotate: 70 },
  { id: 15, left: '98%', top: '35%', size: 3, tx: 130, ty: -5, duration: 0.38, delay: 0.07, rotate: 15 },
  { id: 16, left: '99%', top: '65%', size: 3, tx: 125, ty: 25, duration: 0.39, delay: 0.06, rotate: 20 },

  // Top spray (bursting upwards)
  { id: 17, left: '20%', top: '0%', size: 6, tx: -50, ty: -80, duration: 0.45, delay: 0.04, rotate: -15 },
  { id: 18, left: '50%', top: '0%', size: 7, tx: 0, ty: -95, duration: 0.47, delay: 0.02, rotate: 0 },
  { id: 19, left: '80%', top: '0%', size: 6, tx: 50, ty: -80, duration: 0.45, delay: 0.05, rotate: 15 },
  { id: 20, left: '35%', top: '0%', size: 4, tx: -25, ty: -65, duration: 0.40, delay: 0.08, rotate: -10 },
  { id: 21, left: '65%', top: '0%', size: 4, tx: 25, ty: -65, duration: 0.40, delay: 0.06, rotate: 10 },

  // Bottom spray
  { id: 22, left: '20%', top: '100%', size: 5, tx: -45, ty: 65, duration: 0.43, delay: 0.05, rotate: -130 },
  { id: 23, left: '50%', top: '100%', size: 6, tx: 5, ty: 75, duration: 0.46, delay: 0.03, rotate: 180 },
  { id: 24, left: '80%', top: '100%', size: 5, tx: 45, ty: 65, duration: 0.44, delay: 0.06, rotate: 130 },

  // Four Corners (angular snap droplets)
  { id: 25, left: '0%', top: '0%', size: 7, tx: -95, ty: -85, duration: 0.48, delay: 0.01, rotate: -45 },
  { id: 26, left: '100%', top: '0%', size: 7, tx: 95, ty: -85, duration: 0.48, delay: 0.02, rotate: 45 },
  { id: 27, left: '0%', top: '100%', size: 6, tx: -85, ty: 80, duration: 0.46, delay: 0.05, rotate: -135 },
  { id: 28, left: '100%', top: '100%', size: 6, tx: 85, ty: 80, duration: 0.46, delay: 0.04, rotate: 135 },
];

export const GlassLoginForm: React.FC<Props> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onForgotPassword,
  onOpenLaravelCode,
  lang = 'sw',
  onToggleLang,
}) => {
  const { authenticateUser, users } = useSystem();
  const [username, setUsername] = useState('debbydm123');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCounter, setShakeCounter] = useState(0);

  const triggerShake = () => {
    setIsShaking(false);
    setTimeout(() => {
      setShakeCounter(c => c + 1);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 520);
    }, 10);
  };

  // Translations
  const t = {
    en: {
      welcome: 'Welcome',
      back: 'Back',
      subtitle: 'Commercial Hub Portal · Login to continue',
      userPlaceholder: 'Username or Email',
      passPlaceholder: 'Password',
      remember: 'Remember me',
      forgot: 'Forgot password?',
      loginBtn: 'Login',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      poweredBy: 'Powered by JACH System • Jambo Asali Commercial Hub',
      motto: 'Health • Quality • Trust',
      quickFill: 'Quick Fill Test',
      viewCode: 'Laravel Blade Code',
      capsWarning: 'Caps Lock is ON!',
      errorRequired: 'Please fill in both username/email and password.',
      errorWrongPass: 'Incorrect password! Please try again.',
      chooseAccount: 'Select User Account (Role Testing):',
    },
    sw: {
      welcome: 'Karibu',
      back: 'Tena',
      subtitle: 'Kituo cha Biashara · Ingia kwenye akaunti yako',
      userPlaceholder: 'Jina la Mtumiaji au Barua Pepe',
      passPlaceholder: 'Nenosiri',
      remember: 'Nikumbuke',
      forgot: 'Umesahau nenosiri?',
      loginBtn: 'Kuingia',
      noAccount: 'Huna akaunti bado?',
      signUp: 'Jisajili Hapa',
      poweredBy: 'Imewezeshwa na JACH System • Jambo Asali Commercial Hub',
      motto: 'Afya • Ubora • Uaminifu',
      quickFill: 'Jaza Kiotomatiki',
      viewCode: 'Msimbo wa Laravel',
      capsWarning: 'Tahadhari: Kitufe cha Caps Lock kimewashwa!',
      errorRequired: 'Tafadhali weka jina la mtumiaji na nenosiri lako.',
      errorWrongPass: 'Nenosiri si sahihi! Tafadhali hakiki na ujaribu tena.',
      chooseAccount: 'Chagua Akaunti ya Mtumiaji (Majaribio ya Wadhifa):',
    }
  }[lang];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.getModifierState('CapsLock')) {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage(t.errorRequired);
      triggerShake();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = authenticateUser(username, password);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error || t.errorWrongPass);
        triggerShake();
        return;
      }

      onLoginSuccess(res.user?.username || username);
    }, 600);
  };

  const handleSelectAccount = (u: typeof users[0]) => {
    setUsername(u.username);
    setPassword(u.password || '123');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-[430px] relative z-10 my-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Water droplets flinging outwards when card shakes ("kujikunguta maji") */}
      {isShaking && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
          {WATER_DROPLETS.map((d) => (
            <span
              key={`drop-${shakeCounter}-${d.id}`}
              className="water-droplet"
              style={{
                left: d.left,
                top: d.top,
                width: `${d.size}px`,
                height: `${Math.round(d.size * 1.35)}px`,
                '--tx': `${d.tx}px`,
                '--ty': `${d.ty}px`,
                '--duration': `${d.duration}s`,
                '--rot': `${d.rotate}deg`,
                animationDelay: `${d.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Main JACH SYSTEM Glowing Golden Glass Card */}
      <div className={`glass-panel-zamboo rounded-[34px] p-7 sm:p-9 transition-all duration-300 relative overflow-hidden ${isShaking ? 'animate-card-shake card-error-glow' : ''}`}>
        
        {/* Subtle Water Sheen Wave across card surface when shaking */}
        {isShaking && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent pointer-events-none animate-water-sheen z-20" />
        )}
        
        {/* Subtle inner golden ambient illumination */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header: Zamboo Asali Honeybee Geometric Logo */}
        <div className="mb-6">
          <ZambooLogo size="md" />
        </div>

        {/* 2. Welcome Back Headline */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white font-display">
            {t.welcome} <span className="text-[#F6BA35] drop-shadow-[0_0_12px_rgba(245,184,46,0.6)]">{t.back}</span>
          </h2>
        </div>

        {/* Error Alert if needed */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3. Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username or Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-200/70">
              <User className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.userPlaceholder}
              required
              className="glass-input-zamboo w-full pl-11 pr-4 py-3.5 rounded-2xl text-white placeholder-stone-400 text-sm focus:outline-none"
            />
          </div>

          {/* Password Input with Lock & Eye Toggle */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-200/70">
              <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder={t.passPlaceholder}
              required
              className="glass-input-zamboo w-full pl-11 pr-11 py-3.5 rounded-2xl text-white placeholder-stone-400 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-amber-200/70 hover:text-amber-300 focus:outline-none transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
              ) : (
                <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* CapsLock Warning */}
          {capsLockActive && (
            <p className="text-[11px] text-amber-300 flex items-center gap-1 pl-1">
              <span>⚠️ {t.capsWarning}</span>
            </p>
          )}

          {/* Remember me & Forgot password Row */}
          <div className="flex items-center justify-between pt-1 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-amber-100/90 hover:text-white transition-colors">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe 
                    ? 'bg-[#F6BA35] text-stone-900 border border-[#F6BA35] shadow-[0_0_8px_rgba(245,184,46,0.6)]' 
                    : 'bg-stone-900/60 border border-white/30'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>{t.remember}</span>
            </label>

            <button
              type="button"
              onClick={() => onForgotPassword(username)}
              className="text-xs font-medium text-[#F6BA35] hover:text-amber-300 transition-colors hover:underline underline-offset-4"
            >
              {t.forgot}
            </button>
          </div>

          {/* 4. Golden Gradient Pill Button: Login -> */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-honey-gold w-full py-3.5 px-6 rounded-2xl font-bold text-stone-950 text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span className="text-[15px]">{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

          {/* Quick Account Switcher for Testing Different Roles */}
          <div className="pt-3 border-t border-amber-400/20">
            <div className="text-[11px] font-bold text-amber-200/80 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#F6BA35]" />
              <span>{t.chooseAccount}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = username === u.username;
                const roleBadge = {
                  muuzaji: 'Muuzaji',
                  manager_masoko: 'Masoko',
                  stock: 'Stoo',
                  mhasibu: 'Mhasibu',
                  managing_director: 'Mkurugenzi',
                  system_admin: 'Admin',
                }[u.role];

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectAccount(u)}
                    className={`text-left p-1.5 rounded-xl border text-[10px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F6BA35] text-stone-950 border-[#F6BA35] font-bold'
                        : 'bg-black/40 hover:bg-black/60 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="font-semibold truncate">{u.name.split(' ')[0]}</div>
                    <div className={`text-[9px] ${isSelected ? 'text-stone-900' : 'text-[#F6BA35]'}`}>
                      {roleBadge} ({u.username})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* Footer Inside Card: Powered by JACH System */}
        <div className="pt-5 text-center select-none">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-200/90">
            <Leaf className="w-3.5 h-3.5 text-[#F6BA35] fill-[#F6BA35]" />
            <span>{t.poweredBy}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
