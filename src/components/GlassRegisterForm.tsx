import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ZambooLogo } from './ZambooLogo';

interface Props {
  onSwitchToLogin: () => void;
  onRegistered: (username: string) => void;
  lang?: 'en' | 'sw';
}

export const GlassRegisterForm: React.FC<Props> = ({ onSwitchToLogin, onRegistered, lang = 'en' }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    en: {
      title: 'Create Account',
      subtitle: 'Join JACH System · Jambo Asali Commercial Hub',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. David Mwamba',
      userLabel: 'Username',
      userPlaceholder: 'david_mwamba',
      emailLabel: 'Email Address',
      emailPlaceholder: 'david@example.com',
      passLabel: 'Password',
      confirmPassLabel: 'Confirm Password',
      agree: 'I agree to the Terms of Service & Privacy Policy',
      submitBtn: 'Complete Registration',
      hasAccount: 'Already have an account?',
      loginHere: 'Login Here',
      errEmpty: 'Please fill out all required fields.',
      errShort: 'Password must be at least 6 characters long.',
      errMatch: 'Passwords do not match.',
      errTerms: 'Please accept terms and conditions to proceed.'
    },
    sw: {
      title: 'Fungua Akaunti',
      subtitle: 'Jiunge na JACH System · Jambo Asali Commercial Hub',
      nameLabel: 'Jina Kamili',
      namePlaceholder: 'Mfano: Juma Rashid',
      userLabel: 'Jina la Mtumiaji (Username)',
      userPlaceholder: 'juma_rashid',
      emailLabel: 'Barua Pepe',
      emailPlaceholder: 'juma@example.com',
      passLabel: 'Nenosiri',
      confirmPassLabel: 'Thibitisha Nenosiri',
      agree: 'Ninakubali Vigezo na Masharti ya Huduma',
      submitBtn: 'Kamilisha Usajili',
      hasAccount: 'Je, tayari una akaunti?',
      loginHere: 'Ingia Hapa',
      errEmpty: 'Tafadhali jaza sehemu zote zinazohitajika.',
      errShort: 'Nenosiri liwe na angalau herufi 6.',
      errMatch: 'Nenosiri halilingani.',
      errTerms: 'Tafadhali kubali vigezo ili kuendelea.'
    }
  }[lang];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError(t.errEmpty);
      return;
    }

    if (password.length < 6) {
      setError(t.errShort);
      return;
    }

    if (password !== passwordConfirm) {
      setError(t.errMatch);
      return;
    }

    if (!agreeTerms) {
      setError(t.errTerms);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const stored = JSON.parse(localStorage.getItem('jach_users') || '{}');
      stored[username.toLowerCase().trim()] = password;
      if (email.trim()) {
        stored[email.toLowerCase().trim()] = password;
      }
      localStorage.setItem('jach_users', JSON.stringify(stored));
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLoading(false);
      onRegistered(username);
    }, 1000);
  };

  return (
    <div className="w-full max-w-[430px] relative z-10 my-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="glass-panel-zamboo rounded-[34px] p-7 sm:p-9 relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-4">
          <ZambooLogo size="sm" />
        </div>

        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            {t.title}
          </h2>
          <p className="text-xs text-amber-200/70">{t.subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-amber-100/90 mb-1">
              {t.nameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-200/70">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="glass-input-zamboo w-full pl-10 pr-4 py-2.5 rounded-2xl text-white placeholder-stone-400 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-100/90 mb-1">
              {t.userLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-200/70 font-mono font-bold text-xs">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.userPlaceholder}
                className="glass-input-zamboo w-full pl-10 pr-4 py-2.5 rounded-2xl text-white placeholder-stone-400 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-100/90 mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-200/70">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="glass-input-zamboo w-full pl-10 pr-4 py-2.5 rounded-2xl text-white placeholder-stone-400 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-amber-100/90 mb-1">
                {t.passLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-200/70">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input-zamboo w-full pl-8 pr-7 py-2.5 rounded-2xl text-white placeholder-stone-400 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-amber-200/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-100/90 mb-1">
                {t.confirmPassLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-200/70">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input-zamboo w-full pl-8 pr-3 py-2.5 rounded-2xl text-white placeholder-stone-400 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-amber-100/80">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded bg-stone-900/60 border-amber-400/40 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>{t.agree}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-honey-gold w-full py-3 px-6 rounded-2xl font-bold text-stone-950 text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60 shadow-lg mt-2"
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>{t.submitBtn}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-amber-100/80">
            {t.hasAccount}{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-[#F6BA35] hover:text-amber-300 underline-offset-4 hover:underline ml-1"
            >
              {t.loginHere}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
