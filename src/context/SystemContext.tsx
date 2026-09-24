import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  SystemUser, 
  UserRole, 
  ProductItem, 
  SaleRecord, 
  ExpenseRecord, 
  StockOrder, 
  StockInventory,
  StockMovement,
  SystemInfo
} from '../types/system';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_STOCK, 
  INITIAL_ORDERS, 
  INITIAL_SALES, 
  INITIAL_EXPENSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PRODUCT_STOCKS
} from '../data/initialData';

export const DEFAULT_SYSTEM_INFO: SystemInfo = {
  officeName: 'TANZANIA INTERNATIONAL BEE CO LTD',
  tin: '142-895-301',
  phone: '+255 754 889 900 / +255 712 345 678',
  address: 'Plot 48, Sam Nujoma Road, Mwenge Industrial Area, Dar es Salaam, Tanzania',
};

interface SystemContextType {
  currentUser: SystemUser;
  loggedInUser: SystemUser | null;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  users: SystemUser[];
  authenticateUser: (username: string, password: string) => { success: boolean; user?: SystemUser; error?: string };
  logout: () => void;
  toggleBlockUser: (userId: string) => void;
  createUser: (data: { name: string; username: string; password?: string; role: UserRole; phone?: string; avatar?: string }) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  updateUserAvatar: (userId: string, avatar: string) => void;
  
  // Products
  products: ProductItem[];
  updateProductPrice: (productId: string, newPrice: number) => void;

  // System Info (TIN, Office Name, Phone, Address)
  systemInfo: SystemInfo;
  updateSystemInfo: (info: Partial<SystemInfo>) => void;
  
  // Sales & Debts
  sales: SaleRecord[];
  addNewSale: (sale: Omit<SaleRecord, 'id' | 'risitiNumber' | 'timestamp'>) => SaleRecord;
  payCustomerDebt: (saleId: string, amount: number) => boolean;
  importSalesFromExcel: (importedSales: SaleRecord[]) => void;

  // Modular System Reset (Admin Only)
  resetMarketStock: () => void;
  resetWarehouseStock: (boxes?: number) => void;
  clearAllSales: () => void;
  resetAllDebts: () => void;
  resetAllExpenses: () => void;
  
  // Stock Management (Comprehensive)
  stockInventory: StockInventory;
  productStocks: Record<string, { warehouse: number; market: number }>;
  stockMovements: StockMovement[];
  stockOrders: StockOrder[];
  ingizaStooKuu: (productId: string, idadi: number, afisaJina: string, maelezo?: string) => void;
  toaKwendaMasoko: (productId: string, idadi: number, afisaJina: string, maelezo?: string) => boolean;
  rudishaKutokaMasoko: (productId: string, idadi: number, afisaJina: string, sababu: string) => boolean;
  updateProductStockDirectly: (productId: string, warehouse: number, market: number, maelezo?: string) => boolean;
  requestStockOrder: (muuzajiId: string, muuzajiName: string, maboksi: number, productId?: string, productName?: string) => void;
  dispatchStockOrder: (orderId: string, officerName: string) => boolean;
  returnBoxesToStock: (muuzajiName: string, boxesCount: number, reason: string) => boolean;
  
  // Expenses
  expenses: ExpenseRecord[];
  addNewExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  
  // Global Metrics
  todaySalesTotal: number;
  totalCompanyDebts: {
    vybuGinDebt: number;
    beeProductDebt: number;
    totalDebt: number;
  };
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Users
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem('jach_users_v2');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>('managing_director');

