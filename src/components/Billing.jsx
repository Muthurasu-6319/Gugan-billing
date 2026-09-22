import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  Sparkles,
  User,
  Phone,
  Layers,
  CreditCard,
  Wallet,
  Smartphone,
  Coins,
  Truck,
  Calendar,
  Hash,
  MapPin,
  Eye,
  FileText
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const Billing = () => {
  const {
    shop,
    products,
    customers,
    categories,
    saveBill,
    showToast,
    setActiveInvoiceForPrint,
    setIsPrintModalOpen
  } = useApp();

  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Customer state with localStorage draft persistence
  const [selectedCustomerId, setSelectedCustomerId] = useState(() => localStorage.getItem('svc_draft_customer_id') || '');
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('svc_draft_customer_name') || '');
  const [customerMobile, setCustomerMobile] = useState(() => localStorage.getItem('svc_draft_customer_mobile') || '');
  const [customerAddress, setCustomerAddress] = useState(() => localStorage.getItem('svc_draft_customer_address') || '');
  const [customerGstin, setCustomerGstin] = useState(() => localStorage.getItem('svc_draft_customer_gstin') || '');
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [cardQtys, setCardQtys] = useState({});

  const formatOrderNo = (num) => String(num || 1).padStart(2, '0');

  // Bill Title & Dispatch Details
  const [billTitle, setBillTitle] = useState(() => localStorage.getItem('svc_draft_bill_title') || 'INVOICE');
  const [copyType, setCopyType] = useState('');
  const [orderNo, setOrderNo] = useState(() => formatOrderNo(shop.nextOrderNum || 1));
  const [despatchDate, setDespatchDate] = useState(() => localStorage.getItem('svc_draft_despatch_date') || getTodayFormatted());
  const [transport, setTransport] = useState('');
  const [agent, setAgent] = useState('');

  // Live ticking date & time state (updates live every second without needing refresh)
  const [liveNow, setLiveNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setOrderNo(formatOrderNo(shop.nextOrderNum || 1));
  }, [shop.nextOrderNum]);

  // Cart Items with localStorage draft persistence
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('svc_draft_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Product Add / Entry State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customItemName, setCustomItemName] = useState('');
  const [cases, setCases] = useState(1);
  const [packPieces, setPackPieces] = useState(18);
  const [packContent, setPackContent] = useState('18 BOX');
  const [qty, setQty] = useState(18);
  const [rate, setRate] = useState('');
  const [customDiscount, setCustomDiscount] = useState('0');
  const [per, setPer] = useState('1 BOX');

  // Wholesale Charges & Calculations (Matching Reference Bill)
  const [pfPercent, setPfPercent] = useState(3); // P & F 3%
  const [taxPercent, setTaxPercent] = useState(shop.defaultTaxRate || 6.5); // TAX rate
  const [commissionPercent, setCommissionPercent] = useState(3); // Comission @ 3%

  // Payment method with localStorage persistence
  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('svc_draft_payment_method') || 'Cash'); // Cash, UPI, Card, Credit, Split
  const [splitCash, setSplitCash] = useState(() => localStorage.getItem('svc_draft_split_cash') || '');
  const [splitUpi, setSplitUpi] = useState(() => localStorage.getItem('svc_draft_split_upi') || '');
  const [splitCard, setSplitCard] = useState(() => localStorage.getItem('svc_draft_split_card') || '');

  // Persist draft bill state to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('svc_draft_items', JSON.stringify(items));
    localStorage.setItem('svc_draft_customer_id', selectedCustomerId);
    localStorage.setItem('svc_draft_customer_name', customerName);
    localStorage.setItem('svc_draft_customer_mobile', customerMobile);
    localStorage.setItem('svc_draft_customer_address', customerAddress);
    localStorage.setItem('svc_draft_customer_gstin', customerGstin);
    localStorage.setItem('svc_draft_bill_title', billTitle);
    localStorage.setItem('svc_draft_despatch_date', despatchDate);
    localStorage.setItem('svc_draft_payment_method', paymentMethod);
    localStorage.setItem('svc_draft_split_cash', splitCash);
    localStorage.setItem('svc_draft_split_upi', splitUpi);
    localStorage.setItem('svc_draft_split_card', splitCard);
  }, [items, selectedCustomerId, customerName, customerMobile, customerAddress, customerGstin, billTitle, despatchDate, paymentMethod, splitCash, splitUpi, splitCard]);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const casesInputRef = useRef(null);
  const rateInputRef = useRef(null);

  // Helper function to extract numerical index from code (SGC-01 -> 1, SGC-02 -> 2)
  const parseCodeNumber = (code) => {
    if (!code) return 999999;
    const match = code.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 999999;
  };

  // Filter & sort products for search in ascending numerical order (SGC-01, SGC-02...)
  // Products will only be shown when user types in the search bar
  const filteredProducts = searchTerm.trim() === ''
    ? []
    : products
        .filter((p) => {
          const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
          const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.tamilName && p.tamilName.includes(searchTerm));
          return matchesCategory && matchesSearch;
        })
        .sort((a, b) => parseCodeNumber(a.code) - parseCodeNumber(b.code));

  // Calculate live totals
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalCases = items.reduce((sum, item) => sum + (Number(item.cases) || 0), 0);
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  // Net Amount and Balance equal Subtotal directly
  const pfAmount = 0;
  const taxAmount = 0;
  const roundOff = 0;
  const netAmount = subtotal;
  const commissionAmount = 0;
  const netBalance = subtotal;

  // Customer selection from dropdown
  const handleSelectCustomer = (custId) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setCustomerGstin('');
      return;
    }
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name || '');
      setCustomerMobile(cust.mobile || '');
      setCustomerAddress(cust.address || '');
      setCustomerGstin(cust.gstin || '');
    }
  };

  // Customer mobile autocomplete
  const handleMobileChange = (e) => {
    const mob = e.target.value;
    setCustomerMobile(mob);
    const existing = customers.find((c) => c.mobile === mob.trim());
    if (existing) {
      setSelectedCustomerId(existing.id);
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
      setCustomerGstin(existing.gstin || '');
    }
  };

  // Handle Cases change - auto update Qty
  const handleCasesChange = (cVal) => {
    const numCases = Math.max(1, Number(cVal) || 1);
    setCases(numCases);
    const pPieces = Number(packPieces) || 1;
    setQty(numCases * pPieces);
  };

  // Handle Pack Pieces change - auto update Qty
  const handlePackPiecesChange = (pVal) => {
    const pPieces = Math.max(1, Number(pVal) || 1);
    setPackPieces(pPieces);
    setPackContent(`${pPieces} BOX`);
    setQty(cases * pPieces);
  };

  // Select a product from suggestions
  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setSearchTerm(p.name);
    setCustomItemName(p.name);
    setRate(p.sellingPrice);
    setCustomDiscount(p.discount || 0);

    const pieces = Number(p.boxPieces) || 18;
    setPackPieces(pieces);
    setPackContent(p.packing || `${pieces} BOX`);
    setPer(p.unit || '1 BOX');
    setCases(1);
    setQty(pieces);

    if (casesInputRef.current) casesInputRef.current.focus();
  };

  // Add Item to cart
  const handleAddItem = () => {
    const itemName = selectedProduct ? selectedProduct.name : (searchTerm.trim() || customItemName.trim());
    if (!itemName) {
      showToast('Please enter or select a product name!', 'warning');
      return;
    }

    const itemRate = Number(rate);
    if (!itemRate || itemRate <= 0) {
      showToast('Please enter a valid rate (₹)!', 'warning');
      return;
    }

    const itemCases = Number(cases) || 1;
    const itemQty = Number(qty) || itemCases * (Number(packPieces) || 1);
    const itemDisc = Number(customDiscount) || 0;
    const lineTotal = Number(((itemQty * itemRate) * (1 - itemDisc / 100)).toFixed(2));

    const newItem = {
      id: selectedProduct ? selectedProduct.id : `CUSTOM-${Date.now().toString().slice(-4)}`,
      code: selectedProduct ? selectedProduct.code : '',
      name: itemName,
      cases: itemCases,
      packContent: packContent.trim() || `${packPieces} BOX`,
      qty: itemQty,
      rate: itemRate,
      discount: itemDisc,
      per: per.trim() || '1 BOX',
      total: lineTotal
    };

    setItems((prev) => [...prev, newItem]);

    // Reset input fields
    setSelectedProduct(null);
    setSearchTerm('');
    setCustomItemName('');
    setCases(1);
    setPackPieces(18);
    setPackContent('18 BOX');
    setQty(18);
    setRate('');
    setCustomDiscount('0');
    setPer('1 BOX');

    if (searchInputRef.current) searchInputRef.current.focus();
    showToast(`Added "${itemName}" to bill`, 'success');
  };

  // Add product directly from Product Master cards
  const handleAddProductToCart = (product, customQty = 1) => {
    const qtyToAdd = Math.max(1, Number(customQty) || 1);
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      const price = Number(product.sellingPrice) || 0;
      const mrp = Number(product.purchasePrice) || price;
      const disc = Number(product.discount) || 0;

      if (existingIndex > -1) {
        const updated = [...prev];
        const item = updated[existingIndex];
        const newQty = (Number(item.qty) || 0) + qtyToAdd;
        const newTotal = Number((newQty * price * (1 - disc / 100)).toFixed(2));
        updated[existingIndex] = {
          ...item,
          qty: newQty,
          total: newTotal
        };
        return updated;
      } else {
        const lineTotal = Number((qtyToAdd * price * (1 - disc / 100)).toFixed(2));
        const newItem = {
          id: product.id,
          code: product.code,
          name: product.name,
          tamilName: product.tamilName || '',
          category: product.category,
          brand: product.brand,
          packing: product.packing,
          mrp,
          sellingPrice: price,
          rate: price,
          discount: disc,
          qty: qtyToAdd,
          cases: 1,
          packContent: product.packing || '1 Box',
          per: product.unit || '1 Box',
          total: lineTotal
        };
        return [...prev, newItem];
      }
    });
    showToast(`Added ${qtyToAdd} x "${product.name}" to bill`, 'success');
    setSearchTerm('');
  };

  // Update item quantity directly in cart (+ / - buttons)
  const handleUpdateItemQty = (index, delta) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = Math.max(1, (Number(item.qty) || 1) + delta);
      const price = Number(item.sellingPrice) || Number(item.rate) || 0;
      const disc = Number(item.discount) || 0;
      const newTotal = Number((newQty * price * (1 - disc / 100)).toFixed(2));

      updated[index] = {
        ...item,
        qty: newQty,
        total: newTotal
      };
      return updated;
    });
  };

  const handleDirectQtyChange = (index, value) => {
    const newQty = Math.max(1, Number(value) || 1);
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const price = Number(item.sellingPrice) || Number(item.rate) || 0;
      const disc = Number(item.discount) || 0;
      const newTotal = Number((newQty * price * (1 - disc / 100)).toFixed(2));

      updated[index] = {
        ...item,
        qty: newQty,
        total: newTotal
      };
      return updated;
    });
  };

  // Update item quantity or cases directly in cart
  const handleUpdateItemCases = (index, delta) => {
    handleUpdateItemQty(index, delta);
  };

  // Remove item from cart
  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset / Clear Bill
  const handleResetBill = () => {
    setItems([]);
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setCustomerGstin('');
    setSelectedProduct(null);
    setSearchTerm('');
    setCustomItemName('');
    setCases(1);
    setPackPieces(18);
    setPackContent('18 BOX');
    setQty(18);
    setRate('');
    setCustomDiscount('0');
    setPaymentMethod('Cash');
    setSplitCash('');
    setSplitUpi('');
    setSplitCard('');
    setOrderNo(formatOrderNo(shop.nextOrderNum || 1));
    setDespatchDate(getTodayFormatted());
    setBillTitle('INVOICE');
    setCopyType('');
    setTransport('');
    setAgent('');
    setCardQtys({});
    localStorage.removeItem('svc_draft_items');
    localStorage.removeItem('svc_draft_customer_id');
    localStorage.removeItem('svc_draft_customer_name');
    localStorage.removeItem('svc_draft_customer_mobile');
    localStorage.removeItem('svc_draft_customer_address');
    localStorage.removeItem('svc_draft_customer_gstin');
    localStorage.removeItem('svc_draft_payment_method');
    localStorage.removeItem('svc_draft_split_cash');
    localStorage.removeItem('svc_draft_split_upi');
    localStorage.removeItem('svc_draft_split_card');
    showToast('Billing screen cleared', 'info');
  };

  // Save bill action
  const handleSaveBill = async (print = false) => {
    if (items.length === 0) {
      showToast('Add at least one cracker item to save bill!', 'warning');
      return;
    }

    let splitDetails = null;
    if (paymentMethod === 'Split') {
      const c = Number(splitCash) || 0;
      const u = Number(splitUpi) || 0;
      const d = Number(splitCard) || 0;
      if (c + u + d !== netAmount) {
        showToast(`Split amounts (₹${c + u + d}) must equal Net Amount (₹${netAmount})!`, 'error');
        return;
      }
      splitDetails = { cash: c, upi: u, card: d };
    }

    const grossSubtotal = items.reduce((sum, item) => {
      const rate = Number(item.rate || item.sellingPrice || 0);
      const qty = Number(item.qty || 1);
      return sum + (qty * rate);
    }, 0);

    const discountTotal = items.reduce((sum, item) => {
      const rate = Number(item.rate || item.sellingPrice || 0);
      const disc = Number(item.discount || 0);
      const qty = Number(item.qty || 1);
      return sum + (qty * rate * (disc / 100));
    }, 0);

    const billData = {
      billTitle: billTitle || 'INVOICE',
      billFormat: shop.printFormat || 'a4',
      copyType: '',
      orderNo: orderNo.trim(),
      despatchDate: despatchDate.trim(),
      transport: '',
      agent: '',
      customerName: customerName.trim() || 'Cash Customer',
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      customerGstin: customerGstin.trim().toUpperCase(),
      items,
      totalCases,
      totalQty,
      subTotal: grossSubtotal > 0 ? grossSubtotal : subtotal,
      subtotal: grossSubtotal > 0 ? grossSubtotal : subtotal,
      discountTotal: Number(discountTotal.toFixed(2)),
      pfPercent: Number(pfPercent) || 0,
      pfAmount,
      taxPercent: Number(taxPercent) || 0,
      taxTotal: taxAmount,
      roundOff,
      grandTotal: netAmount,
      netAmount,
      commissionPercent: Number(commissionPercent) || 0,
      commissionAmount,
      netBalance,
      paymentMethod: paymentMethod || 'Cash',
      paymentMode: paymentMethod || 'Cash',
      splitDetails
    };

    await saveBill(billData, print);
    handleResetBill();
  };

  // Preview current bill without saving
  const handlePreviewBill = () => {
    if (items.length === 0) {
      showToast('Add at least one item to preview the bill template!', 'warning');
      return;
    }
    const previewData = {
      invoiceNo: `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1001}`,
      date: new Date().toISOString(),
      billTitle: billTitle || 'INVOICE',
      billFormat: shop.printFormat || 'a4',
      copyType: '',
      orderNo: orderNo.trim(),
      despatchDate: despatchDate.trim(),
      transport: '',
      agent: '',
      customerName: customerName.trim() || 'Cash / Walk-in Customer',
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      customerGstin: customerGstin.trim().toUpperCase(),
      items,
      totalCases,
      totalQty,
      subtotal,
      pfPercent: Number(pfPercent) || 0,
      pfAmount,
      taxPercent: Number(taxPercent) || 0,
      taxTotal: taxAmount,
      roundOff,
      grandTotal: netAmount,
      netAmount,
      commissionPercent: Number(commissionPercent) || 0,
      commissionAmount,
      netBalance,
      paymentMethod
    };
    setActiveInvoiceForPrint(previewData);
    setIsPrintModalOpen(true);
  };

  // Keyboard Shortcuts (F2, F3, F4, F5, F6, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetBill();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (mobileInputRef.current) mobileInputRef.current.focus();
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleSaveBill(false);
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleSaveBill(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, customerName, customerMobile, customerAddress, customerGstin, netAmount, paymentMethod, splitCash, splitUpi, splitCard, orderNo, despatchDate, transport, agent, pfPercent, taxPercent, commissionPercent]);

  // Current bill number to display
  const currentBillNo = `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1001}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top POS Toolbar with Bill Info & Shortcuts */}
      <div className="card billing-top-bar" style={{
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        background: '#ffffff',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Bill Number, Format & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BILL NO:</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {currentBillNo}
            </span>
          </div>

          <span className="divider-line" style={{ height: '16px', width: '1px', background: 'var(--border-color)' }}></span>

          <div className="bill-format-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FORMAT:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              PERFORMA (Wholesale)
            </span>
          </div>

          <span className="divider-line" style={{ height: '16px', width: '1px', background: 'var(--border-color)' }}></span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>DATE & TIME:</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {formatDateTime(liveNow.toISOString())}
            </span>
          </div>
        </div>

        {/* Desktop Hotkeys Cheatsheet */}
        <div className="pos-shortcuts-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>KEYS:</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}><span className="kbd">F2</span> New Bill</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}><span className="kbd">F3</span> Customer</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}><span className="kbd">F4</span> Product Search</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}><span className="kbd">F5</span> Save &amp; Print Bill</span>
        </div>
      </div>

      {/* Customer Information & Bill Metadata Section */}
      <div className="card" style={{ padding: '1.35rem 1.5rem', background: '#ffffff' }}>
        {/* Section Header */}
        <div className="customer-card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                Customer Details (M/s Selection)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Select existing client or type billing details
              </p>
            </div>
          </div>

          {/* Customer Dropdown Quick Selector with Search Filter */}
          <div className="customer-quick-pick" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Quick Pick:</span>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem', width: '130px' }}
              placeholder="Filter customer..."
              value={custSearchQuery}
              onChange={(e) => setCustSearchQuery(e.target.value)}
            />
            <select
              className="select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', fontWeight: 600, maxWidth: '240px' }}
              value={selectedCustomerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
            >
              <option value="">-- Pick Saved Customer --</option>
              {customers
                .filter(c =>
                  !custSearchQuery ||
                  c.name.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
                  (c.mobile && c.mobile.includes(custSearchQuery))
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.address ? `(${c.address})` : ''} - {c.mobile}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Customer Form Grid */}
        <div className="customer-form-grid">
          <div>
            <label className="input-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Customer Name
            </label>
            <input
              type="text"
              className="input"
              style={{ fontWeight: 600 }}
              placeholder="e.g. M/S. K.R. TRADERS"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              City / Station / Address
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. BANGALORE"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">
              <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Mobile Number <span className="kbd navbar-btn-text" style={{ fontSize: '0.65rem', padding: '0.05rem 0.3rem' }}>F4</span>
            </label>
            <input
              ref={mobileInputRef}
              type="tel"
              className="input"
              placeholder="e.g. 9876543210"
              value={customerMobile}
              onChange={handleMobileChange}
              maxLength={10}
            />
          </div>

          <div>
            <label className="input-label">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              GSTIN / PAN (Optional)
            </label>
            <input
              type="text"
              className="input"
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              placeholder="33AAAAA0000A1Z5 (Optional)"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        {/* Bill Metadata Ribbon */}
        <div className="bill-meta-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
              Despatch / Bill Date
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
              placeholder="DD-MM-YYYY"
              value={despatchDate}
              onChange={(e) => setDespatchDate(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Invoice Document Type</label>
            <select
              className="select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', fontWeight: 700 }}
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
            >
              <option value="INVOICE">INVOICE</option>
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="ESTIMATE">ESTIMATE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Quick-Search & Select Product Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="var(--primary)" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Select Product
            </span>
            <span className="badge badge-primary">{products.length} Products Available</span>
          </div>

          {/* Category Quick Pills */}
          {categories && categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px', maxWidth: '700px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem' }}
              >
                All ({products.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`btn btn-sm ${selectedCategory === c.name ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem', whiteSpace: 'nowrap' }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="search-input-wrapper" style={{ marginBottom: '1rem' }}>
          <Search size={16} color="var(--text-muted)" className="search-input-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="input input-with-icon"
            placeholder="Search cracker product by Name, Code (SGC-01), Brand, Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Product Cards List */}
        {searchTerm.trim() === '' ? (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Search size={16} color="var(--primary)" />
              <span>Type product name or code (e.g. SGC-01) in the search box to view products</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No products found matching "{searchTerm}".</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Add new products in Products Master tab first!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredProducts.map((p) => {
              const isAdded = items.some((item) => item.id === p.id);
              const addedQty = items.find((item) => item.id === p.id)?.qty || 0;

              return (
                <div
                  key={p.id}
                  onClick={() => handleAddProductToCart(p)}
                  style={{
                    background: isAdded ? '#f0fdf4' : '#ffffff',
                    border: isAdded ? '1px solid #bbf7d0' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        border: '1px solid #fed7aa'
                      }}>
                        {p.code}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                        {p.category}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>

                    {p.tamilName && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {p.tamilName}
                      </div>
                    )}

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{p.brand}</span> • {p.packing}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{p.sellingPrice}
                      </span>
                      {p.purchasePrice && Number(p.purchasePrice) > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{p.purchasePrice}
                        </span>
                      )}
                      {p.discount > 0 && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)' }}>
                          {p.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min="1"
                      className="input"
                      style={{ width: '58px', padding: '0.25rem 0.35rem', fontSize: '0.82rem', fontWeight: 800, textAlign: 'center' }}
                      value={cardQtys[p.id] !== undefined ? cardQtys[p.id] : 1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCardQtys((prev) => ({ ...prev, [p.id]: val }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const count = cardQtys[p.id] !== undefined ? cardQtys[p.id] : 1;
                        handleAddProductToCart(p, count);
                      }}
                      className={`btn btn-sm ${isAdded ? 'btn-success' : 'btn-primary'}`}
                      style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={13} />
                      <span>{isAdded ? `Added (${addedQty})` : 'Add'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Items Table & Wholesale Settlement */}
      <div className="pos-workspace-grid">
        {/* Left: Cart Items List in Wholesale Performa Structure */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Invoice Items ({items.length}) • Total Cases: {totalCases}
              </h3>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setItems([])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
              >
                Clear Items
              </button>
            )}
          </div>

          <div className="table-container" style={{ flex: 1, minHeight: '280px' }}>
            {items.length === 0 ? (
              <div style={{
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={36} color="#cbd5e1" />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  No Cracker Items Added
                </div>
                <div style={{ fontSize: '0.8rem', maxWidth: '400px' }}>
                  Select cracker products from the Product Master list above!
                </div>
              </div>
            ) : (
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '5%' }}>S.N</th>
                    <th>Cracker Name</th>
                    <th>Category</th>
                    <th>Brand / Packing</th>
                    <th style={{ textAlign: 'right' }}>MRP (₹)</th>
                    <th style={{ textAlign: 'right' }}>Sell Price (₹)</th>
                    <th style={{ textAlign: 'center', width: '12%' }}>Qty</th>
                    <th style={{ textAlign: 'center' }}>Disc %</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    <th style={{ textAlign: 'center', width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.name}
                        </div>
                        {item.code && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '0.05rem 0.35rem',
                            borderRadius: '4px',
                            border: '1px solid #fed7aa'
                          }}>
                            {item.code}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{item.brand || 'Standard'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.packing || item.packContent || '1 Box'}</div>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        ₹{(item.mrp || item.sellingPrice || item.rate || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>
                        ₹{(item.sellingPrice || item.rate || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, -1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', fontWeight: 800 }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            style={{
                              width: '56px',
                              textAlign: 'center',
                              padding: '0.25rem 0.3rem',
                              fontWeight: 800,
                              fontSize: '0.85rem'
                            }}
                            value={item.qty}
                            onChange={(e) => handleDirectQtyChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, 1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', fontWeight: 800 }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>
                        {item.discount > 0 ? `${item.discount}%` : '0%'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                        ₹{item.total.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                    <td colSpan="6" style={{ textAlign: 'right' }}>Total Qty Items:</td>
                    <td style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.9rem' }}>{totalQty}</td>
                    <td style={{ textAlign: 'right' }}>SubTotal:</td>
                    <td style={{ textAlign: 'right', fontSize: '0.95rem', color: 'var(--primary)' }}>₹{subtotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* LIVE BILL PREVIEW CARD BELOW ITEMS TABLE */}
          <div className="card" style={{ padding: '1rem', marginTop: '1rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} color="#1e3a8a" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a' }}>Live Invoice Preview</span>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Real-time Sync</span>
            </div>

            {/* Live rendered A4 bill card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontSize: '11px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f2942', paddingBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {shop.logoUrl || shop.logo ? (
                    <img src={shop.logoUrl || shop.logo} alt="Logo" style={{ maxHeight: '42px', maxWidth: '70px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e3a8a', color: '#fbbf24', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                      {(shop.name || 'SG').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{shop.name || 'SRI GUGAN CRACKERS'}</div>
                    <div style={{ fontSize: '9px', color: '#f97316', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{shop.tagline || 'LIGHT UP YOUR CELEBRATIONS'}</div>
                    <div style={{ fontSize: '8.5px', color: '#475569', marginTop: '2px', fontWeight: '600' }}>
                      {[shop.address, shop.city, shop.pincode ? `- ${shop.pincode}` : ''].filter(Boolean).join(', ')}
                      {shop.mobile ? ` • Ph: +91 ${shop.mobile}` : ''}
                      {shop.email ? ` • ${shop.email}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px' }}>
                  <div style={{ fontWeight: '800', color: '#1e3a8a' }}>INVOICE #{currentBillNo}</div>
                  <div style={{ color: '#475569' }}>Date: {despatchDate || getTodayFormatted()}</div>
                  <div style={{ color: '#475569', fontSize: '10px', marginTop: '1px' }}>Time: {liveNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
              </div>

              {/* Customer */}
              <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '4px', margin: '0.65rem 0', display: 'flex', justifyContent: 'space-between' }}>
                <div><strong>Billed To:</strong> {customerName || 'Cash Customer'} {customerAddress ? `(${customerAddress})` : ''}</div>
                <div>{customerMobile && <span><strong>Ph:</strong> +91 {customerMobile}</span>}</div>
              </div>

              {/* Items mini table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', marginBottom: '0.65rem' }}>
                <thead>
                  <tr style={{ background: '#0f2942', color: '#ffffff' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'center' }}>S.N</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>MRP (₹)</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Sell Price (₹)</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No items added yet</td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const mrpPrice = Number(item.mrp || item.purchasePrice || item.sellingPrice || item.rate || 0);
                      const sellPrice = Number(item.sellingPrice || item.rate || 0);
                      const grossLineTotal = Number((item.qty * sellPrice).toFixed(2));

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{idx + 1}</td>
                          <td style={{ padding: '4px', fontWeight: '600' }}>{item.name}</td>
                          <td style={{ textAlign: 'right', padding: '4px', color: '#64748b' }}>₹{mrpPrice.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '4px' }}>₹{sellPrice.toFixed(2)}</td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{item.qty}</td>
                          <td style={{ textAlign: 'right', padding: '4px', fontWeight: '700' }}>₹{grossLineTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Summary */}
              {(() => {
                const totalGross = items.reduce((sum, item) => {
                  const sell = Number(item.sellingPrice || item.rate || 0);
                  return sum + (item.qty * sell);
                }, 0);
                const totalDisc = items.reduce((sum, item) => {
                  const sell = Number(item.sellingPrice || item.rate || 0);
                  const disc = Number(item.discount || 0);
                  return sum + (item.qty * sell * (disc / 100));
                }, 0);
                const finalNet = totalGross - totalDisc;

                let paymentText = '';
                if (paymentMethod === 'Split') {
                  const parts = [];
                  if (Number(splitCash) > 0) parts.push(`Cash ₹${splitCash}`);
                  if (Number(splitUpi) > 0) parts.push(`UPI ₹${splitUpi}`);
                  if (Number(splitCard) > 0) parts.push(`Card ₹${splitCard}`);
                  paymentText = parts.length > 0 ? parts.join(' | ') : `Split Pay ₹${finalNet.toFixed(2)}`;
                } else {
                  paymentText = `${paymentMethod.toUpperCase()} ₹${finalNet.toFixed(2)}`;
                }

                return (
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 10px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Subtotal:</span>
                      <strong>₹{totalGross.toFixed(2)}</strong>
                    </div>
                    {totalDisc > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', marginBottom: '2px' }}>
                        <span>Discount:</span>
                        <strong>-₹{totalDisc.toFixed(2)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f2942', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '4px' }}>
                      <div><strong>Total Items:</strong> {items.length} &nbsp;|&nbsp; <strong>Total Qty:</strong> {totalQty}</div>
                      <div style={{ fontSize: '13px', fontWeight: '900' }}>Grand Total: ₹{finalNet.toFixed(2)}</div>
                    </div>

                    {/* Payment Mode Status Indicator */}
                    <div style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#166534',
                      fontWeight: '700'
                    }}>
                      <span>{paymentText}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>PAID</span>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#16a34a',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>✓</span>
                      </div>
                    </div>

                    {/* Thank you note */}
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', fontStyle: 'italic', color: '#1e3a8a', fontWeight: '700' }}>
                      {shop.footerMessage || 'Thank You! Visit Again...'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right: Payment Method & Totals Breakdown (Matching Reference Image) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Payment Method Selector */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Mode
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
              {['Cash', 'UPI', 'Card', 'Credit', 'Split'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  style={{
                    padding: '0.45rem 0.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === mode ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === mode ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === mode ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                >
                  {mode === 'Cash' && <Coins size={14} />}
                  {mode === 'UPI' && <Smartphone size={14} />}
                  {mode === 'Card' && <CreditCard size={14} />}
                  {mode === 'Credit' && <Wallet size={14} />}
                  {mode === 'Split' && <Layers size={14} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>

            {/* Split Payment inputs if selected */}
            {paymentMethod === 'Split' && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.65rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Split Payment Breakdown (Net: ₹{netAmount}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>Cash:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>UPI:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitUpi}
                      onChange={(e) => setSplitUpi(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>Card:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitCard}
                      onChange={(e) => setSplitCard(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill Net Total Summary & Action Buttons */}
          <div className="card" style={{ padding: '1.25rem', background: '#ffffff' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid var(--border-color)',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Net Total:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Bill Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => handleSaveBill(true)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem' }}
                disabled={items.length === 0}
              >
                <Printer size={18} />
                <span>SAVE &amp; PRINT BILL (F5)</span>
              </button>

              <button
                onClick={() => handleSaveBill(false)}
                className="btn btn-success"
                style={{ width: '100%', fontWeight: 700 }}
                disabled={items.length === 0}
              >
                <Save size={16} />
                <span>Save Only</span>
              </button>

              <button
                onClick={handleResetBill}
                className="btn btn-outline"
                style={{ fontWeight: 600, color: 'var(--danger)', borderColor: '#fca5a5' }}
              >
                <RotateCcw size={15} />
                <span>Clear Bill Screen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
