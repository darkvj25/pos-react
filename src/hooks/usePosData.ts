import { useState, useEffect } from 'react';
import { Product, Sale, BusinessSettings, StockAdjustment, User, HeldTransaction, CartItem } from '@/types/pos';
import { getFromLocalStorage, saveToLocalStorage, generateReceiptNumber } from '@/utils/pos';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Sari-Sari Store POS',
  address: '123 Barangay Street, Manila, Philippines',
  tin: '123-456-789-000',
  birPermitNumber: 'FP-12345678',
  contactNumber: '+63 912 345 6789',
  email: 'store@example.com',
  receiptFooter: 'Salamat sa inyong pagbili!',
  vatEnabled: true,
  vatRate: 0.12,
};

const DEFAULT_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Instant Noodles',
  'Seasonings',
  'Personal Care',
  'Household',
  'Canned Goods',
  'Dairy',
  'Frozen',
  'Others'
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 350ml',
    category: 'Beverages',
    price: 25,
    stock: 50,
    barcode: '4902102119825',
    cost: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... other products
];

// Utility: parse dates from localStorage
const parseProductDates = (products: Product[]): Product[] =>
  products.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));

const parseSalesDates = (sales: Sale[]): Sale[] =>
  sales.map(sale => ({
    ...sale,
    timestamp: new Date(sale.timestamp),
  }));

export const usePosData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<string[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProducts = getFromLocalStorage('pos_products', SAMPLE_PRODUCTS);
    const savedSales = getFromLocalStorage('pos_sales', []);
    const savedSettings = getFromLocalStorage('pos_settings', DEFAULT_SETTINGS);
    const savedCategories = getFromLocalStorage('pos_categories', DEFAULT_CATEGORIES);
    const savedAdjustments = getFromLocalStorage('pos_stock_adjustments', []);
    const savedUsers = getFromLocalStorage('pos_users', []);
    const savedHeldTransactions = getFromLocalStorage('pos_held_transactions', []);

    setProducts(parseProductDates(savedProducts));
    setUsers(savedUsers);
    setSales(parseSalesDates(savedSales));
    setSettings(savedSettings);
    setCategories(savedCategories);
    setStockAdjustments(savedAdjustments);
    setHeldTransactions(savedHeldTransactions);
    setIsLoading(false);
  }, []);

  // Category management
  const addCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveToLocalStorage('pos_categories', updated);
    return true;
  };

  const updateCategory = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    const updatedCategories = categories.map(cat => cat === oldName ? trimmed : cat);
    const updatedProducts = products.map(p =>
      p.category === oldName ? { ...p, category: trimmed, updatedAt: new Date() } : p
    );
    setCategories(updatedCategories);
    setProducts(updatedProducts);
    saveToLocalStorage('pos_categories', updatedCategories);
    saveToLocalStorage('pos_products', updatedProducts);
    return true;
  };

  const deleteCategory = (categoryName: string): boolean => {
    if (!categories.includes(categoryName)) return false;
    if (products.some(p => p.category === categoryName)) return false;
    const updated = categories.filter(cat => cat !== categoryName);
    setCategories(updated);
    saveToLocalStorage('pos_categories', updated);
    return true;
  };

  // Product management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID?.() || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>): void => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
  };

  const deleteProduct = (productId: string): void => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
  };

  const getProductByBarcode = (barcode: string): Product | undefined =>
    products.find(p => p.barcode === barcode);

  const searchProducts = (query: string): Product[] => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode?.includes(query)
    );
  };

  // Stock management
  const adjustStock = (
    productId: string,
    quantity: number,
    type: 'add' | 'remove',
    reason: string,
    userId: string
  ): void => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = type === 'add'
      ? product.stock + quantity
      : Math.max(0, product.stock - quantity);

    updateProduct(productId, { stock: newStock });

    const adjustment: StockAdjustment = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      productId,
      productName: product.name,
      adjustmentType: type,
      quantity,
      reason,
      userId,
      timestamp: new Date(),
    };

    const updated = [...stockAdjustments, adjustment];
    setStockAdjustments(updated);
    saveToLocalStorage('pos_stock_adjustments', updated);
  };

  // Sales
  const recordSale = (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID?.() || Date.now().toString(),
      receiptNumber: generateReceiptNumber(),
      timestamp: new Date(),
    };

    saleData.items.forEach(item => {
      updateProduct(item.productId, {
        stock: Math.max(0, item.product.stock - item.quantity),
      });
    });

    const updated = [...sales, newSale];
    setSales(updated);
    saveToLocalStorage('pos_sales', updated);
    return newSale;
  };

  const getSalesByDate = (date: Date): Sale[] => {
    const target = date.toDateString();
    return sales.filter(sale => new Date(sale.timestamp).toDateString() === target);
  };

  const getTodaySales = (): Sale[] => getSalesByDate(new Date());

  const updateSettings = (newSettings: Partial<BusinessSettings>): void => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToLocalStorage('pos_settings', updated);
  };

  // Analytics
  const getDailySalesTotal = (date: Date): number =>
    getSalesByDate(date).reduce((sum, s) => sum + s.total, 0);

  const getMonthlyRevenue = (year: number, month: number): number =>
    sales.filter(s => {
      const d = new Date(s.timestamp);
      return d.getFullYear() === year && d.getMonth() === month;
    }).reduce((sum, s) => sum + s.total, 0);

  const getLowStockProducts = (threshold = 10): Product[] =>
    products.filter(p => p.stock <= threshold && p.stock > 0);

  const getOutOfStockProducts = (): Product[] =>
    products.filter(p => p.stock === 0);

  // User management
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): User => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID?.() || Date.now().toString(),
      createdAt: new Date(),
      isActive: true,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>): void => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
  };

  const deleteUser = (userId: string): void => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
  };

  const getUserByUsername = (username: string): User | undefined =>
    users.find(u => u.username.toLowerCase() === username.toLowerCase());

  // Hold transaction management
  const holdTransaction = (items: CartItem[], note?: string): HeldTransaction => {
    const heldTransaction: HeldTransaction = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      items,
      timestamp: new Date(),
      note
    };
    const updated = [...heldTransactions, heldTransaction];
    setHeldTransactions(updated);
    saveToLocalStorage('pos_held_transactions', updated);
    return heldTransaction;
  };

  const retrieveHeldTransaction = (id: string): CartItem[] | undefined => {
    const transaction = heldTransactions.find(t => t.id === id);
    if (transaction) {
      const updated = heldTransactions.filter(t => t.id !== id);
      setHeldTransactions(updated);
      saveToLocalStorage('pos_held_transactions', updated);
      return transaction.items;
    }
    return undefined;
  };

  return {
    products,
    sales,
    settings,
    categories,
    stockAdjustments,
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    getUserByUsername,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    searchProducts,
    adjustStock,
    getLowStockProducts,
    getOutOfStockProducts,
    recordSale,
    getSalesByDate,
    getTodaySales,
    updateSettings,
    getDailySalesTotal,
    getMonthlyRevenue,
    addCategory,
    updateCategory,
    deleteCategory,
    holdTransaction,
    retrieveHeldTransaction,
    heldTransactions,
  };
};
