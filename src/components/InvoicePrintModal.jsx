import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  X,
  User,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime, numberToWordsIndian, formatCurrency } from '../utils/formatters';

export const InvoicePrintModal = () => {
  const { shop, activeInvoiceForPrint, isPrintModalOpen, setIsPrintModalOpen } = useApp();
  // Default to A4 Executive or the bill's saved format
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4', 'performa', 'thermal'

  useEffect(() => {
    setPrintFormat('a4');
  }, [activeInvoiceForPrint]);

  // Trigger browser print dialog when opened via Save & Print or Print click
  useEffect(() => {
    if (isPrintModalOpen && activeInvoiceForPrint && activeInvoiceForPrint.autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrintModalOpen, activeInvoiceForPrint]);

  if (!isPrintModalOpen || !activeInvoiceForPrint) return null;

  const inv = activeInvoiceForPrint;

  const handlePrint = () => {
    window.print();
  };

  // Financial calculations with robust fallbacks
  const subtotal = Number(inv.subtotal) || 0;
  const totalCases = inv.totalCases !== undefined
    ? Number(inv.totalCases)
    : (inv.items ? inv.items.reduce((sum, i) => sum + (Number(i.cases) || 0), 0) : 0);

  const totalQty = inv.totalQty !== undefined
    ? Number(inv.totalQty)
    : (inv.items ? inv.items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0) : 0);

  const pfPercent = inv.pfPercent !== undefined ? Number(inv.pfPercent) : 3;
  const pfAmount = inv.pfAmount !== undefined
    ? Number(inv.pfAmount)
    : Number(((subtotal * pfPercent) / 100).toFixed(2));

  const taxPercent = inv.taxPercent !== undefined ? Number(inv.taxPercent) : (shop.defaultTaxRate || 6.5);
  const taxBase = subtotal + pfAmount;
  const taxAmount = inv.taxTotal !== undefined
    ? Number(inv.taxTotal)
    : Number(((taxBase * taxPercent) / 100).toFixed(2));

  const rawNetAmount = taxBase + taxAmount;
  const netAmount = inv.netAmount !== undefined
    ? Number(inv.netAmount)
    : (inv.grandTotal !== undefined ? Number(inv.grandTotal) : Math.round(rawNetAmount));

  const roundOff = inv.roundOff !== undefined
    ? Number(inv.roundOff)
    : Number((netAmount - rawNetAmount).toFixed(2));

  const commissionPercent = inv.commissionPercent !== undefined ? Number(inv.commissionPercent) : 3;
  const commissionAmount = inv.commissionAmount !== undefined
    ? Number(inv.commissionAmount)
    : Math.round((subtotal * commissionPercent) / 100);

  const netBalance = inv.netBalance !== undefined
    ? Number(inv.netBalance)
    : (netAmount - commissionAmount);

  // Pad items for authentic paper billing look
  const emptyRowsCountPerforma = Math.max(0, 10 - (inv.items ? inv.items.length : 0));
  const emptyRowsPerforma = Array.from({ length: emptyRowsCountPerforma });

  const emptyRowsCountA4 = Math.max(0, 6 - (inv.items ? inv.items.length : 0));
  const emptyRowsA4 = Array.from({ length: emptyRowsCountA4 });

  // UPI payment payload for QR Code
  const upiId = shop.upiId || 'fireworks@upi';
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shop.name || 'Sri Gugan Crackers')}&am=${netAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${inv.invoiceNo}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=1&data=${encodeURIComponent(upiPayLink)}`;

  // Shop details with safe fallbacks
  const shopAddress = shop.address || 'Sattur Road, Near Bus Stand';
  const shopCity = shop.city || 'Sivakasi';
  const shopDistrict = shop.district || 'Virudhunagar';
  const shopState = shop.state || 'Tamil Nadu';
  const shopPincode = shop.pincode || '626123';
  const shopPhone = shop.mobile || '94431 23456';
  const shopAltPhone = shop.altMobile || '98421 23456';
  const shopEmail = shop.email || 'billing@fireworks.com';
  const shopWebsite = shop.website || '';
  const shopGstin = shop.gstin || '33AAAAA0000A1Z5';

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth: printFormat === 'thermal' ? '460px' : '920px', width: '100%' }}>
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={20} color="var(--primary)" />
            <span>Bill Print Preview #{inv.invoiceNo}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="modal-body" style={{ background: '#cbd5e1', padding: '1.25rem', overflowY: 'auto' }}>
          {printFormat === 'a4' ? (
            /* ==========================================================
               1. EXECUTIVE A4 MASTER BILL TEMPLATE (MATCHING REFERENCE DESIGN)
               ========================================================== */
            <div
              id="printable-invoice"
              style={{
                width: '100%',
                maxWidth: '820px',
                margin: '0 auto',
                background: '#ffffff',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#1e293b',
                padding: '0',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative Header Sparkles Background */}
              <div style={{ padding: '1.5rem 1.75rem 1rem 1.75rem' }}>
                {/* TOP BAR: Logo + Title + Tagline & Trust Badges */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  {/* Left: Brand Logo & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt="Logo"
                        style={{ maxHeight: '65px', maxWidth: '110px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b',
                        fontWeight: '900',
                        fontSize: '20px',
                        boxShadow: '0 4px 10px rgba(30,58,138,0.3)',
                        border: '2px solid #fbbf24'
                      }}>
                        SG
                      </div>
                    )}
                    <div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#0f172a',
                        letterSpacing: '0.04em',
                        lineHeight: '1.1',
                        fontFamily: "'Outfit', 'Inter', sans-serif"
                      }}>
                        {shop.name || 'SRI GUGAN CRACKERS'}
                      </div>
                      <div style={{
                        fontSize: '10.5px',
                        fontWeight: '800',
                        color: '#f97316',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginTop: '3px'
                      }}>
                        {shop.tagline || 'LIGHT UP YOUR CELEBRATIONS'}
                      </div>

                      {/* Shop Address & Contact Details */}
                      <div style={{ fontSize: '10px', color: '#334155', marginTop: '6px', lineHeight: '1.4', fontWeight: '500' }}>
                        <div>
                          <strong>Address:</strong> {[shop.address, shop.city, shop.pincode ? `- ${shop.pincode}` : '', shop.district ? `${shop.district} Dist` : '', shop.state].filter(Boolean).join(', ')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span><strong>Ph:</strong> +91 {shopPhone}{shopAltPhone && shopAltPhone !== shopPhone ? ` / ${shopAltPhone}` : ''}</span>
                          {shopEmail && <span>| <strong>Email:</strong> {shopEmail}</span>}
                          {shopWebsite && <span>| <strong>Web:</strong> {shopWebsite}</span>}
                          {shopGstin && <span>| <strong>GSTIN:</strong> {shopGstin}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Premium Quality Tagline & Badges */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e3a8a', fontStyle: 'italic' }}>
                      Premium Quality Crackers
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#475569', fontStyle: 'italic' }}>
                      for a Brighter Tomorrow
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', fontSize: '10px', color: '#1e3a8a', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'flex-end', gap: '4px' }}>
                        <CheckCircle2 size={12} color="#0284c7" />
                        <span>Safe &amp; Reliable</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'flex-end', gap: '4px' }}>
                        <Sparkles size={12} color="#0284c7" />
                        <span>Wide Range</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'flex-end', gap: '4px' }}>
                        <ShieldCheck size={12} color="#0284c7" />
                        <span>Best Prices</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INVOICE Title & Subtitle + Date Box */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color: '#1e3a8a',
                      margin: 0,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      INVOICE
                    </h1>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
                      Thank you for your purchase!
                    </div>
                    <div style={{ height: '3px', width: '45px', background: '#f97316', borderRadius: '2px', marginTop: '6px' }}></div>
                  </div>

                  {/* Meta Box (Invoice No, Date, Time) */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    minWidth: '220px'
                  }}>
                    <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 0' }}>Invoice No</td>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 6px' }}>:</td>
                          <td style={{ fontWeight: '700', color: '#334155', textAlign: 'right' }}>{inv.invoiceNo}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 0' }}>Date</td>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 6px' }}>:</td>
                          <td style={{ fontWeight: '700', color: '#334155', textAlign: 'right' }}>
                            {inv.date ? inv.date.split('T')[0] : (inv.despatchDate || getTodayFormatted())}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 0' }}>Time</td>
                          <td style={{ color: '#1e3a8a', fontWeight: '700', padding: '2px 6px' }}>:</td>
                          <td style={{ fontWeight: '700', color: '#334155', textAlign: 'right' }}>
                            {inv.date && inv.date.includes('T') ? new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '07:45 PM'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Customer Details Card */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '1.25rem',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#1e3a8a',
                    marginBottom: '6px'
                  }}>
                    <User size={14} color="#1e3a8a" />
                    <span>Customer Details</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '11.5px', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#1e3a8a', fontWeight: '700', minWidth: '55px' }}>Name</span>
                      <span style={{ color: '#1e3a8a', fontWeight: '700' }}>:</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{inv.customerName || 'Cash Customer'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#1e3a8a', fontWeight: '700', minWidth: '55px' }}>Phone</span>
                      <span style={{ color: '#1e3a8a', fontWeight: '700' }}>:</span>
                      <span style={{ color: '#334155' }}>{inv.customerMobile || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#1e3a8a', fontWeight: '700', minWidth: '55px' }}>Address</span>
                      <span style={{ color: '#1e3a8a', fontWeight: '700' }}>:</span>
                      <span style={{ color: '#334155' }}>{inv.customerAddress || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* ITEMS TABLE (Matching Reference Image Dark Blue Header) */}
                <div style={{ borderRadius: '6px 6px 0 0', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    textAlign: 'left'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#0f2942',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '10.5px'
                      }}>
                        <th style={{ width: '5%', padding: '8px 6px', textAlign: 'center' }}>S.N</th>
                        <th style={{ width: '25%', padding: '8px 8px' }}>Cracker Name</th>
                        <th style={{ width: '18%', padding: '8px 8px' }}>Category</th>
                        <th style={{ width: '15%', padding: '8px 8px' }}>Brand / Packing</th>
                        <th style={{ width: '10%', padding: '8px 6px', textAlign: 'right' }}>MRP (₹)</th>
                        <th style={{ width: '10%', padding: '8px 6px', textAlign: 'right' }}>Sell Price (₹)</th>
                        <th style={{ width: '5%', padding: '8px 4px', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '6%', padding: '8px 4px', textAlign: 'center' }}>Disc %</th>
                        <th style={{ width: '12%', padding: '8px 8px', textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items && inv.items.map((item, idx) => {
                        const mrpVal = Number(item.mrp || item.purchasePrice || item.sellingPrice || item.rate || 0);
                        const sellVal = Number(item.sellingPrice || item.rate || 0);
                        const discVal = Number(item.discount || 0);
                        const lineGross = Number((item.qty * sellVal).toFixed(2));

                        return (
                          <tr key={idx} style={{
                            borderBottom: '1px solid #e2e8f0',
                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            height: '26px'
                          }}>
                            <td style={{ textAlign: 'center', padding: '4px', color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '4px 8px', fontWeight: '600', color: '#0f172a' }}>{item.name}</td>
                            <td style={{ padding: '4px 8px', color: '#475569' }}>{item.category || 'Standard'}</td>
                            <td style={{ padding: '4px 8px', color: '#475569' }}>{item.brand || item.packing || item.packContent || 'Standard Pack'}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px', color: '#64748b' }}>{mrpVal.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: '600', color: '#0f172a' }}>{sellVal.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', padding: '4px' }}>{item.qty}</td>
                            <td style={{ textAlign: 'center', padding: '4px', color: '#475569' }}>{discVal > 0 ? `${discVal}%` : '0%'}</td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '700', color: '#0f172a' }}>{lineGross.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM SUMMARY SPLIT (Terms on Left, Summary Box on Right) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 280px',
                  gap: '1.25rem',
                  marginTop: '1.25rem',
                  alignItems: 'end'
                }}>
                  {/* Left Terms & Conditions */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    background: '#ffffff'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#1e3a8a',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#1e3a8a',
                        color: '#ffffff',
                        fontSize: '9px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>i</div>
                      <span>Terms &amp; Conditions</span>
                    </div>

                    <ul style={{
                      margin: 0,
                      paddingLeft: '14px',
                      fontSize: '9.5px',
                      color: '#475569',
                      lineHeight: '1.4'
                    }}>
                      {shop.terms ? (
                        shop.terms.split('\n').filter(Boolean).map((t, idx) => <li key={idx}>{t}</li>)
                      ) : (
                        <>
                          <li>Goods once sold will not be taken back or exchanged.</li>
                          <li>Use crackers in a safe and open place under adult supervision.</li>
                          <li>Follow safety instructions while bursting fireworks.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Right Summary Table */}
                  {(() => {
                    const grossTotal = inv.items ? inv.items.reduce((sum, item) => {
                      const sell = Number(item.sellingPrice || item.rate || 0);
                      return sum + (item.qty * sell);
                    }, 0) : subtotal;

                    const totalDiscount = inv.items ? inv.items.reduce((sum, item) => {
                      const sell = Number(item.sellingPrice || item.rate || 0);
                      const disc = Number(item.discount || 0);
                      return sum + (item.qty * sell * (disc / 100));
                    }, 0) : 0;

                    const grandNet = grossTotal - totalDiscount;

                    return (
                      <div style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 12px', fontWeight: '700', color: '#1e3a8a' }}>Total Qty</td>
                              <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{totalQty}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 12px', fontWeight: '700', color: '#1e3a8a' }}>Subtotal</td>
                              <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>₹ {grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 12px', fontWeight: '700', color: '#1e3a8a' }}>Discount</td>
                              <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>-₹ {totalDiscount.toFixed(2)}</td>
                            </tr>
                            <tr style={{ background: '#0f2942', color: '#ffffff' }}>
                              <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '800' }}>Grand Total</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '15px', fontWeight: '900' }}>₹ {grandNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr style={{ background: '#f0fdf4', color: '#166534', borderTop: '1px solid #bbf7d0' }}>
                              <td style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800' }}>Payment Status</td>
                              <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800' }}>
                                ✓ {(inv.paymentMethod || 'CASH').toUpperCase()} ₹ {grandNet.toFixed(2)} (PAID)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                {/* SIGNATURE GREETING "Thank You! Visit Again..." */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '1.25rem',
                  paddingRight: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '26px',
                      fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
                      color: '#1e3a8a',
                      fontWeight: 'bold',
                      lineHeight: '1'
                    }}>
                      Thank You!
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em', marginTop: '2px' }}>
                      Visit Again...
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* DARK BLUE FOOTER BAR */}
              <div style={{
                background: '#0f2942',
                color: '#ffffff',
                padding: '8px 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11.5px',
                fontWeight: '600'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#f97316" />
                  <span>{shop.name || 'Sri Gugan Crackers'} &nbsp;|&nbsp; {[shop.address, shop.city].filter(Boolean).join(', ')} &nbsp;|&nbsp; Ph: +91 {shopPhone}</span>
                </div>
                <div style={{ opacity: 0.9, fontSize: '10.5px' }}>
                  {shopWebsite ? <span>Web: {shopWebsite} &nbsp;|&nbsp; </span> : ''}
                  {shopEmail ? `Email: ${shopEmail}` : ''}
                </div>
              </div>
            </div>
          ) : printFormat === 'performa' ? (
            /* ==========================================================
               2. PERFORMA / WHOLESALE BILL (WITH COMPLETE SHOP ADDRESS & LOGO)
               ========================================================== */
            <div
              id="printable-invoice"
              className="performa-invoice"
              style={{
                width: '100%',
                maxWidth: '790px',
                minHeight: '1020px',
                margin: '0 auto',
                background: '#ffffff',
                border: '1.5px solid #000000',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                position: 'relative'
              }}
            >
              {/* Document Header Title */}
              <div style={{
                position: 'relative',
                padding: '8px 16px',
                textAlign: 'center',
                borderBottom: '1.5px solid #000000',
                background: '#f8fafc'
              }}>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}>
                  {(inv.billTitle && inv.billTitle !== 'PERFORMA') ? inv.billTitle : 'INVOICE'}
                </div>
              </div>

              {/* Shop Full Details Banner in Wholesale Performa */}
              <div style={{
                padding: '6px 14px',
                borderBottom: '1.5px solid #000000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#ffffff'
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {shop.name || 'SRI GUGAN CRACKERS'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#000000', marginTop: '1px' }}>
                    {shopAddress}, {shopCity} - {shopPincode}, {shopDistrict} Dist, {shopState}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#000000' }}>
                    <strong>Ph:</strong> +91 {shopPhone} {shopAltPhone ? ` / ${shopAltPhone}` : ''} | <strong>Email:</strong> {shopEmail}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                  <div>GSTIN: <span style={{ fontFamily: 'monospace' }}>{shopGstin}</span></div>
                  <div>State Code: 33 (TN)</div>
                </div>
              </div>

              {/* Top Customer Info and Logo Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                borderBottom: '1.5px solid #000000'
              }}>
                {/* Left Side: M/s Customer, City, GSTIN/PAN */}
                <div style={{
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: 'normal' }}>M/s : </span>
                      <strong style={{ fontSize: '14px', letterSpacing: '0.02em' }}>
                        {inv.customerName || 'M/S.K.R.ENTERPRISE'}
                      </strong>
                    </div>
                    <div style={{ paddingLeft: '38px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                      {inv.customerAddress || 'BANGALORE'}
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid #000000',
                    marginTop: '8px',
                    paddingTop: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>
                      GSTIN / PAN : <span style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.04em' }}>{inv.customerGstin || '29ATGPM1120L2ZN'}</span>
                    </span>
                    {inv.customerMobile && (
                      <span>Ph: +91 {inv.customerMobile}</span>
                    )}
                  </div>
                </div>

                {/* Right Side: Boxed Logo Frame */}
                <div style={{
                  borderLeft: '1.5px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 8px',
                  background: '#ffffff',
                  minHeight: '85px',
                  textAlign: 'center'
                }}>
                  <img
                    src={shop.logo || '/logo.png'}
                    alt="Logo"
                    style={{
                      maxHeight: '74px',
                      maxWidth: '125px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    letterSpacing: '0.04em',
                    marginTop: '2px',
                    color: '#000000',
                    lineHeight: 1.1
                  }}>
                    {shop.name || 'SRI GUGAN CRACKERS'}
                  </div>
                </div>
              </div>

              {/* Table with continuous vertical borders running down */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  color: '#000000',
                  flex: 1
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '1.5px solid #000000',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      <th style={{ width: '5%', padding: '6px 4px', borderRight: '1px solid #000000' }}>S.N</th>
                      <th style={{ width: '33%', padding: '6px 6px', textAlign: 'left', borderRight: '1px solid #000000' }}>Product name</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Cases</th>
                      <th style={{ width: '11%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Pack<br />Content</th>
                      <th style={{ width: '7%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Qty</th>
                      <th style={{ width: '10%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Rate</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Disc.%</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Per</th>
                      <th style={{ width: '10%', padding: '6px 6px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Billed Items */}
                    {inv.items && inv.items.map((item, idx) => (
                      <tr key={idx} style={{ height: '28px', verticalAlign: 'middle' }}>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {idx + 1}
                        </td>
                        <td style={{ textAlign: 'left', padding: '4px 6px', borderRight: '1px solid #000000', fontWeight: 'bold' }}>
                          {item.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.cases || 1}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.packContent || (item.packing || '18 BOX')}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', borderRight: '1px solid #000000' }}>
                          {item.qty}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', borderRight: '1px solid #000000' }}>
                          {Number(item.rate).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.discount ? Number(item.discount).toFixed(2) : '0.00'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.per || '1 BOX'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                          {Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Extended Empty Rows to Maintain Vertical Gridlines down the Page */}
                    {emptyRowsPerforma.map((_, i) => (
                      <tr key={`empty-perf-${i}`} style={{ height: '28px' }}>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Row directly above bottom boxes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '38% 8% 44% 10%',
                borderTop: '1.5px solid #000000',
                borderBottom: '1.5px solid #000000',
                fontSize: '12px',
                fontWeight: 'bold',
                lineHeight: '26px'
              }}>
                <div style={{ textAlign: 'right', paddingRight: '10px', borderRight: '1px solid #000000' }}>
                  Total Cases
                </div>
                <div style={{ textAlign: 'center', borderRight: '1px solid #000000' }}>
                  {totalCases}
                </div>
                <div style={{ textAlign: 'right', paddingRight: '14px', borderRight: '1px solid #000000' }}>
                  SubTotal
                </div>
                <div style={{ textAlign: 'right', paddingRight: '6px' }}>
                  {subtotal.toFixed(2)}
                </div>
              </div>

              {/* Bottom Footer Split Section (Dispatch Details & Financial Summary) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 280px',
                minHeight: '175px'
              }}>
                {/* Left Box: Order No, Despatch date, Transport, Agent, Amount in Words */}
                <div style={{
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {inv.orderNo && (
                      <div>
                        <strong>Order No &nbsp; &nbsp; &nbsp; &nbsp;:</strong> {inv.orderNo}
                      </div>
                    )}
                    <div>
                      <strong>Date &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong> {inv.despatchDate || formatDateTime(inv.date)}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#1e293b' }}>
                      <strong>Words:</strong> {numberToWordsIndian(netAmount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingTop: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#1e293b' }}>Page 1</div>
                    <div style={{ fontSize: '10px', borderTop: '1px dashed #000000', paddingTop: '2px', fontWeight: 'bold' }}>
                      Authorized Signatory
                    </div>
                  </div>
                </div>

                {/* Right Box: P&F, TAX, Round off, Net amount, Comission, Net Balance */}
                <div style={{
                  borderLeft: '1.5px solid #000000',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 0' }}>P &amp; F {pfPercent} %</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{pfAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0' }}>TAX ({taxPercent}%)</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0' }}>Round off</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>
                          {roundOff > 0 ? `+${roundOff.toFixed(2)}` : `${roundOff.toFixed(2)}`}
                        </td>
                      </tr>

                      {/* Net Amount with separator */}
                      <tr style={{ borderTop: '1px solid #000000' }}>
                        <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Net amount</td>
                        <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>
                          {netAmount.toFixed(2)}
                        </td>
                      </tr>

                      {/* Comission */}
                      <tr>
                        <td style={{ padding: '2px 0' }}>Comission @ {commissionPercent}%</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{commissionAmount.toFixed(2)}</td>
                      </tr>

                      {/* Net Balance with separator */}
                      <tr style={{ borderTop: '1px solid #000000' }}>
                        <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Net Balance</td>
                        <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>
                          {netBalance.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               3. THERMAL RECEIPT (3-INCH / 80MM COUNTER SLIP)
               ========================================================== */
            <div
              id="printable-invoice"
              style={{
                width: '320px',
                margin: '0 auto',
                background: '#ffffff',
                padding: '1.25rem 1rem',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#111827',
                lineHeight: 1.4,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <img
                  src={shop.logo || '/logo.png'}
                  alt="Logo"
                  style={{ maxHeight: '54px', maxWidth: '120px', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                />
                <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: '#000000' }}>
                  {shop.name || 'SRI GUGAN CRACKERS'}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>
                  {shopAddress}, {shopCity} - {shopPincode}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Ph: {shopPhone}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563' }}>
                  GSTIN: {shopGstin}
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Invoice Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span>Bill: #{inv.invoiceNo}</span>
                <span>Date: {inv.despatchDate || formatDateTime(inv.date)}</span>
              </div>
              <div style={{ fontSize: '11px', marginTop: '3px' }}>
                <div><strong>M/s:</strong> {inv.customerName || 'Cash Customer'}</div>
                {inv.customerAddress && <div><strong>City:</strong> {inv.customerAddress}</div>}
                {inv.customerMobile && <div><strong>Phone:</strong> +91 {inv.customerMobile}</div>}
                {inv.customerGstin && <div><strong>GSTIN:</strong> {inv.customerGstin}</div>}
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000000', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '3px' }}>Item</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'center' }}>Cs</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'center' }}>Qty</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Rate</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items && inv.items.map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'top' }}>
                      <td style={{ paddingTop: '4px', paddingBottom: '2px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{item.packContent}</div>
                      </td>
                      <td style={{ paddingTop: '4px', textAlign: 'center' }}>{item.cases || 1}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right' }}>₹{Number(item.rate).toFixed(2)}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right', fontWeight: 700 }}>₹{Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0' }}></div>

              {/* Calculations */}
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Cases:</span>
                  <span>{totalCases}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {pfAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>P &amp; F ({pfPercent}%):</span>
                    <span>₹{pfAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax ({taxPercent}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `₹${roundOff.toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* Grand Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 800,
                padding: '2px 0'
              }}>
                <span>NET AMOUNT:</span>
                <span>₹{netAmount.toFixed(2)}</span>
              </div>

              {commissionAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#dc2626' }}>
                  <span>Comission @ {commissionPercent}%:</span>
                  <span>-₹{commissionAmount.toFixed(2)}</span>
                </div>
              )}

              {commissionAmount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: 800,
                  padding: '4px 0',
                  color: '#16a34a'
                }}>
                  <span>NET BALANCE:</span>
                  <span>₹{netBalance.toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* QR Code in Thermal */}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <img
                  src={qrCodeUrl}
                  alt="UPI QR"
                  style={{ width: '64px', height: '64px', margin: '0 auto', display: 'block' }}
                />
                <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>
                  Scan to Pay: {upiId}
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px' }}>
                <div style={{ fontWeight: 700 }}>{shop.footerMessage}</div>
                <div style={{ marginTop: '4px', fontSize: '9px', color: '#6b7280' }}>
                  Software by POS Billing System
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer no-print">
          <button onClick={() => setIsPrintModalOpen(false)} className="btn btn-secondary">
            Close Preview
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
            <Printer size={16} />
            <span>Print Invoice Now (Ctrl+P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
