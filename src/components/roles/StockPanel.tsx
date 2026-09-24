import React, { useState, useMemo } from 'react';
import { useSystem } from '../../context/SystemContext';
import { ProductCategory, ProductItem } from '../../types/system';
import { 
  Boxes, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Plus, 
  ArrowUpRight, 
  ClipboardList, 
  BarChart3, 
  Search, 
  DollarSign, 
  TrendingUp, 
  FileSpreadsheet, 
  Check, 
  Package, 
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Edit3,
  Save,
  PenLine
} from 'lucide-react';

export const StockPanel: React.FC = () => {
  const { 
    stockInventory, 
    productStocks, 
    stockMovements, 
    stockOrders, 
    products, 
    dispatchStockOrder, 
    ingizaStooKuu, 
    toaKwendaMasoko, 
    rudishaKutokaMasoko, 
    updateProductStockDirectly,
    currentUser, 
    sales, 
    users 
  } = useSystem();

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // State for Direct Stock Editing (Inline and Modal)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempWarehouseStock, setTempWarehouseStock] = useState<number | ''>('');
  const [tempMarketStock, setTempMarketStock] = useState<number | ''>('');
  const [stockEditNote, setStockEditNote] = useState<string>('');
  const [modalEditProduct, setModalEditProduct] = useState<ProductItem | null>(null);

  // Handlers for Direct Stock Editing
  const handleStartInlineEdit = (p: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const stock = productStocks[p.id] || { warehouse: 0, market: 0 };
    setEditingProductId(p.id);
    setTempWarehouseStock(stock.warehouse);
    setTempMarketStock(stock.market);
    setStockEditNote('');
  };

  const handleSaveInlineEdit = (p: ProductItem) => {
    const newWh = typeof tempWarehouseStock === 'number' ? Math.max(0, tempWarehouseStock) : 0;
    const newMkt = typeof tempMarketStock === 'number' ? Math.max(0, tempMarketStock) : 0;

    updateProductStockDirectly(p.id, newWh, newMkt, stockEditNote.trim() || undefined);
    showToast(`Masalio ya "${p.name}" yamehaririwa kikamilifu! (Stoo Kuu: ${newWh}, Masoko: ${newMkt})`);
    setEditingProductId(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingProductId(null);
  };

  const handleOpenStockEditModal = (p: ProductItem) => {
    const stock = productStocks[p.id] || { warehouse: 0, market: 0 };
    setModalEditProduct(p);
    setTempWarehouseStock(stock.warehouse);
    setTempMarketStock(stock.market);
    setStockEditNote('');
  };

  const handleSaveModalStockEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditProduct) return;

    const newWh = typeof tempWarehouseStock === 'number' ? Math.max(0, tempWarehouseStock) : 0;
    const newMkt = typeof tempMarketStock === 'number' ? Math.max(0, tempMarketStock) : 0;

    updateProductStockDirectly(modalEditProduct.id, newWh, newMkt, stockEditNote.trim() || undefined);
    showToast(`Masalio ya "${modalEditProduct.name}" yamehaririwa kikamilifu! (Stoo Kuu: ${newWh}, Masoko: ${newMkt})`);
    setModalEditProduct(null);
  };

  // =========================================================================
  // 3 TOP LEVEL OPTIONS:
  // 1. stock_kuu (Stoo Kuu)
  // 2. oda_wauzaji (Oda za Wauzaji)
  // 3. report_mwaka (Ripoti ya Mwaka)
  // Starts null (closed) until user clicks to open
  // =========================================================================
  const [mainTab, setMainTab] = useState<'stock_kuu' | 'oda_wauzaji' | 'report_mwaka' | null>(null);

  // =========================================================================
  // SUB-OPTIONS UNDER STOO KUU:
  // a) main_stock
  // b) ingiza_stookuu
  // c) ingiza_masoko
  // d) rudisha_mzigo
  // e) kumbukumbu
  // Starts null (closed) until user clicks to open
  // =========================================================================
  const [stockKuuSubTab, setStockKuuSubTab] = useState<'main_stock' | 'ingiza_stookuu' | 'ingiza_masoko' | 'rudisha_mzigo' | 'kumbukumbu' | null>(null);

  // Search filter for Main Stock
  const [mainStockSearch, setMainStockSearch] = useState('');
  const [mainStockCategoryFilter, setMainStockCategoryFilter] = useState<'ALL' | 'vybu_gin' | 'bee_product'>('ALL');

  // Search filter for Kumbukumbu
  const [kumbukumbuSearch, setKumbukumbuSearch] = useState('');

  // -------------------------------------------------------------------------
  // FORM: INGIZA STOO KUU
  // -------------------------------------------------------------------------
  const [ingizaCategory, setIngizaCategory] = useState<ProductCategory>('vybu_gin');
  const [ingizaProductId, setIngizaProductId] = useState<string>('prod-vybu-01');
  const [ingizaQuantity, setIngizaQuantity] = useState<number | ''>('');
  const [ingizaNote, setIngizaNote] = useState<string>('Mzigo mpya kutoka kiwandani');

  const selectedIngizaProduct = useMemo(() => {
    return products.find(p => p.id === ingizaProductId) || products[0];
  }, [products, ingizaProductId]);

  const ingizaLiveValue = useMemo(() => {
    const qty = typeof ingizaQuantity === 'number' ? ingizaQuantity : 0;
    if (!selectedIngizaProduct || qty <= 0) return 0;
    return qty * selectedIngizaProduct.price;
  }, [selectedIngizaProduct, ingizaQuantity]);

  const handleIngizaStooKuuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = typeof ingizaQuantity === 'number' ? ingizaQuantity : 0;
    if (qty <= 0) {
      showToast('Weka idadi sahihi zaidi ya 0!');
      return;
    }

    ingizaStooKuu(
      ingizaProductId, 
      qty, 
      currentUser.name || 'Rashid Bakari (Stock)', 
      ingizaNote
    );

    showToast(`Imefanikiwa! ${qty} za ${selectedIngizaProduct.name} zimeingizwa Stoo Kuu (Thamani: TZS ${ingizaLiveValue.toLocaleString()}).`);
    setIngizaQuantity('');
  };

  // -------------------------------------------------------------------------
  // FORM: TOA KWENDA MASOKO
  // -------------------------------------------------------------------------
  const [toaProductId, setToaProductId] = useState<string>('prod-vybu-01');
  const [toaQuantity, setToaQuantity] = useState<number | ''>('');
  const [toaRecipient, setToaRecipient] = useState<string>('Deborah Mvungi (Debby)');

  const selectedToaProduct = useMemo(() => {
    return products.find(p => p.id === toaProductId) || products[0];
  }, [products, toaProductId]);

  const toaCurrentWarehouseStock = useMemo(() => {
    return productStocks[toaProductId]?.warehouse || 0;
  }, [productStocks, toaProductId]);

  const toaLiveValue = useMemo(() => {
    const qty = typeof toaQuantity === 'number' ? toaQuantity : 0;
    if (!selectedToaProduct || qty <= 0) return 0;
    return qty * selectedToaProduct.price;
  }, [selectedToaProduct, toaQuantity]);

  const handleToaMasokoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = typeof toaQuantity === 'number' ? toaQuantity : 0;
    if (qty <= 0) {
      showToast('Weka idadi sahihi zaidi ya 0!');
      return;
    }

    if (qty > toaCurrentWarehouseStock) {
      showToast(`Stoo Kuu haina idadi ya kutosha! Salio lililopo ni ${toaCurrentWarehouseStock}`);
      return;
    }

    const success = toaKwendaMasoko(
      toaProductId, 
      qty, 
      currentUser.name || 'Rashid Bakari (Stock)', 
      `Kutoa kwenda sokoni kwa ${toaRecipient}`
    );

    if (success) {
      showToast(`Mzigo wa ${qty} (${selectedToaProduct.name}) umepunguzwa Stoo Kuu na kuingizwa Masoko!`);
      setToaQuantity('');
    }
  };

  // -------------------------------------------------------------------------
  // FORM: KURUDISHA MZIGO KUTOKA MASOKO
  // -------------------------------------------------------------------------
  const [rudishaProductId, setRudishaProductId] = useState<string>('prod-vybu-01');
  const [rudishaQuantity, setRudishaQuantity] = useState<number | ''>('');
  const [rudishaMuuzaji, setRudishaMuuzaji] = useState<string>('Mariam Sonda');
  const [rudishaReason, setRudishaReason] = useState<string>('Mteja alipunguza oda sokoni');

  const selectedRudishaProduct = useMemo(() => {
    return products.find(p => p.id === rudishaProductId) || products[0];
  }, [products, rudishaProductId]);

  const handleRudishaMasokoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = typeof rudishaQuantity === 'number' ? rudishaQuantity : 0;
    if (qty <= 0) {
      showToast('Weka idadi sahihi zaidi ya 0!');
      return;
    }

    const success = rudishaKutokaMasoko(
      rudishaProductId, 
      qty, 
      currentUser.name || 'Rashid Bakari', 
      `${rudishaMuuzaji}: ${rudishaReason}`
    );

    if (success) {
      showToast(`Mzigo wa ${qty} (${selectedRudishaProduct.name}) umerudishwa Stoo Kuu kutoka masoko!`);
      setRudishaQuantity('');
    }
  };

  // -------------------------------------------------------------------------
  // DISPATCH ORDER (ODA ZA WAUZAJI)
  // -------------------------------------------------------------------------
  const handleDispatchOrder = (orderId: string) => {
    const success = dispatchStockOrder(orderId, currentUser.name || 'Rashid Bakari (Stock)');
    if (success) {
      showToast('Oda imethibitishwa na mzigo umetoka Stoo Kuu kwenda Masoko kikamilifu!');
    }
  };

  // -------------------------------------------------------------------------
  // ANNUAL REPORT CALCULATIONS (REPORT YA MWAKA)
  // -------------------------------------------------------------------------
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const yearlySales = useMemo(() => {
    return sales.filter(s => {
      if (s.tarehe.includes(selectedYear)) return true;
      if (s.tarehe.endsWith(selectedYear)) return true;
      return true;
    });
  }, [sales, selectedYear]);

  const yearlyTotalBoxes = useMemo(() => {
    return yearlySales.reduce((sum, s) => {
      if (s.maboksiSold > 0) return sum + s.maboksiSold;
      const count = s.items.reduce((iSum, item) => iSum + item.quantity, 0);
      return sum + count;
    }, 0);
  }, [yearlySales]);

  const yearlyTotalRevenue = useMemo(() => {
    return yearlySales.reduce((sum, s) => sum + s.totalKiasi, 0);
  }, [yearlySales]);

  const yearlyTransactionsCount = yearlySales.length;

  const averagePricePerBox = useMemo(() => {
    if (yearlyTotalBoxes === 0) return 0;
    return Math.round(yearlyTotalRevenue / yearlyTotalBoxes);
  }, [yearlyTotalRevenue, yearlyTotalBoxes]);

  const salesBySeller = useMemo(() => {
    const map: Record<string, { name: string; boxes: number; revenue: number; transactions: number }> = {};

    yearlySales.forEach(s => {
      const sellerKey = s.muuzajiName || 'Muuzaji';
      if (!map[sellerKey]) {
        map[sellerKey] = { name: sellerKey, boxes: 0, revenue: 0, transactions: 0 };
      }
      map[sellerKey].boxes += s.maboksiSold > 0 ? s.maboksiSold : s.items.reduce((acc, i) => acc + i.quantity, 0);
      map[sellerKey].revenue += s.totalKiasi;
      map[sellerKey].transactions += 1;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [yearlySales]);

  return (
    <div className="space-y-6">

      {/* Global Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-[#F6BA35] text-stone-950 font-bold text-xs flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-stone-950" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-stone-950 font-black text-sm">✕</button>
        </div>
      )}

      {/* Top Banner with live Stock Highlights */}
      <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-[#F6BA35] border border-amber-400/30">
              <Boxes className="w-6 h-6 stroke-[2.2]" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                Paneli ya Meneja Stoo (Stock Manager)
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Bofya kitufe cha kipengele unachotaka ili kifunguke moja kwa moja
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-stone-800 text-stone-300">
              Stoo Kuu: <strong className="text-[#F6BA35] font-mono">{stockInventory.warehouseBoxes} Box</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-stone-800 text-stone-300">
              Sokoni: <strong className="text-cyan-300 font-mono">{stockInventory.marketBoxes} Box</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-stone-800 text-stone-300">
              Oda Mpya: <strong className="text-rose-400 font-mono">{stockOrders.filter(o => o.status === 'PENDING').length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3 TOP LEVEL MODERN ACTION CARDS (CLICK TO OPEN / CLOSE): */}
      {/* 1. STOO KUU  |  2. ODA ZA WAUZAJI  |  3. RIPOTI YA MWAKA */}
      {/* ======================================================================= */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: STOO KUU */}
          <button
            type="button"
            onClick={() => setMainTab(prev => prev === 'stock_kuu' ? null : 'stock_kuu')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[120px] ${
              mainTab === 'stock_kuu'
                ? 'bg-gradient-to-br from-amber-500/20 via-[#F6BA35]/10 to-black/80 border-[#F6BA35] shadow-[0_0_30px_rgba(246,186,53,0.25)] ring-1 ring-[#F6BA35]/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-amber-400/50 hover:bg-stone-900/60 hover:-translate-y-1 hover:shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex items-center gap-3">
                <span className={`p-3 rounded-2xl transition-all ${
                  mainTab === 'stock_kuu' 
                    ? 'bg-[#F6BA35] text-stone-950 shadow-[0_0_15px_rgba(246,186,53,0.6)]' 
                    : 'bg-amber-500/15 text-[#F6BA35] border border-amber-400/30 group-hover:scale-110'
                }`}>
                  <Boxes className="w-6 h-6 stroke-[2.2]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white font-display tracking-wide">
                      1. STOO KUU
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[#F6BA35] text-[10px] font-bold">
                      5 Sehemu
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    Main Stock, Ingiza, Toa, Rudisha & Ledger
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[11px] text-stone-400">
                Salio: <strong className="text-[#F6BA35] font-mono">{stockInventory.warehouseBoxes} Boxes</strong>
              </span>
              {mainTab === 'stock_kuu' ? (
                <span className="px-3 py-1 rounded-full bg-[#F6BA35] text-stone-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-stone-800/90 group-hover:bg-amber-500/20 text-stone-300 group-hover:text-[#F6BA35] border border-stone-700/60 group-hover:border-amber-400/40 font-bold text-xs flex items-center gap-1.5 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </button>

          {/* Card 2: ODA ZA WAUZAJI */}
          <button
            type="button"
            onClick={() => setMainTab(prev => prev === 'oda_wauzaji' ? null : 'oda_wauzaji')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[120px] ${
              mainTab === 'oda_wauzaji'
                ? 'bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-black/80 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-cyan-400/50 hover:bg-stone-900/60 hover:-translate-y-1 hover:shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex items-center gap-3">
                <span className={`p-3 rounded-2xl transition-all ${
                  mainTab === 'oda_wauzaji' 
                    ? 'bg-cyan-400 text-stone-950 shadow-[0_0_15px_rgba(34,211,238,0.6)]' 
                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 group-hover:scale-110'
                }`}>
                  <ClipboardList className="w-6 h-6 stroke-[2.2]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white font-display tracking-wide">
                      2. ODA ZA WAUZAJI
                    </span>
                    {stockOrders.filter(o => o.status === 'PENDING').length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                        {stockOrders.filter(o => o.status === 'PENDING').length} Mpya
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    Thibitisha na toa mzigo kwenda masoko
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[11px] text-stone-400">
                Oda Zote: <strong className="text-cyan-300 font-mono">{stockOrders.length}</strong>
              </span>
              {mainTab === 'oda_wauzaji' ? (
                <span className="px-3 py-1 rounded-full bg-cyan-400 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-stone-800/90 group-hover:bg-cyan-500/20 text-stone-300 group-hover:text-cyan-300 border border-stone-700/60 group-hover:border-cyan-400/40 font-bold text-xs flex items-center gap-1.5 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </button>

          {/* Card 3: RIPOTI YA MWAKA */}
          <button
            type="button"
            onClick={() => setMainTab(prev => prev === 'report_mwaka' ? null : 'report_mwaka')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[120px] ${
              mainTab === 'report_mwaka'
                ? 'bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-black/80 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.25)] ring-1 ring-purple-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-purple-400/50 hover:bg-stone-900/60 hover:-translate-y-1 hover:shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex items-center gap-3">
                <span className={`p-3 rounded-2xl transition-all ${
                  mainTab === 'report_mwaka' 
                    ? 'bg-purple-400 text-stone-950 shadow-[0_0_15px_rgba(192,132,252,0.6)]' 
                    : 'bg-purple-500/15 text-purple-400 border border-purple-400/30 group-hover:scale-110'
                }`}>
                  <BarChart3 className="w-6 h-6 stroke-[2.2]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white font-display tracking-wide">
                      3. RIPOTI YA MWAKA
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold">
                      {selectedYear}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    Mabox, mapato, miamala, wastani bei
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[11px] text-stone-400">
                Mauzo Mwaka: <strong className="text-emerald-400 font-mono">TZS {yearlyTotalRevenue.toLocaleString()}</strong>
              </span>
              {mainTab === 'report_mwaka' ? (
                <span className="px-3 py-1 rounded-full bg-purple-400 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <span>Imefunguliwa</span>
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-stone-800/90 group-hover:bg-purple-500/20 text-stone-300 group-hover:text-purple-300 border border-stone-700/60 group-hover:border-purple-400/40 font-bold text-xs flex items-center gap-1.5 transition-all">
                  <span>Bofya Kufungua</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </button>

        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. SEHEMU YA STOO KUU (VIFUNGO VYA KISASA VYA KUFUNGUA KILA KIPENGELE) */}
      {/* ======================================================================= */}
      {mainTab === 'stock_kuu' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          {/* Sub-Option Modern Buttons Header for Stoo Kuu */}
          <div className="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-stone-800/80 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#F6BA35] font-black block">
                  Chagua Kipengele Ndani ya Stoo Kuu:
                </span>
                <p className="text-xs text-stone-400 mt-0.5">
                  Bofya kitufe kimoja kifunguke chini yake mara moja. Ukibonyeza tena kitafungwa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {stockKuuSubTab && (
                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Funga Yote</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMainTab(null)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#F6BA35] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-amber-400/30"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Funga Stoo Kuu</span>
                </button>
              </div>
            </div>

            {/* 5 Modern Interactive Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Button A: Main Stock */}
              <button
                type="button"
                onClick={() => setStockKuuSubTab(prev => prev === 'main_stock' ? null : 'main_stock')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  stockKuuSubTab === 'main_stock'
                    ? 'bg-amber-500/25 border-[#F6BA35] text-white shadow-lg shadow-amber-500/20 ring-1 ring-[#F6BA35]/50'
                    : 'bg-black/50 border-stone-800 text-stone-300 hover:border-amber-400/40 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${stockKuuSubTab === 'main_stock' ? 'bg-[#F6BA35] text-stone-950 font-bold' : 'bg-amber-500/10 text-[#F6BA35]'}`}>
                      <Boxes className="w-4 h-4 stroke-[2.2]" />
                    </span>
                    {stockKuuSubTab === 'main_stock' ? (
                      <span className="text-[10px] font-black text-[#F6BA35] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                        Imefunguliwa ▼
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-300">
                        Bofya ➔
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black block text-white">a) Main Stock</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Bidhaa na Masalio Yake
                  </span>
                </div>
              </button>

              {/* Button B: Ingiza Stoo Kuu */}
              <button
                type="button"
                onClick={() => setStockKuuSubTab(prev => prev === 'ingiza_stookuu' ? null : 'ingiza_stookuu')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  stockKuuSubTab === 'ingiza_stookuu'
                    ? 'bg-amber-500/25 border-[#F6BA35] text-white shadow-lg shadow-amber-500/20 ring-1 ring-[#F6BA35]/50'
                    : 'bg-black/50 border-stone-800 text-stone-300 hover:border-amber-400/40 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${stockKuuSubTab === 'ingiza_stookuu' ? 'bg-[#F6BA35] text-stone-950 font-bold' : 'bg-amber-500/10 text-[#F6BA35]'}`}>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    {stockKuuSubTab === 'ingiza_stookuu' ? (
                      <span className="text-[10px] font-black text-[#F6BA35] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                        Imefunguliwa ▼
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-300">
                        Bofya ➔
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black block text-white">b) Ingiza Stoo Kuu</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Vybu & Mazao ya Nyuki
                  </span>
                </div>
              </button>

              {/* Button C: Ingiza Masoko */}
              <button
                type="button"
                onClick={() => setStockKuuSubTab(prev => prev === 'ingiza_masoko' ? null : 'ingiza_masoko')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  stockKuuSubTab === 'ingiza_masoko'
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-black/50 border-stone-800 text-stone-300 hover:border-cyan-400/40 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${stockKuuSubTab === 'ingiza_masoko' ? 'bg-cyan-400 text-stone-950 font-bold' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    {stockKuuSubTab === 'ingiza_masoko' ? (
                      <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40">
                        Imefunguliwa ▼
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-300">
                        Bofya ➔
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black block text-white">c) Ingiza Masoko</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Toa Stoo kwenda Masoko
                  </span>
                </div>
              </button>

              {/* Button D: Rudisha Mzigo */}
              <button
                type="button"
                onClick={() => setStockKuuSubTab(prev => prev === 'rudisha_mzigo' ? null : 'rudisha_mzigo')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  stockKuuSubTab === 'rudisha_mzigo'
                    ? 'bg-purple-500/25 border-purple-400 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/50'
                    : 'bg-black/50 border-stone-800 text-stone-300 hover:border-purple-400/40 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${stockKuuSubTab === 'rudisha_mzigo' ? 'bg-purple-400 text-stone-950 font-bold' : 'bg-purple-500/10 text-purple-400'}`}>
                      <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    {stockKuuSubTab === 'rudisha_mzigo' ? (
                      <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/40">
                        Imefunguliwa ▼
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-300">
                        Bofya ➔
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black block text-white">d) Rudisha Mzigo</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Kutoka Masoko kuja Stoo
                  </span>
                </div>
              </button>

              {/* Button E: Kumbukumbu */}
              <button
                type="button"
                onClick={() => setStockKuuSubTab(prev => prev === 'kumbukumbu' ? null : 'kumbukumbu')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  stockKuuSubTab === 'kumbukumbu'
                    ? 'bg-amber-500/25 border-[#F6BA35] text-white shadow-lg shadow-amber-500/20 ring-1 ring-[#F6BA35]/50'
                    : 'bg-black/50 border-stone-800 text-stone-300 hover:border-amber-400/40 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${stockKuuSubTab === 'kumbukumbu' ? 'bg-[#F6BA35] text-stone-950 font-bold' : 'bg-amber-500/10 text-[#F6BA35]'}`}>
                      <ClipboardList className="w-4 h-4 stroke-[2.2]" />
                    </span>
                    {stockKuuSubTab === 'kumbukumbu' ? (
                      <span className="text-[10px] font-black text-[#F6BA35] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                        Imefunguliwa ▼
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-300">
                        Bofya ➔
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black block text-white">e) Kumbukumbu</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Tarehe, Muda & Thamani
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* SUB-SECTION 1: MAIN STOCK (Opens when clicked) */}
          {/* ----------------------------------------------------------------- */}
          {stockKuuSubTab === 'main_stock' && (
            <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-[#F6BA35]" />
                    Main Stock: Bidhaa Tulizonazo na Masalio Yake
                  </h2>
                  <p className="text-xs text-stone-400">
                    Orodha kamili ya Vybu Gin na Mazao ya Nyuki pamoja na idadi zilizopo Stoo Kuu na Masokoni.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={mainStockCategoryFilter}
                    onChange={(e) => setMainStockCategoryFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-black/50 border border-stone-700 text-xs text-stone-200 outline-none focus:border-[#F6BA35]"
                  >
                    <option value="ALL">Bidhaa Zote</option>
                    <option value="vybu_gin">Vybu Gin Tu</option>
                    <option value="bee_product">Bee Products Tu</option>
                  </select>

                  <div className="relative w-40 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tafuta..."
                      value={mainStockSearch}
                      onChange={(e) => setMainStockSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-xs text-white focus:border-[#F6BA35] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                    title="Funga Main Stock"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Stock Table */}
              <div className="overflow-x-auto rounded-2xl border border-stone-800">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="p-3">Kitengo</th>
                      <th className="p-3">Jina la Bidhaa</th>
                      <th className="p-3">Ufungashaji (Packaging)</th>
                      <th className="p-3">Bei (TZS)</th>
                      <th className="p-3 text-center">Salio Stoo Kuu</th>
                      <th className="p-3 text-center">Salio Masoko</th>
                      <th className="p-3 text-right">Thamani Stoo Kuu (TZS)</th>
                      <th className="p-3 text-center">Vitendo (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 bg-black/20">
                    {products
                      .filter(p => {
                        if (mainStockCategoryFilter !== 'ALL' && p.category !== mainStockCategoryFilter) return false;
                        if (mainStockSearch && !p.name.toLowerCase().includes(mainStockSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map(p => {
                        const stock = productStocks[p.id] || { warehouse: 0, market: 0 };
                        const isEditingThisRow = editingProductId === p.id;
                        const currentWhVal = isEditingThisRow
                          ? (typeof tempWarehouseStock === 'number' ? tempWarehouseStock : 0) * p.price
                          : stock.warehouse * p.price;

                        return (
                          <tr key={p.id} className={`transition-colors ${isEditingThisRow ? 'bg-amber-500/10 border-l-2 border-[#F6BA35]' : 'hover:bg-amber-500/5'}`}>
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
                            <td className="p-3 font-mono font-medium text-stone-300">
                              TZS {p.price.toLocaleString()}
                            </td>

                            {/* SALIO STOO KUU (EDITABLE) */}
                            <td className="p-3 text-center font-mono font-bold text-amber-300">
                              {isEditingThisRow ? (
                                <div className="flex items-center justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={tempWarehouseStock}
                                    onChange={(e) => setTempWarehouseStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-20 px-2 py-1 rounded-lg bg-stone-950 border border-amber-400 text-amber-300 font-mono font-bold text-center text-xs focus:outline-none ring-2 ring-amber-400/50 shadow-inner"
                                    placeholder="0"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <span 
                                  onClick={(e) => handleStartInlineEdit(p, e)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-400/20 hover:border-amber-400/60 cursor-pointer inline-flex items-center gap-1.5 transition-all group/badge"
                                  title="Bofya kuhariri Salio la Stoo Kuu"
                                >
                                  <span>{stock.warehouse}</span>
                                  <Edit3 className="w-2.5 h-2.5 text-amber-400/40 group-hover/badge:text-[#F6BA35] transition-colors" />
                                </span>
                              )}
                            </td>

                            {/* SALIO MASOKO (EDITABLE) */}
                            <td className="p-3 text-center font-mono font-bold text-cyan-300">
                              {isEditingThisRow ? (
                                <div className="flex items-center justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={tempMarketStock}
                                    onChange={(e) => setTempMarketStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-20 px-2 py-1 rounded-lg bg-stone-950 border border-cyan-400 text-cyan-300 font-mono font-bold text-center text-xs focus:outline-none ring-2 ring-cyan-400/50 shadow-inner"
                                    placeholder="0"
                                  />
                                </div>
                              ) : (
                                <span 
                                  onClick={(e) => handleStartInlineEdit(p, e)}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/20 hover:border-cyan-400/60 cursor-pointer inline-flex items-center gap-1.5 transition-all group/badge"
                                  title="Bofya kuhariri Salio la Masoko"
                                >
                                  <span>{stock.market}</span>
                                  <Edit3 className="w-2.5 h-2.5 text-cyan-400/40 group-hover/badge:text-cyan-300 transition-colors" />
                                </span>
                              )}
                            </td>

                            {/* THAMANI STOO KUU */}
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              TZS {currentWhVal.toLocaleString()}
                            </td>

                            {/* VITENDO / ACTIONS */}
                            <td className="p-3 text-center">
                              {isEditingThisRow ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlineEdit(p)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-md"
                                    title="Hifadhi Salio"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Hifadhi</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEdit}
                                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] cursor-pointer"
                                    title="Ghairi"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartInlineEdit(p, e)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-[#F6BA35] border border-amber-400/20 hover:border-amber-400/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                    title="Hariri Masalio ya Bidhaa Hii"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Hariri</span>
                                  </button>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* SUB-SECTION 2: INGIZA STOO KUU (Opens when clicked) */}
          {/* ----------------------------------------------------------------- */}
          {stockKuuSubTab === 'ingiza_stookuu' && (
            <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#F6BA35]" />
                    Ingiza Mzigo Stoo Kuu (Vybu Gin au Bee Products)
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Chagua kama ni Vybu Gin (moja tu) au Bee Products (orodha ya mazao ya nyuki). Thamani ya idadi hiyo huhesabiwa papo hapo kabla ya kuingiza.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStockKuuSubTab(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                  title="Funga Sehemu Hii"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIngizaCategory('vybu_gin');
                    setIngizaProductId('prod-vybu-01');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    ingizaCategory === 'vybu_gin'
                      ? 'bg-amber-500/20 border-[#F6BA35] shadow-lg shadow-amber-500/10 text-white'
                      : 'bg-black/40 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F6BA35]">1. Vybu Gin 200mls</span>
                    <Package className="w-4 h-4 text-[#F6BA35]" />
                  </div>
                  <p className="text-[11px] text-stone-400">Bidhaa moja ya kiwanda (Box 200mls x 24)</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIngizaCategory('bee_product');
                    setIngizaProductId('prod-bee-01');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    ingizaCategory === 'bee_product'
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10 text-white'
                      : 'bg-black/40 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-cyan-300">2. Bee Products (Mazao ya Nyuki)</span>
                    <Boxes className="w-4 h-4 text-cyan-300" />
                  </div>
                  <p className="text-[11px] text-stone-400">Orodha kamili ya asali na mazao yote 15 ya nyuki</p>
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleIngizaStooKuuSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    {ingizaCategory === 'vybu_gin' ? 'Bidhaa ya Vybu Gin:' : 'Chagua Mazao ya Nyuki Unayotaka Kuingiza:'}
                  </label>
                  <select
                    value={ingizaProductId}
                    onChange={(e) => setIngizaProductId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-stone-700 text-white text-xs font-bold focus:border-[#F6BA35] outline-none"
                  >
                    {products
                      .filter(p => p.category === ingizaCategory)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.packaging} (Bei: TZS {p.price.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Idadi ya Kuingiza Stoo Kuu *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Weka idadi..."
                    value={ingizaQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIngizaQuantity(val === '' ? '' : Math.max(1, Number(val)));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-stone-700 text-white font-mono font-bold text-sm focus:border-[#F6BA35] outline-none"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Salio la sasa Stoo Kuu: <strong>{productStocks[ingizaProductId]?.warehouse || 0}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Thamani ya Idadi Hiyo (Hesabu ya Papo Hapo)
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-[#F6BA35]/50 flex items-center justify-between">
                    <span className="text-xs text-stone-300">Thamani Jumla:</span>
                    <span className="text-base font-black font-mono text-[#F6BA35]">
                      TZS {ingizaLiveValue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    {ingizaQuantity} × TZS {selectedIngizaProduct?.price.toLocaleString()}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Maelezo ya Muamala
                  </label>
                  <input
                    type="text"
                    value={ingizaNote}
                    onChange={(e) => setIngizaNote(e.target.value)}
                    placeholder="mfano: Mzigo mpya kutoka kiwandani / mzingani"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-stone-700 text-white text-xs focus:border-[#F6BA35] outline-none"
                  />
                </div>

                <div className="md:col-span-2 pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-2 shadow-xl cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Thibitisha na Ingiza Mzigo Stoo Kuu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="px-4 py-3 rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs cursor-pointer"
                  >
                    Funga
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* SUB-SECTION 3: INGIZA MASOKO (Kutoa Stoo kwenda Masoko) */}
          {/* ----------------------------------------------------------------- */}
          {stockKuuSubTab === 'ingiza_masoko' && (
            <div className="glass-panel-zamboo rounded-3xl p-6 border border-cyan-400/35 shadow-2xl space-y-4 max-w-2xl animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                    Ingiza Masoko (Kutoa Mzigo Kutoka Stoo Kuu Kwenda Sokoni)
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Mzigo huu unakatwa moja kwa moja kutoka Stoo Kuu (unapungua) na kuongezwa sokoni kwa wauzaji.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStockKuuSubTab(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleToaMasokoSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Chagua Bidhaa:</label>
                  <select
                    value={toaProductId}
                    onChange={(e) => setToaProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs outline-none focus:border-cyan-400"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.packaging}) — Stoo Kuu: {productStocks[p.id]?.warehouse || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Idadi ya Kutoa:</label>
                    <input
                      type="number"
                      min="1"
                      max={toaCurrentWarehouseStock}
                      placeholder="Weka idadi..."
                      value={toaQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setToaQuantity(val === '' ? '' : Math.max(1, Number(val)));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Iliyopo Stoo: <strong>{toaCurrentWarehouseStock}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Thamani ya Mzigo:</label>
                    <div className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono font-bold text-xs">
                      TZS {toaLiveValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Mpokeaji / Muuzaji:</label>
                  <select
                    value={toaRecipient}
                    onChange={(e) => setToaRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs"
                  >
                    {users.filter(u => u.role === 'muuzaji').map(u => (
                      <option key={u.id} value={u.name}>{u.name} (Muuzaji)</option>
                    ))}
                    <option value="Soko Kuu la Dar es Salaam">Soko Kuu la Dar es Salaam</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    <span>Toa Mzigo Kwenda Masoko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs cursor-pointer"
                  >
                    Funga
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* SUB-SECTION 4: RUDISHA MZIGO (Kurejesha kutoka Masoko kuja Stoo Kuu) */}
          {/* ----------------------------------------------------------------- */}
          {stockKuuSubTab === 'rudisha_mzigo' && (
            <div className="glass-panel-zamboo rounded-3xl p-6 border border-purple-400/35 shadow-2xl space-y-4 max-w-2xl animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-purple-400" />
                    Kurudisha Mzigo Kutoka Masoko (Inaingia Stoo Kuu)
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Maboksi yaliyobaki sokoni yanarudishwa stoo kuu na kuongezwa kwenye salio lililobaki.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStockKuuSubTab(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRudishaMasokoSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Chagua Bidhaa Inayorudishwa:</label>
                  <select
                    value={rudishaProductId}
                    onChange={(e) => setRudishaProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs outline-none focus:border-purple-400"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.packaging}) — Sokoni: {productStocks[p.id]?.market || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Idadi Inayorudishwa:</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Weka idadi..."
                      value={rudishaQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRudishaQuantity(val === '' ? '' : Math.max(1, Number(val)));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Muuzaji Aliyerudisha:</label>
                    <select
                      value={rudishaMuuzaji}
                      onChange={(e) => setRudishaMuuzaji(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs"
                    >
                      {users.filter(u => u.role === 'muuzaji').map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Sababu ya Kurudisha:</label>
                  <input
                    type="text"
                    value={rudishaReason}
                    onChange={(e) => setRudishaReason(e.target.value)}
                    placeholder="mfano: Mteja alipunguza oda / muda wa soko ulipita"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-700 text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>Rejesha Mzigo Stoo Kuu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs cursor-pointer"
                  >
                    Funga
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* SUB-SECTION 5: KUMBUKUMBU (Movement Ledger) */}
          {/* ----------------------------------------------------------------- */}
          {stockKuuSubTab === 'kumbukumbu' && (
            <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#F6BA35]" />
                    Kumbukumbu ya Mienendo ya Mzigo (Stock Movement Ledger)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Inarekodi kila boksi na bidhaa zilizoingia na kutoka kwa tarehe, muda, aina ya product, idadi na thamani yake.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tafuta bidhaa au afisa..."
                      value={kumbukumbuSearch}
                      onChange={(e) => setKumbukumbuSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-xs text-white focus:border-[#F6BA35] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStockKuuSubTab(null)}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-800">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="p-3">Tarehe & Muda</th>
                      <th className="p-3">Aina ya Muamala</th>
                      <th className="p-3">Bidhaa (Product)</th>
                      <th className="p-3 text-center">Idadi</th>
                      <th className="p-3">Thamani (TZS)</th>
                      <th className="p-3 text-center">Salio Kabla ➔ Baada</th>
                      <th className="p-3">Afisa & Maelezo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 bg-black/20">
                    {stockMovements
                      .filter(m => 
                        m.productName.toLowerCase().includes(kumbukumbuSearch.toLowerCase()) ||
                        m.afisaJina.toLowerCase().includes(kumbukumbuSearch.toLowerCase()) ||
                        (m.maelezo && m.maelezo.toLowerCase().includes(kumbukumbuSearch.toLowerCase()))
                      )
                      .map(m => {
                        const isIngiza = m.ainaYaMuamala === 'INGIZA_STOO_KUU';
                        const isToa = m.ainaYaMuamala === 'TOA_KWENDA_MASOKO';
                        const isRudisha = m.ainaYaMuamala === 'RUDISHA_KUTOKA_MASOKO';

                        return (
                          <tr key={m.id} className="hover:bg-amber-500/5 transition-colors">
                            <td className="p-3 whitespace-nowrap font-mono text-stone-400 text-[11px]">
                              <div>{m.tarehe}</div>
                              <div className="text-[10px] text-stone-500">{m.muda}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {isIngiza && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  Ingiza Stoo Kuu
                                </span>
                              )}
                              {isToa && (
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                                  Toa Masoko
                                </span>
                              )}
                              {isRudisha && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                                  Rejesha Stoo Kuu
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-white">
                              {m.productName}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-white">
                              {m.idadi}
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              TZS {m.thamani.toLocaleString()}
                            </td>
                            <td className="p-3 text-center font-mono text-stone-300 text-[11px]">
                              <span className="text-stone-400">{m.salioKabla}</span>
                              <span className="mx-1 text-[#F6BA35]">➔</span>
                              <span className="font-bold text-amber-300">{m.salioBaada}</span>
                            </td>
                            <td className="p-3 text-stone-400 text-[11px]">
                              <div className="font-medium text-stone-200">{m.afisaJina}</div>
                              <div className="text-stone-500 text-[10px]">{m.maelezo}</div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. ODA ZA WAUZAJI (Opens when clicked) */}
      {/* ======================================================================= */}
      {mainTab === 'oda_wauzaji' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#F6BA35]" />
                  Oda za Maboksi kutoka kwa Wauzaji
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Tazama majina ya wauzaji na aina ya oda walizoomba. Bofya kitufe cha kuthibitisha ili kupunguza stoo kuu na kuingiza moja kwa moja sokoni.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMainTab(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                title="Funga Oda za Wauzaji"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3">Namba ya Oda</th>
                    <th className="p-3">Jina la Muuzaji</th>
                    <th className="p-3">Aina ya Oda / Bidhaa</th>
                    <th className="p-3 text-center">Maboksi Yaliyoombwa</th>
                    <th className="p-3">Tarehe</th>
                    <th className="p-3">Hali ya Oda</th>
                    <th className="p-3 text-center">Hatua ya Stoo Manager</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-black/20">
                  {stockOrders.map(order => {
                    const isPending = order.status === 'PENDING';

                    return (
                      <tr key={order.id} className="hover:bg-amber-500/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#F6BA35]">
                          {order.orderNumber}
                        </td>
                        <td className="p-3 font-semibold text-white">
                          {order.muuzajiName}
                        </td>
                        <td className="p-3 text-stone-300 font-medium">
                          {order.productName || 'Vybu Gin (Box 200mls x 24)'}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-amber-300 text-sm">
                          {order.maboksiRequested} Box
                        </td>
                        <td className="p-3 font-mono text-stone-400">
                          {order.tarehe}
                        </td>
                        <td className="p-3">
                          {isPending ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#F6BA35] border border-amber-500/30 text-[10px] font-bold">
                              Inasubiri Uthibitisho (Pending)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Imetolewa Sokoni (Dispatched)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleDispatchOrder(order.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 mx-auto cursor-pointer shadow-md transition-all"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Thibitisha na Toa Stoo Kuu Kwenda Masoko</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-500 italic">
                              Imethibitishwa na {order.dispatchedBy}
                            </span>
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
      {/* 3. RIPOTI YA MWAKA (Opens when clicked) */}
      {/* ======================================================================= */}
      {mainTab === 'report_mwaka' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F6BA35]" />
                Ripoti ya Mwaka ya Mauzo & Mzunguko wa Maboksi (Annual Report)
              </h2>
              <p className="text-xs text-stone-400">
                Muhtasari wa jumla ya maboksi, mapato, miamala, na wastani wa bei kwa box kwa mwaka mzima.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-300">Mwaka:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/60 border border-stone-700 text-white font-bold text-xs focus:border-[#F6BA35] outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              <button
                type="button"
                onClick={() => setMainTab(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer ml-2"
                title="Funga Ripoti ya Mwaka"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 HIGHLIGHTED METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Jumla ya Mabox Yaliyouzwa */}
            <div className="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                <span>JUMLA YA MABOX YA MWAKA</span>
                <span className="p-1.5 rounded-xl bg-amber-500/15 border border-[#F6BA35]/40 text-[#F6BA35]">
                  <Boxes className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-white font-display">
                {yearlyTotalBoxes.toLocaleString()} <span className="text-sm font-semibold text-stone-300">Box</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Jumla ya bidhaa zote zilizouzwa mwaka {selectedYear}
              </p>
            </div>

            {/* 2. Jumla ya Mapato */}
            <div className="glass-panel-zamboo rounded-3xl p-5 border border-emerald-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                <span>JUMLA YA MAPATO YA MWAKA</span>
                <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-display">
                TZS {yearlyTotalRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Mapato yote yaliyokusanywa na wauzaji
              </p>
            </div>

            {/* 3. Miamala na Mauzo */}
            <div className="glass-panel-zamboo rounded-3xl p-5 border border-cyan-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                <span>MIAMALA & MAUZO YA MWAKA</span>
                <span className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
                  <ClipboardList className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-cyan-400 font-display">
                {yearlyTransactionsCount} <span className="text-sm font-semibold text-stone-300">Miamala</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Idadi ya risiti zilizotolewa kwa wateja
              </p>
            </div>

            {/* 4. Wastani wa Bei kwa Box */}
            <div className="glass-panel-zamboo rounded-3xl p-5 border border-purple-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                <span>WASTANI WA BEI KWA BOX</span>
                <span className="p-1.5 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-purple-300 font-display">
                TZS {averagePricePerBox.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Wastani: Mapato ya Mwaka ÷ Jumla ya Mabox
              </p>
            </div>

          </div>

          {/* Jedwali la Mauzo ya Wauzaji kwa Mwaka */}
          <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#F6BA35]" />
                  Mchanganuo wa Mauzo ya Wauzaji kwa Mwaka {selectedYear}
                </h3>
                <p className="text-xs text-stone-400">
                  Idadi ya maboksi yaliyouzwa, mapato yaliyokusanywa na kila muuzaji, na idadi ya miamala aliyofanya.
                </p>
              </div>

              <button
                type="button"
                onClick={() => showToast('Ripoti ya mwaka inapakuliwa kama Excel/CSV...')}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-[#F6BA35] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Pakua Ripoti ya Mwaka (Excel/CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3">Jina la Muuzaji</th>
                    <th className="p-3 text-center">Maboksi Aliyouza</th>
                    <th className="p-3 text-right">Mapato Aliyoingiza (TZS)</th>
                    <th className="p-3 text-center">Idadi ya Miamala</th>
                    <th className="p-3 text-right">Wastani kwa Muamala (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-black/20">
                  {salesBySeller.map(seller => {
                    const avgPerTx = seller.transactions > 0 ? Math.round(seller.revenue / seller.transactions) : 0;

                    return (
                      <tr key={seller.name} className="hover:bg-amber-500/5 transition-colors">
                        <td className="p-3 font-semibold text-white">
                          {seller.name}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-amber-300">
                          {seller.boxes.toLocaleString()} Box
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          TZS {seller.revenue.toLocaleString()}
                        </td>
                        <td className="p-3 text-center font-mono text-cyan-300">
                          {seller.transactions}
                        </td>
                        <td className="p-3 text-right font-mono text-stone-300">
                          TZS {avgPerTx.toLocaleString()}
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
      {/* MODAL: DIRECT STOCK EDIT (HARIRI SALIO LA BIDHAA) */}
      {/* ======================================================================= */}
      {modalEditProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-amber-400/50 rounded-3xl p-6 shadow-2xl text-stone-100 relative space-y-4">
            <button
              type="button"
              onClick={() => setModalEditProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-stone-800 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#F6BA35] font-black">HARIRI MASALIO YA HISA</span>
              <h3 className="text-base font-black text-white font-display">
                {modalEditProduct.name}
              </h3>
              <p className="text-xs text-stone-400">
                {modalEditProduct.packaging} · Bei: TZS {modalEditProduct.price.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleSaveModalStockEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-amber-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Salio Jipya Stoo Kuu (Warehouse):
                </label>
                <input
                  type="number"
                  min="0"
                  value={tempWarehouseStock}
                  onChange={(e) => setTempWarehouseStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-amber-400/60 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#F6BA35]/50"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  Salio Jipya Masokoni (Market):
                </label>
                <input
                  type="number"
                  min="0"
                  value={tempMarketStock}
                  onChange={(e) => setTempMarketStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-cyan-400/60 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-1">
                  Sababu / Maelezo ya Marekebisho (Optional):
                </label>
                <input
                  type="text"
                  value={stockEditNote}
                  onChange={(e) => setStockEditNote(e.target.value)}
                  placeholder="Mfano: Ukaguzi wa hisa (Stock taking)"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-stone-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">Thamani Mpya ya Stoo Kuu:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    TZS {((typeof tempWarehouseStock === 'number' ? tempWarehouseStock : 0) * modalEditProduct.price).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#F6BA35] hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Hifadhi Masalio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalEditProduct(null)}
                  className="px-4 py-3 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
