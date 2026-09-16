const API_BASE = '/api';

export const api = {
  // Health
  checkHealth: () => fetch(`${API_BASE}/health`).then(r => r.json()),

  // Shop
  getShop: () => fetch(`${API_BASE}/shop`).then(r => r.json()),
  saveShop: (shop) => fetch(`${API_BASE}/shop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shop)
  }).then(r => r.json()),

  // Categories
  getCategories: () => fetch(`${API_BASE}/categories`).then(r => r.json()),
  addCategory: (category) => fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  }).then(r => r.json()),
  deleteCategory: (id) => fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Products
  getProducts: () => fetch(`${API_BASE}/products`).then(r => r.json()),
  addProduct: (product) => fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(r => r.json()),
  updateProduct: (id, product) => fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(r => r.json()),
  deleteProduct: (id) => fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Customers
  getCustomers: () => fetch(`${API_BASE}/customers`).then(r => r.json()),
  addCustomer: (customer) => fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  }).then(r => r.json()),
  updateCustomer: (id, customer) => fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  }).then(r => r.json()),
  deleteCustomer: (id) => fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Suppliers
  getSuppliers: () => fetch(`${API_BASE}/suppliers`).then(r => r.json()),
  addSupplier: (supplier) => fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier)
  }).then(r => r.json()),

  // Sales
  getSales: () => fetch(`${API_BASE}/sales`).then(r => r.json()),
  saveSale: (sale) => fetch(`${API_BASE}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale)
  }).then(r => r.json()),

  // Purchases
  getPurchases: () => fetch(`${API_BASE}/purchases`).then(r => r.json()),
  savePurchase: (purchase) => fetch(`${API_BASE}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchase)
  }).then(r => r.json()),

  // Returns
  getReturns: () => fetch(`${API_BASE}/returns`).then(r => r.json()),
  saveReturn: (ret) => fetch(`${API_BASE}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ret)
  }).then(r => r.json()),

  // Wipe All Data
  wipeAllData: () => fetch(`${API_BASE}/wipe`, { method: 'POST' }).then(r => r.json())
};
