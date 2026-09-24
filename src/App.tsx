/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlassLoginForm } from './components/GlassLoginForm';
import { GlassRegisterForm } from './components/GlassRegisterForm';
import { JachSystemDashboard } from './components/JachSystemDashboard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { LaravelCodeModal } from './components/LaravelCodeModal';
import { BackgroundConfig } from './components/BackgroundSettings';
import { SystemProvider } from './context/SystemContext';

// Zamboo Asali Luxury Background Assets
import userPhototourlBg from './assets/images/user_phototourl_bg.jpg';
import zambooAsaliBg from './assets/images/zamboo_asali_bg_1790201838198.jpg';
import scenicFallbackBg from './assets/images/scenic_glass_bg_1790201515777.jpg';

const USER_CDN_BG = 'https://cdn.phototourl.com/member/2026-09-23-d3b6db54-f924-4538-84ee-821e56fc7767.jpg';

const PRESET_BACKGROUNDS = [
  {
    id: 'user-cdn',
    name: 'Picha ya CDN (Phototourl)',
    url: USER_CDN_BG,
  },
  {
    id: 'zamboo-luxury',
    name: 'Jambo Asali Luxury Honey',
    url: zambooAsaliBg,
  },
  {
    id: 'scenic-lake',
    name: 'Milima & Ziwa la Twilight',
    url: scenicFallbackBg,
  },
  {
    id: 'amber-glow',
    name: 'Warm Amber Lounge',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80',
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [loggedInUser, setLoggedInUser] = useState<string>('');
  const [isLaravelModalOpen, setIsLaravelModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [lang, setLang] = useState<'en' | 'sw'>('sw');

  const [bgConfig, setBgConfig] = useState<BackgroundConfig>({
    id: 'user-cdn',
    name: 'JACH System Official Background',
    url: USER_CDN_BG,
    blurLevel: 'sm',
    overlayOpacity: 0.18,
    showOrbs: true,
  });

  const [activeBgSrc, setActiveBgSrc] = useState<string>(USER_CDN_BG);

  // Toggle Language
  const handleToggleLang = () => {
    setLang(prev => (prev === 'en' ? 'sw' : 'en'));
  };

  const handleLoginSuccess = (user: string) => {
    setLoggedInUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLoggedInUser('');
    setCurrentView('login');
  };

  const handleForgotPassword = (email: string) => {
    setForgotEmail(email);
    setIsForgotModalOpen(true);
  };

  return (
    <SystemProvider>
      {currentView === 'dashboard' ? (
        <JachSystemDashboard
          username={loggedInUser || 'debbydm123'}
          onLogout={handleLogout}
          onOpenCode={() => setIsLaravelModalOpen(true)}
          lang={lang}
        />
      ) : (
        <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-amber-500/30 selection:text-white">
          
          {/* ========================================================================= */}
          {/* 1. BACKGROUND LAYERS (JACH SYSTEM LUXURY AMBIENT SCENE) */}
          {/* ========================================================================= */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Background Image */}
            <img
              src={activeBgSrc}
              alt="JACH System Background"
              onError={() => {
                if (activeBgSrc !== userPhototourlBg) {
                  setActiveBgSrc(userPhototourlBg);
                }
              }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform scale-105 transition-all duration-700 ease-out filter brightness-[0.92]"
            />

            {/* Dynamic Dark Warm Amber Overlay */}
            <div 
              className="absolute inset-0 bg-[#0d0905] transition-opacity duration-300 mix-blend-multiply"
              style={{ opacity: bgConfig.overlayOpacity }}
            />

            {/* Cinematic Gradient Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/50 pointer-events-none" />

            {/* Ambient Glowing Atmospheric Honey Orbs */}
            {bgConfig.showOrbs && (
              <>
                <div className="absolute top-[18%] left-[10%] w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-[15%] right-[8%] w-96 h-96 rounded-full bg-yellow-500/20 blur-3xl animate-float-slow" />
                <div className="absolute top-[40%] left-[55%] w-80 h-80 rounded-full bg-orange-600/15 blur-3xl animate-pulse-glow" />
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. TOP BRAND HEADER */}
          {/* ========================================================================= */}
          <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-amber-400/20 backdrop-blur-xl bg-stone-950/60 shadow-md">
            
            {/* Brand identity wordmark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F6BA35]/20 border border-[#F6BA35]/40 flex items-center justify-center text-[#F6BA35] shadow-[0_0_10px_rgba(245,184,46,0.4)]">
                <svg viewBox="0 0 100 90" className="w-5 h-5 text-[#F6BA35]" fill="none">
                  <path d="M50 4L90 28V68L50 88L10 68V28L50 4Z" stroke="currentColor" strokeWidth="6"/>
                  <circle cx="50" cy="36" r="8" fill="currentColor"/>
                  <ellipse cx="50" cy="55" rx="10" ry="12" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold tracking-[0.14em] text-white font-display uppercase">
                  JACH SYSTEM
                </span>
                <span className="text-[9px] tracking-[0.2em] text-[#F6BA35] uppercase font-semibold">
                  Jambo Asali Commercial Hub
                </span>
              </div>
            </div>

          </header>

          {/* ========================================================================= */}
          {/* 3. MAIN CONTENT (THE EXACT ADVANCED GLASSMORPHISM LOGIN CARD) */}
          {/* ========================================================================= */}
          <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
            {currentView === 'login' && (
              <GlassLoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setCurrentView('register')}
                onForgotPassword={handleForgotPassword}
                onOpenLaravelCode={() => setIsLaravelModalOpen(true)}
                lang={lang}
                onToggleLang={handleToggleLang}
              />
            )}

            {currentView === 'register' && (
              <GlassRegisterForm
                onSwitchToLogin={() => setCurrentView('login')}
                onRegistered={(user) => {
                  setLoggedInUser(user);
                  setCurrentView('dashboard');
                }}
                lang={lang}
              />
            )}
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS */}
      {/* ========================================================================= */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={forgotEmail}
        lang={lang}
      />

      <LaravelCodeModal
        isOpen={isLaravelModalOpen}
        onClose={() => setIsLaravelModalOpen(false)}
      />
    </SystemProvider>
  );
}