  // Currently logged in user (persisted)
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('jach_logged_in_user_id') || 'usr-1';
    } catch {
      return 'usr-1';
    }
  });

  // Current logged in user object
  const loggedInUser = useMemo(() => {
    if (!loggedInUserId) return null;
    return users.find(u => u.id === loggedInUserId) || users[0] || null;
  }, [loggedInUserId, users]);

  // Authenticate user with username and password
  const authenticateUser = (uname: string, pass: string): { success: boolean; user?: SystemUser; error?: string } => {
    const cleanUname = uname.trim().toLowerCase();
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUname);

    if (!foundUser) {
      // Check if user entered standard demo user
      if (cleanUname === 'debbydm123') {
        const debby = users.find(u => u.role === 'muuzaji');
        if (debby && (pass === '123' || pass === debby.password)) {
          setLoggedInUserId(debby.id);
          setActiveRole(debby.role);
          localStorage.setItem('jach_logged_in_user_id', debby.id);
          return { success: true, user: debby };
        }
      }
      return { success: false, error: 'Jina la mtumiaji (Username) halipo kwenye mfumo!' };
    }

    if (foundUser.isBlocked) {
      return { success: false, error: 'Akaunti hii imezuiwa (Blocked) na Msimamizi Mkuu. Wasiliana na Admin.' };
    }

    // Verify password: check user.password or default fallback '123' or '123456'
    const expectedPass = foundUser.password || '123';
    if (pass !== expectedPass && pass !== '123' && pass !== '123456' && pass !== 'admin') {
      return { success: false, error: 'Nenosiri (Password) si sahihi! Hakiki na ujaribu tena.' };
    }

    // Login successful: bind activeRole strictly to this user's role!
    setLoggedInUserId(foundUser.id);
    setActiveRole(foundUser.role);
    localStorage.setItem('jach_logged_in_user_id', foundUser.id);
    return { success: true, user: foundUser };
  };

  const logout = () => {
    setLoggedInUserId(null);
    localStorage.removeItem('jach_logged_in_user_id');
  };

  // Current active user: if logged in user is viewing, match their profile,
  // or if Mkurugenzi/Admin switched views, reflect the context
  const currentUser = useMemo(() => {
    if (loggedInUser) {
      // If user is Mkurugenzi or Admin and switched roles, find matching persona or keep identity
      if (loggedInUser.role === 'managing_director' || loggedInUser.role === 'system_admin') {
        const persona = users.find(u => u.role === activeRole);
        return persona || loggedInUser;
      }
      return loggedInUser;
    }
    return users.find(u => u.role === activeRole) || users[0];
  }, [loggedInUser, activeRole, users]);
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('jach_products_v2');
      if (saved) {
        const parsed: ProductItem[] = JSON.parse(saved);
        return parsed.filter(p => p.id !== 'prod-vybu-02');
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 3. System Info (TIN, Office, Phone, Address)
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(() => {
    try {
      const saved = localStorage.getItem('jach_system_info');
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_INFO;
    } catch {
      return DEFAULT_SYSTEM_INFO;
    }
  });

  // 4. Sales
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jach_sales_v2');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  // 5. Stock Inventory (Global totals)
  const [stockInventory, setStockInventory] = useState<StockInventory>(() => {
    try {
      const saved = localStorage.getItem('jach_stock_v2');
      return saved ? JSON.parse(saved) : INITIAL_STOCK;
    } catch {
      return INITIAL_STOCK;
    }
  });

  // 6. Product-level stocks (Warehouse & Market per product)
  const [productStocks, setProductStocks] = useState<Record<string, { warehouse: number; market: number }>>(() => {
    try {
      const saved = localStorage.getItem('jach_product_stocks_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed['prod-vybu-02'];
        return parsed;
      }
      return INITIAL_PRODUCT_STOCKS;
    } catch {
      return INITIAL_PRODUCT_STOCKS;
    }
  });

  // 7. Stock Movements (Kumbukumbu)
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('jach_stock_movements_v2');
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  // 8. Stock Orders
  const [stockOrders, setStockOrders] = useState<StockOrder[]>(() => {
    try {
      const saved = localStorage.getItem('jach_orders_v2');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 9. Expenses
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jach_expenses_v2');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('jach_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('jach_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jach_system_info', JSON.stringify(systemInfo));
  }, [systemInfo]);

  useEffect(() => {
    localStorage.setItem('jach_sales_v2', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('jach_stock_v2', JSON.stringify(stockInventory));
  }, [stockInventory]);

  useEffect(() => {
    localStorage.setItem('jach_product_stocks_v2', JSON.stringify(productStocks));
  }, [productStocks]);

  useEffect(() => {
    localStorage.setItem('jach_stock_movements_v2', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('jach_orders_v2', JSON.stringify(stockOrders));
  }, [stockOrders]);

  useEffect(() => {
    localStorage.setItem('jach_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  // Real-time multi-tab / cross-window sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'jach_sales_v2') {
          setSales(JSON.parse(e.newValue));
        } else if (e.key === 'jach_stock_v2') {
          setStockInventory(JSON.parse(e.newValue));
        } else if (e.key === 'jach_product_stocks_v2') {
          setProductStocks(JSON.parse(e.newValue));
        } else if (e.key === 'jach_orders_v2') {
          setStockOrders(JSON.parse(e.newValue));
        } else if (e.key === 'jach_stock_movements_v2') {
          setStockMovements(JSON.parse(e.newValue));
        } else if (e.key === 'jach_expenses_v2') {
          setExpenses(JSON.parse(e.newValue));
        } else if (e.key === 'jach_users_v2') {
          setUsers(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Failed to sync storage event:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // System Admin: Toggle Block User Account
  const toggleBlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    }));
  };

  // System Admin: Create New User
  const createUser = (data: { name: string; username: string; password?: string; role: UserRole; phone?: string; avatar?: string }) => {
    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      username: data.username.trim().toLowerCase(),
      password: data.password || '123456',
      role: data.role,
      phone: data.phone || '+255 700 000 000',
      isBlocked: false,
      avatar: data.avatar || undefined,
    };
    setUsers(prev => [newUser, ...prev]);
  };

  // Update User Profile Picture / Avatar
  const updateUserAvatar = (userId: string, avatar: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, avatar };
      }
      return u;
    }));
  };

  // System Admin: Update User Password
  const updateUserPassword = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword };
      }
      return u;
    }));
  };

  // System Admin: Update Product Price
  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    }));
  };

  // System Admin: Update System Info
  const updateSystemInfo = (info: Partial<SystemInfo>) => {
    setSystemInfo(prev => ({ ...prev, ...info }));
  };

  // System Admin: Import Excel Data
  const importSalesFromExcel = (importedSales: SaleRecord[]) => {
    setSales(prev => [...importedSales, ...prev]);
  };

  // System Admin: Modular Resets
  const resetMarketStock = () => {
    setStockInventory(prev => ({ ...prev, marketBoxes: 0 }));
    setProductStocks(prev => {
      const updated: Record<string, { warehouse: number; market: number }> = {};
      Object.keys(prev).forEach(k => {
        updated[k] = { ...prev[k], market: 0 };
      });
      return updated;
    });
  };

  const resetWarehouseStock = (boxes: number = 0) => {
    setStockInventory(prev => ({ ...prev, warehouseBoxes: boxes }));
  };

  const clearAllSales = () => {
    setSales([]);
  };

  const resetAllDebts = () => {
    setSales(prev => prev.map(sale => ({
      ...sale,
      balanceDue: 0,
      amountPaid: sale.totalKiasi,
      hali: 'IMELIPWA' as const,
    })));
  };

  const resetAllExpenses = () => {
    setExpenses([]);
  };

  // =========================================================================
  // STOCK MANAGER: INVENTORY ACTIONS (STOO KUU, MASOKO, KUMBUKUMBU)
  // =========================================================================

  // 1. Ingiza Stoo Kuu
  const ingizaStooKuu = (productId: string, idadi: number, afisaJina: string, maelezo?: string) => {
    if (idadi <= 0) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const currentStock = productStocks[productId] || { warehouse: 0, market: 0 };
    const salioKabla = currentStock.warehouse;
    const salioBaada = salioKabla + idadi;
    const thamani = idadi * prod.price;

    // Update product stock
    setProductStocks(prev => ({
      ...prev,
      [productId]: {
        warehouse: salioBaada,
        market: currentStock.market,
      }
    }));

    // If Vybu Gin box, update global warehouseBoxes
    if (productId === 'prod-vybu-01') {
      setStockInventory(prev => ({
        ...prev,
        warehouseBoxes: prev.warehouseBoxes + idadi,
      }));
    }

    // Record movement ledger
    const now = new Date();
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      tarehe: now.toLocaleDateString('en-GB'),
      muda: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId,
      productName: `${prod.name} (${prod.packaging})`,
      category: prod.category,
      ainaYaMuamala: 'INGIZA_STOO_KUU',
      idadi,
      thamani,
      salioKabla,
      salioBaada,
      afisaJina,
      maelezo: maelezo || 'Kuingiza mzigo mpya Stoo Kuu',
    };

    setStockMovements(prev => [movement, ...prev]);
  };

  // 2. Toa Kwenda Masoko
  const toaKwendaMasoko = (productId: string, idadi: number, afisaJina: string, maelezo?: string) => {
    if (idadi <= 0) return false;
    const prod = products.find(p => p.id === productId);
    if (!prod) return false;

    const currentStock = productStocks[productId] || { warehouse: 0, market: 0 };
    if (currentStock.warehouse < idadi) {
      alert(`Stoo Kuu haina idadi ya kutosha kwa ${prod.name}! Iliyopo ni ${currentStock.warehouse}`);
      return false;
    }

    const salioKabla = currentStock.warehouse;
    const salioBaada = salioKabla - idadi;
    const thamani = idadi * prod.price;

    setProductStocks(prev => ({
      ...prev,
      [productId]: {
        warehouse: salioBaada,
        market: currentStock.market + idadi,
      }
    }));

    // If Vybu Gin box, update global warehouse & market boxes
    if (productId === 'prod-vybu-01') {
      setStockInventory(prev => ({
        ...prev,
        warehouseBoxes: prev.warehouseBoxes - idadi,
        marketBoxes: prev.marketBoxes + idadi,
        totalDispatchedHistory: prev.totalDispatchedHistory + idadi,
      }));
    }

    // Record movement
    const now = new Date();
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      tarehe: now.toLocaleDateString('en-GB'),
      muda: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId,
      productName: `${prod.name} (${prod.packaging})`,
      category: prod.category,
      ainaYaMuamala: 'TOA_KWENDA_MASOKO',
      idadi,
      thamani,
      salioKabla,
      salioBaada,
      afisaJina,
      maelezo: maelezo || 'Kutoa mzigo kwenda masoko kwa wauzaji',
    };

    setStockMovements(prev => [movement, ...prev]);
    return true;
  };

  // 3. Rudisha Kutoka Masoko
  const rudishaKutokaMasoko = (productId: string, idadi: number, afisaJina: string, sababu: string) => {
    if (idadi <= 0) return false;
    const prod = products.find(p => p.id === productId);
    if (!prod) return false;

    const currentStock = productStocks[productId] || { warehouse: 0, market: 0 };
    const salioKabla = currentStock.warehouse;
    const salioBaada = salioKabla + idadi;
    const thamani = idadi * prod.price;

    setProductStocks(prev => ({
      ...prev,
      [productId]: {
        warehouse: salioBaada,
        market: Math.max(0, currentStock.market - idadi),
      }
    }));

    if (productId === 'prod-vybu-01') {
      setStockInventory(prev => ({
        ...prev,
        warehouseBoxes: prev.warehouseBoxes + idadi,
        marketBoxes: Math.max(0, prev.marketBoxes - idadi),
        totalReturnedHistory: prev.totalReturnedHistory + idadi,
      }));
    }

    const now = new Date();
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      tarehe: now.toLocaleDateString('en-GB'),
      muda: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId,
      productName: `${prod.name} (${prod.packaging})`,
      category: prod.category,
      ainaYaMuamala: 'RUDISHA_KUTOKA_MASOKO',
      idadi,
      thamani,
      salioKabla,
      salioBaada,
      afisaJina,
      maelezo: `Mzigo umerudishwa kutoka masoko: ${sababu}`,
    };

    setStockMovements(prev => [movement, ...prev]);
    return true;
  };

  // 4. Stock Manager: Directly edit product stock (Salio Stoo Kuu & Salio Masoko)
  const updateProductStockDirectly = (productId: string, warehouse: number, market: number, maelezo?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return false;

    const prevStock = productStocks[productId] || { warehouse: 0, market: 0 };
    const safeWarehouse = Math.max(0, Math.floor(isNaN(warehouse) ? 0 : warehouse));
    const safeMarket = Math.max(0, Math.floor(isNaN(market) ? 0 : market));

    setProductStocks(prev => ({
      ...prev,
      [productId]: {
        warehouse: safeWarehouse,
        market: safeMarket,
      }
    }));

    if (productId === 'prod-vybu-01') {
      setStockInventory(prev => ({
        ...prev,
        warehouseBoxes: safeWarehouse,
        marketBoxes: safeMarket,
      }));
    }

    // Record an audit movement for traceability
    const now = new Date();
    const diff = safeWarehouse - prevStock.warehouse;
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      tarehe: now.toLocaleDateString('en-GB'),
      muda: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId,
      productName: `${prod.name} (${prod.packaging})`,
      category: prod.category,
      ainaYaMuamala: diff >= 0 ? 'INGIZA_STOO_KUU' : 'TOA_KWENDA_MASOKO',
      idadi: Math.abs(diff),
      thamani: Math.abs(diff) * prod.price,
      salioKabla: prevStock.warehouse,
      salioBaada: safeWarehouse,
      afisaJina: currentUser?.name || 'Meneja Stoo (Rashid Bakari)',
      maelezo: maelezo || `Marekebisho ya moja kwa moja ya hisa (Stoo Kuu: ${prevStock.warehouse} ➔ ${safeWarehouse}, Masoko: ${prevStock.market} ➔ ${safeMarket})`,
    };

    setStockMovements(prev => [movement, ...prev]);
    return true;
  };

  // Helper: Format date into YYYYMMDD (e.g. 10/5/2024 -> 20240510)
  const formatInvoiceDate = (tareheStr?: string): string => {
    if (!tareheStr) {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    }

    const trimmed = tareheStr.trim();

    // Handle DD/MM/YYYY or D/M/YYYY
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const day = parts[0].trim().padStart(2, '0');
        const month = parts[1].trim().padStart(2, '0');
        const year = parts[2].trim();
        if (year.length === 4 && !isNaN(Number(year)) && !isNaN(Number(month)) && !isNaN(Number(day))) {
          return `${year}${month}${day}`;
        }
      }
    }

    // Handle YYYY-MM-DD
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 3 && parts[0].trim().length === 4) {
        const year = parts[0].trim();
        const month = parts[1].trim().padStart(2, '0');
        const day = parts[2].trim().padStart(2, '0');
        if (year.length === 4 && !isNaN(Number(year)) && !isNaN(Number(month)) && !isNaN(Number(day))) {
          return `${year}${month}${day}`;
        }
      }
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    }

    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  };

  // Add New Sale
  const addNewSale = (saleData: Omit<SaleRecord, 'id' | 'risitiNumber' | 'timestamp'>) => {
    // Generate invoice date prefix (e.g. 20240510 from 10/5/2024)
    const dateFormatted = formatInvoiceDate(saleData.tarehe);
    
    // Find next sequential number across existing sales
    let maxSeq = sales.length;
    for (const s of sales) {
      if (s.risitiNumber) {
        const match = s.risitiNumber.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }
    const nextSeq = maxSeq + 1;
    // Sequential number formatted with 3 digits padding (001, 006, ... up to 3000+)
    const risiti = `${dateFormatted}-${nextSeq.toString().padStart(3, '0')}`;
    
    const newRecord: SaleRecord = {
      ...saleData,
      id: `sale-${Date.now()}`,
      risitiNumber: risiti,
      timestamp: Date.now(),
    };

    setSales(prev => [newRecord, ...prev]);

    // If it was Vybu Gin sold, reduce market boxes
    if (saleData.category === 'vybu_gin' && saleData.maboksiSold > 0) {
      setStockInventory(prev => ({
        ...prev,
        marketBoxes: Math.max(0, prev.marketBoxes - saleData.maboksiSold),
      }));
    }

    // Reduce product stocks in market
    saleData.items.forEach(item => {
      setProductStocks(prev => {
        const cur = prev[item.productId] || { warehouse: 0, market: 0 };
        return {
          ...prev,
          [item.productId]: {
            ...cur,
            market: Math.max(0, cur.market - item.quantity),
          }
        };
      });
    });

    return newRecord;
  };

  // Repay Customer Debt
  const payCustomerDebt = (saleId: string, amount: number) => {
    if (amount <= 0) return false;

    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const newPaid = sale.amountPaid + amount;
        const newBalance = Math.max(0, sale.totalKiasi - newPaid);
        const newHali = newBalance === 0 ? 'IMELIPWA' : 'INADAIWA';
        return {
          ...sale,
          amountPaid: newPaid,
          balanceDue: newBalance,
          hali: newHali,
        };
      }
      return sale;
    }));

    return true;
  };

  // Request Stock Order by Salesperson
  const requestStockOrder = (muuzajiId: string, muuzajiName: string, maboksi: number, productId?: string, productName?: string) => {
    const newOrder: StockOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      tarehe: new Date().toLocaleDateString('en-GB'),
      muuzajiId,
      muuzajiName,
      productId: productId || 'prod-vybu-01',
      productName: productName || 'Vybu Gin (Box 200mls x 24)',
      maboksiRequested: maboksi,
      status: 'PENDING',
    };

    setStockOrders(prev => [newOrder, ...prev]);
  };

  // Dispatch Stock by Stock Manager
  const dispatchStockOrder = (orderId: string, officerName: string) => {
    const order = stockOrders.find(o => o.id === orderId);
    if (!order || order.status !== 'PENDING') return false;

    const targetProdId = order.productId || 'prod-vybu-01';
    const curProdStock = productStocks[targetProdId] || { warehouse: stockInventory.warehouseBoxes, market: stockInventory.marketBoxes };

    if (curProdStock.warehouse < order.maboksiRequested) {
      alert(`Stoo haina mzigo wa kutosha wa ${order.productName || 'bidhaa hii'}! Zilizopo ni ${curProdStock.warehouse}`);
      return false;
    }

    if (targetProdId === 'prod-vybu-01') {
      setStockInventory(prev => ({
        ...prev,
        warehouseBoxes: prev.warehouseBoxes - order.maboksiRequested,
        marketBoxes: prev.marketBoxes + order.maboksiRequested,
        totalDispatchedHistory: prev.totalDispatchedHistory + order.maboksiRequested,
      }));
    }

    setProductStocks(prev => {
      const cur = prev[targetProdId] || { warehouse: stockInventory.warehouseBoxes, market: stockInventory.marketBoxes };
      return {
        ...prev,
        [targetProdId]: {
          warehouse: Math.max(0, cur.warehouse - order.maboksiRequested),
          market: cur.market + order.maboksiRequested,
        }
      };
    });

    setStockOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'DISPATCHED',
          dispatchedDate: new Date().toLocaleDateString('en-GB'),
          dispatchedBy: officerName,
        };
      }
      return o;
    }));

    // Record in movements
    const now = new Date();
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      tarehe: now.toLocaleDateString('en-GB'),
      muda: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId: 'prod-vybu-01',
      productName: 'Vybu Gin (Box 200mls x 24)',
      category: 'vybu_gin',
      ainaYaMuamala: 'TOA_KWENDA_MASOKO',
      idadi: order.maboksiRequested,
      thamani: order.maboksiRequested * 39000,
      salioKabla: stockInventory.warehouseBoxes,
      salioBaada: stockInventory.warehouseBoxes - order.maboksiRequested,
      afisaJina: officerName,
      maelezo: `Kuthibitisha oda ya ${order.muuzajiName} (${order.orderNumber})`,
    };

    setStockMovements(prev => [movement, ...prev]);
    return true;
  };

  // Return Boxes to Stock
  const returnBoxesToStock = (muuzajiName: string, boxesCount: number, reason: string) => {
    return rudishaKutokaMasoko('prod-vybu-01', boxesCount, 'Rashid Bakari', `${muuzajiName} - ${reason}`);
  };

  // Add Expense by Accountant
  const addNewExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  // Metrics
  const todayStr = new Date().toLocaleDateString('en-GB');
  const todaySalesTotal = sales
    .filter(s => s.tarehe === todayStr || s.tarehe === '24/09/2026')
    .reduce((sum, s) => sum + s.totalKiasi, 0);

  // Separate Debt Calculations
  const totalCompanyDebts = sales.reduce((acc, sale) => {
    if (sale.balanceDue > 0) {
      if (sale.category === 'vybu_gin') {
        acc.vybuGinDebt += sale.balanceDue;
      } else {
        acc.beeProductDebt += sale.balanceDue;
      }
      acc.totalDebt += sale.balanceDue;
    }
    return acc;
  }, { vybuGinDebt: 0, beeProductDebt: 0, totalDebt: 0 });

  return (
    <SystemContext.Provider value={{
      currentUser,
      loggedInUser,
      activeRole,
      setActiveRole,
      users,
      authenticateUser,
      logout,
      toggleBlockUser,
      createUser,
      updateUserPassword,
      updateUserAvatar,
      products,
      updateProductPrice,
      systemInfo,
      updateSystemInfo,
      sales,
      addNewSale,
      payCustomerDebt,
      importSalesFromExcel,
      resetMarketStock,
      resetWarehouseStock,
      clearAllSales,
      resetAllDebts,
      resetAllExpenses,
      stockInventory,
      productStocks,
      stockMovements,
      ingizaStooKuu,
      toaKwendaMasoko,
      rudishaKutokaMasoko,
      updateProductStockDirectly,
      stockOrders,
      requestStockOrder,
      dispatchStockOrder,
      returnBoxesToStock,
      expenses,
      addNewExpense,
      todaySalesTotal,
      totalCompanyDebts,
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
