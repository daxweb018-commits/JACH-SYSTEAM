export type UserRole = 
  | 'muuzaji' 
  | 'manager_masoko' 
  | 'mhasibu' 
  | 'managing_director' 
  | 'system_admin' 
  | 'stock';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  phone: string;
  isBlocked: boolean;
  avatar?: string;
}

export interface SystemInfo {
  officeName: string;
  tin: string;
  phone: string;
  address: string;
}

export type ProductCategory = 'vybu_gin' | 'bee_product';

export interface ProductItem {
  id: string;
  category: ProductCategory;
  name: string;
  packaging: string;
  price: number; // in TZS
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleRecord {
  id: string;
  risitiNumber: string; // Invoice Number (e.g. INV-20260924-001)
  tarehe: string; // YYYY-MM-DD or DD/MM/YYYY
  timestamp: number;
  muuzajiId: string;
  muuzajiName: string;
  mtejaName: string;
  mtejaPhone: string;
  mtejaTin?: string;
  paymentMethod?: string;
  category: ProductCategory;
  items: SaleItem[];
  otherCost?: number;
  otherCostDescription?: string;
  hasOtherCost?: boolean;
  totalKiasi: number;
  amountPaid: number;
  balanceDue: number;
  isCredit: boolean;
  hali: 'IMELIPWA' | 'INADAIWA' | 'HAIJALIPWA';
  maboksiSold: number;
}

export interface DebtPayment {
  id: string;
  saleId: string;
  tarehe: string;
  amountPaid: number;
  remainingBalance: number;
  recordedBy: string;
}

export interface ExpenseRecord {
  id: string;
  tarehe: string;
  aliyeChukua: string;
  maelezo: string;
  kiasi: number;
  kitengo: string;
  saini: string; // Base64 or digital signature name
  mhasibuName: string;
}

export interface StockOrder {
  id: string;
  orderNumber: string;
  tarehe: string;
  muuzajiId: string;
  muuzajiName: string;
  productId?: string;
  productName?: string;
  maboksiRequested: number;
  status: 'PENDING' | 'DISPATCHED' | 'REJECTED';
  dispatchedDate?: string;
  dispatchedBy?: string;
  returnedBoxes?: number;
  returnReason?: string;
}

export interface StockInventory {
  warehouseBoxes: number; // e.g. 200
  marketBoxes: number;    // dispatched to salespeople / market
  totalDispatchedHistory: number;
  totalReturnedHistory: number;
}

export interface StockMovement {
  id: string;
  tarehe: string;
  muda: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  ainaYaMuamala: 'INGIZA_STOO_KUU' | 'TOA_KWENDA_MASOKO' | 'RUDISHA_KUTOKA_MASOKO';
  idadi: number;
  thamani: number;
  salioKabla: number;
  salioBaada: number;
  afisaJina: string;
  maelezo?: string;
}

export interface ProductStockRecord {
  productId: string;
  warehouseQuantity: number;
  marketQuantity: number;
}
