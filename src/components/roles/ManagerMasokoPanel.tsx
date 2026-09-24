import React, { useState, useMemo } from 'react';
import { useSystem } from '../../context/SystemContext';
import { SaleRecord } from '../../types/system';
import { downloadSaleReceiptPDF, triggerPrintDialog } from '../../utils/pdfReceiptGenerator';
import { 
  Users, 
  Boxes, 
  AlertTriangle, 
  Phone, 
  User, 
  DollarSign, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  Download,
  Printer,
  X,
  Eye,
  CheckCircle2,
  Clock,
  Store,
  CreditCard,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const ManagerMasokoPanel: React.FC = () => {
  const { sales, users, totalCompanyDebts, systemInfo } = useSystem();
  
  // Navigation Tabs: 'mauzo_yote' | 'wadaiwa' | 'utendaji_wauzaji'
  const [activeTab, setActiveTab] = useState<'mauzo_yote' | 'wadaiwa' | 'utendaji_wauzaji'>('mauzo_yote');

  // Filters
  const [selectedMuuzajiFilter, setSelectedMuuzajiFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vybu_gin' | 'bee_product'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'IMELIPWA' | 'INADAIWA'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Active Receipt Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleRecord | null>(null);

  // List of all salespersons
  const salespersons = useMemo(() => {
    return users.filter(u => u.role === 'muuzaji');
  }, [users]);

  // Aggregate stats per salesperson: boxes sold, total revenue, outstanding debts
  const salespersonStats = useMemo(() => {
    return salespersons.map(sp => {
      const spSales = sales.filter(s => 
        s.muuzajiId === sp.id || 
        s.muuzajiName === sp.name || 
        s.muuzajiName === sp.username ||
        s.muuzajiName?.toLowerCase().includes(sp.username?.toLowerCase() || '') ||
        s.muuzajiName?.toLowerCase().includes(sp.name?.toLowerCase() || '')
      );
      const totalBoxesSold = spSales.reduce((sum, s) => sum + s.maboksiSold, 0);
      const totalRevenue = spSales.reduce((sum, s) => sum + s.totalKiasi, 0);
      const cashCollected = spSales.reduce((sum, s) => sum + s.amountPaid, 0);
      const vybuGinDebt = spSales.filter(s => s.category === 'vybu_gin').reduce((sum, s) => sum + s.balanceDue, 0);
      const beeProductDebt = spSales.filter(s => s.category === 'bee_product').reduce((sum, s) => sum + s.balanceDue, 0);
      const totalDebt = vybuGinDebt + beeProductDebt;
      const debtorsCount = spSales.filter(s => s.balanceDue > 0).length;
      const salesCount = spSales.length;

      return {
        id: sp.id,
        name: sp.name,
        username: sp.username,
        phone: sp.phone,
        totalBoxesSold,
        totalRevenue,
        cashCollected,
        vybuGinDebt,
        beeProductDebt,
        totalDebt,
        debtorsCount,
        salesCount,
      };
    });
  }, [salespersons, sales]);

  // Filtered all sales (Mauzo Yote ya Wauzaji)
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Filter by Muuzaji
      if (selectedMuuzajiFilter !== 'all') {
        const matchesSp = 
          sale.muuzajiId === selectedMuuzajiFilter || 
          sale.muuzajiName === selectedMuuzajiFilter ||
          sale.muuzajiName?.toLowerCase().includes(selectedMuuzajiFilter.toLowerCase());
        if (!matchesSp) return false;
      }

      // Filter by Category
      if (categoryFilter !== 'all' && sale.category !== categoryFilter) {
        return false;
      }

      // Filter by Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'IMELIPWA' && sale.balanceDue > 0) return false;
        if (statusFilter === 'INADAIWA' && sale.balanceDue <= 0) return false;
      }

      // Filter by Payment Method
      if (paymentMethodFilter !== 'all' && sale.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          sale.mtejaName?.toLowerCase().includes(q) ||
          sale.mtejaPhone?.toLowerCase().includes(q) ||
          sale.muuzajiName?.toLowerCase().includes(q) ||
          sale.risitiNumber?.toLowerCase().includes(q) ||
          sale.items?.some(i => i.productName?.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [sales, selectedMuuzajiFilter, categoryFilter, statusFilter, paymentMethodFilter, searchQuery]);

  // Debts only list
  const allDebts = useMemo(() => {
    return filteredSales.filter(s => s.balanceDue > 0);
  }, [filteredSales]);

  // Total summary metrics
  const totalBoxesAll = sales.reduce((sum, s) => sum + s.maboksiSold, 0);
  const totalRevenueAll = sales.reduce((sum, s) => sum + s.totalKiasi, 0);
  const totalCashCollectedAll = sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const totalDebtsCount = sales.filter(s => s.balanceDue > 0).length;

  // Filtered totals
  const filteredTotalAmount = filteredSales.reduce((sum, s) => sum + s.totalKiasi, 0);
  const filteredBoxesSold = filteredSales.reduce((sum, s) => sum + s.maboksiSold, 0);
  const filteredPaidAmount = filteredSales.reduce((sum, s) => sum + s.amountPaid, 0);
  const filteredDebtAmount = filteredSales.reduce((sum, s) => sum + s.balanceDue, 0);

  // Export CSV of filtered sales
  const handleExportCSV = () => {
    const headers = 'TAREHE,RISITI,MUUZAJI,MTEJA,SIMU YA MTEJA,AINA YA BIDHAA,BIDHAA,MABOKSI,JUMLA (TZS),KILICHOLIPWA (TZS),DENI (TZS),NJIA YA MALIPO,HALI\n';
    const rows = filteredSales.map(s => 
      `"${s.tarehe}","${s.risitiNumber}","${s.muuzajiName}","${s.mtejaName}","${s.mtejaPhone || ''}","${s.category === 'vybu_gin' ? 'Vybu Gin' : 'Bee Products'}","${s.items.map(i => i.productName).join('; ')}",${s.maboksiSold},${s.totalKiasi},${s.amountPaid},${s.balanceDue},"${s.paymentMethod || 'Taslimu'}","${s.hali}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ripoti_Mauzo_Wauzaji_Manager_Masoko_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================================= */}
      {/* 1. MARKETING / SALES MANAGER KPI STATS */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue by All Salespersons */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>JUMLA YA MAUZO YA WAUZAJI</span>
            <span className="p-1.5 rounded-xl bg-amber-500/15 border border-[#F6BA35]/30 text-[#F6BA35]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F6BA35] font-mono">
            TZS {totalRevenueAll.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taslimu/Mtandaoni: TZS {totalCashCollectedAll.toLocaleString()}
          </p>
        </div>

        {/* Total Boxes Sold By Team */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-cyan-400/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>MABOKSI YALIYOUZWA SOKONI</span>
            <span className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-display">
            {totalBoxesAll} <span className="text-sm font-semibold text-stone-300">Box</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Jumla ya maboksi ya Vybu Gin</p>
        </div>

        {/* Total Debts Overall */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-rose-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>JUMLA YA MADENI YA WAUZAJI</span>
            <span className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            TZS {totalCompanyDebts.totalDebt.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-300/80 mt-1">
            Wateja {totalDebtsCount} wanadaiwa sokoni
          </p>
        </div>

        {/* Active Salespersons Count */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-purple-400/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>TIMU YA WAUZAJI</span>
            <span className="p-1.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-display">
            {salespersons.length} <span className="text-sm font-semibold text-stone-300">Wauzaji</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Miamala {sales.length} imeingizwa</p>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* 2. REAL-TIME LIVE SYNC ALERT & TAB CONTROLS */}
      {/* ======================================================================= */}
      <div className="glass-panel-zamboo rounded-3xl p-4 border border-amber-400/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Tab Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('mauzo_yote')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mauzo_yote'
                ? 'bg-[#F6BA35] text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-850 border border-stone-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Mauzo Yote ya Wauzaji ({sales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('utendaji_wauzaji')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'utendaji_wauzaji'
                ? 'bg-[#F6BA35] text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-850 border border-stone-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Uchambuzi wa Wauzaji ({salespersons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wadaiwa')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'wadaiwa'
                ? 'bg-[#F6BA35] text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-850 border border-stone-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Orodha ya Wadaiwa ({totalDebtsCount})</span>
          </button>
        </div>

        {/* Right: Live Sync Badge & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mauzo Yanaonekana Papo Hapo (Live Sync)</span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-400/30 hover:border-[#F6BA35] text-amber-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Pakua Ripoti ya CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pakua CSV</span>
          </button>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* 3. TAB 1: MAUZO YOTE YA WAUZAJI (LIVE COMPLETE SALES LEDGER) */}
      {/* ======================================================================= */}
      {activeTab === 'mauzo_yote' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/30 space-y-5">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-[#F6BA35]" />
                Daftari Kamili la Mauzo Yote ya Wauzaji (Live Sales Ledger)
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Kila muuzaji anapofanya mauzo, muamala unaingia hapa moja kwa moja ukiwa na maelezo kamili ya risiti, mteja, na kiasi.
              </p>
            </div>

            {/* Quick Metrics Bar for Filtered Data */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Jumla Iliyochujwa: </span>
                <strong className="text-[#F6BA35] font-mono">TZS {filteredTotalAmount.toLocaleString()}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Maboksi: </span>
                <strong className="text-cyan-300 font-mono">{filteredBoxesSold} Box</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Madeni: </span>
                <strong className="text-rose-400 font-mono">TZS {filteredDebtAmount.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Search and Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta namba ya risiti, mteja, muuzaji, bidhaa..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#F6BA35]"
              />
            </div>

            {/* Filter by Muuzaji */}
            <select
              value={selectedMuuzajiFilter}
              onChange={(e) => setSelectedMuuzajiFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#F6BA35]"
            >
              <option value="all">Wauzaji Wote</option>
              {salespersons.map(sp => (
                <option key={sp.id} value={sp.name}>{sp.name} ({sp.username})</option>
              ))}
            </select>

            {/* Filter by Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#F6BA35]"
            >
              <option value="all">Aina Zote za Bidhaa</option>
              <option value="vybu_gin">Vybu Gin Pekee</option>
              <option value="bee_product">Mazao ya Nyuki Pekee</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#F6BA35]"
            >
              <option value="all">Hali Zote za Malipo</option>
              <option value="IMELIPWA">Imelipwa Kamili</option>
              <option value="INADAIWA">Inadaiwa (Mkopo)</option>
            </select>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800 shadow-inner">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Namba ya Risiti</th>
                  <th className="px-4 py-3">Muuzaji (Afisa)</th>
                  <th className="px-4 py-3">Mteja</th>
                  <th className="px-4 py-3">Bidhaa Zilizouzwa</th>
                  <th className="px-4 py-3 text-right">Maboksi</th>
                  <th className="px-4 py-3 text-right">Jumla (TZS)</th>
                  <th className="px-4 py-3 text-right">Imelipwa (TZS)</th>
                  <th className="px-4 py-3 text-right">Deni (TZS)</th>
                  <th className="px-4 py-3">Njia ya Malipo</th>
                  <th className="px-4 py-3 text-center">Hali</th>
                  <th className="px-4 py-3 text-center">Risiti (Hati)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-stone-900/30">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-stone-500">
                      Hakuna mauzo yaliyopatikana kulingana na vichujio ulivyoweka.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-amber-500/5 transition-colors">
                      
                      {/* Tarehe */}
                      <td className="px-4 py-3 text-stone-300 font-mono">
                        {sale.tarehe}
                      </td>

                      {/* Risiti */}
                      <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">
                        {sale.risitiNumber}
                      </td>

                      {/* Muuzaji */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-bold text-white">{sale.muuzajiName}</span>
                        </div>
                      </td>

                      {/* Mteja */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-200">{sale.mtejaName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{sale.mtejaPhone || 'Hana Simu'}</div>
                      </td>

                      {/* Bidhaa */}
                      <td className="px-4 py-3 max-w-[220px] truncate" title={sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}>
                        <span className="text-stone-300">
                          {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </span>
                      </td>

                      {/* Maboksi Sold */}
                      <td className="px-4 py-3 text-right font-display font-bold text-cyan-300">
                        {sale.maboksiSold > 0 ? `${sale.maboksiSold} Box` : '-'}
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        TZS {sale.totalKiasi.toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">
                        TZS {sale.amountPaid.toLocaleString()}
                      </td>

                      {/* Balance Due */}
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {sale.balanceDue > 0 ? (
                          <span className="text-rose-400">TZS {sale.balanceDue.toLocaleString()}</span>
                        ) : (
                          <span className="text-stone-500">TZS 0</span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                          {sale.paymentMethod || (sale.isCredit ? 'Mkopo' : 'Taslimu')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sale.balanceDue === 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {sale.balanceDue === 0 ? 'IMELIPWA' : 'INADAIWA'}
                        </span>
                      </td>

                      {/* Receipt Actions */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveReceiptSale(sale)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-[#F6BA35] text-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Kagua Risiti</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. TAB 2: UTENDAJI WA KILA MUUZAJI (SALESPERSON PERFORMANCE STATS) */}
      {/* ======================================================================= */}
      {activeTab === 'utendaji_wauzaji' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/30 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F6BA35]" />
              Uchambuzi wa Wauzaji (Maboksi Yaliyouzwa & Mapato ya Kila Muuzaji)
            </h3>
            <p className="text-xs text-stone-400">
              Ulinganifu wa utendaji wa kila muuzaji: jumla ya mauzo, maboksi ya Vybu Gin, fedha zilizokusanywa, na madeni anayodai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salespersonStats.map((sp, idx) => (
              <div 
                key={sp.id}
                className="p-5 rounded-3xl bg-stone-900/80 border border-amber-400/25 space-y-3 relative overflow-hidden group hover:border-[#F6BA35] transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#F6BA35]/20 border border-[#F6BA35]/40 flex items-center justify-center font-black text-sm text-[#F6BA35]">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{sp.name}</h4>
                      <span className="text-[11px] text-stone-400 font-mono">{sp.phone}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMuuzajiFilter(sp.name);
                      setActiveTab('mauzo_yote');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-[#F6BA35] hover:bg-[#F6BA35] hover:text-stone-950 transition-all cursor-pointer"
                  >
                    Ona Mauzo ({sp.salesCount})
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Maboksi Yaliyouzwa</span>
                    <span className="text-lg font-black text-cyan-300 font-display">{sp.totalBoxesSold} Box</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Jumla ya Mauzo</span>
                    <span className="text-xs font-bold text-white font-mono">TZS {sp.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Fedha Zilizokusanywa</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">TZS {sp.cashCollected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Madeni Yaliyobaki</span>
                    <span className="text-xs font-bold text-rose-400 font-mono">TZS {sp.totalDebt.toLocaleString()}</span>
                  </div>
                </div>

                {/* Breakdown & Debtors Count */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Wateja Wanaodaiwa:</span>
                  <span className="font-bold text-rose-400">{sp.debtorsCount} Wadaiwa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. TAB 3: ORODHA YA WADAIWA (DEBTORS MANAGEMENT) */}
      {/* ======================================================================= */}
      {activeTab === 'wadaiwa' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/30 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-rose-400" />
                Orodha ya Wadaiwa Wote (Majina, Namba za Simu, Kiasi na Muuzaji Husika)
              </h3>
              <p className="text-xs text-stone-400">
                Fuatilia kila mteja anayedaiwa na muuzaji anayehusika naye kwa ajili ya ukusanyaji wa fedha.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tafuta mteja, namba, muuzaji..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#F6BA35]"
                />
              </div>

              <select
                value={selectedMuuzajiFilter}
                onChange={(e) => setSelectedMuuzajiFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 focus:outline-none"
              >
                <option value="all">Wauzaji Wote</option>
                {salespersons.map(sp => (
                  <option key={sp.id} value={sp.name}>{sp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Debtors Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Jina la Mdaiwa (Mteja)</th>
                  <th className="px-4 py-3">Namba ya Simu</th>
                  <th className="px-4 py-3">Muuzaji Aliyekopesha</th>
                  <th className="px-4 py-3">Aina ya Bidhaa</th>
                  <th className="px-4 py-3">Bidhaa Iliyokopeshwa</th>
                  <th className="px-4 py-3 text-right">Kiasi cha Mauzo</th>
                  <th className="px-4 py-3 text-right">Salio la Deni</th>
                  <th className="px-4 py-3">Tarehe ya Deni</th>
                  <th className="px-4 py-3 text-center">Hatua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium">
                {allDebts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-stone-500">
                      Hakuna rekodi za madeni zinazolingana na vichujio ulivyochagua.
                    </td>
                  </tr>
                ) : (
                  allDebts.map(debt => (
                    <tr key={debt.id} className="hover:bg-rose-500/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {debt.mtejaName}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#F6BA35]">
                        <a href={`tel:${debt.mtejaPhone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {debt.mtejaPhone}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-200">
                        {debt.muuzajiName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debt.category === 'vybu_gin' ? 'bg-amber-500/20 text-[#F6BA35]' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {debt.category === 'vybu_gin' ? 'Vybu Gin' : 'Mazao ya Nyuki'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-300">
                        {debt.items.map(i => i.productName).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-stone-400">
                        TZS {debt.totalKiasi.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-rose-400 font-extrabold text-sm">
                        TZS {debt.balanceDue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-stone-400">{debt.tarehe}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Kikumbusho cha deni kimetumwa kwa muuzaji ${debt.muuzajiName} ili kumfuatilia mteja ${debt.mtejaName} (${debt.mtejaPhone})!`)}
                          className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-[#F6BA35] text-[#F6BA35] hover:text-stone-950 border border-amber-400/40 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Tuma Kikumbusho
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 6. POPUP MODAL: OFFICIAL A4 RECEIPT VIEWER FOR MANAGER MASOKO */}
      {/* ======================================================================= */}
      {activeReceiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#F6BA35]" />
                <h3 className="text-base font-bold text-white font-display">
                  Stakabadhi Rasmi ya Mauzo (Official Invoice)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptSale(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Preview Body */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-stone-800">
                <h4 className="text-sm font-black text-[#F6BA35] uppercase">{systemInfo.officeName}</h4>
                <p className="text-[11px] text-stone-400">TIN: {systemInfo.tin} | Simu: {systemInfo.phone}</p>
                <p className="text-[10px] text-stone-500">{systemInfo.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] pb-3 border-b border-stone-800">
                <div>
                  <span className="text-stone-400 block">Namba ya Risiti:</span>
                  <strong className="text-[#F6BA35] font-mono">{activeReceiptSale.risitiNumber}</strong>
                  <span className="text-stone-400 block mt-1">Tarehe ya Mauzo:</span>
                  <strong className="text-white">{activeReceiptSale.tarehe}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Muuzaji (Afisa):</span>
                  <strong className="text-white">{activeReceiptSale.muuzajiName}</strong>
                  <span className="text-stone-400 block mt-1">Jina la Mteja:</span>
                  <strong className="text-amber-200">{activeReceiptSale.mtejaName} ({activeReceiptSale.mtejaPhone})</strong>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <div className="text-stone-400 font-bold uppercase text-[10px]">Orodha ya Bidhaa:</div>
                {activeReceiptSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-stone-900 text-xs">
                    <div>
                      <span className="font-bold text-white">{item.productName}</span>
                      <span className="text-stone-400 text-[10px] block">Idadi: {item.quantity} x TZS {item.unitPrice.toLocaleString()}</span>
                    </div>
                    <span className="font-mono font-bold text-white">TZS {item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-stone-800 space-y-1 text-right">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Jumla Kuu ya Mauzo:</span>
                  <span className="font-mono text-[#F6BA35]">TZS {activeReceiptSale.totalKiasi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Kiasi Kilicholipwa:</span>
                  <span className="font-mono">TZS {activeReceiptSale.amountPaid.toLocaleString()}</span>
                </div>
                {activeReceiptSale.balanceDue > 0 && (
                  <div className="flex justify-between text-xs font-bold text-rose-400">
                    <span>Baki ya Deni (Mkopo):</span>
                    <span className="font-mono">TZS {activeReceiptSale.balanceDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => triggerPrintDialog()}
                className="px-4 py-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha (Print)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadSaleReceiptPDF(activeReceiptSale, systemInfo)}
                className="px-5 py-2 rounded-2xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Pakua Risiti ya A4 (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
