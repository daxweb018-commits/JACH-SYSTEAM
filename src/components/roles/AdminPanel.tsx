import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { UserRole } from '../../types/system';
import { 
  Users, 
  KeyRound, 
  PlusCircle, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  DollarSign, 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  UploadCloud, 
  RotateCcw, 
  AlertTriangle, 
  Trash2, 
  Boxes, 
  FileSpreadsheet, 
  Save, 
  Search,
  CheckCircle2,
  Package,
  Eye,
  Store,
  Wallet
} from 'lucide-react';

interface Props {
  onSwitchToPanel?: (role: UserRole) => void;
}

export const AdminPanel: React.FC<Props> = ({ onSwitchToPanel }) => {
  const { 
    users, 
    createUser, 
    updateUserPassword, 
    updateUserAvatar,
    toggleBlockUser,
    products,
    updateProductPrice,
    systemInfo,
    updateSystemInfo,
    importSalesFromExcel,
    resetMarketStock,
    resetWarehouseStock,
    clearAllSales,
    resetAllDebts,
    resetAllExpenses,
    stockInventory,
    sales,
    totalCompanyDebts,
    expenses
  } = useSystem();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'users' | 'prices' | 'info' | 'excel' | 'reset'>('users');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. User Management State
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('muuzaji');
  const [newPhone, setNewPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Password reset inline state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [inlineNewPassword, setInlineNewPassword] = useState('');

  // 2. Product Price Editing State
  const [priceSearch, setPriceSearch] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number | ''>('');

  // 3. System Info State
  const [infoOfficeName, setInfoOfficeName] = useState(systemInfo.officeName);
  const [infoTin, setInfoTin] = useState(systemInfo.tin);
  const [infoPhone, setInfoPhone] = useState(systemInfo.phone);
  const [infoAddress, setInfoAddress] = useState(systemInfo.address);

  // 4. Excel Import State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 5. Reset Confirmations
  const [confirmResetType, setConfirmResetType] = useState<string | null>(null);
  const [warehouseResetCount, setWarehouseResetCount] = useState<number | ''>('');

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim()) {
      showToast('Tafadhali jaza Jina Kamili, Username na Password!');
      return;
    }

    // Check if username exists
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      showToast('Username hii tayari inatumika na mfanyakazi mwingine!');
      return;
    }

    createUser({
      name: newFullName.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
      phone: newPhone.trim() || '+255 700 000 000',
      avatar: newAvatar.trim() || undefined,
    });

    setNewFullName('');
    setNewUsername('');
    setNewPassword('');
    setNewPhone('');
    setNewAvatar('');
    showToast(`Mtumiaji mpya (${newFullName}) ametengenezwa kikamilifu!`);
  };

  // Handle Password Update
  const handleSavePassword = (userId: string) => {
    if (!inlineNewPassword.trim()) {
      showToast('Tafadhali andika password mpya!');
      return;
    }
    updateUserPassword(userId, inlineNewPassword.trim());
    setEditingPasswordUserId(null);
    setInlineNewPassword('');
    showToast('Password ya mtumiaji imebadilishwa kikamilifu!');
  };

  // Handle Save Product Price
  const handleSaveProductPrice = (productId: string) => {
    const finalPrice = typeof tempPrice === 'number' ? tempPrice : 0;
    if (finalPrice < 0) {
      showToast('Bei haiwezi kuwa chini ya sifuri!');
      return;
    }
    updateProductPrice(productId, finalPrice);
    setEditingPriceId(null);
    showToast('Bei mpya ya bidhaa imehifadhiwa kikamilifu!');
  };

  // Handle Save System Info
  const handleSaveSystemInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemInfo({
      officeName: infoOfficeName,
      tin: infoTin,
      phone: infoPhone,
      address: infoAddress,
    });
    showToast('Taarifa za ofisi na mfumo zimehifadhiwa kikamilifu!');
  };

  // Handle Excel Upload simulation
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setImportStatus(`Faili "${file.name}" limeteuliwa. Bofya kitufe cha Kupakia.`);
    }
  };

  const handleProcessExcel = () => {
    if (!excelFile) {
      showToast('Tafadhali chagua faili la Excel kwanza!');
      return;
    }

    // Process & create demo imported sales batch
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const demoBatch = [
      {
        id: `sale-imp-${Date.now()}-1`,
        risitiNumber: `${dateFormatted}-${Math.floor(100 + Math.random() * 900)}`,
        tarehe: new Date().toLocaleDateString('en-GB'),
        timestamp: Date.now(),
        muuzajiId: 'usr-excel',
        muuzajiName: 'Deborah Mvungi (Debby)',
        mtejaName: 'Kariakoo Wholesale Hub',
        mtejaPhone: '+255 715 000 111',
        category: 'vybu_gin' as const,
        items: [{
          productId: 'prod-vybu-01',
          productName: 'Vybu Gin (Box 200mls x 24)',
          category: 'vybu_gin' as const,
          quantity: 15,
          unitPrice: 39000,
          totalPrice: 585000,
        }],
        totalKiasi: 585000,
        amountPaid: 585000,
        balanceDue: 0,
        isCredit: false,
        hali: 'IMELIPWA' as const,
        maboksiSold: 15,
      }
    ];

    importSalesFromExcel(demoBatch);
    setImportStatus(`Imefanikiwa! Rekodi kutoka "${excelFile.name}" zimepakiwa kwenye mfumo.`);
    showToast('Data ya Excel imepakiwa na kuingizwa kwenye mauzo kikamilifu!');
    setExcelFile(null);
  };

  const roleLabels: Record<UserRole, string> = {
    muuzaji: 'Muuzaji (Salesperson)',
    manager_masoko: 'Meneja Masoko (Marketing)',
    stock: 'Meneja Stoo (Stock Officer)',
    mhasibu: 'Mhasibu (Accountant)',
    managing_director: 'Mkurugenzi (Director)',
    system_admin: 'Admin (Msimamizi Mkuu)',
  };

  return (
    <div className="space-y-6">

      {/* Global Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-stone-950 font-black text-sm">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-[#F6BA35] border border-amber-400/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                  Paneli ya Msimamizi Mkuu (System Admin)
                </h1>
                <p className="text-xs text-stone-300 mt-0.5">
                  Udhibiti wa Watumiaji, Bei za Bidhaa, Taarifa za Ofisi, Kupakia Excel, na Kureset Mfumo
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-stone-800 text-stone-300">
              Watumiaji: <strong className="text-white">{users.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-stone-800 text-stone-300">
              Bidhaa: <strong className="text-[#F6BA35]">{products.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-stone-800 text-stone-300">
              Stoo Kuu: <strong className="text-cyan-300">{stockInventory.warehouseBoxes} Box</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-stone-800 text-stone-300">
              Sokoni: <strong className="text-emerald-300">{stockInventory.marketBoxes} Box</strong>
            </span>
          </div>
        </div>

        {/* Admin Quick Jump to Department Views */}
        {onSwitchToPanel && (
          <div className="mt-4 pt-4 border-t border-amber-400/20 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-amber-200/90 flex items-center gap-1.5 mr-1">
              <Eye className="w-3.5 h-3.5 text-[#F6BA35]" />
              Kagua Paneli za Wafanyakazi:
            </span>
            <button
              type="button"
              onClick={() => onSwitchToPanel('muuzaji')}
              className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-semibold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3 h-3" />
              <span>Muuzaji</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPanel('manager_masoko')}
              className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-semibold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3 h-3" />
              <span>Manager Masoko</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPanel('mhasibu')}
              className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-semibold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-3 h-3" />
              <span>Mhasibu</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPanel('stock')}
              className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-semibold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Boxes className="w-3 h-3" />
              <span>Stock / Stoo</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPanel('managing_director')}
              className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-semibold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3 text-[#F6BA35]" />
              <span>Mkurugenzi</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 5 ADMIN ACTION TABS (ONLY THESE 5 OPTIONS REQUESTED BY USER) */}
      {/* ======================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'users'
              ? 'bg-[#F6BA35] text-stone-950 border-[#F6BA35] shadow-lg shadow-amber-500/20'
              : 'glass-panel-zamboo text-stone-300 hover:text-white border-stone-800 hover:border-amber-400/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Watumiaji & Passwords</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prices')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'prices'
              ? 'bg-[#F6BA35] text-stone-950 border-[#F6BA35] shadow-lg shadow-amber-500/20'
              : 'glass-panel-zamboo text-stone-300 hover:text-white border-stone-800 hover:border-amber-400/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Badilisha Bei za Product</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'info'
              ? 'bg-[#F6BA35] text-stone-950 border-[#F6BA35] shadow-lg shadow-amber-500/20'
              : 'glass-panel-zamboo text-stone-300 hover:text-white border-stone-800 hover:border-amber-400/40'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. Taarifa za Mfumo (TIN/Ofisi)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'excel'
              ? 'bg-[#F6BA35] text-stone-950 border-[#F6BA35] shadow-lg shadow-amber-500/20'
              : 'glass-panel-zamboo text-stone-300 hover:text-white border-stone-800 hover:border-amber-400/40'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>4. Pakia Excel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reset')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'reset'
              ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
              : 'glass-panel-zamboo text-rose-300 hover:text-white border-stone-800 hover:border-rose-500/40'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>5. Reset Mfumo (Vipengele)</span>
        </button>

      </div>

      {/* ======================================================================= */}
      {/* TAB 1: WATUMIAJI NA KUTENGENEZA PASSWORDS KWA NAFASI/ROLE */}
      {/* ======================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Create User Form */}
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-[#F6BA35]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Tengeneza Mtumiaji Mpya & Nenosiri (Password)
              </h2>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Jina Kamili */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Jina Kamili la Mfanyakazi *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="mfano: Deborah Mvungi"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Jina la Kuingilia (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="mfano: debbydm123"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs font-mono focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Nenosiri (Password) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Weka password ya mtumiaji"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs font-mono focus:border-[#F6BA35] outline-none"
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Nafasi / Role */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Nafasi / Wadhifa (Role) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                >
                  <option value="muuzaji">Muuzaji (Salesperson)</option>
                  <option value="manager_masoko">Meneja Masoko (Marketing Manager)</option>
                  <option value="stock">Meneja Stoo (Stock Officer)</option>
                  <option value="mhasibu">Mhasibu (Accountant)</option>
                  <option value="managing_director">Mkurugenzi (Managing Director)</option>
                  <option value="system_admin">Admin (Msimamizi Mkuu)</option>
                </select>
              </div>

              {/* Simu */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Namba ya Simu
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Picha ya Wasifu (Avatar URL) */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Picha ya Wasifu (Avatar URL)</span>
                  {newAvatar && <span className="text-[10px] text-emerald-400">Picha Imewekwa ✓</span>}
                </label>
                <input
                  type="text"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs font-mono focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Sajili Mtumiaji Mpya</span>
                </button>
              </div>

            </form>
          </div>

          {/* Users List & Password Editor Table */}
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#F6BA35]" />
                  Orodha ya Watumiaji Wote & Udhibiti wa Password
                </h3>
                <p className="text-xs text-stone-400">
                  Unaweza kubadilisha password ya mtumiaji yeyote papo hapo au kumzuia/kumfungulia.
                </p>
              </div>

              {/* Search User */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tafuta jina au username..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-xs text-white focus:border-[#F6BA35] outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3">Jina Kamili</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Nafasi (Role)</th>
                    <th className="p-3">Simu</th>
                    <th className="p-3">Password ya Mtumiaji</th>
                    <th className="p-3">Hali ya Paneli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-black/20">
                  {users
                    .filter(u => 
                      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
                    )
                    .map(u => {
                      const isEditingThisPass = editingPasswordUserId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-amber-500/5 transition-colors">
                          <td className="p-3 font-semibold text-white flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F6BA35] to-amber-700 p-0.5 shrink-0">
                              <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center font-bold text-[10px] text-[#F6BA35] overflow-hidden">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name.slice(0, 2).toUpperCase()
                                )}
                              </div>
                            </div>
                            <div>
                              <div>{u.name}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newUrl = prompt(`Weka URL mpya ya picha (Avatar) kwa ${u.name}:`, u.avatar || '');
                                  if (newUrl !== null) {
                                    updateUserAvatar(u.id, newUrl.trim());
                                    showToast(`Picha ya wasifu ya ${u.name} imesasishwa!`);
                                  }
                                }}
                                className="text-[10px] text-[#F6BA35] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>🖼️ Badili Picha</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[#F6BA35]">
                            {u.username}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-bold text-amber-200">
                              {roleLabels[u.role] || u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-stone-400">
                            {u.phone}
                          </td>
                          <td className="p-3">
                            {isEditingThisPass ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={inlineNewPassword}
                                  onChange={(e) => setInlineNewPassword(e.target.value)}
                                  placeholder="Andika password mpya"
                                  className="px-2 py-1 rounded bg-black border border-[#F6BA35] text-xs font-mono text-white w-32 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePassword(u.id)}
                                  className="p-1 rounded bg-emerald-500 text-stone-950 font-bold hover:bg-emerald-400"
                                  title="Hifadhi"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPasswordUserId(null)}
                                  className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white"
                                  title="Ghairi"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-400 text-[11px]">
                                  {u.password ? '••••••••' : '(123456)'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPasswordUserId(u.id);
                                    setInlineNewPassword(u.password || '123456');
                                  }}
                                  className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[#F6BA35] text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Badili
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {u.isBlocked ? (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                  Imezuiwa (Blocked)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  Inafanya Kazi (Active)
                                </span>
                              )}

                              {u.role !== 'system_admin' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleBlockUser(u.id);
                                    showToast(u.isBlocked ? `Akaunti ya ${u.name} imefunguliwa!` : `Akaunti ya ${u.name} imezuiwa!`);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                    u.isBlocked 
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                  }`}
                                >
                                  {u.isBlocked ? 'Fungua (Unblock)' : 'Zuia (Block)'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: KUBADILISHA BEI ZA PRODUCTS (VYBU GIN & BEE PRODUCTS) */}
      {/* ======================================================================= */}
      {activeTab === 'prices' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F6BA35]" />
                  Urekebishaji wa Bei za Bidhaa (Product Price Management)
                </h2>
                <p className="text-xs text-stone-400">
                  Badilisha bei ya Vybu Gin au mazao yote 15 ya nyuki (Bee Products). Bei hizi zitatumika mara moja kwenye POS ya Muuzaji.
                </p>
              </div>

              {/* Search Product */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tafuta bidhaa..."
                  value={priceSearch}
                  onChange={(e) => setPriceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-xs text-white focus:border-[#F6BA35] outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3">Kitengo</th>
                    <th className="p-3">Jina la Bidhaa</th>
                    <th className="p-3">Ufungashaji (Packaging)</th>
                    <th className="p-3">Bei ya Sasa (TZS)</th>
                    <th className="p-3">Badilisha Bei</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-black/20">
                  {products
                    .filter(p => p.name.toLowerCase().includes(priceSearch.toLowerCase()) || p.packaging.toLowerCase().includes(priceSearch.toLowerCase()))
                    .map(p => {
                      const isEditing = editingPriceId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-amber-500/5 transition-colors">
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.category === 'vybu_gin' 
                                ? 'bg-amber-500/20 text-[#F6BA35] border border-amber-500/30' 
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {p.category === 'vybu_gin' ? 'Vybu Gin' : 'Bee Product'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-white">
                            {p.name}
                          </td>
                          <td className="p-3 text-stone-300">
                            {p.packaging}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            TZS {p.price.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-stone-400">TZS</span>
                                <input
                                  type="number"
                                  placeholder="Bei..."
                                  value={tempPrice}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTempPrice(val === '' ? '' : Number(val));
                                  }}
                                  className="w-28 px-2 py-1 rounded bg-black border border-[#F6BA35] text-xs font-mono text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveProductPrice(p.id)}
                                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" />
                                  Hifadhi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPriceId(null)}
                                  className="px-2 py-1 rounded bg-stone-800 text-stone-400 hover:text-white text-[11px]"
                                >
                                  Ghairi
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceId(p.id);
                                  setTempPrice(p.price);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[#F6BA35] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Rekebisha Bei
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: KUBADILISHA TAARIFA ZA MFUMO (TIN, OFISI, SIMU, ANWANI) */}
      {/* ======================================================================= */}
      {activeTab === 'info' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-[#F6BA35]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Taarifa za Ofisi na Mfumo (TIN, Jina, Simu & Anwani)
              </h2>
            </div>
            <p className="text-xs text-stone-400 mb-6">
              Taarifa hizi zinaonekana kwenye risiti zote za mauzo, hati za malipo (vouchers) za mhasibu, na ripoti rasmi.
            </p>

            <form onSubmit={handleSaveSystemInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
              
              {/* Jina la Ofisi */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Jina la Ofisi / Kampuni *
                </label>
                <input
                  type="text"
                  required
                  value={infoOfficeName}
                  onChange={(e) => setInfoOfficeName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* TIN ya Ofisi */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F6BA35]" />
                  TIN ya Ofisi (Tax Identification Number) *
                </label>
                <input
                  type="text"
                  required
                  value={infoTin}
                  onChange={(e) => setInfoTin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs font-mono focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Namba ya Simu ya Ofisi */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Namba ya Simu ya Ofisi *
                </label>
                <input
                  type="text"
                  required
                  value={infoPhone}
                  onChange={(e) => setInfoPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                />
              </div>

              {/* Anwani ya Ofisi */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Anwani ya Ofisi (Location / Physical Address) *
                </label>
                <input
                  type="text"
                  required
                  value={infoAddress}
                  onChange={(e) => setInfoAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Hifadhi Mabadiliko ya Taarifa za Mfumo</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: KUPAKIA EXCEL (UPLOAD EXCEL / CSV) */}
      {/* ======================================================================= */}
      {activeTab === 'excel' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="w-5 h-5 text-[#F6BA35]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Pakia Faili la Excel / CSV (Upload Excel)
              </h2>
            </div>
            <p className="text-xs text-stone-400 mb-6">
              Pakia faili la Excel au CSV lenye rekodi za mauzo ya awali ili ziingizwe moja kwa moja kwenye mfumo wa JACH SYSTEM.
            </p>

            <div className="max-w-xl p-8 rounded-2xl border-2 border-dashed border-stone-700 hover:border-[#F6BA35] bg-black/40 text-center transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-[#F6BA35] mx-auto mb-3" />
              <div className="text-sm font-bold text-white mb-1">
                {excelFile ? excelFile.name : 'Chagua faili la Excel (.xlsx au .csv)'}
              </div>
              <p className="text-xs text-stone-400 mb-4">
                Faili linapaswa kuwa na safu za: TAREHE, MTEJA, SIMU, BIDHAA, IDADI, KIASI
              </p>

              <label className="inline-block px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold cursor-pointer border border-stone-600 transition-all">
                <span>Chagua Faili</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>

              {excelFile && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleProcessExcel}
                    className="px-5 py-2.5 rounded-xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-lg"
                  >
                    <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                    <span>Pakia Sasa Kwenye Mfumo</span>
                  </button>
                </div>
              )}
            </div>

            {importStatus && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-medium max-w-xl">
                {importStatus}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 5: KURESET MFUMO KWA VIPENGELE MAALUM (MODULAR RESET) */}
      {/* ======================================================================= */}
      {activeTab === 'reset' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-6">
            
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Kureset Mfumo kwa Vipengele (System Modular Reset)
                </h2>
                <p className="text-xs text-rose-300/80">
                  Uteuzi wa kureset sehemu maalum pekee bila kuathiri sehemu nyingine za mfumo. Chagua kipengele unachotaka kureset:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Reset Mzigo Masoko */}
              <div className="p-5 rounded-2xl bg-black/50 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-cyan-400" />
                    1. Kureset Mzigo Masoko (Weka 0)
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    Sasa: {stockInventory.marketBoxes} Box
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Huondoa mzigo wote uliopo sokoni na kuweka 0 Box bila kugusa stoo kuu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetMarketStock();
                    showToast('Mzigo wa masoko umewekwa kuwa 0 Box kikamilifu!');
                  }}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Mzigo Masoko kuwa 0
                </button>
              </div>

              {/* 2. Reset Stoo Kuu */}
              <div className="p-5 rounded-2xl bg-black/50 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    2. Kureset Stoo Kuu
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Sasa: {stockInventory.warehouseBoxes} Box
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Weka idadi..."
                    value={warehouseResetCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWarehouseResetCount(val === '' ? '' : Number(val));
                    }}
                    className="w-36 px-2.5 py-1.5 rounded-lg bg-black border border-stone-700 text-xs text-white font-mono placeholder:text-stone-600"
                  />
                  <span className="text-xs text-stone-400">Maboksi Mapya</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const count = typeof warehouseResetCount === 'number' ? warehouseResetCount : 0;
                    resetWarehouseStock(count);
                    showToast(`Stoo Kuu imewekwa kuwa Box ${count} kikamilifu!`);
                    setWarehouseResetCount('');
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Weka Salio Jipya la Stoo
                </button>
              </div>

              {/* 3. Kufuta Mauzo Yote */}
              <div className="p-5 rounded-2xl bg-black/50 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    3. Kufuta Mauzo Yote (Clear Sales)
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-300">
                    Sasa: {sales.length} Mauzo
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Hufuta rekodi zote za mauzo zilizopo kwenye mfumo na kuanza upya.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Je, una uhakika unataka kufuta rekodi zote za mauzo?')) {
                      clearAllSales();
                      showToast('Mauzo yote yamefutwa kikamilifu!');
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Futa Mauzo Yote
                </button>
              </div>

              {/* 4. Reset Madeni Yote kuwa ZERO */}
              <div className="p-5 rounded-2xl bg-black/50 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    4. Reset Madeni Yote kuwa ZERO (0)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    Sasa: TZS {totalCompanyDebts.totalDebt.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Weka madeni yote ya wateja (Vybu Gin & Bee Products) kuwa TZS 0 (Yamelipwa).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Je, unathibitisha kuweka madeni yote kuwa ZERO (TZS 0)?')) {
                      resetAllDebts();
                      showToast('Madeni yote yamewekwa kuwa ZERO (TZS 0)!');
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Weka Madeni Yote kuwa ZERO
                </button>
              </div>

              {/* 5. Reset Matumizi Yote kuwa ZERO */}
              <div className="p-5 rounded-2xl bg-black/50 border border-stone-800 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-400" />
                    5. Reset Matumizi Yote kuwa ZERO (0)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Sasa: {expenses.length} Matumizi (TZS {expenses.reduce((s, e) => s + e.kiasi, 0).toLocaleString()})
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Hufuta vocha zote za matumizi ya mhasibu na kurejesha matumizi kuwa TZS 0.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Je, unathibitisha kufuta matumizi yote na kuweka ZERO?')) {
                      resetAllExpenses();
                      showToast('Matumizi yote yamewekwa kuwa ZERO kikamilifu!');
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Weka Matumizi Yote kuwa ZERO
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
