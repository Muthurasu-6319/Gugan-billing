import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CATEGORIES,
  INITIAL_SHOP,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_RETURNS
} from '../data/initialData';
import { api } from '../utils/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Current user / role: 'admin' or 'cashier'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('svc_user');
    return saved ? JSON.parse(saved) : { role: 'admin', name: 'Shop Owner (Admin)' };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // Shop details
  const [shop, setShop] = useState(INITIAL_SHOP);

  // Products
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Customers
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  // Suppliers
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  // Sales
  const [sales, setSales] = useState(INITIAL_SALES);

  // Purchases
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);

  // Returns
  const [returns, setReturns] = useState(INITIAL_RETURNS);

  // Categories State
  const [categories, setCategories] = useState(CATEGORIES);

  // Print modal state
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('svc_active_tab');
    return saved || 'billing';
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Fetch all database state
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shopData, catData, prodData, custData, suppData, salesData, purData, retData] = await Promise.all([
        api.getShop().catch(() => null),
        api.getCategories().catch(() => []),
        api.getProducts().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getSales().catch(() => []),
        api.getPurchases().catch(() => []),
        api.getReturns().catch(() => [])
      ]);

      setDbConnected(true);

      if (shopData && shopData.id) {
        setShop(prev => ({ ...INITIAL_SHOP, ...shopData }));
      }
      if (Array.isArray(catData) && catData.length > 0) {
        setCategories(catData);
      }
      if (Array.isArray(prodData)) {
        setProducts(prodData.map(p => ({
          ...p,
          purchasePrice: Number(p.purchasePrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          discount: Number(p.discount) || 0,
          taxRate: Number(p.taxRate) || 12,
          currentStock: Number(p.currentStock) || 0,
          minimumStock: Number(p.minimumStock) || 10
        })));
      }
      if (Array.isArray(custData)) {
        setCustomers(custData.map(c => ({
          ...c,
          totalBilled: Number(c.totalBilled) || 0,
          totalBills: Number(c.totalBills) || 0,
          creditBalance: Number(c.creditBalance) || 0
        })));
      }
      if (Array.isArray(suppData)) {
        setSuppliers(suppData.map(s => ({
          ...s,
          balance: Number(s.balance) || 0,
          totalPurchases: Number(s.totalPurchases) || 0
        })));
      }
      if (Array.isArray(salesData)) {
        setSales(salesData);
      }
      if (Array.isArray(purData)) {
        setPurchases(purData);
      }
      if (Array.isArray(retData)) {
        setReturns(retData);
      }
    } catch (err) {
      console.error('Failed to sync with TiDB database:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    localStorage.setItem('svc_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('svc_active_tab', activeTab);
  }, [activeTab]);

  // Category Actions
  const addCategory = async (categoryName) => {
    if (!categoryName || !categoryName.trim()) return;
    const trimmed = categoryName.trim();
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Category already exists!', 'warning');
      return;
    }
    const newCat = {
      id: `cat_${Date.now()}`,
      name: trimmed
    };
    try {
      await api.addCategory(newCat);
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${trimmed}" saved to Database!`, 'success');
    } catch (e) {
      showToast('Error saving category: ' + e.message, 'error');
    }
  };

  const deleteCategory = async (categoryIdOrName) => {
    const catToDelete = categories.find((c) => c.id === categoryIdOrName || c.name === categoryIdOrName);
    if (!catToDelete) return;
    if (window.confirm(`Delete category "${catToDelete.name}"?`)) {
      try {
        await api.deleteCategory(catToDelete.id);
        setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id && c.name !== catToDelete.name));
        showToast(`Category "${catToDelete.name}" deleted from Database!`, 'info');
      } catch (e) {
        showToast('Error deleting category: ' + e.message, 'error');
      }
    }
  };

  // Switch role
  const switchRole = (role) => {
    if (role === 'admin') {
      setCurrentUser({ role: 'admin', name: 'Shop Owner (Admin)' });
      showToast('Switched to Admin (Owner) Mode - All features unlocked', 'success');
    } else {
      setCurrentUser({ role: 'cashier', name: 'Cashier Staff' });
      showToast('Switched to Cashier Staff Mode (Restricted view)', 'info');
      if (['reports', 'settings'].includes(activeTab)) {
        setActiveTab('billing');
      }
    }
  };

  // Save new bill
  const saveBill = async (billData, printAfterSave = false) => {
    const invoiceNo = `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1001}`;
    
    const newSale = {
      ...billData,
      id: invoiceNo,
      invoiceNo,
      date: new Date().toISOString(),
      createdBy: currentUser.role === 'admin' ? 'Admin' : 'Cashier'
    };

    if (printAfterSave) {
      setActiveInvoiceForPrint({ ...newSale, autoPrint: true });
      setIsPrintModalOpen(true);
    }

    try {
      await api.saveSale(newSale);
      showToast(`Bill #${invoiceNo} saved to TiDB Database!`, 'success');
      refreshAllData();
      return newSale;
    } catch (e) {
      showToast('Database error saving bill: ' + e.message, 'error');
      return null;
    }
  };

  // Process Sales Return
  const processReturn = async (returnData) => {
    const returnId = `RET-${Date.now().toString().slice(-4)}`;
    const newReturn = {
      ...returnData,
      id: returnId,
      date: new Date().toISOString(),
      createdBy: currentUser.role === 'admin' ? 'Admin' : 'Cashier'
    };

    try {
      await api.saveReturn(newReturn);
      showToast(`Sales return #${returnId} saved! Stock replenished in DB.`, 'success');
      await refreshAllData();
      return newReturn;
    } catch (e) {
      showToast('Database error processing return: ' + e.message, 'error');
      return null;
    }
  };

  // Add Product
  const addProduct = async (productData) => {
    const newProd = {
      ...productData,
      id: productData.code || `PRD-${Date.now().toString().slice(-4)}`,
      currentStock: Number(productData.openingStock) || 0,
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      discount: Number(productData.discount) || 0,
      taxRate: Number(productData.taxRate) || 12,
      minimumStock: Number(productData.minimumStock) || 10,
      status: productData.status || 'Active'
    };

    try {
      await api.addProduct(newProd);
      showToast(`Product "${newProd.name}" saved to TiDB Database!`, 'success');
      await refreshAllData();
    } catch (e) {
      showToast('Database error adding product: ' + e.message, 'error');
    }
  };

  // Update Product
  const updateProduct = async (updatedProduct) => {
    try {
      await api.updateProduct(updatedProduct.id, updatedProduct);
      showToast(`Product "${updatedProduct.name}" updated in Database!`, 'success');
      await refreshAllData();
    } catch (e) {
      showToast('Database error updating product: ' + e.message, 'error');
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Admin can delete products!', 'error');
      return;
    }
    try {
      await api.deleteProduct(id);
      showToast('Product deleted from Database!', 'info');
      await refreshAllData();
    } catch (e) {
      showToast('Database error deleting product: ' + e.message, 'error');
    }
  };

  // Quick adjust stock
  const quickAdjustStock = async (productId, newStock) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const updated = { ...target, currentStock: Math.max(0, Number(newStock)) };
    try {
      await api.updateProduct(productId, updated);
      showToast('Stock updated in Database!', 'success');
      await refreshAllData();
    } catch (e) {
      showToast('Error updating stock: ' + e.message, 'error');
    }
  };

  // Add Purchase Entry (Inward stock)
  const addPurchase = async (purchaseData) => {
    const purchaseId = `PUR-${Date.now().toString().slice(-4)}`;
    const newPur = {
      ...purchaseData,
      id: purchaseId,
      date: new Date().toISOString()
    };

    try {
      await api.savePurchase(newPur);
      showToast(`Stock inward saved to TiDB Database!`, 'success');
      await refreshAllData();
    } catch (e) {
      showToast('Error saving purchase inward: ' + e.message, 'error');
    }
  };

  // Add / Update Supplier
  const addSupplier = async (suppData) => {
    const sId = suppData.id || `SUP-${Date.now().toString().slice(-4)}`;
    const supplier = {
      ...suppData,
      id: sId,
      balance: Number(suppData.balance) || 0,
      totalPurchases: Number(suppData.totalPurchases) || 0
    };
    try {
      await api.addSupplier(supplier);
      showToast('Supplier saved to Database!', 'success');
      await refreshAllData();
    } catch (e) {
      showToast('Error saving supplier: ' + e.message, 'error');
    }
  };

  // Add / Update Customer
  const addCustomer = async (custData) => {
    const cId = custData.id || `CUST-${Date.now().toString().slice(-4)}`;
    const customer = {
      ...custData,
      id: cId,
      totalBilled: Number(custData.totalBilled) || 0,
      totalBills: Number(custData.totalBills) || 0,
      creditBalance: Number(custData.creditBalance) || 0
    };
    try {
      if (custData.id) {
        await api.updateCustomer(cId, customer);
        showToast('Customer details updated in Database!', 'success');
      } else {
        await api.addCustomer(customer);
        showToast('Customer created in Database!', 'success');
      }
      await refreshAllData();
    } catch (e) {
      showToast('Error saving customer: ' + e.message, 'error');
    }
  };

  // Update Shop Profile
  const updateShop = async (newDetails) => {
    try {
      await api.saveShop(newDetails);
      setShop(newDetails);
      showToast('Shop and Invoice settings saved to TiDB Database!', 'success');
    } catch (e) {
      showToast('Error saving shop settings: ' + e.message, 'error');
    }
  };

  // Export Data
  const exportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shop,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      returns
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Gugan_Crackers_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Complete shop backup downloaded!', 'success');
  };

  // Import Data
  const importData = async (importedJson) => {
    try {
      if (importedJson.shop) await api.saveShop(importedJson.shop);
      if (Array.isArray(importedJson.products)) {
        for (const p of importedJson.products) await api.addProduct(p);
      }
      if (Array.isArray(importedJson.customers)) {
        for (const c of importedJson.customers) await api.addCustomer(c);
      }
      if (Array.isArray(importedJson.suppliers)) {
        for (const s of importedJson.suppliers) await api.addSupplier(s);
      }
      await refreshAllData();
      showToast('Data imported and synced with Database!', 'success');
    } catch (e) {
      showToast('Error importing data: ' + e.message, 'error');
    }
  };

  // Wipe All Data
  const wipeAllData = async () => {
    if (window.confirm('Delete all products, customers, sales, and database records completely?')) {
      try {
        await api.wipeAllData();
        setProducts([]);
        setCustomers([]);
        setSuppliers([]);
        setSales([]);
        setPurchases([]);
        setReturns([]);
        setShop(prev => ({ ...prev, nextInvoiceNum: 1, nextOrderNum: 1 }));
        showToast('All database records cleared and Invoice numbering reset to INV-1!', 'info');
        await refreshAllData();
      } catch (e) {
        showToast('Error clearing database records: ' + e.message, 'error');
      }
    }
  };

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSetActiveTab = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Trigger print bill
  const triggerPrintBill = (invoice, autoPrint = true) => {
    setActiveInvoiceForPrint({ ...invoice, autoPrint });
    setIsPrintModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        isLoading,
        dbConnected,
        refreshAllData,
        shop,
        updateShop,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        categories,
        addCategory,
        deleteCategory,
        customers,
        addCustomer,
        suppliers,
        addSupplier,
        sales,
        saveBill,
        purchases,
        addPurchase,
        returns,
        processReturn,
        activeTab,
        setActiveTab: handleSetActiveTab,
        activeInvoiceForPrint,
        isPrintModalOpen,
        setIsPrintModalOpen,
        triggerPrintBill,
        exportData,
        importData,
        wipeAllData,
        resetData: wipeAllData,
        toast,
        showToast,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
