import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { UserRole } from '../types/system';
import { MuuzajiPanel } from './roles/MuuzajiPanel';
import { ManagerMasokoPanel } from './roles/ManagerMasokoPanel';
import { MhasibuPanel } from './roles/MhasibuPanel';
import { MkurugenziPanel } from './roles/MkurugenziPanel';
import { StockPanel } from './roles/StockPanel';
import { AdminPanel } from './roles/AdminPanel';
import { 
  Menu, 
  Calendar, 
  Share2, 
  LogOut, 
  ChevronDown, 
  Download, 
  Boxes, 
  DollarSign, 
  Crown, 
  LayoutDashboard, 
  Package, 
  Store, 
  Users, 
  Receipt, 
  Wallet, 
  ShieldAlert,
  Lock,
  CheckCircle2,
  Check,
  Eye,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  username?: string;
  onLogout: () => void;
  onOpenCode?: () => void;
  lang?: 'en' | 'sw';
}

export const JachSystemDashboard: React.FC<Props> = ({
  onLogout,
  onOpenCode,
}) => {
  const { 
    currentUser, 
    loggedInUser,
    activeRole, 
    setActiveRole, 
    stockInventory, 
    totalCompanyDebts,
    sales,
    updateUserAvatar
  } = useSystem();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [headerCalendarOpen, setHeaderCalendarOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(currentUser.avatar || '');

  // Check if current authenticated user has multi-role administrative privileges
  // Only managing_director and system_admin can view all other roles/accounts
  const userRealRole = loggedInUser?.role || currentUser.role;
  const isPrivilegedUser = userRealRole === 'managing_director' || userRealRole === 'system_admin';

  // Role labels for Swahili display
  const ROLE_CONFIG: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    managing_director: {
      label: 'Mkurugenzi Mtendaji (Director)',
      icon: Crown,
      color: '#F6BA35',
      desc: 'Grafu ya ukuaji, madeni yote & ukaguzi wa paneli zote',
    },
    muuzaji: {
      label: 'Muuzaji (Salesperson)',
      icon: DollarSign,
      color: '#10b981',
      desc: 'Piga bei automatic, Vybu Gin vs Asali, madeni ya mteja',
    },
    manager_masoko: {
      label: 'Manager Masoko (Sales Manager)',
      icon: BarChart3,
      color: '#06b6d4',
      desc: 'Madeni kwa kila muuzaji, namba za wadaiwa, maboksi yaliyouzwa',
    },
    mhasibu: {
      label: 'Mhasibu (Accountant)',
      icon: Wallet,
      color: '#f59e0b',
      desc: 'Kuingiza matumizi, jina la aliyechukua fedha & saini',
    },
    stock: {
      label: 'Mtu wa Stock (Stoo)',
      icon: Boxes,
      color: '#a855f7',
      desc: 'Sheria ya maboksi (200 - 100), oda za wauzaji & urejeshaji',
    },
    system_admin: {
      label: 'System Admin (Msimamizi Mkuu)',
      icon: ShieldAlert,
      color: '#f43f5e',
      desc: 'Kuzuia (Block) & kufungua akaunti ya mtu yeyote',
    },
  };

  const currentRoleInfo = ROLE_CONFIG[activeRole];

  const handleShareLiveLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  // Export all sales report
  const handleExportExcel = () => {
    const headers = 'TAREHE,RISITI,TIMU / MUUZAJI,MTEJA,BIDHAA,MABOKSI,KIASI (TZS),HALI\n';
    const rows = sales.map(s => 
      `"${s.tarehe}","${s.risitiNumber}","${s.muuzajiName}","${s.mtejaName}","${s.items.map(i => i.productName).join(';')}",${s.maboksiSold},${s.totalKiasi},"${s.hali}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JACH_System_Ripoti_Mauzo_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-white">
      
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Kiungo cha Live kimenakiliwa kikamilifu!</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. TOP HEADER BAR: EXACT SAME BRAND DESIGN + INSTANT ROLE SWITCHER */}
      {/* ======================================================================= */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-amber-400/20 backdrop-blur-2xl bg-stone-950/70 shadow-md">
        
        {/* Left: Hide/Show Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-amber-400/30 text-amber-200 hover:text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Menu className="w-4 h-4 text-[#F6BA35]" />
            <span className="hidden sm:inline">
              {sidebarOpen ? 'Ficha Menyu (Hide)' : 'Onyesha Menyu'}
            </span>
          </button>

          {/* Role Indicator / Switcher Pill */}
          {isPrivilegedUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#F6BA35]/50 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                title="Badili mtazamo wa jukumu (Mkurugenzi/Admin tu)"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentRoleInfo.color }} />
                <span className="text-white hidden md:inline">Jukumu:</span>
                <span className="text-[#F6BA35] font-extrabold">{currentRoleInfo.label.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-200" />
              </button>

              {/* Role Dropdown */}
              {roleSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-stone-900 border border-amber-400/40 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150 text-xs">
                  <div className="p-2 border-b border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Mamlaka ya Ukaguzi:</span>
                    <span className="text-[10px] text-[#F6BA35]">Admin / Director</span>
                  </div>
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => {
                    const info = ROLE_CONFIG[r];
                    const Icon = info.icon;
                    const isSelected = activeRole === r;

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setActiveRole(r);
                          setRoleSwitcherOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer mt-1 ${isSelected ? 'bg-[#F6BA35] text-stone-950 font-bold' : 'hover:bg-stone-800 text-stone-200'}`}
                      >
                        <div className="p-1 rounded-lg bg-black/30 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">{info.label}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-stone-900' : 'text-stone-400'}`}>
                            {info.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-400/20 text-xs font-bold flex items-center gap-2 select-none shadow-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentRoleInfo.color }} />
              <span className="text-stone-400 hidden md:inline">Wadhifa:</span>
              <span className="text-[#F6BA35] font-extrabold">{currentRoleInfo.label.split(' ')[0]}</span>
            </div>
          )}
        </div>

        {/* Right: Date, User Profile, Logout */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          
          {/* Live Date Badge with Calendar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setHeaderCalendarOpen(!headerCalendarOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-amber-400/20 hover:border-amber-400/50 text-xs text-amber-100/90 transition-all cursor-pointer shadow-sm"
              title="Fungua Kalenda ya Mfumo"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F6BA35]" />
              <span>Alhamisi, 24 Sep 2026</span>
            </button>

            {headerCalendarOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-900/95 border border-amber-400/40 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
                  <span className="font-bold text-[#F6BA35]">Kalenda ya Mfumo (2026)</span>
                  <button
                    type="button"
                    onClick={() => setHeaderCalendarOpen(false)}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-center py-1">
                  <div className="text-sm font-bold text-white">Septemba 2026</div>
                  <div className="text-[11px] text-stone-400">Juma la 39 • Robo ya 3</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center my-2 text-[10px] text-stone-400 font-bold">
                  <span>Jt</span><span>Jn</span><span>Jt</span><span>Al</span><span>Ij</span><span>Jm</span><span>Jp</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                  <span className="text-stone-600">31</span>
                  <span className="text-stone-300">1</span>
                  <span className="text-stone-300">2</span>
                  <span className="text-stone-300">3</span>
                  <span className="text-stone-300">4</span>
                  <span className="text-stone-300">5</span>
                  <span className="text-stone-300">6</span>
                  <span className="text-stone-300">7</span>
                  <span className="text-stone-300">8</span>
                  <span className="text-stone-300">9</span>
                  <span className="text-stone-300">10</span>
                  <span className="text-stone-300">11</span>
                  <span className="text-stone-300">12</span>
                  <span className="text-stone-300">13</span>
                  <span className="text-stone-300">14</span>
                  <span className="text-stone-300">15</span>
                  <span className="text-stone-300">16</span>
                  <span className="text-stone-300">17</span>
                  <span className="text-stone-300">18</span>
                  <span className="text-stone-300">19</span>
                  <span className="text-stone-300">20</span>
                  <span className="text-stone-300">21</span>
                  <span className="text-stone-300">22</span>
                  <span className="text-stone-300">23</span>
                  <span className="rounded-lg bg-[#F6BA35] text-stone-950 font-black shadow-md">24</span>
                  <span className="text-stone-300">25</span>
                  <span className="text-stone-300">26</span>
                  <span className="text-stone-300">27</span>
                  <span className="text-stone-300">28</span>
                  <span className="text-stone-300">29</span>
                  <span className="text-stone-300">30</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-amber-200/80 flex items-center justify-between">
                  <span>Leo: 24/09/2026</span>
                  <span className="text-emerald-400 font-bold">Mfumo Upo Hewani</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl hover:bg-stone-900/70 border border-transparent hover:border-amber-400/25 transition-all cursor-pointer"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F6BA35] to-amber-700 p-0.5">
                  <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center font-bold text-[11px] text-[#F6BA35] overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-stone-950 ${currentUser.isBlocked ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {currentUser.name}
                  <ChevronDown className="w-3 h-3 text-amber-200/70" />
                </span>
                <span className="text-[10px] text-amber-200/60 font-mono">
                  {currentRoleInfo.label.split(' ')[0]}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-900/95 border border-amber-400/30 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-400/20 text-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F6BA35] to-amber-700 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center font-bold text-xs text-[#F6BA35] overflow-hidden">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-[#F6BA35] font-mono truncate">{currentUser.username}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{currentUser.phone}</div>
                  </div>
                </div>

                {/* Change Avatar Section */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAvatar(!isEditingAvatar);
                      setTempAvatarUrl(currentUser.avatar || '');
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#F6BA35] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-amber-400/30"
                  >
                    <span>🖼️ Badili Picha ya Wasifu (Avatar)</span>
                  </button>

                  {isEditingAvatar && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-stone-800 space-y-2 text-xs">
                      <label className="block text-[11px] text-stone-300 font-semibold">Weka kiungo (URL) ya picha au chagua faili:</label>
                      <input
                        type="text"
                        value={tempAvatarUrl}
                        onChange={(e) => setTempAvatarUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg au data:image/..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-white focus:border-[#F6BA35] outline-none font-mono"
                      />
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setTempAvatarUrl(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="dashboard-avatar-file"
                        />
                        <label
                          htmlFor="dashboard-avatar-file"
                          className="flex-1 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-center text-[10px] font-bold cursor-pointer"
                        >
                          Chagua Faili
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updateUserAvatar(currentUser.id, tempAvatarUrl.trim());
                            setIsEditingAvatar(false);
                            setProfileDropdownOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-[#F6BA35] hover:bg-amber-400 text-stone-950 text-[10px] font-black cursor-pointer"
                        >
                          Hifadhi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full mt-1 px-3 py-2 rounded-xl text-left text-xs text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 transition-all cursor-pointer border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Toka kwenye Mfumo (Logout)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Logout Icon */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-stone-900/80 hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-500/30 transition-all cursor-pointer"
            title="Toka"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </header>

      {/* ======================================================================= */}
      {/* 2. BODY LAYOUT: SIDEBAR + ACTIVE ROLE PANEL */}
      {/* ======================================================================= */}
      <div className="relative flex-1 flex overflow-hidden">
        
        {/* ===================================================================== */}
        {/* SIDEBAR */}
        {/* ===================================================================== */}
        <aside 
          className={`relative z-20 shrink-0 border-r border-amber-400/20 backdrop-blur-2xl bg-stone-950/80 transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full overflow-hidden'}`}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            
            {/* Sidebar Brand Identity */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F6BA35]/20 border border-[#F6BA35]/40 flex items-center justify-center text-[#F6BA35] shadow-[0_0_15px_rgba(245,184,46,0.35)] shrink-0">
                <svg viewBox="0 0 100 90" className="w-6 h-6 text-[#F6BA35]" fill="none">
                  <path d="M50 4L90 28V68L50 88L10 68V28L50 4Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
                  <circle cx="50" cy="36" r="8" fill="currentColor"/>
                  <ellipse cx="50" cy="55" rx="10" ry="12" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider text-white font-display uppercase">
                  JACH SYSTEM
                </span>
                <span className="text-[9px] tracking-widest text-[#F6BA35] uppercase font-semibold">
                  Management System
                </span>
              </div>
            </div>

            {/* Navigation Menu Links By Roles */}
            <nav className="space-y-1.5 text-xs font-semibold">
              
              {/* If privileged (Admin or Director), show all department links */}
              {isPrivilegedUser ? (
                <>
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Ukaguzi wa Idara (All Roles)
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRole('managing_director')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'managing_director' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <Crown className="w-4 h-4" />
                    <span>Mkurugenzi (Mkuu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRole('system_admin')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'system_admin' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>System Admin (Udhibiti)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRole('muuzaji')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'muuzaji' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-[0_0_20px_rgba(245,184,46,0.5)]' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                    <span>Muuzaji (Mauzo & Madeni)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRole('manager_masoko')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'manager_masoko' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Manager Masoko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRole('mhasibu')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'mhasibu' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Mhasibu (Matumizi & Saini)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRole('stock')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${activeRole === 'stock' ? 'bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20' : 'text-stone-300 hover:text-white hover:bg-stone-900/60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>Stock / Stoo Kuu</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono text-[#F6BA35]">
                      {stockInventory.warehouseBoxes}
                    </span>
                  </button>
                </>
              ) : (
                /* For non-privileged users: STRICTLY SHOW ONLY THEIR ROLE'S DEDICATED PANEL */
                <>
                  <div className="px-3 py-1 text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">
                    Paneli Yako Maalumu
                  </div>

                  {userRealRole === 'muuzaji' && (
                    <button
                      type="button"
                      onClick={() => setActiveRole('muuzaji')}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20 cursor-default"
                    >
                      <DollarSign className="w-4 h-4 stroke-[2.5]" />
                      <span>Paneli ya Mauzo & Madeni Yangu</span>
                    </button>
                  )}

                  {userRealRole === 'manager_masoko' && (
                    <button
                      type="button"
                      onClick={() => setActiveRole('manager_masoko')}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20 cursor-default"
                    >
                      <Store className="w-4 h-4" />
                      <span>Paneli ya Masoko & Maboksi</span>
                    </button>
                  )}

                  {userRealRole === 'mhasibu' && (
                    <button
                      type="button"
                      onClick={() => setActiveRole('mhasibu')}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20 cursor-default"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Paneli ya Uhasibu & Matumizi</span>
                    </button>
                  )}

                  {userRealRole === 'stock' && (
                    <button
                      type="button"
                      onClick={() => setActiveRole('stock')}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-2xl bg-[#F6BA35] text-stone-950 font-bold shadow-lg shadow-amber-500/20 cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4" />
                        <span>Paneli ya Stock / Stoo Kuu</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono text-[#F6BA35]">
                        {stockInventory.warehouseBoxes}
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* Excel Report Download - Available for all authorized staff */}
              <div className="pt-2 border-t border-amber-400/10">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-300 hover:text-white hover:bg-stone-900/60 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Pakua Excel ya Mauzo</span>
                </button>
              </div>

            </nav>

          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-amber-400/15 text-[10px] text-amber-200/60 font-mono text-center">
            JACH SYSTEM v2.6 · 2026
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* MAIN ROLE CONTENT CONTAINER */}
        {/* ===================================================================== */}
        <main className="relative flex-1 p-4 sm:p-7 overflow-y-auto z-10 space-y-6">
          
          {/* IF CURRENT USER'S PANEL IS BLOCKED BY ADMIN: SHOW OFFICIAL LOCKOUT */}
          {currentUser.isBlocked ? (
            <div className="glass-panel-zamboo rounded-3xl p-8 sm:p-12 border border-rose-500/50 shadow-2xl text-center space-y-4 max-w-2xl mx-auto my-12 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-400 font-display">
                PANELI HII IMEZUIWA NA MSIMAMIZI MKUU
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Akaunti yako ya <strong>{currentUser.name}</strong> ({currentUser.username}) imezuiwa kufanya kazi au kuingiza miamala kwenye mfumo kwa sasa kulingana na maelekezo ya kiusalama.
              </p>
              <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/30 text-xs text-stone-400">
                Wasiliana na <strong>System Admin (Mhandisi Kelvin Peter)</strong> ili kukagua na kufungua akaunti yako.
              </div>
              <button
                type="button"
                onClick={() => setActiveRole('system_admin')}
                className="px-6 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
              >
                Fungua Paneli ya System Admin (Kama Msimamizi)
              </button>
            </div>
          ) : (
            <>
              {/* DYNAMIC ROLE PANEL RENDERING */}
              {activeRole === 'managing_director' && (
                <MkurugenziPanel onSwitchToPanel={(role) => setActiveRole(role)} />
              )}

              {activeRole === 'muuzaji' && (
                <MuuzajiPanel />
              )}

              {activeRole === 'manager_masoko' && (
                <ManagerMasokoPanel />
              )}

              {activeRole === 'mhasibu' && (
                <MhasibuPanel />
              )}

              {activeRole === 'stock' && (
                <StockPanel />
              )}

              {activeRole === 'system_admin' && (
                <AdminPanel onSwitchToPanel={(role) => setActiveRole(role)} />
              )}
            </>
          )}

        </main>

      </div>

    </div>
  );
};
