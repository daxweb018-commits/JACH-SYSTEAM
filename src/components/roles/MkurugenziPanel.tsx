import React, { useState, useMemo } from 'react';
import { useSystem } from '../../context/SystemContext';
import { UserRole, SaleRecord } from '../../types/system';
import { downloadSaleReceiptPDF, triggerPrintDialog } from '../../utils/pdfReceiptGenerator';
import { 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  Eye, 
  ShieldAlert, 
  BarChart2, 
  ArrowUpRight,
  Users,
  Search,
  Filter,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Store,
  Printer,
  Download,
  X,
  Sparkles
} from 'lucide-react';

interface Props {
  onSwitchToPanel: (role: UserRole) => void;
}

export const MkurugenziPanel: React.FC<Props> = ({ onSwitchToPanel }) => {
  const { 
    sales, 
    stockInventory, 
    totalCompanyDebts, 
    expenses,
    users,
    systemInfo 
  } = useSystem();

  // Search & Filter for Director's Sales Stream
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedMuuzajiFilter, setSelectedMuuzajiFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vybu_gin' | 'bee_product'>('all');
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleRecord | null>(null);

  // List of all salespersons
  const salespersons = useMemo(() => {
    return users.filter(u => u.role === 'muuzaji');
  }, [users]);

  // Total Company Metrics
  const totalRevenueAll = useMemo(() => sales.reduce((sum, s) => sum + s.totalKiasi, 0), [sales]);
  const totalBoxesSoldAll = useMemo(() => sales.reduce((sum, s) => sum + s.maboksiSold, 0), [sales]);
  const totalExpensesAll = useMemo(() => expenses.reduce((sum, e) => sum + e.kiasi, 0), [expenses]);
  const netProfit = totalRevenueAll - totalExpensesAll;
  const totalCashCollected = useMemo(() => sales.reduce((sum, s) => sum + s.amountPaid, 0), [sales]);

  // Breakdown per Salesperson for Director Oversight
  const salespersonBreakdown = useMemo(() => {
    return salespersons.map((sp, index) => {
      const spSales = sales.filter(s => 
        s.muuzajiId === sp.id || 
        s.muuzajiName === sp.name || 
        s.muuzajiName === sp.username ||
        s.muuzajiName?.toLowerCase().includes(sp.username?.toLowerCase() || '') ||
        s.muuzajiName?.toLowerCase().includes(sp.name?.toLowerCase() || '')
      );

      const boxesSold = spSales.reduce((sum, s) => sum + s.maboksiSold, 0);
      const revenue = spSales.reduce((sum, s) => sum + s.totalKiasi, 0);
      const cashPaid = spSales.reduce((sum, s) => sum + s.amountPaid, 0);
      const debts = spSales.reduce((sum, s) => sum + s.balanceDue, 0);
      const count = spSales.length;

      return {
        id: sp.id,
        name: sp.name,
        username: sp.username,
        phone: sp.phone,
        boxesSold,
        revenue,
        cashPaid,
        debts,
        count,
        rank: index + 1
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [salespersons, sales]);

  // Filtered live sales list for director inspection
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (selectedMuuzajiFilter !== 'all') {
        const matchesSp = 
          sale.muuzajiId === selectedMuuzajiFilter || 
          sale.muuzajiName === selectedMuuzajiFilter ||
          sale.muuzajiName?.toLowerCase().includes(selectedMuuzajiFilter.toLowerCase());
        if (!matchesSp) return false;
      }

      if (categoryFilter !== 'all' && sale.category !== categoryFilter) {
        return false;
      }

      if (salesSearch.trim()) {
        const q = salesSearch.toLowerCase();
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
  }, [sales, selectedMuuzajiFilter, categoryFilter, salesSearch]);

  return (
    <div className="space-y-6">
      
      {/* ======================================================================= */}
      {/* 1. EXECUTIVE TOP KPI CARDS */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>MAPATO YA BIASHARA YOTE</span>
            <span className="p-1.5 rounded-xl bg-amber-500/15 border border-[#F6BA35]/40 text-[#F6BA35]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F6BA35] font-mono">
            TZS {totalRevenueAll.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taslimu/Benki: TZS {totalCashCollected.toLocaleString()}
          </div>
        </div>

        {/* Total Boxes Sold */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-cyan-400/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>JUMLA YA MABOKSI YALIYOUZWA</span>
            <span className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            {totalBoxesSoldAll} <span className="text-sm font-semibold text-stone-300">Box</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">
            Stoo Kuu iliyobaki: <strong className="text-[#F6BA35]">{stockInventory.warehouseBoxes} Box</strong>
          </div>
        </div>

        {/* Total Debts (Separated & Combined) */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-rose-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>MADENI YOTE SOKONI</span>
            <span className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            TZS {totalCompanyDebts.totalDebt.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-300 mt-2 flex justify-between">
            <span>Vybu: <strong className="text-rose-300">TZS {totalCompanyDebts.vybuGinDebt.toLocaleString()}</strong></span>
            <span>Asali: <strong className="text-amber-300">TZS {totalCompanyDebts.beeProductDebt.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-panel-zamboo rounded-3xl p-5 border border-emerald-400/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
            <span>FAIDA HALISI (NET PROFIT)</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            TZS {netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-2">
            Baada ya kutoa matumizi ya TZS {totalExpensesAll.toLocaleString()}
          </div>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* 2. EXECUTIVE LIVE SALES OVERSIGHT (UFUATILIAJI WA MAUZO YA WAUZAJI) */}
      {/* ======================================================================= */}
      <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-400/20">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-[#F6BA35]" />
              Ufuatiliaji wa Mauzo ya Wauzaji Moja kwa Moja (Live Executive Sales Feed)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Kila muuzaji anapofanya mauzo sokoni, muamala unaingia na kuonekana hapa moja kwa moja kwa Mkurugenzi Mkuu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Mauzo Yanaonekana Papo Hapo ({sales.length} Miamala)</span>
            </span>
          </div>
        </div>

        {/* Salesperson Leaderboard Cards for Director */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {salespersonBreakdown.map((sp) => (
            <div 
              key={sp.id}
              className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-[#F6BA35]/50 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F6BA35]/20 text-[#F6BA35] font-black text-xs flex items-center justify-center">
                    #{sp.rank}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{sp.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{sp.username}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMuuzajiFilter(sp.name)}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 text-[#F6BA35] hover:bg-[#F6BA35] hover:text-stone-950 text-[10px] font-bold transition-all cursor-pointer"
                >
                  Chuja ({sp.count} Mauzo)
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-800 text-center">
                <div className="p-1.5 rounded-xl bg-stone-950/60">
                  <span className="text-[9px] text-stone-400 block uppercase">Maboksi</span>
                  <span className="text-xs font-bold text-cyan-300">{sp.boxesSold} Box</span>
                </div>
                <div className="p-1.5 rounded-xl bg-stone-950/60">
                  <span className="text-[9px] text-stone-400 block uppercase">Mapato</span>
                  <span className="text-[11px] font-bold text-[#F6BA35] font-mono">TZS {sp.revenue.toLocaleString()}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-stone-950/60">
                  <span className="text-[9px] text-stone-400 block uppercase">Madeni</span>
                  <span className="text-[11px] font-bold text-rose-400 font-mono">TZS {sp.debts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Sales Table with Search & Filter */}
        <div className="space-y-3 pt-3 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs font-bold text-stone-300">
              Orodha ya Miamala ya Hivi Karibuni:
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  placeholder="Tafuta risiti, mteja, muuzaji..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#F6BA35]"
                />
              </div>

              <select
                value={selectedMuuzajiFilter}
                onChange={(e) => setSelectedMuuzajiFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
              >
                <option value="all">Wauzaji Wote</option>
                {salespersons.map(sp => (
                  <option key={sp.id} value={sp.name}>{sp.name}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
              >
                <option value="all">Bidhaa Zote</option>
                <option value="vybu_gin">Vybu Gin</option>
                <option value="bee_product">Mazao ya Nyuki</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Risiti #</th>
                  <th className="px-4 py-3">Muuzaji (Afisa)</th>
                  <th className="px-4 py-3">Mteja & Simu</th>
                  <th className="px-4 py-3">Bidhaa Zilizouzwa</th>
                  <th className="px-4 py-3 text-right">Maboksi</th>
                  <th className="px-4 py-3 text-right">Jumla (TZS)</th>
                  <th className="px-4 py-3 text-right">Imelipwa (TZS)</th>
                  <th className="px-4 py-3 text-right">Deni (TZS)</th>
                  <th className="px-4 py-3 text-center">Hali</th>
                  <th className="px-4 py-3 text-center">Hati ya Risiti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-stone-900/40">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-stone-500">
                      Hakuna rekodi za mauzo zilizopatikana.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-4 py-3 text-stone-300 font-mono">{sale.tarehe}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">{sale.risitiNumber}</td>
                      <td className="px-4 py-3 font-bold text-white">{sale.muuzajiName}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-200">{sale.mtejaName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{sale.mtejaPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-300 max-w-[200px] truncate">
                        {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right font-display font-bold text-cyan-300">
                        {sale.maboksiSold > 0 ? `${sale.maboksiSold} Box` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        TZS {sale.totalKiasi.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400">
                        TZS {sale.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {sale.balanceDue > 0 ? (
                          <span className="text-rose-400">TZS {sale.balanceDue.toLocaleString()}</span>
                        ) : (
                          <span className="text-stone-500">TZS 0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          sale.balanceDue === 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {sale.balanceDue === 0 ? 'IMELIPWA' : 'INADAIWA'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveReceiptSale(sale)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-[#F6BA35] text-[#F6BA35] hover:text-stone-950 border border-amber-400/30 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Risiti</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ======================================================================= */}
      {/* 3. MKURUGENZI SUPER-VIEW: AWEZE KUONA PANEL YA MTU YOYOTE */}
      {/* ======================================================================= */}
      <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-amber-400/20">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#F6BA35]" />
              Ukaguzi wa Idara (Mkurugenzi Anaweza Kuona Paneli ya Mtu Yeyote)
            </h3>
            <p className="text-xs text-stone-400">
              Bofya idara yoyote hapa chini ili kukagua paneli yake na kuona utendaji kazi moja kwa moja.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F6BA35]/20 text-[#F6BA35] border border-[#F6BA35]/40">
            Mamlaka Kamili (Director View)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* View Muuzaji Panel */}
          <button
            type="button"
            onClick={() => onSwitchToPanel('muuzaji')}
            className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-amber-400/25 hover:border-[#F6BA35] text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-[#F6BA35] mb-2 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">Paneli ya Muuzaji</div>
            <div className="text-[10px] text-stone-400 mt-1">Mauzo, stoo ya muuzaji & madeni</div>
          </button>

          {/* View Manager Masoko */}
          <button
            type="button"
            onClick={() => onSwitchToPanel('manager_masoko')}
            className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-amber-400/25 hover:border-[#F6BA35] text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">Manager Masoko</div>
            <div className="text-[10px] text-stone-400 mt-1">Madeni yote & maboksi ya wauzaji</div>
          </button>

          {/* View Mhasibu Panel */}
          <button
            type="button"
            onClick={() => onSwitchToPanel('mhasibu')}
            className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-amber-400/25 hover:border-[#F6BA35] text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">Paneli ya Mhasibu</div>
            <div className="text-[10px] text-stone-400 mt-1">Matumizi, saini & vouchers</div>
          </button>

          {/* View Stock Panel */}
          <button
            type="button"
            onClick={() => onSwitchToPanel('stock')}
            className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-amber-400/25 hover:border-[#F6BA35] text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">Mtu wa Stock (Stoo)</div>
            <div className="text-[10px] text-stone-400 mt-1">Oda za maboksi & urejeshaji</div>
          </button>

          {/* View System Admin Panel */}
          <button
            type="button"
            onClick={() => onSwitchToPanel('system_admin')}
            className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-amber-400/25 hover:border-[#F6BA35] text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">System Admin</div>
            <div className="text-[10px] text-stone-400 mt-1">Kuzuia (Block) & kufungua akaunti</div>
          </button>

        </div>

      </div>

      {/* ======================================================================= */}
      {/* 4. POPUP MODAL: OFFICIAL A4 RECEIPT VIEWER FOR MKURUGENZI */}
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
