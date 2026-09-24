import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  lang?: 'en' | 'sw';
}

export const ForgotPasswordModal: React.FC<Props> = ({ isOpen, onClose, defaultEmail = '', lang = 'en' }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(lang === 'sw' ? 'Tafadhali weka barua pepe au jina la mtumiaji.' : 'Please enter your email or username.');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1100);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-zamboo w-full max-w-md rounded-[32px] p-6 sm:p-8 text-white relative shadow-2xl border border-amber-400/40">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F6BA35]/20 border border-[#F6BA35]/40 flex items-center justify-center text-[#F6BA35]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display">
              {lang === 'sw' ? 'Kiungo Kimetumwa!' : 'Reset Link Sent!'}
            </h3>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              {lang === 'sw' ? 'Tumetuma kiungo cha kurejesha nenosiri kwenye:' : 'We sent password reset instructions to:'} <br />
              <strong className="text-[#F6BA35] font-mono">{email}</strong>
            </p>
            <button
              onClick={handleReset}
              className="btn-honey-gold w-full mt-4 py-3 rounded-2xl font-bold text-stone-950 text-sm transition-all"
            >
              {lang === 'sw' ? 'Rudi Kwenye Kuingia' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F6BA35]/15 border border-[#F6BA35]/30 flex items-center justify-center text-[#F6BA35] mb-3 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-display mb-1 text-white">
                {lang === 'sw' ? 'Umesahau Nenosiri?' : 'Forgot Password?'}
              </h3>
              <p className="text-xs text-amber-100/75">
                {lang === 'sw'
                  ? 'Weka barua pepe au jina la mtumiaji uliyojiandikisha nayo tukupe kiungo.'
                  : 'Enter your email or username associated with JACH System (Jambo Asali Commercial Hub).'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-100/90 mb-2">
                  {lang === 'sw' ? 'Barua Pepe / Username' : 'Email Address / Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-200/70">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'sw' ? 'Weka barua pepe yako...' : 'Enter your email...'}
                    className="glass-input-zamboo w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-400 text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-honey-gold w-full py-3.5 px-6 rounded-2xl font-bold text-stone-950 shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <span>{lang === 'sw' ? 'Tuma Kiungo' : 'Send Reset Link'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-amber-100/70 hover:text-white transition-colors"
              >
                {lang === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
