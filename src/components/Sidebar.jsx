import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Boxes,
  FileText,
  Users,
  History,
  Truck,
  Building2,
  BarChart3,
  Settings,
  Lock,
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    products,
    shop,
    isMobileMenuOpen,
    closeMobileMenu
  } = useApp();

  // Count low stock items
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minimumStock
  ).length;

  const menuItems = [
    { id: 'dashboard', label: "Dashboard", icon: LayoutDashboard },
    { id: 'billing', label: "Quick Billing", icon: ReceiptText, badge: 'F2' },
    { id: 'products', label: "Products Master", icon: Package },
    { id: 'pricelist', label: "Price List", icon: FileText },
    {
      id: 'stock',
      label: "Stock & Alerts",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeType: 'danger'
    },
    { id: 'customers', label: "Customers", icon: Users },
    { id: 'sales', label: "Sales History", icon: History },
    { id: 'purchases', label: "Stock Inward", icon: Truck },
    { id: 'suppliers', label: "Suppliers", icon: Building2 },
    {
      id: 'reports',
      label: "Reports & Profit",
      icon: BarChart3,
      adminOnly: true
    },
    {
      id: 'settings',
      label: "Shop Settings",
      icon: Settings,
      adminOnly: true
    }
  ];

  return (
    <>
      {/* Dark Backdrop Overlay on Mobile */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 999
          }}
        />
      )}

      <aside
        className={`no-print sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}
        style={{
          width: '240px',
          height: '100vh',
          background: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          userSelect: 'none',
          overflowY: 'auto'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0
            }}>
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              ) : (
                <Flame size={20} />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {shop.name || 'Sri Gugan'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Billing &amp; Inventory
              </div>
            </div>
          </div>

          {/* Close drawer button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="mobile-menu-toggle btn btn-secondary btn-sm"
            style={{ padding: '0.25rem', borderRadius: '6px' }}
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <div style={{
            padding: '0.25rem 0.75rem 0.5rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-light)'
          }}>
            Main Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.adminOnly && currentUser.role !== 'admin';

            return (
              <button
                key={item.id}
                disabled={isLocked}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 600,
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : (isLocked ? 'var(--text-light)' : 'var(--text-secondary)'),
                  border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isLocked) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isLocked) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <Icon
                    size={17}
                    color={isActive ? 'var(--primary)' : (isLocked ? '#cbd5e1' : '#64748b')}
                  />
                  <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                </div>

                {isLocked ? (
                  <Lock size={12} color="#cbd5e1" title="Admin only" />
                ) : item.badge ? (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      background: item.badgeType === 'danger' ? '#fef2f2' : '#f1f5f9',
                      color: item.badgeType === 'danger' ? '#dc2626' : 'var(--text-muted)',
                      border: item.badgeType === 'danger' ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Low Stock Alert Footer Banner */}
        {lowStockCount > 0 && (
          <div style={{
            margin: '0.75rem',
            padding: '0.75rem',
            background: 'var(--danger-light)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={() => setActiveTab('stock')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.78rem' }}>
              <AlertTriangle size={15} />
              <span>{lowStockCount} Low Stock Items</span>
            </div>
          </div>
        )}

        {/* User Info Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.name}</span>
            <div style={{ fontSize: '0.68rem', textTransform: 'capitalize', color: 'var(--primary)', fontWeight: 600 }}>
              {currentUser.role} Role
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
