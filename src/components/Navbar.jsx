import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  UserCheck,
  Clock,
  Sparkles,
  FileText,
  Menu
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const Navbar = () => {
  const {
    currentUser,
    switchRole,
    shop,
    activeTab,
    setActiveTab,
    toggleMobileMenu
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'billing': return 'Quick Billing';
      case 'products': return 'Products Inventory';
      case 'pricelist': return 'Cracker Price List';
      case 'stock': return 'Stock & Inventory Alerts';
      case 'customers': return 'Customer Directory';
      case 'sales': return 'Sales Bill History';
      case 'purchases': return 'Stock Inward Receipts';
      case 'suppliers': return 'Suppliers Directory';
      case 'reports': return 'Financial Reports & Analytics';
      case 'settings': return 'System & Shop Settings';
      default: return 'Gugan Billing';
    }
  };

  return (
    <header className="no-print navbar-container" style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '0.75rem'
    }}>
      {/* Left: Mobile Toggle + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-toggle btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.45rem', borderRadius: '8px', flexShrink: 0 }}
          title="Open Menu"
        >
          <Menu size={18} color="var(--primary)" />
        </button>

        <div style={{ overflow: 'hidden' }}>
          <h1 className="navbar-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {getPageTitle()}
          </h1>
          <p className="navbar-subtitle" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {shop.name} • {shop.city || 'Sivakasi'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('billing')}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.35rem', fontWeight: 700, padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
          title="F2: Open Quick Billing"
        >
          <Sparkles size={14} />
          <span className="navbar-btn-text">New Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('pricelist')}
          className="btn btn-secondary btn-sm navbar-btn-text"
          style={{ gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
        >
          <FileText size={14} color="var(--primary)" />
          <span>Price List</span>
        </button>

        {/* Real-time Clock */}
        <div className="navbar-clock" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontWeight: 600
        }}>
          <Clock size={14} color="var(--primary)" />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 700 }}>{timeString}</span>
        </div>

        {/* Role Switcher Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f1f5f9',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => switchRole('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.15rem 0.45rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: currentUser.role === 'admin' ? '#ffffff' : 'transparent',
              color: currentUser.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentUser.role === 'admin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={11} />
            <span>Admin</span>
          </button>
          <button
            onClick={() => switchRole('cashier')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.15rem 0.45rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: currentUser.role === 'cashier' ? '#ffffff' : 'transparent',
              color: currentUser.role === 'cashier' ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: currentUser.role === 'cashier' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={11} />
            <span>Staff</span>
          </button>
        </div>
      </div>
    </header>
  );
};
