import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  Gift,
  CheckCircle2,
  XCircle,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Products = () => {
  const {
    products,
    categories,
    addCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    currentUser,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, normal

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Form State
  const initialFormState = {
    name: '',
    tamilName: '',
    code: '',
    category: 'Sound Crackers',
    brand: 'Standard',
    packing: '10 pcs / box',
    unit: 'Box',
    boxPieces: 10,
    purchasePrice: '',
    sellingPrice: '',
    discount: 10,
    taxRate: '',
    openingStock: 100,
    minimumStock: 15,
    status: 'Active',
    isBundle: false,
    bundleItems: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Generate next sequential product code: SGC-01, SGC-02, SGC-03...
  const getNextProductCode = () => {
    let maxNum = 0;
    products.forEach((p) => {
      if (p.code) {
        const match = p.code.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `SGC-${nextNum < 10 ? '0' + nextNum : nextNum}`;
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      code: getNextProductCode()
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (p) => {
    if (currentUser.role !== 'admin') {
      showToast('Cashier role cannot edit products. Switch to Admin.', 'warning');
      return;
    }
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice || !formData.code) {
      showToast('Product Name, Selling Price and Product Code are required!', 'error');
      return;
    }

    const trimmedCode = formData.code.trim();

    // Prevent duplicate product codes
    const isDuplicate = products.some(
      (p) => p.code.trim().toLowerCase() === trimmedCode.toLowerCase() && p.id !== editingProduct?.id
    );
    if (isDuplicate) {
      showToast(`Product Code "${trimmedCode}" already exists for another product!`, 'error');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...formData,
        code: trimmedCode,
        id: editingProduct.id,
        sellingPrice: Number(formData.sellingPrice),
        purchasePrice: Number(formData.purchasePrice),
        discount: Number(formData.discount),
        taxRate: formData.taxRate !== '' ? Number(formData.taxRate) : 0,
        minimumStock: Number(formData.minimumStock)
      });
    } else {
      addProduct({
        ...formData,
        code: trimmedCode,
        sellingPrice: Number(formData.sellingPrice),
        purchasePrice: Number(formData.purchasePrice),
        discount: Number(formData.discount),
        taxRate: formData.taxRate !== '' ? Number(formData.taxRate) : 0,
        minimumStock: Number(formData.minimumStock)
      });
      setSelectedCategory('all');
      setSearchQuery('');
      setStockFilter('all');
    }
    setIsModalOpen(false);
  };

  // Helper function to extract numerical index from code (SGC-01 -> 1, SGC-02 -> 2)
  const parseCodeNumber = (code) => {
    if (!code) return 999999;
    const match = code.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 999999;
  };

  // Filter & sort products in ascending order (SGC-01, SGC-02, SGC-03...)
  const filtered = products
    .filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tamilName && p.tamilName.includes(searchQuery)) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = p.currentStock <= p.minimumStock;
      } else if (stockFilter === 'out') {
        matchesStock = p.currentStock <= 0;
      }

      return matchesCat && matchesSearch && matchesStock;
    })
    .sort((a, b) => parseCodeNumber(a.code) - parseCodeNumber(b.code));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Add Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Crackers Product Master</span>
            <span className="badge badge-primary">{products.length} Products</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Manage Sivakasi cracker catalog, brands, rates, discounts, bundles &amp; minimum stock.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-secondary"
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <Tag size={16} />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{ gap: '0.5rem', fontWeight: 700 }}
          >
            <Plus size={18} />
            <span>Add New Cracker</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div className="products-filter-grid">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={16} color="var(--text-muted)" className="search-input-icon" />
            <input
              type="text"
              className="input input-with-icon"
              placeholder="Search by Name, Code (SC001), Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon || '🏷️'} {c.name} ({products.filter((p) => p.category === c.name).length})
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            className="select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock Status</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.75rem', paddingBottom: '2px', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem' }}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`btn btn-sm ${selectedCategory === c.name ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem', gap: '0.25rem', whiteSpace: 'nowrap', borderStyle: 'dashed' }}
            title="Add or Delete Categories"
          >
            <Plus size={13} />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Products Table (Scrollable on Mobile) */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Code</th>
                <th>Cracker Name</th>
                <th>Category</th>
                <th>Brand / Packing</th>
                {currentUser.role === 'admin' && <th style={{ textAlign: 'right' }}>MRP (₹)</th>}
                <th style={{ textAlign: 'right' }}>Sell Price (₹)</th>
                <th style={{ textAlign: 'center' }}>Disc %</th>
                <th style={{ textAlign: 'center' }}>Current Stock</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No products found matching your search.</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing filters or search terms.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minimumStock;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #fed7aa'
                        }}>
                          {p.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                          {p.name}
                        </div>
                        {p.tamilName && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
                            {p.tamilName}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.brand}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.packing}</div>
                      </td>
                      {currentUser.role === 'admin' && (
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                          {formatCurrency(p.purchasePrice)}
                        </td>
                      )}
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '0.82rem' }}>
                        {p.discount > 0 ? `${p.discount}%` : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)' }}>
                          {p.currentStock} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.unit}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Min: {p.minimumStock}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isOut ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.55rem' }}
                            title="Edit Cracker"
                          >
                            <Edit2 size={13} />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete cracker "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem', color: 'var(--danger)' }}
                              title="Delete Cracker"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Sparkles size={20} color="var(--primary)" />
                <span>{editingProduct ? 'Edit Cracker Product' : 'Add New Cracker'}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Product Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Lakshmi Atom Bomb"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Tamil Name */}
                <div>
                  <label className="input-label">Tamil Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Lakshmi"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                  />
                </div>

                {/* Product Code */}
                <div>
                  <label className="input-label">Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. SC001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="input-label">Brand</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Standard, Sony, Krishna, Peacock"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                {/* Packing */}
                <div>
                  <label className="input-label">Packing Details</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 10 pcs / box, 1 roll"
                    value={formData.packing}
                    onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                  />
                </div>

                {/* Unit & Unit conversion */}
                <div>
                  <label className="input-label">Unit</label>
                  <select
                    className="select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="Box">Box</option>
                    <option value="Pkt">Pkt (Packet)</option>
                    <option value="Roll">Roll</option>
                    <option value="Pcs">Pcs (Pieces)</option>
                  </select>
                </div>

                {/* MRP Price (Admin Only) */}
                <div>
                  <label className="input-label">MRP Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    className="input"
                    placeholder="80"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="input-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="input"
                    placeholder="120"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>

                {/* Discount % */}
                <div>
                  <label className="input-label">Default Discount %</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>

                {/* Tax Rate % (Optional) */}
                <div>
                  <label className="input-label">Tax Rate (GST %) (Optional)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="12"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  />
                </div>

                {/* Opening Stock */}
                {!editingProduct && (
                  <div>
                    <label className="input-label">Opening Stock</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="100"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                    />
                  </div>
                )}

                {/* Minimum Stock Alert Level */}
                <div>
                  <label className="input-label">Minimum Stock Alert Level</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="15"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Tag size={18} color="var(--primary)" />
                <span>Manage Product Categories</span>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Add New Category Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName);
                    setNewCategoryName('');
                  }
                }}
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="text"
                  className="input"
                  placeholder="Enter new category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </form>

              {/* Search & List Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Existing Categories ({categories.length})
                </div>
              </div>

              {/* Category Search Input */}
              <div className="search-input-wrapper">
                <Search size={15} color="var(--text-muted)" className="search-input-icon" />
                <input
                  type="text"
                  className="input input-with-icon"
                  placeholder="Search categories..."
                  value={catSearchQuery}
                  onChange={(e) => setCatSearchQuery(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {categories.filter((c) => c.name.toLowerCase().includes(catSearchQuery.toLowerCase())).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No categories found matching "{catSearchQuery}".
                  </div>
                ) : (
                  categories
                    .filter((c) => c.name.toLowerCase().includes(catSearchQuery.toLowerCase()))
                    .map((c) => {
                      const productCount = products.filter((p) => p.category === c.name).length;

                      return (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.85rem',
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              {c.name}
                            </span>
                            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                              {productCount} Products
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteCategory(c.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            title={`Delete category "${c.name}"`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
