import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Search, Phone, MapPin, Receipt, History, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Customers = () => {
  const { customers, sales, addCustomer, setActiveTab, triggerPrintBill, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustHistory, setSelectedCustHistory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    gstin: '',
    creditBalance: 0
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      mobile: '',
      address: '',
      gstin: '',
      creditBalance: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      showToast('Customer Name and Mobile are required!', 'error');
      return;
    }
    addCustomer(formData);
    setIsModalOpen(false);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile && c.mobile.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Customer Directory</span>
            <span className="badge badge-primary">{customers.length} Customers</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Customer database table. Customers typed during billing auto-save here in real-time.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search customer by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Table Format */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>City / Address</th>
                <th>GSTIN</th>
                <th style={{ textAlign: 'right' }}>Total Billed (₹)</th>
                <th style={{ textAlign: 'center' }}>Total Bills</th>
                <th style={{ textAlign: 'center', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>No Customers Found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Customers are saved automatically during billing, or click "Add Customer" to register.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const custBills = sales.filter((s) => s.customerMobile === c.mobile || s.customerName === c.name);

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {c.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          <Phone size={13} color="var(--primary)" />
                          <span>{c.mobile}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {c.address || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {c.gstin || '-'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>
                        {formatCurrency(c.totalBilled || 0)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {c.totalBills || custBills.length} Bills
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => setSelectedCustHistory({ customer: c, bills: custBills })}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '0.25rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            title="View Customer Bills History"
                          >
                            <History size={13} />
                            <span>Bills ({custBills.length})</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('billing')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            title="New Bill"
                          >
                            New Bill
                          </button>
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

      {/* Customer Bill History Modal */}
      {selectedCustHistory && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <History size={18} color="var(--primary)" />
                <span>Purchase Bills History: {selectedCustHistory.customer.name} ({selectedCustHistory.customer.mobile})</span>
              </div>
              <button onClick={() => setSelectedCustHistory(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div className="modal-body">
              {selectedCustHistory.bills.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>No Bills Recorded Yet</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Bills generated for this customer will appear here automatically.</div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date &amp; Time</th>
                        <th>Items</th>
                        <th>Payment</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ textAlign: 'center' }}>Preview &amp; Print</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustHistory.bills.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                            {b.invoiceNo}
                          </td>
                          <td>{formatDate(b.date)}</td>
                          <td>{b.items ? b.items.length : 0} items</td>
                          <td>
                            <span className="badge badge-neutral">{b.paymentMode || b.paymentMethod || 'Cash'}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(b.grandTotal || b.netAmount || 0)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => triggerPrintBill(b)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.3rem 0.6rem', gap: '0.25rem', fontSize: '0.75rem' }}
                            >
                              <Receipt size={13} />
                              <span>Preview Bill</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedCustHistory(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Users size={18} color="var(--primary)" />
                <span>Add New Customer</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. M/S. K.R. TRADERS"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="e.g. 9842154321"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">City / Address</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. BANGALORE"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">GSTIN / PAN (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
