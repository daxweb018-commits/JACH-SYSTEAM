import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { downloadSaleReceiptPDF, downloadExpenseVoucherPDF, triggerPrintDialog } from '../../utils/pdfReceiptGenerator';
import { 
  Wallet, 
  FileText, 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  PenTool, 
  Printer, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Scale,
  X,
  Boxes,
  Store,
  ArrowUpRight,
  Receipt,
  Eraser,
  ChevronUp,
  Clock,
  ShieldCheck,
  Package,
  Download
} from 'lucide-react';
import { ExpenseRecord, SaleRecord } from '../../types/system';
import { DatePickerCalendar } from '../DatePickerCalendar';

export const MhasibuPanel: React.FC = () => {
  const { 
    expenses, 
    addNewExpense, 
    sales, 
    currentUser, 
    systemInfo, 
    stockInventory, 
    products, 
    productStocks 
  } = useSystem();

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // MODERN COLLAPSIBLE TABS (Starts closed so user can click to open)
  // 1. idhinisha_matumizi
  // 2. daftari_matumizi
  // 3. ripoti_mauzo
  // 4. hali_mzigo
  // =========================================================================
  const [activeSection, setActiveSection] = useState<'idhinisha_matumizi' | 'daftari_matumizi' | 'ripoti_mauzo' | 'hali_mzigo' | null>(null);

  // =========================================================================
  // FORM: IDHINISHA MATUMIZI
  // =========================================================================
  const [tarehe, setTarehe] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [aliyeChukua, setAliyeChukua] = useState('');
  const [maelezo, setMaelezo] = useState('');
  const [kiasi, setKiasi] = useState<number | ''>('');
  const [kitengo, setKitengo] = useState('Uendeshaji wa Kila Siku');
  const [sainiTextFallback, setSainiTextFallback] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);

  // Search filter for Expenses
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // Filter for Sales Report
  const [salesPeriodFilter, setSalesPeriodFilter] = useState<'zote' | 'leo' | 'wiki' | 'mwezi' | 'mwaka'>('zote');
  const [salesSearchQuery, setSalesSearchQuery] = useState('');

  // =========================================================================
  // DIGITAL SIGNATURE CANVAS PAD
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Setup canvas resolution and background
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with transparent or dark background
    ctx.strokeStyle = '#F6BA35'; // Luxury Gold ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (activeSection === 'idhinisha_matumizi') {
      setTimeout(initCanvas, 100);
    }
  }, [activeSection]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = '#F6BA35';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // =========================================================================
  // 5 CORE FINANCIAL & INVENTORY METRICS REQUIRED BY USER:
  // 1. Mzigo Uliopo Stoo (Warehouse Stock)
  // 2. Mzigo Uliopo Masoko (Market Stock)
  // 3. Mauzo Leo (Sales Today)
  // 4. Matumizi Mwezi Huu (Expenses This Month)
  // 5. Salio Halisi (Net Cash Balance)
  // =========================================================================

  // Helper date functions
  const now = new Date();
  const todayGB = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const todayISO = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = String(now.getFullYear());

  // 1. Mzigo uliopo Stoo Kuu
  const mzigoStooBoxes = stockInventory.warehouseBoxes;

  // 2. Mzigo uliopo Masoko
  const mzigoMasokoBoxes = stockInventory.marketBoxes;

  // 3. Mauzo Leo
  const todaySales = useMemo(() => {
    return sales.filter(s => {
      if (s.tarehe === todayGB || s.tarehe === todayISO) return true;
      if (s.timestamp) {
        const d = new Date(s.timestamp);
        return d.toDateString() === now.toDateString();
      }
      return false;
    });
  }, [sales, todayGB, todayISO]);

  const mauzoLeoAmount = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.totalKiasi, 0);
  }, [todaySales]);

  const mauzoLeoPaid = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.amountPaid, 0);
  }, [todaySales]);

  // 4. Matumizi Mwezi Huu
  const thisMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      return (
        e.tarehe.includes(`/${currentMonth}/${currentYear}`) ||
        e.tarehe.startsWith(`${currentYear}-${currentMonth}`)
      );
    });
  }, [expenses, currentMonth, currentYear]);

  const matumiziMweziHuuAmount = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + e.kiasi, 0);
  }, [thisMonthExpenses]);

  // 5. Salio Halisi (Net Cash = Total Cash Collected from Sales - Total Expenses)
  const totalCashCollected = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.amountPaid, 0);
  }, [sales]);

  const totalExpensesAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.kiasi, 0);
  }, [expenses]);

  const salioHalisi = totalCashCollected - totalExpensesAllTime;

  // =========================================================================
  // SUBMIT EXPENSE WITH SIGNATURE
  // =========================================================================
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!aliyeChukua.trim()) {
      showToast('Tafadhali jaza jina la aliyechukua/kuomba fedha.');
      return;
    }
    if (!kiasi || Number(kiasi) <= 0) {
      showToast('Tafadhali ingiza kiasi sahihi cha fedha.');
      return;
    }
    if (!maelezo.trim()) {
      showToast('Tafadhali weka maelezo ya kwa ajili ya nini fedha hii inatolewa.');
      return;
    }

    // Determine signature
    let signatureToSave = '';
    if (hasDrawnSignature && canvasRef.current) {
      signatureToSave = canvasRef.current.toDataURL('image/png');
    } else if (sainiTextFallback.trim()) {
      signatureToSave = sainiTextFallback.trim();
    } else {
      showToast('Tafadhali chora saini kwenye kisanduku au weka jina la aliyethibitisha saini.');
      return;
    }

    const expenseData = {
      tarehe,
      aliyeChukua: aliyeChukua.trim(),
      maelezo: maelezo.trim(),
      kiasi: Number(kiasi),
      kitengo,
      saini: signatureToSave,
      mhasibuName: currentUser.name || 'Mhasibu Mkuu',
    };

    addNewExpense(expenseData);

    // Reset Form
    setAliyeChukua('');
    setMaelezo('');
    setKiasi('');
    setSainiTextFallback('');
    clearSignature();
    showToast(`Matumizi ya TZS ${Number(kiasi).toLocaleString()} yameidhinishwa kikamilifu!`);

    // Auto open voucher to view
    setSelectedVoucher({
      id: `VOUCH-${Date.now().toString().slice(-6)}`,
      ...expenseData,
    });
  };

  // =========================================================================
  // FILTERED EXPENSES
  // =========================================================================
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.aliyeChukua.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
      e.maelezo.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
      e.kitengo.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
      e.tarehe.includes(expenseSearchQuery)
    );
  }, [expenses, expenseSearchQuery]);

  // =========================================================================
  // FILTERED SALES REPORT
  // =========================================================================
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Period filter
      if (salesPeriodFilter === 'leo') {
        const isToday = sale.tarehe === todayGB || sale.tarehe === todayISO;
        if (!isToday) return false;
      } else if (salesPeriodFilter === 'mwezi') {
        const isMonth = 
          sale.tarehe.includes(`/${currentMonth}/${currentYear}`) ||
          sale.tarehe.startsWith(`${currentYear}-${currentMonth}`);
        if (!isMonth) return false;
      }

      // Search Query
      if (salesSearchQuery.trim()) {
        const query = salesSearchQuery.toLowerCase();
        const matchCustomer = sale.mtejaName.toLowerCase().includes(query);
        const matchSeller = sale.muuzajiName.toLowerCase().includes(query);
        const matchReceipt = sale.risitiNumber.toLowerCase().includes(query);
        const matchItem = sale.items.some(it => it.productName.toLowerCase().includes(query));
        if (!matchCustomer && !matchSeller && !matchReceipt && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [sales, salesPeriodFilter, salesSearchQuery, todayGB, todayISO, currentMonth, currentYear]);

  const salesReportTotalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.totalKiasi, 0);
  }, [filteredSales]);

  const salesReportTotalPaid = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.amountPaid, 0);
  }, [filteredSales]);

  const salesReportTotalDebts = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.balanceDue, 0);
  }, [filteredSales]);

  const salesReportTotalBoxes = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.maboksiSold, 0);
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#F6BA35] text-stone-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-stone-950" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-400/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-[#F6BA35]">
              <Wallet className="w-6 h-6 stroke-[2.2]" />
            </span>
            DAFTARI LA MUHASIBU
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Uidhinishaji wa matumizi kwa saini ya kuchora, ufuatiliaji wa mzigo stoo & masoko, mauzo na salio halisi la fedha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Mfumo Unafanya Kazi
          </span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 5 CORE SUMMARY METRIC CARDS REQUIRED BY USER: */}
      {/* 1. Mzigo Stoo | 2. Masoko | 3. Mauzo Leo | 4. Matumizi Mwezi Huu | 5. Salio Halisi */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Mzigo Uliopo Stoo */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-amber-400/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MZIGO STOO KUU</span>
            <span className="p-1 rounded-lg bg-amber-500/15 text-[#F6BA35]">
              <Boxes className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F6BA35] font-mono">
            {mzigoStooBoxes} <span className="text-xs font-sans text-stone-300">Box</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 truncate">
            Stoo Kuu ya Kiwanda
          </p>
        </div>

        {/* Metric 2: Mzigo Uliopo Masoko */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-cyan-400/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MZIGO MASOKO</span>
            <span className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Store className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
            {mzigoMasokoBoxes} <span className="text-xs font-sans text-stone-300">Box</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 truncate">
            Uliopo kwa Wauzaji Sokoni
          </p>
        </div>

        {/* Metric 3: Mauzo Leo */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-emerald-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MAUZO LEO</span>
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            TZS {mauzoLeoAmount.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1 truncate">
            Pesa zilizolipwa: TZS {mauzoLeoPaid.toLocaleString()}
          </p>
        </div>

        {/* Metric 4: Matumizi Mwezi Huu */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-rose-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MATUMIZI MWEZI HUU</span>
            <span className="p-1 rounded-lg bg-rose-500/15 text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            TZS {matumiziMweziHuuAmount.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1 truncate">
            Vocha {thisMonthExpenses.length} za mwezi huu
          </p>
        </div>

        {/* Metric 5: Salio Halisi (Net Cash Balance) */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-[#F6BA35]/40 shadow-md relative overflow-hidden col-span-2 lg:col-span-1 group">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>SALIO HALISI (NET)</span>
            <span className="p-1 rounded-lg bg-amber-500/15 text-[#F6BA35]">
              <Scale className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${salioHalisi >= 0 ? 'text-[#F6BA35]' : 'text-rose-400'}`}>
            TZS {salioHalisi.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1 truncate">
            Mapato yaliyokusanywa - Matumizi
          </p>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* 4 MODERN ACTION BUTTON CARDS (CLICK TO OPEN / TOGGLE): */}
      {/* 1. IDHINISHA MATUMIZI | 2. DAFTARI LA MATUMIZI | 3. RIPOTI YA MAUZO | 4. HALI YA MZIGO */}
      {/* ======================================================================= */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: IDHINISHA MATUMIZI NA CHORA SAINI */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'idhinisha_matumizi' ? null : 'idhinisha_matumizi')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'idhinisha_matumizi'
                ? 'bg-gradient-to-br from-amber-500/20 via-[#F6BA35]/10 to-black/80 border-[#F6BA35] shadow-[0_0_25px_rgba(246,186,53,0.25)] ring-1 ring-[#F6BA35]/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-amber-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'idhinisha_matumizi'
                  ? 'bg-[#F6BA35] text-stone-950 shadow-md'
                  : 'bg-amber-500/15 text-[#F6BA35] border border-amber-400/30'
              }`}>
                <PenTool className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  1. IDHINISHA MATUMIZI
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Fomu na Kuchora Saini
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Saini kwa Kidole / Mouse
              </span>
              {activeSection === 'idhinisha_matumizi' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F6BA35] text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800/90 group-hover:bg-amber-500/20 text-stone-300 group-hover:text-[#F6BA35] border border-stone-700/60 group-hover:border-amber-400/40 font-bold text-[11px] flex items-center gap-1 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </button>

          {/* Card 2: DAFTARI LA MATUMIZI */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'daftari_matumizi' ? null : 'daftari_matumizi')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'daftari_matumizi'
                ? 'bg-gradient-to-br from-rose-500/20 via-rose-400/10 to-black/80 border-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.25)] ring-1 ring-rose-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-rose-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'daftari_matumizi'
                  ? 'bg-rose-400 text-stone-950 shadow-md'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-400/30'
              }`}>
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  2. DAFTARI LA MATUMIZI
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Rekodi za Vocha & Saini
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Vocha Zote: <strong className="text-rose-400 font-mono">{expenses.length}</strong>
              </span>
              {activeSection === 'daftari_matumizi' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-400 text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800/90 group-hover:bg-rose-500/20 text-stone-300 group-hover:text-rose-300 border border-stone-700/60 group-hover:border-rose-400/40 font-bold text-[11px] flex items-center gap-1 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </button>

          {/* Card 3: RIPOTI YA MAUZO */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'ripoti_mauzo' ? null : 'ripoti_mauzo')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'ripoti_mauzo'
                ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-black/80 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-emerald-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'ripoti_mauzo'
                  ? 'bg-emerald-400 text-stone-950 shadow-md'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/30'
              }`}>
                <Receipt className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  3. RIPOTI YA MAUZO
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Mauzo ya Wauzaji & Risiti
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Miamala: <strong className="text-emerald-400 font-mono">{sales.length}</strong>
              </span>
              {activeSection === 'ripoti_mauzo' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800/90 group-hover:bg-emerald-500/20 text-stone-300 group-hover:text-emerald-300 border border-stone-700/60 group-hover:border-emerald-400/40 font-bold text-[11px] flex items-center gap-1 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </button>

          {/* Card 4: HALI YA MZIGO (STOO & MASOKO) */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'hali_mzigo' ? null : 'hali_mzigo')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'hali_mzigo'
                ? 'bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-black/80 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-cyan-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'hali_mzigo'
                  ? 'bg-cyan-400 text-stone-950 shadow-md'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30'
              }`}>
                <Package className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  4. HALI YA MZIGO
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Stoo Kuu & Masoko
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Jumla: <strong className="text-cyan-300 font-mono">{mzigoStooBoxes + mzigoMasokoBoxes} Boxes</strong>
              </span>
              {activeSection === 'hali_mzigo' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800/90 group-hover:bg-cyan-500/20 text-stone-300 group-hover:text-cyan-300 border border-stone-700/60 group-hover:border-cyan-400/40 font-bold text-[11px] flex items-center gap-1 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </button>

        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. SEHEMU YA KUIDHINISHA MATUMIZI NA CHORA SAINI */}
      {/* ======================================================================= */}
      {activeSection === 'idhinisha_matumizi' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#F6BA35]" />
                Kuidhinisha Matumizi ya Fedha & Kuchora Saini
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Weka tarehe, jina la aliyechukua/aliyeomba fedha, kiasi, sababu/kwa ajili ya nini, na mchoree saini hapo chini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="Funga Sehemu Hii"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitExpense} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* 1. Tarehe */}
              <DatePickerCalendar
                value={tarehe}
                onChange={setTarehe}
                label="1. Tarehe ya Matumizi:"
                required
              />

              {/* 2. Jina */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#F6BA35]" />
                  2. Jina la Anayeidhinishiwa / Aliyechukua:
                </label>
                <input
                  type="text"
                  value={aliyeChukua}
                  onChange={(e) => setAliyeChukua(e.target.value)}
                  placeholder="Mfano: Hamisi Athumani (Dereva / Msimamizi)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#F6BA35]"
                  required
                />
              </div>

              {/* 3. Kiasi Fedha */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                  3. Kiasi cha Fedha (TZS):
                </label>
                <input
                  type="number"
                  min="100"
                  value={kiasi}
                  onChange={(e) => setKiasi(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Mfano: 120,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-rose-400 font-black text-sm focus:outline-none focus:border-[#F6BA35]"
                  required
                />
                {kiasi && Number(kiasi) > 0 && (
                  <span className="text-[11px] text-stone-400 block font-mono">
                    = TZS {Number(kiasi).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Kitengo / Aina ya Matumizi */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Kitengo / Aina ya Matumizi:</label>
                <select
                  value={kitengo}
                  onChange={(e) => setKitengo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-[#F6BA35]"
                >
                  <option value="Usafirishaji / Logistics">Usafirishaji & Mafuta ya Gari</option>
                  <option value="Uendeshaji wa Stoo">Uendeshaji wa Stoo & Viburua</option>
                  <option value="Uendeshaji wa Kila Siku">Uendeshaji wa Ofisi & Kila Siku</option>
                  <option value="Manunuzi ya Vifaa vya Nyuki">Manunuzi ya Vifaa vya Nyuki</option>
                  <option value="Posho na Masurufu">Posho na Masurufu</option>
                  <option value="Matengenezo & Huduma">Matengenezo & Huduma za Mashine</option>
                  <option value="Mengineyo">Mengineyo</option>
                </select>
              </div>

              {/* 4. Fedha kwa ajili ya nini */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F6BA35]" />
                  4. Fedha Hii ni kwa Ajili ya Nini? (Sababu ya Matumizi):
                </label>
                <input
                  type="text"
                  value={maelezo}
                  onChange={(e) => setMaelezo(e.target.value)}
                  placeholder="Mfano: Mafuta ya kusambazia maboksi ya Vybu Gin mkoani Pwani na posho ya dereva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#F6BA35]"
                  required
                />
              </div>

            </div>

            {/* ================================================================= */}
            {/* 5. SEHEMU YA KUCHORA SAINI (SIGNATURE DRAWING CANVAS PAD) */}
            {/* ================================================================= */}
            <div className="p-4 rounded-3xl bg-black/40 border border-amber-400/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-stone-200 font-extrabold text-xs flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#F6BA35]" />
                    5. Sehemu ya Kuchora Saini (Chora hapa kwa kidole au mouse):
                  </label>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Mpokeaji au muidhinishaji anachora saini yake halisi kwenye kisanduku hiki cha dhahabu.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasDrawnSignature && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Saini Imechorwa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-stone-700"
                  >
                    <Eraser className="w-3.5 h-3.5 text-rose-400" />
                    <span>Futa Saini / Chora Upya</span>
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="relative rounded-2xl border-2 border-dashed border-amber-400/40 bg-stone-950 overflow-hidden flex items-center justify-center min-h-[140px]">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] cursor-crosshair touch-none block"
                />

                {!hasDrawnSignature && (
                  <div className="absolute pointer-events-none text-center text-stone-600">
                    <PenTool className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#F6BA35]" />
                    <span className="text-xs font-medium">Chora saini yako hapa kwa kugusa kioo au kwa mouse</span>
                  </div>
                )}
              </div>

              {/* Optional Text Backup for Saini */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-stone-400 text-[11px]">Au andika saini ya maandishi:</span>
                <input
                  type="text"
                  value={sainiTextFallback}
                  onChange={(e) => setSainiTextFallback(e.target.value)}
                  placeholder="Mfano: H. Athumani (Afisa Aliyethibitishwa)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-200 font-serif italic text-xs focus:outline-none focus:border-[#F6BA35]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-[#F6BA35] hover:brightness-110 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Idhinisha & Hifadhi Matumizi</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. DAFTARI LA MATUMIZI (EXPENSE LEDGER NA VOCHA) */}
      {/* ======================================================================= */}
      {activeSection === 'daftari_matumizi' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-rose-400/35 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                Daftari Rasmi la Matumizi Yote Yaliyoidhinishwa
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Tazama miamala yote, saini zilizochorwa, na fungua vocha ya kielektroniki kwa uchapishaji.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto no-print">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  placeholder="Tafuta mpokeaji, maelezo..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Chapisha Daftari la Matumizi"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span>Chapisha</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                title="Funga Daftari la Matumizi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Aliyechukua Fedha</th>
                  <th className="px-4 py-3">Kitengo / Idara</th>
                  <th className="px-4 py-3">Kusudi (Kwa ajili ya nini)</th>
                  <th className="px-4 py-3">Kiasi (TZS)</th>
                  <th className="px-4 py-3">Saini Iliyochorwa</th>
                  <th className="px-4 py-3">Mhasibu Aliyethibitisha</th>
                  <th className="px-4 py-3 text-center no-print">Vocha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-stone-500">
                      Hakuna rekodi za matumizi zilizopatikana.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(exp => {
                    const isImageSignature = exp.saini.startsWith('data:image');

                    return (
                      <tr key={exp.id} className="hover:bg-rose-500/5 transition-colors">
                        <td className="px-4 py-3 text-[#F6BA35] font-bold font-mono">{exp.tarehe}</td>
                        <td className="px-4 py-3 font-bold text-white">{exp.aliyeChukua}</td>
                        <td className="px-4 py-3 text-stone-400">{exp.kitengo}</td>
                        <td className="px-4 py-3 text-stone-300 max-w-xs truncate" title={exp.maelezo}>
                          {exp.maelezo}
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-400 font-extrabold text-sm">
                          TZS {exp.kiasi.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {isImageSignature ? (
                            <img
                              src={exp.saini}
                              alt="Saini"
                              className="h-8 max-w-[120px] object-contain bg-black/50 rounded p-1 border border-amber-400/30 inline-block"
                            />
                          ) : (
                            <span className="font-serif italic text-amber-200 text-xs">
                              ✍️ {exp.saini}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-400 text-[11px]">{exp.mhasibuName}</td>
                        <td className="px-4 py-3 text-center no-print">
                          <button
                            type="button"
                            onClick={() => setSelectedVoucher(exp)}
                            className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-[#F6BA35] text-[#F6BA35] hover:text-stone-950 border border-amber-400/40 font-bold text-xs transition-all cursor-pointer shadow-sm"
                          >
                            Tazama Vocha
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. RIPOTI YA MAUZO (KAMA ILIVYO KWA WENGINE) */}
      {/* ======================================================================= */}
      {activeSection === 'ripoti_mauzo' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-emerald-400/35 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Ripoti ya Mauzo ya Wauzaji & Miamala
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Tazama mauzo yote yaliyofanywa na wauzaji sokoni, kiasi kilichokusanywa, na madeni yaliyobaki.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Chapisha Ripoti</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                title="Funga Ripoti ya Mauzo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics of Filtered Sales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">JUMLA YA MAUZO</span>
              <span className="text-lg font-black text-white font-mono">
                TZS {salesReportTotalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">FEDHA ZILIZOPITA</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                TZS {salesReportTotalPaid.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-rose-500/20">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">MADENI YALIYOBAKI</span>
              <span className="text-lg font-black text-rose-400 font-mono">
                TZS {salesReportTotalDebts.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">MABOKSI YALIYOUZWA</span>
              <span className="text-lg font-black text-[#F6BA35] font-mono">
                {salesReportTotalBoxes} Boxes
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 no-print">
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-2xl border border-stone-800">
              {(['zote', 'leo', 'mwezi'] as const).map(period => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSalesPeriodFilter(period)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
                    salesPeriodFilter === period
                      ? 'bg-emerald-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {period === 'zote' ? 'Mauzo Yote' : period === 'leo' ? 'Leo Tu' : 'Mwezi Huu'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={salesSearchQuery}
                onChange={(e) => setSalesSearchQuery(e.target.value)}
                placeholder="Tafuta mteja, muuzaji, risiti..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Muuzaji</th>
                  <th className="px-4 py-3">Mteja & Simu</th>
                  <th className="px-4 py-3">Bidhaa & Maboksi</th>
                  <th className="px-4 py-3">Jumla (TZS)</th>
                  <th className="px-4 py-3">Imelipwa (TZS)</th>
                  <th className="px-4 py-3">Baki ya Deni</th>
                  <th className="px-4 py-3 text-center">Hali</th>
                  <th className="px-4 py-3 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-stone-500">
                      Hakuna mauzo yaliyopatikana kwa kigezo hiki.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => {
                    const isFullyPaid = sale.hali === 'IMELIPWA';

                    return (
                      <tr key={sale.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">
                          {sale.risitiNumber}
                        </td>
                        <td className="px-4 py-3 text-stone-300 font-mono text-[11px]">
                          {sale.tarehe}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {sale.muuzajiName}
                        </td>
                        <td className="px-4 py-3 text-stone-300">
                          <div>{sale.mtejaName}</div>
                          {sale.mtejaPhone && (
                            <div className="text-[10px] text-stone-500">{sale.mtejaPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-300">
                          {sale.items.map(it => (
                            <div key={it.productId} className="text-xs">
                              {it.productName} ({it.quantity} Box)
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-white">
                          TZS {sale.totalKiasi.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          TZS {sale.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-400">
                          {sale.balanceDue > 0 ? `TZS ${sale.balanceDue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFullyPaid 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isFullyPaid ? 'Imelipwa' : 'Inadaiwa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(sale)}
                            className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold cursor-pointer"
                          >
                            Tazama
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. HALI YA MZIGO (STOO KUU & MASOKO) */}
      {/* ======================================================================= */}
      {activeSection === 'hali_mzigo' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-cyan-400/35 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Hali ya Mzigo: Stoo Kuu & Masoko kwa Kila Bidhaa
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Uchambuzi wa maboksi na bidhaa zilizopo stoo ya kiwanda na zilizopo sokoni kwa wauzaji.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="Funga Hali ya Mzigo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Aina</th>
                  <th className="px-4 py-3">Jina la Bidhaa</th>
                  <th className="px-4 py-3">Ufungashaji</th>
                  <th className="px-4 py-3">Bei kwa Box / Kipimo</th>
                  <th className="px-4 py-3 text-center">Stoo Kuu (Warehouse)</th>
                  <th className="px-4 py-3 text-center">Masoko (Market)</th>
                  <th className="px-4 py-3 text-right">Thamani Stoo Kuu (TZS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                {products.map(p => {
                  const stock = productStocks[p.id] || { warehouse: 0, market: 0 };
                  const warehouseVal = stock.warehouse * p.price;

                  return (
                    <tr key={p.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.category === 'vybu_gin'
                            ? 'bg-amber-500/20 text-[#F6BA35] border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {p.category === 'vybu_gin' ? 'Vybu Gin' : 'Bee Product'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-stone-300">
                        {p.packaging}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-300">
                        TZS {p.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-[#F6BA35]">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20">
                          {stock.warehouse}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-cyan-300">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                          {stock.market}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        TZS {warehouseVal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* EXPENSE VOUCHER MODAL (NA SAINI ILIYOCHORWA) */}
      {/* ======================================================================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 printable-modal-overlay">
          <div className="w-full max-w-md bg-stone-900 border border-amber-400/50 rounded-3xl p-6 shadow-2xl text-stone-100 relative max-h-[90vh] overflow-y-auto printable-voucher-card">
            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer no-print print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-stone-800 space-y-1 voucher-header-box">
              <span className="text-xs uppercase tracking-widest text-[#F6BA35] font-black">{systemInfo.officeName}</span>
              <p className="text-[10px] text-stone-400">TIN: {systemInfo.tin} · Simu: {systemInfo.phone}</p>
              <h3 className="text-base font-extrabold text-white uppercase font-display pt-1">
                HATI YA MALIPO (PAYMENT VOUCHER)
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">Hati Nambari: {selectedVoucher.id}</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Tarehe ya Malipo:</span>
                <span className="text-white font-bold font-mono">{selectedVoucher.tarehe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Aliyelipwa (Mpokeaji):</span>
                <span className="text-white font-bold">{selectedVoucher.aliyeChukua}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Kitengo / Idara:</span>
                <span className="text-stone-300">{selectedVoucher.kitengo}</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400 block text-[11px] mb-1">Kusudi la Malipo (Maelezo):</span>
                <p className="text-white font-medium">{selectedVoucher.maelezo}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                <span className="text-stone-300 font-bold">Kiasi Kilichotolewa:</span>
                <span className="text-rose-400 font-black text-lg font-mono">
                  TZS {selectedVoucher.kiasi.toLocaleString()}
                </span>
              </div>

              {/* Saini ya Mpokeaji */}
              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-stone-400 block mb-1">Saini ya Mpokeaji (Aliyechukua Fedha):</span>
                {selectedVoucher.saini.startsWith('data:image') ? (
                  <div className="bg-stone-950 p-2 rounded-2xl border border-amber-400/30 flex justify-center">
                    <img
                      src={selectedVoucher.saini}
                      alt="Saini ya Mpokeaji"
                      className="h-14 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-2 bg-stone-950 rounded-xl text-amber-200 font-serif italic text-sm border border-stone-800">
                    ✍️ {selectedVoucher.saini}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
                <span>Imethibitishwa na Mhasibu:</span>
                <span className="text-stone-300 font-medium">{selectedVoucher.mhasibuName}</span>
              </div>

              {/* Print Footer */}
              <div className="pt-3 border-t border-stone-800 text-[10px] text-stone-400 text-center space-y-0.5 print-only">
                <p>Hati hii imetolewa na kuidhinishwa na Idara ya Uhasibu — {systemInfo.officeName}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row gap-2 no-print print:hidden">
              <button
                type="button"
                onClick={() => triggerPrintDialog()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#F6BA35] hover:brightness-110 active:scale-[0.98] text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all border border-amber-300"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Chapisha Vocha (Print)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadExpenseVoucherPDF(selectedVoucher, systemInfo);
                }}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-600 hover:border-amber-400/50 shadow-md cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-[#F6BA35]" />
                <span>Pakua Vocha (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-3 rounded-xl bg-stone-800/80 text-stone-400 hover:text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* SALE RECEIPT MODAL */}
      {/* ======================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 printable-modal-overlay">
          <div className="w-full max-w-md bg-stone-900 border border-emerald-400/50 rounded-3xl p-6 shadow-2xl text-stone-100 relative max-h-[90vh] overflow-y-auto printable-receipt-card">
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer no-print print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-stone-800 space-y-1 receipt-header-box">
              <span className="text-xs uppercase tracking-widest text-[#F6BA35] font-black">{systemInfo.officeName}</span>
              <p className="text-[10px] text-stone-400">TIN: {systemInfo.tin} · Simu: {systemInfo.phone}</p>
              <h3 className="text-base font-extrabold text-white uppercase font-display pt-1">
                INVOICE YA MAUZO RASMI
              </h3>
              <p className="text-[11px] text-[#F6BA35] font-mono font-bold">
                Invoice Number: {selectedReceipt.risitiNumber}
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Tarehe ya Mauzo:</span>
                <span className="text-white font-bold font-mono">{selectedReceipt.tarehe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Muuzaji:</span>
                <span className="text-white font-bold">{selectedReceipt.muuzajiName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Mteja:</span>
                <span className="text-white font-bold">{selectedReceipt.mtejaName}</span>
              </div>
              {selectedReceipt.mtejaPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Simu ya Mteja:</span>
                  <span className="text-stone-300 font-mono">{selectedReceipt.mtejaPhone}</span>
                </div>
              )}

              {/* Items */}
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="text-stone-400 block text-[11px] font-bold">Maelezo ya Bidhaa & Gharama:</span>
                {selectedReceipt.items.map((it, idx) => {
                  const isOtherCost = it.productId === 'prod-other-cost' || it.productName.toLowerCase().includes('usafiri') || idx === 1;
                  return (
                    <div key={idx} className="flex justify-between text-stone-200 receipt-item-row text-xs border-b border-stone-900 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>
                          {isOtherCost && !it.productName.toLowerCase().includes('usafiri') ? `Usafiri (${it.productName})` : it.productName}
                        </span>
                      </div>
                      <span className="font-mono text-white font-bold">TZS {it.totalPrice.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-stone-800 receipt-total-row">
                <span className="text-stone-300 font-bold">Jumla Kuu (Total):</span>
                <span className="text-white font-black text-base font-mono">
                  TZS {selectedReceipt.totalKiasi.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span className="font-bold">Kiasi Kilicholipwa:</span>
                <span className="font-black text-base font-mono">
                  TZS {selectedReceipt.amountPaid.toLocaleString()}
                </span>
              </div>
              {selectedReceipt.balanceDue > 0 && (
                <div className="flex justify-between items-center text-rose-400">
                  <span className="font-bold">Baki ya Deni (Credit):</span>
                  <span className="font-black text-base font-mono">
                    TZS {selectedReceipt.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Print Footer */}
              <div className="pt-3 border-t border-stone-800 text-[10px] text-stone-400 text-center space-y-0.5 print-only">
                <p>Asante kwa kufanya biashara na {systemInfo.officeName}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row gap-2 no-print print:hidden">
              <button
                type="button"
                onClick={() => triggerPrintDialog()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.98] text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all border border-emerald-400"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Chapisha (Print)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadSaleReceiptPDF(selectedReceipt, systemInfo);
                }}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-600 hover:border-emerald-400/50 shadow-md cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Pakua Risiti (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-3 rounded-xl bg-stone-800/80 text-stone-400 hover:text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
