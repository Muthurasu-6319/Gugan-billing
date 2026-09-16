import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Receipt,
  Boxes,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  Sparkles,
  Printer,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatCurrencyNoDec } from '../utils/formatters';

export const Dashboard = () => {
  const {
    shop,
    sales,
    products,
    setActiveTab,
    triggerPrintBill
  } = useApp();

  // Calculate Today's Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const isTodayDate = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.getTime() >= todayStart;
    }
    const parts = String(dateVal).split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2].slice(0, 4), 10);
      const parsed = new Date(year, month, day).getTime();
      return !isNaN(parsed) && parsed >= todayStart;
    }
    return false;
  };

  const isThisMonthDate = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.getTime() >= thisMonthStart;
    }
    const parts = String(dateVal).split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2].slice(0, 4), 10);
      const parsed = new Date(year, month, day).getTime();
      return !isNaN(parsed) && parsed >= thisMonthStart;
    }
    return false;
  };

  const todaySales = sales.filter((s) => isTodayDate(s.date) || isTodayDate(s.createdAt));
  const monthSales = sales.filter((s) => isThisMonthDate(s.date) || isThisMonthDate(s.createdAt));

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + (Number(s.grandTotal) || Number(s.netAmount) || Number(s.subTotal) || 0), 0);
  const monthSalesTotal = monthSales.reduce((sum, s) => sum + (Number(s.grandTotal) || Number(s.netAmount) || Number(s.subTotal) || 0), 0);
  const todayBillsCount = todaySales.length;

  // Collection breakdown (Cash, UPI, Card)
  let cashCol = 0;
  let upiCol = 0;
  let cardCol = 0;

  todaySales.forEach((s) => {
    const pm = (s.paymentMethod || s.paymentMode || 'Cash').toString().trim().toLowerCase();
    const amount = Number(s.grandTotal) || Number(s.netAmount) || Number(s.subTotal) || 0;

    if (pm.includes('upi') || pm.includes('gpay') || pm.includes('phonepe') || pm.includes('online')) {
      upiCol += amount;
    } else if (pm.includes('card') || pm.includes('swipe') || pm.includes('credit') || pm.includes('debit')) {
      cardCol += amount;
    } else if (pm.includes('split') && s.splitDetails) {
      cashCol += Number(s.splitDetails.cash) || 0;
      upiCol += Number(s.splitDetails.upi) || 0;
      cardCol += Number(s.splitDetails.card) || 0;
    } else {
      cashCol += amount;
    }
  });

  const todayCollectionTotal = cashCol + upiCol + cardCol;

  // Low stock and out of stock items
  const lowStockItems = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minimumStock);
  const outOfStockItems = products.filter((p) => p.currentStock <= 0);

  // Recent 5 bills
  const recentBills = sales.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Sleek Hero Welcome Banner */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back to {shop.name}!
            </h2>
            <span className="badge badge-primary">POS Active</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', fontWeight: 500 }}>
            Here is your sales summary &amp; stock overview for today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('billing')} className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
            <Sparkles size={18} />
            <span>New Bill (F2)</span>
          </button>
          <button onClick={() => setActiveTab('stock')} className="btn btn-secondary btn-lg" style={{ gap: '0.5rem' }}>
            <Boxes size={18} />
            <span>Check Inventory</span>
          </button>
        </div>
      </div>

      {/* Primary 4 KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* 1. Today's Revenue */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Today's Sales</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(todaySalesTotal)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {todayBillsCount} total bills generated
          </div>
        </div>

        {/* 2. Today's Collection */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Collection</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
            {formatCurrency(todayCollectionTotal)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Cash &amp; Digital payments
          </div>
        </div>

        {/* 3. Monthly Sales */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>This Month Sales</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrencyNoDec(monthSalesTotal)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {monthSales.length} monthly transactions
          </div>
        </div>

        {/* 4. Stock Alerts */}
        <div
          className="card"
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '1.35rem',
            cursor: 'pointer',
            borderColor: lowStockItems.length > 0 ? '#fca5a5' : 'var(--border-color)',
            background: lowStockItems.length > 0 ? '#fef2f2' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: lowStockItems.length > 0 ? '#b91c1c' : 'var(--text-muted)' }}>
              Stock Alerts
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.02em' }}>
            {lowStockItems.length + outOfStockItems.length} Items
          </div>
          <div style={{ fontSize: '0.78rem', color: lowStockItems.length > 0 ? '#b91c1c' : 'var(--text-muted)', marginTop: '0.35rem' }}>
            {outOfStockItems.length} out of stock
          </div>
        </div>
      </div>

      {/* Collection Split Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 1rem' }}>
          Today's Collection Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cash Received</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>
              {formatCurrency(cashCol)}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>UPI (GPay / PhonePe)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e40af', marginTop: '0.25rem' }}>
              {formatCurrency(upiCol)}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Card Swipe</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6b21a8', marginTop: '0.25rem' }}>
              {formatCurrency(cardCol)}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Recent Bills & Low Stock Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Sales Bills */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Recent Invoices
            </h3>
            <button onClick={() => setActiveTab('sales')} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'center' }}>Print</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.invoiceNo}</td>
                    <td style={{ fontWeight: 600 }}>{b.customerName || 'Cash Customer'}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(b.grandTotal)}</td>
                    <td><span className="badge badge-blue">{b.paymentMethod}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => triggerPrintBill(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Printer size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Stock Alerts Watchlist
            </h3>
            <button onClick={() => setActiveTab('stock')} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
              <span>Manage Stock</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              All inventory levels are healthy!
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'center' }}>Stock</th>
                    <th style={{ textAlign: 'center' }}>Min</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: prod.currentStock <= 0 ? 'var(--danger)' : 'var(--warning)' }}>
                        {prod.currentStock} {prod.unit}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{prod.minimumStock}</td>
                      <td>
                        {prod.currentStock <= 0 ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : (
                          <span className="badge badge-warning">Low Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
