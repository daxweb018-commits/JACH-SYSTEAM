import React, { useState, useMemo } from 'react';
import { useSystem } from '../../context/SystemContext';
import { ProductCategory, ProductItem, SaleRecord, SaleItem } from '../../types/system';
import { downloadSaleReceiptPDF, triggerPrintDialog } from '../../utils/pdfReceiptGenerator';
import { DatePickerCalendar } from '../DatePickerCalendar';
import { 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Clock, 
  UserCheck, 
  CreditCard, 
  Boxes, 
  Search, 
  Plus, 
  Receipt, 
  ArrowDownCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  PackagePlus,
  Layers,
  Sparkles,
  Download,
  Printer,
  X,
  FileSpreadsheet,
  ChevronUp,
  ArrowUpRight,
  Phone,
  FileText,
  Send,
  Check
} from 'lucide-react';

export const MuuzajiPanel: React.FC = () => {
  const { 
    currentUser, 
    products, 
    sales, 
    addNewSale, 
    payCustomerDebt,
    requestStockOrder,
    stockOrders,
    productStocks,
    systemInfo 
  } = useSystem();

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // MODERN COLLAPSIBLE ACTION CARDS (Starts closed for a clean interface)
  // 1. uza_bidhaa
  // 2. weka_oda
  // 3. madeni_yangu
  // 4. ripoti_mauzo
  // =========================================================================
  const [activeSection, setActiveSection] = useState<'uza_bidhaa' | 'weka_oda' | 'madeni_yangu' | 'ripoti_mauzo' | 'main_stock' | null>(null);

  // =========================================================================
  // FORM YA KUUZA BIDHAA (POS)
  // =========================================================================
  const [tarehe, setTarehe] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [mtejaName, setMtejaName] = useState('');
  const [mtejaPhone, setMtejaPhone] = useState('');
  const [mtejaTin, setMtejaTin] = useState('');
  
  // Product Category: 'vybu_gin' | 'bee_product'
  const [saleCategory, setSaleCategory] = useState<ProductCategory>('vybu_gin');
  const [selectedBeeProductId, setSelectedBeeProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  
  // Other Cost State (Gharama Nyingine / Usafiri)
  const [hasOtherCost, setHasOtherCost] = useState<boolean>(false);
  const [otherCostAmount, setOtherCostAmount] = useState<number | ''>('');
  const [otherCostDescription, setOtherCostDescription] = useState<string>('Usafiri wa Mzigo');

  // Njia ya Malipo: 'M-Pesa' | 'Mix by Yas' | 'Benki' | 'Mkopo'
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Mix by Yas' | 'Benki' | 'Mkopo'>('M-Pesa');
  const [amountPaidInput, setAmountPaidInput] = useState<number | ''>('');

  // Active Receipt Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleRecord | null>(null);

  // =========================================================================
  // FORM YA KUWEKA ODA KWA STOCK MANAGER
  // =========================================================================
  const [orderProductType, setOrderProductType] = useState<ProductCategory>('vybu_gin');
  const [orderBeeProductId, setOrderBeeProductId] = useState<string>('');
  const [orderQuantity, setOrderQuantity] = useState<number | ''>('');

  // =========================================================================
  // MODAL YA KULIPA DENI (REPAY DEBT)
  // =========================================================================
  const [repaySale, setRepaySale] = useState<SaleRecord | null>(null);
  const [repayAmount, setRepayAmount] = useState<number | ''>('');
  const [repayMethod, setRepayMethod] = useState<'M-Pesa' | 'Mix by Yas' | 'Benki' | 'Taslimu'>('M-Pesa');

  // Search in My Sales and Debts
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [debtSearchQuery, setDebtSearchQuery] = useState('');

  // =========================================================================
  // PRODUCTS FILTERING
  // =========================================================================
  const vybuProduct = useMemo(() => {
    return products.find(p => p.category === 'vybu_gin') || {
      id: 'prod-vybu-01',
      name: 'Vybu Gin (200mls)',
      packaging: 'Box (200mls x 24 Bottles)',
      price: 39000,
      category: 'vybu_gin' as ProductCategory,
    };
  }, [products]);

  const beeProducts = useMemo(() => {
    return products.filter(p => p.category === 'bee_product');
  }, [products]);

  // Selected Product for Sale
  const currentSaleProduct = useMemo(() => {
    if (saleCategory === 'vybu_gin') {
      return vybuProduct;
    }
    const found = beeProducts.find(p => p.id === selectedBeeProductId);
    return found || beeProducts[0] || vybuProduct;
  }, [saleCategory, vybuProduct, beeProducts, selectedBeeProductId]);

  // Auto calculate price:
  // If Vybu Gin, price is strictly TZS 39,000 per box!
  const unitPrice = currentSaleProduct ? currentSaleProduct.price : 39000;
  const baseProductPrice = unitPrice * (typeof quantity === 'number' && quantity > 0 ? quantity : 0);
  const numericOtherCost = hasOtherCost && typeof otherCostAmount === 'number' && otherCostAmount > 0 ? otherCostAmount : 0;
  const totalCalculatedSalePrice = baseProductPrice + numericOtherCost;

  // Payment amounts calculation
  const isCreditSale = paymentMethod === 'Mkopo';
  const effectivePaid = isCreditSale ? Number(amountPaidInput || 0) : totalCalculatedSalePrice;
  const balanceDue = Math.max(0, totalCalculatedSalePrice - effectivePaid);
  const isFullyPaid = balanceDue === 0;

  // =========================================================================
  // FILTER SALES & DEBTS BELONGING TO THIS SALESPERSON
  // =========================================================================
  const mySales = useMemo(() => {
    return sales.filter(s => 
      s.muuzajiId === currentUser.id || 
      s.muuzajiName === currentUser.name || 
      s.muuzajiName === currentUser.username ||
      currentUser.role === 'managing_director'
    );
  }, [sales, currentUser]);

  const myDebts = useMemo(() => {
    return mySales.filter(s => s.balanceDue > 0);
  }, [mySales]);

  // Today's summary
  const todayGB = new Date().toLocaleDateString('en-GB');
  const todayISO = new Date().toISOString().split('T')[0];

  const mySalesToday = useMemo(() => {
    return mySales.filter(s => s.tarehe === todayGB || s.tarehe === todayISO);
  }, [mySales, todayGB, todayISO]);

  const mySalesTodayAmount = useMemo(() => {
    return mySalesToday.reduce((sum, s) => sum + s.totalKiasi, 0);
  }, [mySalesToday]);

  const myCashCollectedToday = useMemo(() => {
    return mySalesToday.reduce((sum, s) => sum + s.amountPaid, 0);
  }, [mySalesToday]);

  const myTotalPendingDebts = useMemo(() => {
    return myDebts.reduce((sum, s) => sum + s.balanceDue, 0);
  }, [myDebts]);

  const myBoxesSoldToday = useMemo(() => {
    return mySalesToday.reduce((sum, s) => sum + s.maboksiSold, 0);
  }, [mySalesToday]);

  // My Orders
  const myStockOrders = useMemo(() => {
    return stockOrders.filter(o => 
      o.muuzajiId === currentUser.id || 
      o.muuzajiName === currentUser.name || 
      o.muuzajiName === currentUser.username ||
      currentUser.role === 'managing_director'
    );
  }, [stockOrders, currentUser]);

  // =========================================================================
  // SUBMIT NEW SALE (UZA BIDHAA)
  // =========================================================================
  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mtejaName.trim()) {
      showToast('Tafadhali jaza jina la mteja.');
      return;
    }
    if (!currentSaleProduct) {
      showToast('Tafadhali chagua bidhaa ya kuuza.');
      return;
    }
    if (!quantity || quantity <= 0) {
      showToast('Tafadhali weka idadi sahihi ya bidhaa.');
      return;
    }

    const effectiveQuantity = Number(quantity);
    const prodStock = productStocks[currentSaleProduct.id] || { warehouse: 0, market: 0 };

    if (prodStock.market < effectiveQuantity) {
      showToast(`⚠️ HAKUNA MZIGO WA KUTOSHA MASOKONI! Salio la ${currentSaleProduct.name} sokoni ni ${prodStock.market}. Tafadhali weka oda kwa Stock Manager.`);
      return;
    }

    const saleAmountPaid = isCreditSale ? Number(amountPaidInput || 0) : totalCalculatedSalePrice;
    const finalBalance = Math.max(0, totalCalculatedSalePrice - saleAmountPaid);
    const saleStatus = finalBalance === 0 ? 'IMELIPWA' : (saleAmountPaid > 0 ? 'INADAIWA' : 'HAIJALIPWA');

    const item1TotalPrice = unitPrice * effectiveQuantity;

    // Build Sale Items: Item 1 = Product, Item 2 = Other Cost / Usafiri (if entered)
    const saleItems: SaleItem[] = [
      {
        productId: currentSaleProduct.id,
        productName: `${currentSaleProduct.name} (${currentSaleProduct.packaging})`,
        category: saleCategory,
        quantity: effectiveQuantity,
        unitPrice,
        totalPrice: item1TotalPrice,
      }
    ];

    if (hasOtherCost && numericOtherCost > 0) {
      const desc = otherCostDescription.trim() || 'Usafiri';
      saleItems.push({
        productId: 'prod-other-cost',
        productName: desc,
        category: saleCategory,
        quantity: 1,
        unitPrice: numericOtherCost,
        totalPrice: numericOtherCost,
      });
    }

    const createdRecord = addNewSale({
      tarehe,
      muuzajiId: currentUser.id,
      muuzajiName: currentUser.name || currentUser.username,
      mtejaName: mtejaName.trim(),
      mtejaPhone: mtejaPhone.trim() || 'Hana Simu',
      mtejaTin: mtejaTin.trim() || 'Hana TIN',
      paymentMethod,
      category: saleCategory,
      items: saleItems,
      otherCost: numericOtherCost > 0 ? numericOtherCost : undefined,
      otherCostDescription: numericOtherCost > 0 ? (otherCostDescription.trim() || 'Usafiri') : undefined,
      hasOtherCost: numericOtherCost > 0,
      totalKiasi: totalCalculatedSalePrice,
      amountPaid: saleAmountPaid,
      balanceDue: finalBalance,
      isCredit: isCreditSale,
      hali: saleStatus,
      maboksiSold: saleCategory === 'vybu_gin' ? effectiveQuantity : 0,
    });

    // Reset Form
    setMtejaName('');
    setMtejaPhone('');
    setMtejaTin('');
    setQuantity('');
    setAmountPaidInput('');
    setPaymentMethod('M-Pesa');
    setHasOtherCost(false);
    setOtherCostAmount('');
    setOtherCostDescription('Usafiri wa Mzigo');

    showToast(`Mauzo ya TZS ${totalCalculatedSalePrice.toLocaleString()} yamethibitishwa na invoice imetengenezwa!`);

    // Open receipt modal directly
    setActiveReceiptSale(createdRecord);
  };

  // =========================================================================
  // SUBMIT STOCK ORDER KWA STOCK MANAGER
  // =========================================================================
  const handleSendStockOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const qty = typeof orderQuantity === 'number' ? orderQuantity : 0;
    if (qty <= 0) {
      showToast('Tafadhali weka idadi ya maboksi unayotaka kuagiza.');
      return;
    }

    let targetProductId = 'prod-vybu-01';
    let targetProductName = 'Vybu Gin (Box 200mls x 24)';

    if (orderProductType === 'bee_product') {
      const p = beeProducts.find(b => b.id === orderBeeProductId) || beeProducts[0];
      if (p) {
        targetProductId = p.id;
        targetProductName = `${p.name} (${p.packaging})`;
      }
    }

    requestStockOrder(
      currentUser.id,
      currentUser.name || currentUser.username,
      qty,
      targetProductId,
      targetProductName
    );

    setOrderQuantity('');
    showToast(`Oda ya ${qty} ya ${targetProductName} imetumwa kwa Stock Manager!`);
  };

  // =========================================================================
  // REPAY CUSTOMER DEBT
  // =========================================================================
  const handleConfirmDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaySale || !repayAmount || Number(repayAmount) <= 0) {
      showToast('Tafadhali ingiza kiasi sahihi cha fedha inayolipwa.');
      return;
    }

    const payVal = Number(repayAmount);
    if (payVal > repaySale.balanceDue) {
      showToast(`Kiasi kinacholipwa (TZS ${payVal.toLocaleString()}) kimezidi salio la deni (TZS ${repaySale.balanceDue.toLocaleString()})!`);
      return;
    }

    const success = payCustomerDebt(repaySale.id, payVal);
    if (success) {
      showToast(`Malipo ya deni ya TZS ${payVal.toLocaleString()} ya mteja ${repaySale.mtejaName} yamethibitishwa!`);
      setRepaySale(null);
      setRepayAmount('');
    } else {
      showToast('Hitilafu wakati wa kuthibitisha malipo.');
    }
  };

  // =========================================================================
  // DOWNLOAD EXCEL OF MY SALES (.csv)
  // =========================================================================
  const downloadSalesExcel = () => {
    if (mySales.length === 0) {
      showToast('Hakuna mauzo ya kupakua kwa sasa.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Tarehe ya Mauzo',
      'Muuzaji',
      'Jina la Mteja',
      'Simu ya Mteja',
      'TIN ya Mteja',
      'Bidhaa Zilizouzwa (Pamoja na Usafiri)',
      'Idadi ya Maboksi/Vipimo',
      'Njia ya Malipo',
      'Jumla ya Mauzo (TZS)',
      'Kiasi Kilicholipwa (TZS)',
      'Baki ya Deni (TZS)',
      'Hali ya Malipo'
    ];

    const rows = mySales.map(s => {
      const itemsStr = s.items.map(i => `${i.productName} [${i.quantity}]`).join('; ');
      return [
        `"${s.risitiNumber}"`,
        `"${s.tarehe}"`,
        `"${s.muuzajiName}"`,
        `"${s.mtejaName}"`,
        `"${s.mtejaPhone || 'Hana'}"`,
        `"${s.mtejaTin || 'Hana'}"`,
        `"${itemsStr}"`,
        `"${s.category === 'vybu_gin' ? s.maboksiSold : s.items.reduce((acc, i) => acc + i.quantity, 0)}"`,
        `"${s.paymentMethod || (s.isCredit ? 'Mkopo' : 'Taslimu')}"`,
        `"${s.totalKiasi}"`,
        `"${s.amountPaid}"`,
        `"${s.balanceDue}"`,
        `"${s.hali}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ripoti_ya_Mauzo_Yangu_${currentUser.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Ripoti ya Excel ya mauzo yako imepakuliwa kikamilifu!');
  };

  // Download Receipt as Official PDF Document
  const handleDownloadReceiptPDF = (sale: SaleRecord) => {
    try {
      downloadSaleReceiptPDF(sale, systemInfo);
      showToast(`Risiti ya PDF (#${sale.risitiNumber}) imepakuliwa kikamilifu!`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback text download
      downloadReceiptAsText(sale);
    }
  };

  // Download Receipt as Text File (Fallback)
  const downloadReceiptAsText = (sale: SaleRecord) => {
    const textContent = `
========================================
       ${systemInfo.officeName}
       TIN: ${systemInfo.tin}
       Simu: ${systemInfo.phone}
========================================
RISITI YA MAUZO RASMI
Namba ya Risiti: ${sale.risitiNumber}
Tarehe: ${sale.tarehe}
Muuzaji: ${sale.muuzajiName}
----------------------------------------
TAARIFA ZA MTEJA:
Jina: ${sale.mtejaName}
Simu: ${sale.mtejaPhone || 'Hana Simu'}
TIN ya Mteja: ${sale.mtejaTin || 'Hana TIN'}
----------------------------------------
BIDHAA ZILIZOUZWA:
${sale.items.map(it => `- ${it.productName} x ${it.quantity} = TZS ${it.totalPrice.toLocaleString()}`).join('\n')}
----------------------------------------
Njia ya Malipo: ${sale.paymentMethod || (sale.isCredit ? 'Mkopo' : 'Taslimu')}
Jumla ya Mauzo: TZS ${sale.totalKiasi.toLocaleString()}
Kiasi Kilicholipwa: TZS ${sale.amountPaid.toLocaleString()}
Baki ya Deni: TZS ${sale.balanceDue.toLocaleString()}
Hali ya Malipo: ${sale.hali}
========================================
Asante kwa kufanya biashara nasi!
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Risiti_${sale.risitiNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Risiti imepakuliwa!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border backdrop-blur-md transition-all ${
          toastMessage.includes('⚠️') || toastMessage.includes('HAKUNA') || toastMessage.includes('KUTOSHA')
            ? 'bg-rose-600 text-white border-rose-400 shadow-rose-900/60 animate-shake'
            : 'bg-[#F6BA35] text-stone-950 border-amber-300 animate-in fade-in slide-in-from-top-2 duration-200'
        }`}>
          {toastMessage.includes('⚠️') || toastMessage.includes('HAKUNA') || toastMessage.includes('KUTOSHA') ? (
            <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-stone-950" />
          )}
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-400/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-[#F6BA35]">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </span>
            DAFTARI LA MUUZAJI SOKONI
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Uuzaji wa bidhaa, utoaji wa risiti, kuweka oda kwa Stock Manager, ufuatiliaji wa madeni yako na kupakua Excel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[#F6BA35] text-xs font-bold font-mono">
            {currentUser.name || currentUser.username}
          </span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TOP KPI CARDS (Summary ya Muuzaji) */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Mauzo Yangu Leo */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-amber-400/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MAUZO YANGU LEO</span>
            <span className="p-1 rounded-lg bg-amber-500/15 text-[#F6BA35]">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-[#F6BA35] font-mono">
            TZS {mySalesTodayAmount.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Miamala {mySalesToday.length} ya leo
          </p>
        </div>

        {/* KPI 2: Fedha Zilizokusanywa Leo */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>FEDHA ZILIZOLIPWA</span>
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            TZS {myCashCollectedToday.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Taslimu na mitandao ya leo
          </p>
        </div>

        {/* KPI 3: Madeni Yangu ya Wateja */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-rose-500/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MADENI YANGU SOKONI</span>
            <span className="p-1 rounded-lg bg-rose-500/15 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-rose-400 font-mono">
            TZS {myTotalPendingDebts.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Wateja {myDebts.length} wenye madeni
          </p>
        </div>

        {/* KPI 4: Maboksi Yaliyouzwa Leo */}
        <div className="glass-panel-zamboo rounded-2xl p-4 border border-cyan-400/30 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-stone-400 mb-1.5">
            <span>MABOKSI LEO</span>
            <span className="p-1 rounded-lg bg-cyan-500/15 text-cyan-300">
              <Boxes className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-cyan-300 font-mono">
            {myBoxesSoldToday} <span className="text-xs font-sans text-stone-300">Box</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Vybu Gin iliyouzwa leo
          </p>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* 4 MODERN ACTION BUTTON CARDS (CLICK TO OPEN): */}
      {/* 1. UZA BIDHAA | 2. WEKA ODA KWA STOCK MANAGER | 3. MADENI YANGU | 4. RIPOTI YA MAUZO */}
      {/* ======================================================================= */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: UZA BIDHAA (POS & RISITI) */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'uza_bidhaa' ? null : 'uza_bidhaa')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'uza_bidhaa'
                ? 'bg-gradient-to-br from-amber-500/20 via-[#F6BA35]/10 to-black/80 border-[#F6BA35] shadow-[0_0_25px_rgba(246,186,53,0.25)] ring-1 ring-[#F6BA35]/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-amber-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'uza_bidhaa'
                  ? 'bg-[#F6BA35] text-stone-950 shadow-md'
                  : 'bg-amber-500/15 text-[#F6BA35] border border-amber-400/30'
              }`}>
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  1. UZA BIDHAA (POS)
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Tengeneza & Chapisha Risiti
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Vybu: <strong className="text-[#F6BA35]">39,000/=</strong>
              </span>
              {activeSection === 'uza_bidhaa' ? (
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

          {/* Card 2: WEKA ODA KWA STOCK MANAGER */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'weka_oda' ? null : 'weka_oda')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'weka_oda'
                ? 'bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-black/80 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-cyan-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'weka_oda'
                  ? 'bg-cyan-400 text-stone-950 shadow-md'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
              }`}>
                <PackagePlus className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  2. ODA KWA STOCK MGR
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Agiza Mzigo Kutoka Stoo
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Oda Zangu: <strong className="text-cyan-300 font-mono">{myStockOrders.length}</strong>
              </span>
              {activeSection === 'weka_oda' ? (
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

          {/* Card 3: MADENI YANGU YA SOKONI */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'madeni_yangu' ? null : 'madeni_yangu')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'madeni_yangu'
                ? 'bg-gradient-to-br from-rose-500/20 via-rose-400/10 to-black/80 border-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.25)] ring-1 ring-rose-400/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-rose-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'madeni_yangu'
                  ? 'bg-rose-400 text-stone-950 shadow-md'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-400/30'
              }`}>
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  3. MADENI YANGU
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Wateja Wenye Madeni & Lipa
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Wanaodaiwa: <strong className="text-rose-400 font-mono">{myDebts.length}</strong>
              </span>
              {activeSection === 'madeni_yangu' ? (
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

          {/* Card 4: RIPOTI YA MAUZO YANGU & PAKUA EXCEL */}
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
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  4. RIPOTI YA MAUZO
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Pakua Excel & Orodha ya Risiti
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Mauzo Yote: <strong className="text-emerald-400 font-mono">{mySales.length}</strong>
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

          {/* Card 5: MAIN STOCK (Tazama vyote vilivyopo stoo kuu na sokoni) */}
          <button
            type="button"
            onClick={() => setActiveSection(prev => prev === 'main_stock' ? null : 'main_stock')}
            className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[110px] ${
              activeSection === 'main_stock'
                ? 'bg-gradient-to-br from-amber-500/20 via-[#F6BA35]/10 to-black/80 border-[#F6BA35] shadow-[0_0_25px_rgba(246,186,53,0.25)] ring-1 ring-[#F6BA35]/50'
                : 'glass-panel-zamboo text-stone-200 border-stone-800 hover:border-amber-400/50 hover:bg-stone-900/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-2xl transition-all ${
                activeSection === 'main_stock'
                  ? 'bg-[#F6BA35] text-stone-950 shadow-md'
                  : 'bg-amber-500/15 text-[#F6BA35] border border-amber-400/30'
              }`}>
                <Boxes className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span className="font-black text-sm block text-white font-display">
                  5. MAIN STOCK (STOO)
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Tazama Stock Iliyopo Sokoni & Stoo
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400">
                Aina za Bidhaa: <strong className="text-[#F6BA35] font-mono">{products.length}</strong>
              </span>
              {activeSection === 'main_stock' ? (
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

        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. SEHEMU YA KUUZA BIDHAA (POS & CONFIRM RECEIPT) */}
      {/* ======================================================================= */}
      {activeSection === 'uza_bidhaa' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#F6BA35]" />
                Fomu ya Kuuza Bidhaa (New Sale)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Ingiza tarehe, jina la mteja, namba ya simu, TIN number, chagua bidhaa (Vybu Gin 39,000/= au Bee Product), njia ya malipo, na thibitisha kutengeneza risiti.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="Funga Fomu ya Kuuza"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleConfirmSale} className="space-y-6">
            
            {/* Top row: Customer & Date details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* 1. Tarehe */}
              <DatePickerCalendar
                value={tarehe}
                onChange={setTarehe}
                label="Tarehe ya Mauzo:"
                required
              />

              {/* 2. Jina la Mteja */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Jina la Mteja:
                </label>
                <input
                  type="text"
                  value={mtejaName}
                  onChange={(e) => setMtejaName(e.target.value)}
                  placeholder="Mfano: Baraka Bar & Lounge / Juma Said"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#F6BA35]"
                  required
                />
              </div>

              {/* 3. Namba ya Simu */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F6BA35]" />
                  Namba ya Simu ya Mteja:
                </label>
                <input
                  type="tel"
                  value={mtejaPhone}
                  onChange={(e) => setMtejaPhone(e.target.value)}
                  placeholder="Mfano: 0754 123 456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono focus:outline-none focus:border-[#F6BA35]"
                />
              </div>

              {/* 4. TIN Number ya Mteja */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F6BA35]" />
                  TIN Number ya Mteja:
                </label>
                <input
                  type="text"
                  value={mtejaTin}
                  onChange={(e) => setMtejaTin(e.target.value)}
                  placeholder="Mfano: 142-998-311 (hiari)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono focus:outline-none focus:border-[#F6BA35]"
                />
              </div>

            </div>

            {/* Middle row: Product Selection & Pricing */}
            <div className="p-4 rounded-3xl bg-black/40 border border-amber-400/30 space-y-4">
              
              <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
                <span>Chagua Aina ya Bidhaa:</span>
                <span className="text-[11px] text-stone-400">Vybu Gin (Box = TZS 39,000) au Mazao ya Nyuki</span>
              </div>

              {/* Category Radio buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <button
                  type="button"
                  onClick={() => setSaleCategory('vybu_gin')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    saleCategory === 'vybu_gin'
                      ? 'bg-amber-500/20 border-[#F6BA35] ring-1 ring-[#F6BA35]/50 text-white'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-amber-400/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-[#F6BA35]">
                      <Boxes className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-black block text-sm text-white">VYBU GIN (200mls)</span>
                      <span className="text-[11px] text-stone-400">Box (200mls x 24 Chupa)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#F6BA35] font-mono block">TZS 39,000</span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Kwa Box</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSaleCategory('bee_product');
                    if (!selectedBeeProductId && beeProducts.length > 0) {
                      setSelectedBeeProductId(beeProducts[0].id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    saleCategory === 'bee_product'
                      ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400/50 text-white'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-cyan-400/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-black block text-sm text-white">MAZAO YA NYUKI (BEE PRODUCTS)</span>
                      <span className="text-[11px] text-stone-400">Asali, Dawa za macho, n.k.</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-300 block">Chagua Hapa ➔</span>
                    <span className="text-[10px] text-stone-400">Bei mbalimbali</span>
                  </div>
                </button>

              </div>

              {/* If Bee Product selected, show dropdown */}
              {saleCategory === 'bee_product' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Chagua Aina ya Mazao ya Nyuki (Bee Product):
                  </label>
                  <select
                    value={selectedBeeProductId}
                    onChange={(e) => setSelectedBeeProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    {beeProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.packaging} (TZS {p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity and live calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Ingiza Idadi ({saleCategory === 'vybu_gin' ? 'Maboksi' : 'Vipimo'}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Weka idadi..."
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setQuantity('');
                      } else {
                        const num = parseInt(val, 10);
                        setQuantity(isNaN(num) ? '' : Math.max(1, num));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono font-bold text-base focus:outline-none focus:border-[#F6BA35] placeholder:text-stone-600 placeholder:font-normal placeholder:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Bei kwa Kipimo:
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-mono font-bold text-sm">
                    TZS {unitPrice.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Jumla Kuu ya Mauzo (Total):
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-[#F6BA35]/40 text-[#F6BA35] font-mono font-black text-lg flex flex-col justify-center min-h-[48px]">
                    <span>TZS {totalCalculatedSalePrice.toLocaleString()}</span>
                    {hasOtherCost && numericOtherCost > 0 && (
                      <span className="text-[10px] text-stone-400 font-normal">
                        (Bidhaa: {baseProductPrice.toLocaleString()} + Usafiri: {numericOtherCost.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* ======================================================================= */}
              {/* KAKIPENGELE CHA OTHER COST (USAFIRI / GHARAMA NYINGINE) */}
              {/* ======================================================================= */}
              <div className="pt-3 border-t border-stone-800/90 space-y-3">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !hasOtherCost;
                      setHasOtherCost(nextState);
                      if (nextState && (otherCostAmount === '' || otherCostAmount === 0)) {
                        setOtherCostAmount(5000);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto ${
                      hasOtherCost
                        ? 'bg-[#F6BA35] text-stone-950 border-amber-300 shadow-lg shadow-amber-500/20 font-black'
                        : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-amber-400/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                        hasOtherCost ? 'bg-stone-950 border-stone-950 text-[#F6BA35]' : 'border-stone-500 bg-stone-950'
                      }`}>
                        {hasOtherCost && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs uppercase tracking-wider">Other Cost (Gharama za Usafiri / Ziada)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      hasOtherCost ? 'bg-stone-950 text-[#F6BA35]' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {hasOtherCost ? 'Imewashwa (+TZS)' : 'Bofya Kuongeza'}
                    </span>
                  </button>

                  {hasOtherCost && (
                    <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                      <span>✓ Itaandikwa namba 2: <strong>Usafiri</strong> kwenye invoice</span>
                    </span>
                  )}
                </div>

                {hasOtherCost && (
                  <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-400/40 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div>
                      <label className="block text-[11px] font-bold text-[#F6BA35] mb-1 flex items-center justify-between">
                        <span>Kiasi cha Other Cost / Usafiri (TZS):</span>
                        <span className="text-[10px] text-stone-400 font-normal">Gharama zilizoongezwa</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Mfano: 5000"
                        value={otherCostAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOtherCostAmount(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-400/30 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#F6BA35]"
                        required={hasOtherCost}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#F6BA35] mb-1 flex items-center justify-between">
                        <span>Maelezo ya Other Cost (Namba 2 kwenye Invoice):</span>
                        <span className="text-[10px] text-stone-400 font-normal">Hiari / Badilisha</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Mfano: Usafiri wa Mzigo"
                        value={otherCostDescription}
                        onChange={(e) => setOtherCostDescription(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-400/30 text-white text-xs focus:outline-none focus:border-[#F6BA35]"
                      />
                    </div>

                    {/* Quick suggestions */}
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400 font-bold mr-1">Machaguo ya Haraka:</span>
                      {['Usafiri wa Mzigo', 'Usafiri wa Bodaboda/Bajaji', 'Usafirishaji wa Mikoani', 'Gharama ya Ufungashaji'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setOtherCostDescription(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            otherCostDescription === tag
                              ? 'bg-[#F6BA35] text-stone-950 font-black shadow-sm'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Bottom row: Payment Method & Credit handling */}
            <div className="p-4 rounded-3xl bg-black/40 border border-amber-400/30 space-y-4">
              
              <div className="text-xs font-bold text-stone-300">
                Njia ya Malipo (Chagua moja):
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                
                {/* M-Pesa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('M-Pesa')}
                  className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'M-Pesa'
                      ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md font-black'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>M-Pesa</span>
                </button>

                {/* Mix by Yas */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Mix by Yas')}
                  className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Mix by Yas'
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md font-black'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-amber-400/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F6BA35]" />
                  <span>Mix by Yas</span>
                </button>

                {/* Benki */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Benki')}
                  className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Benki'
                      ? 'bg-cyan-500 text-stone-950 border-cyan-400 shadow-md font-black'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-cyan-400/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Benki (Bank)</span>
                </button>

                {/* Mkopo */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Mkopo')}
                  className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Mkopo'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md font-black'
                      : 'bg-stone-950 border-stone-800 text-rose-300 hover:border-rose-400/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Mkopo (Credit)</span>
                </button>

              </div>

              {/* If Credit is selected */}
              {isCreditSale && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Kiasi Alicholipa Mteja Sasa (Deposit / Kianzio TZS):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={totalCalculatedSalePrice}
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Mfano: 20000 (au 0 kama hajalipa chochote)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-[#F6BA35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Baki ya Deni Linalobaki:
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-black text-sm">
                      TZS {balanceDue.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Indicator of Payment Status (KIJANI vs NYEKUNDU) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">Hali ya Malipo:</span>
                  {isFullyPaid ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      IMELIPWA KIKAMILIFU (KIJANI)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,113,133,0.3)] animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      DENI LIPO / HAJAMALIZA: TZS {balanceDue.toLocaleString()} (NYEKUNDU)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-[#F6BA35] hover:brightness-110 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer transition-all self-end sm:self-auto"
                >
                  <Receipt className="w-4 h-4 stroke-[2.5]" />
                  <span>Thibitisha Mauzo & Tengeneza Risiti</span>
                </button>
              </div>

            </div>

          </form>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. WEKA ODA KWA STOCK MANAGER */}
      {/* ======================================================================= */}
      {activeSection === 'weka_oda' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-cyan-400/35 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-cyan-400" />
                Weka Oda Mpya ya Mzigo kwa Stock Manager
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Chagua aina ya bidhaa (Vybu Gin au Bee Product), weka idadi, na thibitisha. Oda itaenda moja kwa moja kwa Stock Manager kwa uthibitisho.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="Funga Fomu ya Oda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSendStockOrder} className="max-w-2xl space-y-4">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 block">
                1. Chagua Kitengo cha Bidhaa Unayotaka Kuagiza:
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setOrderProductType('vybu_gin')}
                  className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                    orderProductType === 'vybu_gin'
                      ? 'bg-amber-500/20 border-[#F6BA35] text-[#F6BA35] ring-1 ring-[#F6BA35]'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  Vybu Gin (Box 200mls x 24)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderProductType('bee_product');
                    if (!orderBeeProductId && beeProducts.length > 0) {
                      setOrderBeeProductId(beeProducts[0].id);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                    orderProductType === 'bee_product'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  Mazao ya Nyuki (Bee Product)
                </button>
              </div>
            </div>

            {orderProductType === 'bee_product' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  Chagua Aina ya Bee Product:
                </label>
                <select
                  value={orderBeeProductId}
                  onChange={(e) => setOrderBeeProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  {beeProducts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.packaging})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">
                2. Idadi ya Maboksi / Vipimo Unavyoomba:
              </label>
              <input
                type="number"
                min="1"
                placeholder="Weka idadi ya kuagiza..."
                value={orderQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setOrderQuantity(val === '' ? '' : Math.max(1, Number(val)));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-cyan-300 font-mono font-bold text-base focus:outline-none focus:border-cyan-400 placeholder:text-stone-600 placeholder:font-normal placeholder:text-sm"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Thibitisha & Tuma Oda kwa Stock Manager</span>
              </button>
            </div>

          </form>

          {/* Orodha ya Oda Zangu */}
          <div className="pt-4 border-t border-stone-800 space-y-3">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Orodha ya Oda Zangu Nilizowahi Kuomba:
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="px-4 py-3">Oda Nambari</th>
                    <th className="px-4 py-3">Tarehe</th>
                    <th className="px-4 py-3">Bidhaa Iliyoombwa</th>
                    <th className="px-4 py-3 text-center">Idadi</th>
                    <th className="px-4 py-3 text-center">Hali ya Oda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                  {myStockOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-stone-500">
                        Hujawahi kutuma oda yoyote ya mzigo kwa Stock Manager.
                      </td>
                    </tr>
                  ) : (
                    myStockOrders.map(ord => {
                      const isPending = ord.status === 'PENDING';

                      return (
                        <tr key={ord.id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">
                            {ord.orderNumber}
                          </td>
                          <td className="px-4 py-3 font-mono text-stone-300">
                            {ord.tarehe}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            {ord.productName || 'Vybu Gin (Box 200mls x 24)'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-cyan-300">
                            {ord.maboksiRequested} Box
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPending ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F6BA35] border border-amber-500/30 text-[10px] font-bold">
                                Inasubiri Uthibitisho (Pending)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                Imetolewa Sokoni (Dispatched)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. MAIN STOCK (TAZAMA STOCK ILIPO SOKONI NA STOO KUU) */}
      {/* ======================================================================= */}
      {activeSection === 'main_stock' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-amber-400/35 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#F6BA35]" />
                Main Stock: Orodha ya Bidhaa na Salio Zake Sokoni & Stoo Kuu
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Orodha ya Vybu Gin na Mazao ya Nyuki yote pamoja na idadi zilizopo kwenye Stoo Kuu na Sokoni.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="Funga Main Stock"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-black/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="p-3">Kitengo</th>
                  <th className="p-3">Jina la Bidhaa</th>
                  <th className="p-3">Ufungashaji (Packaging)</th>
                  <th className="p-3">Bei (TZS)</th>
                  <th className="p-3 text-center">Salio Stoo Kuu</th>
                  <th className="p-3 text-center">Salio Sokoni</th>
                  <th className="p-3 text-right">Thamani Stoo Kuu (TZS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 bg-black/20">
                {products.map(p => {
                  const stock = productStocks[p.id] || { warehouse: 0, market: 0 };
                  const whVal = stock.warehouse * p.price;

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
                      <td className="p-3 font-mono font-medium text-stone-300">
                        TZS {p.price.toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300">
                        {stock.warehouse}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">
                        {stock.market}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-stone-200">
                        TZS {whVal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}
      {activeSection === 'madeni_yangu' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-rose-400/35 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-400" />
                Madeni Yangu ya Wateja Sokoni (Customer Debts)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Unaona wateja wako tu uliowauzia kwa mkopo. Mteja anapohitaji kulipa, bofya "Lipa Deni" kuingiza fedha na kukata deni.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto no-print">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={debtSearchQuery}
                  onChange={(e) => setDebtSearchQuery(e.target.value)}
                  placeholder="Tafuta mteja, simu au invoice..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Chapisha Orodha ya Madeni"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span>Chapisha</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                title="Funga Madeni Yangu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Jina la Mteja</th>
                  <th className="px-4 py-3">Simu</th>
                  <th className="px-4 py-3">TIN ya Mteja</th>
                  <th className="px-4 py-3">Bidhaa Aliyochukua</th>
                  <th className="px-4 py-3">Jumla ya Mauzo</th>
                  <th className="px-4 py-3">Alicholipa</th>
                  <th className="px-4 py-3">Baki ya Deni</th>
                  <th className="px-4 py-3 text-center no-print">Hatua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                {myDebts
                  .filter(d => 
                    d.mtejaName.toLowerCase().includes(debtSearchQuery.toLowerCase()) ||
                    d.mtejaPhone.includes(debtSearchQuery) ||
                    d.risitiNumber.toLowerCase().includes(debtSearchQuery.toLowerCase())
                  )
                  .map(debt => (
                    <tr key={debt.id} className="hover:bg-rose-500/5 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">
                        {debt.risitiNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-300">
                        {debt.tarehe}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {debt.mtejaName}
                      </td>
                      <td className="px-4 py-3 text-stone-300 font-mono">
                        {debt.mtejaPhone || 'Hana Simu'}
                      </td>
                      <td className="px-4 py-3 text-stone-400 font-mono text-[11px]">
                        {debt.mtejaTin || '-'}
                      </td>
                      <td className="px-4 py-3 text-stone-300">
                        {debt.items.map(it => `${it.productName} (${it.quantity})`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-200">
                        TZS {debt.totalKiasi.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                        TZS {debt.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-extrabold text-rose-400 text-sm">
                        TZS {debt.balanceDue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => {
                            setRepaySale(debt);
                            setRepayAmount(debt.balanceDue);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1 mx-auto cursor-pointer shadow-md transition-all"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Lipa Deni</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                {myDebts.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-stone-500">
                      Hongera! Huna mteja yeyote mwenye deni sokoni kwa sasa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. RIPOTI YA MAUZO YANGU & PAKUA EXCEL */}
      {/* ======================================================================= */}
      {activeSection === 'ripoti_mauzo' && (
        <div className="glass-panel-zamboo rounded-3xl p-6 border border-emerald-400/35 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Ripoti ya Mauzo Yangu & Pakua Excel
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Tazama rekodi zote za mauzo uliyoyafanya na pakua faili rasmi la Excel (.csv) au chapisha (print) kwa ajili ya kumbukumbu zako.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto no-print">
              {/* PRINT BUTTON */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Printer className="w-4 h-4 text-[#F6BA35]" />
                <span>Chapisha Ripoti</span>
              </button>

              {/* DOWNLOAD EXCEL BUTTON */}
              <button
                type="button"
                onClick={downloadSalesExcel}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Pakua Excel</span>
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

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 no-print">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={salesSearchQuery}
                onChange={(e) => setSalesSearchQuery(e.target.value)}
                placeholder="Tafuta mteja, simu, bidhaa au invoice..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <span className="text-xs text-stone-400 font-mono">
              Jumla ya Mauzo Yako: <strong>{mySales.length}</strong>
            </span>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Mteja & Simu</th>
                  <th className="px-4 py-3">TIN ya Mteja</th>
                  <th className="px-4 py-3">Bidhaa & Idadi</th>
                  <th className="px-4 py-3">Njia ya Malipo</th>
                  <th className="px-4 py-3">Jumla (TZS)</th>
                  <th className="px-4 py-3">Imelipwa (TZS)</th>
                  <th className="px-4 py-3">Deni (TZS)</th>
                  <th className="px-4 py-3 text-center">Hali</th>
                  <th className="px-4 py-3 text-center no-print">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium bg-black/20">
                {mySales
                  .filter(s => 
                    s.mtejaName.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
                    s.risitiNumber.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
                    (s.mtejaPhone && s.mtejaPhone.includes(salesSearchQuery)) ||
                    s.items.some(i => i.productName.toLowerCase().includes(salesSearchQuery.toLowerCase()))
                  )
                  .map(sale => {
                    const isPaid = sale.hali === 'IMELIPWA';

                    return (
                      <tr key={sale.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#F6BA35]">
                          {sale.risitiNumber}
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-300">
                          {sale.tarehe}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-white block">{sale.mtejaName}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{sale.mtejaPhone}</span>
                        </td>
                        <td className="px-4 py-3 text-stone-400 font-mono text-[11px]">
                          {sale.mtejaTin || '-'}
                        </td>
                        <td className="px-4 py-3 text-stone-300">
                          {sale.items.map(it => (
                            <div key={it.productId}>
                              {it.productName} ({it.quantity})
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 text-[10px] font-bold">
                            {sale.paymentMethod || (sale.isCredit ? 'Mkopo' : 'Taslimu')}
                          </span>
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
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isPaid ? 'Imelipwa' : 'Inadaiwa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveReceiptSale(sale)}
                              className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#F6BA35] border border-amber-400/30 text-xs font-bold cursor-pointer"
                              title="Tazama Risiti"
                            >
                              Tazama
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadReceiptPDF(sale)}
                              className="p-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-[#F6BA35] border border-stone-700 text-xs cursor-pointer"
                              title="Pakua PDF ya Risiti"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {mySales.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-stone-500">
                      Bado hujafanya mauzo yoyote. Bofya "Uza Bidhaa" hapo juu kuanza kuuza!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: LIPA DENI LA MTEJA */}
      {/* ======================================================================= */}
      {repaySale && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="w-full max-w-md bg-stone-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-stone-100 relative space-y-4">
            <button
              type="button"
              onClick={() => setRepaySale(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-stone-800 space-y-1">
              <span className="text-xs uppercase tracking-widest text-rose-400 font-bold">KULIPA DENI LA MTEJA</span>
              <h3 className="text-lg font-black text-white font-display">
                {repaySale.mtejaName}
              </h3>
              <p className="text-xs text-stone-400">Risiti #: {repaySale.risitiNumber} · Simu: {repaySale.mtejaPhone}</p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Jumla ya Mauzo Awali:</span>
                <span className="text-white font-mono font-bold">TZS {repaySale.totalKiasi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Kiasi Kilicholipwa Awali:</span>
                <span className="text-emerald-400 font-mono font-bold">TZS {repaySale.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-800">
                <span className="text-stone-300 font-bold">Baki ya Deni analodaiwa:</span>
                <span className="text-rose-400 font-mono font-black text-base">TZS {repaySale.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmDebtPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  Kiasi Anacholipa Sasa (TZS):
                </label>
                <input
                  type="number"
                  min="100"
                  max={repaySale.balanceDue}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Mfano: 39000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  Njia ya Malipo:
                </label>
                <select
                  value={repayMethod}
                  onChange={(e) => setRepayMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-rose-400"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Mix by Yas">Mix by Yas</option>
                  <option value="Benki">Benki (Bank Transfer)</option>
                  <option value="Taslimu">Taslimu (Cash)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Thibitisha Malipo ya Deni</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRepaySale(null)}
                  className="px-4 py-3 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: RISITI RASMI YA MAUZO (DOWNLOAD AU PRINT) */}
      {/* ======================================================================= */}
      {activeReceiptSale && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 printable-modal-overlay">
          <div className="w-full max-w-md bg-stone-900 border border-[#F6BA35]/50 rounded-3xl p-6 shadow-2xl text-stone-100 relative max-h-[90vh] overflow-y-auto printable-receipt-card">
            <button
              type="button"
              onClick={() => setActiveReceiptSale(null)}
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
              <p className="text-xs text-[#F6BA35] font-mono font-bold">
                Invoice Number: {activeReceiptSale.risitiNumber}
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Tarehe ya Mauzo:</span>
                <span className="text-white font-mono font-bold">{activeReceiptSale.tarehe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Muuzaji:</span>
                <span className="text-white font-bold">{activeReceiptSale.muuzajiName}</span>
              </div>
              
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-bold text-[#F6BA35]">Taarifa za Mteja:</span>
                <div className="flex justify-between text-stone-200">
                  <span>Jina:</span>
                  <span className="font-bold text-white">{activeReceiptSale.mtejaName}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Simu:</span>
                  <span className="font-mono">{activeReceiptSale.mtejaPhone || 'Hana'}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>TIN Number:</span>
                  <span className="font-mono text-stone-300">{activeReceiptSale.mtejaTin || 'Hana TIN'}</span>
                </div>
              </div>

              {/* Items Breakdown (Item 1: Bidhaa, Item 2: Usafiri / Other Cost) */}
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                <span className="text-stone-400 block text-[10px] uppercase font-bold text-[#F6BA35]">Maelezo ya Bidhaa & Gharama:</span>
                {activeReceiptSale.items.map((it, idx) => {
                  const isOtherCost = it.productId === 'prod-other-cost' || it.productName.toLowerCase().includes('usafiri') || idx === 1;
                  return (
                    <div key={idx} className="flex justify-between items-center text-stone-200 receipt-item-row border-b border-stone-900/80 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-md bg-amber-500/20 text-[#F6BA35] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {isOtherCost && !it.productName.toLowerCase().includes('usafiri') ? `Usafiri (${it.productName})` : it.productName}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {isOtherCost ? '1 Kipimo/Huduma' : `${it.quantity} ${it.category === 'vybu_gin' ? 'Box' : 'Kipimo'}`} × TZS {it.unitPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-white text-xs whitespace-nowrap">
                        TZS {it.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Njia ya Malipo:</span>
                <span className="text-[#F6BA35] font-bold">
                  {activeReceiptSale.paymentMethod || (activeReceiptSale.isCredit ? 'Mkopo' : 'Taslimu')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-stone-800 receipt-total-row">
                <span className="text-stone-300 font-bold">Jumla Kuu (Total):</span>
                <span className="text-white font-mono font-black text-base">
                  TZS {activeReceiptSale.totalKiasi.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Kiasi Kilicholipwa:</span>
                <span className="font-mono text-base">
                  TZS {activeReceiptSale.amountPaid.toLocaleString()}
                </span>
              </div>

              {activeReceiptSale.balanceDue > 0 && (
                <div className="flex justify-between items-center text-rose-400 font-bold">
                  <span>Baki ya Deni (Credit):</span>
                  <span className="font-mono text-base">
                    TZS {activeReceiptSale.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="pt-2 flex justify-center">
                {activeReceiptSale.balanceDue === 0 ? (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black receipt-badge">
                    IMELIPWA KIKAMILIFU
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black receipt-badge">
                    INADAIWA / DENI LIPO: TZS {activeReceiptSale.balanceDue.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Official Receipt Footer for Print */}
              <div className="pt-3 border-t border-stone-800 text-[10px] text-stone-400 text-center space-y-0.5 print-only">
                <p>Asante kwa kufanya biashara na {systemInfo.officeName}</p>
                <p>Bidhaa zilizouzwa hazirudishwi baada ya siku 3.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row gap-2 no-print print:hidden">
              {/* PRINT BUTTON */}
              <button
                type="button"
                onClick={() => triggerPrintDialog()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#F6BA35] hover:brightness-110 active:scale-[0.98] text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all border border-amber-300"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Chapisha (Print)</span>
              </button>

              {/* DOWNLOAD PDF BUTTON */}
              <button
                type="button"
                onClick={() => handleDownloadReceiptPDF(activeReceiptSale)}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-600 hover:border-amber-400/50 shadow-md cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-[#F6BA35]" />
                <span>Pakua PDF (Document)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReceiptSale(null)}
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
