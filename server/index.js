import express from 'express';
import cors from 'cors';
import pool, { initDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 10 Real-looking Cracker Products
const SEED_PRODUCTS = [
  { id: 'SGC-01', code: 'SGC-01', name: '2 3/4" Sound Crackers (Ground)', category: 'Sound Crackers', brand: 'Sivakasi Spark', unit: 'Box', purchasePrice: 120, sellingPrice: 45, discount: 60, taxRate: 12, openingStock: 250, currentStock: 250, minimumStock: 20, status: 'Active' },
  { id: 'SGC-02', code: 'SGC-02', name: 'Deluxe Lakshmi Bomb (28 Sound)', category: 'Bombs', brand: 'Sivakasi Spark', unit: 'Box', purchasePrice: 250, sellingPrice: 95, discount: 60, taxRate: 12, openingStock: 180, currentStock: 180, minimumStock: 15, status: 'Active' },
  { id: 'SGC-03', code: 'SGC-03', name: '3 1/2" Flower Pot Big (Special)', category: 'Flower Pots', brand: 'Royal Sivakasi', unit: 'Box', purchasePrice: 320, sellingPrice: 120, discount: 60, taxRate: 12, openingStock: 150, currentStock: 150, minimumStock: 15, status: 'Active' },
  { id: 'SGC-04', code: 'SGC-04', name: 'Special Ground Chakkram Big', category: 'Ground Chakkars', brand: 'Royal Sivakasi', unit: 'Box', purchasePrice: 180, sellingPrice: 68, discount: 60, taxRate: 12, openingStock: 200, currentStock: 200, minimumStock: 20, status: 'Active' },
  { id: 'SGC-05', code: 'SGC-05', name: '10 Shot Multi Colour Sky Aerial', category: 'Multi Shots', brand: 'Sky High', unit: 'Box', purchasePrice: 650, sellingPrice: 240, discount: 60, taxRate: 12, openingStock: 90, currentStock: 90, minimumStock: 10, status: 'Active' },
  { id: 'SGC-06', code: 'SGC-06', name: '12" Electric Sparklers (Multi)', category: 'Sparklers', brand: 'Sivakasi Spark', unit: 'Box', purchasePrice: 140, sellingPrice: 52, discount: 60, taxRate: 12, openingStock: 300, currentStock: 300, minimumStock: 30, status: 'Active' },
  { id: 'SGC-07', code: 'SGC-07', name: '7 Shot Rocket Aerial Sky', category: 'Rockets', brand: 'Sky High', unit: 'Box', purchasePrice: 380, sellingPrice: 145, discount: 60, taxRate: 12, openingStock: 120, currentStock: 120, minimumStock: 15, status: 'Active' },
  { id: 'SGC-08', code: 'SGC-08', name: 'Peacock Fountain Mega Flowerpot', category: 'Flower Pots', brand: 'Royal Sivakasi', unit: 'Box', purchasePrice: 450, sellingPrice: 175, discount: 60, taxRate: 12, openingStock: 110, currentStock: 110, minimumStock: 10, status: 'Active' },
  { id: 'SGC-09', code: 'SGC-09', name: 'Siren Bomb Flying Sound', category: 'Bombs', brand: 'Sivakasi Spark', unit: 'Box', purchasePrice: 220, sellingPrice: 85, discount: 60, taxRate: 12, openingStock: 160, currentStock: 160, minimumStock: 15, status: 'Active' },
  { id: 'SGC-10', code: 'SGC-10', name: '30 Shot Royal Fireworks Fancy Sky', category: 'Multi Shots', brand: 'Sky High', unit: 'Box', purchasePrice: 1450, sellingPrice: 550, discount: 60, taxRate: 12, openingStock: 50, currentStock: 50, minimumStock: 5, status: 'Active' }
];

// 10 Real-looking Customers
const SEED_CUSTOMERS = [
  { id: 'CUST-1001', name: 'M/S. K.R. TRADERS', mobile: '9842154321', address: 'Main Bazaar, Madurai', gstin: '33AAACK1234F1Z2', totalBilled: 14500, totalBills: 3, creditBalance: 0 },
  { id: 'CUST-1002', name: 'SIVAKASI FIREWORKS AGENCY', mobile: '9443187654', address: 'Sattur Road, Sivakasi', gstin: '33BBBFS5678G1Z9', totalBilled: 28900, totalBills: 5, creditBalance: 0 },
  { id: 'CUST-1003', name: 'TAMILNADU CRACKERS STALL', mobile: '9894012345', address: 'Gandhi Road, Salem', gstin: '33CCCTS9012H1Z5', totalBilled: 18200, totalBills: 2, creditBalance: 0 },
  { id: 'CUST-1004', name: 'CHENNAI WHOLESALE STORES', mobile: '9789023456', address: 'Parrys Corner, Chennai', gstin: '33DDDCW3456I1Z1', totalBilled: 42000, totalBills: 4, creditBalance: 0 },
  { id: 'CUST-1005', name: 'K. MURALIDHARAN', mobile: '9442234567', address: 'Cross Cut Road, Coimbatore', gstin: '', totalBilled: 3500, totalBills: 1, creditBalance: 0 },
  { id: 'CUST-1006', name: 'P. VIJAYAKUMAR', mobile: '9843345678', address: 'TVS Nagar, Tiruchirappalli', gstin: '', totalBilled: 4800, totalBills: 2, creditBalance: 0 },
  { id: 'CUST-1007', name: 'SRI BALAJI STORES', mobile: '9944456789', address: 'Town Hall, Erode', gstin: '33EEEBS7890J1Z4', totalBilled: 15600, totalBills: 3, creditBalance: 0 },
  { id: 'CUST-1008', name: 'RAMESH & BROS RETAIL', mobile: '9865567890', address: 'Kamaraj Road, Tirunelveli', gstin: '', totalBilled: 6200, totalBills: 2, creditBalance: 0 },
  { id: 'CUST-1009', name: 'S. SENTHILKUMAR', mobile: '9750078901', address: 'Anna Nagar, Dindigul', gstin: '', totalBilled: 2900, totalBills: 1, creditBalance: 0 },
  { id: 'CUST-1010', name: 'R. ANANDAN', mobile: '9486689012', address: 'New Bus Stand, Vellore', gstin: '', totalBilled: 3800, totalBills: 1, creditBalance: 0 }
];

// Helper to seed initial products & customers if empty
async function seedInitialData() {
  try {
    const [sRows] = await pool.query('SELECT isWiped FROM shop WHERE id = "main_shop"').catch(() => [[]]);
    if (sRows && sRows.length > 0 && sRows[0].isWiped) {
      console.log('Database was wiped by user. Skipping automatic initial seeding.');
      return;
    }

    const [pRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (pRows[0].count === 0) {
      console.log('Seeding 10 real cracker products into TiDB Cloud DB...');
      for (const p of SEED_PRODUCTS) {
        await pool.query(
          `INSERT INTO products (
            id, code, name, category, brand, unit, purchasePrice, sellingPrice,
            discount, taxRate, openingStock, currentStock, minimumStock, boxQty, piecesPerBox, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
          [p.id, p.code, p.name, p.category, p.brand, p.unit, p.purchasePrice, p.sellingPrice, p.discount, p.taxRate, p.openingStock, p.currentStock, p.minimumStock, p.status]
        );
      }
    }

    const [cRows] = await pool.query('SELECT COUNT(*) as count FROM customers');
    if (cRows[0].count === 0) {
      console.log('Seeding 10 real customers into TiDB Cloud DB...');
      for (const c of SEED_CUSTOMERS) {
        await pool.query(
          `INSERT INTO customers (id, name, mobile, address, gstin, totalBilled, totalBills, creditBalance)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.name, c.mobile, c.address, c.gstin, c.totalBilled, c.totalBills, c.creditBalance]
        );
      }
    }
  } catch (e) {
    console.error('Error seeding data:', e);
  }
}

let dbInitPromise = null;
async function ensureDb() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await initDb();
      await seedInitialData();
    })();
  }
  await dbInitPromise;
}

// Middleware to ensure DB tables exist on every request
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('DB Initialization Middleware Error:', err);
    next();
  }
});

// Health Check / Test DB
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as result');
    res.json({ status: 'ok', dbConnected: true, rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// ================= SHOP =================
app.get('/api/shop', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shop LIMIT 1');
    if (rows.length > 0) {
      const shopData = rows[0];
      shopData.taxInclusive = Boolean(shopData.taxInclusive);
      return res.json(shopData);
    }
    return res.json(null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shop', async (req, res) => {
  try {
    const shop = req.body;
    const shopId = 'main_shop';
    await pool.query(
      `INSERT INTO shop (
        id, name, tagline, logo, address, city, district, state, pincode,
        mobile, altMobile, email, gstin, stateCode, invoicePrefix, nextInvoiceNum,
        nextOrderNum, footerMessage, terms, printFormat, taxInclusive, defaultTaxRate, upiId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name), tagline=VALUES(tagline), logo=VALUES(logo), address=VALUES(address),
        city=VALUES(city), district=VALUES(district), state=VALUES(state), pincode=VALUES(pincode),
        mobile=VALUES(mobile), altMobile=VALUES(altMobile), email=VALUES(email), gstin=VALUES(gstin),
        stateCode=VALUES(stateCode), invoicePrefix=VALUES(invoicePrefix), nextInvoiceNum=VALUES(nextInvoiceNum),
        nextOrderNum=VALUES(nextOrderNum), footerMessage=VALUES(footerMessage), terms=VALUES(terms),
        printFormat=VALUES(printFormat), taxInclusive=VALUES(taxInclusive), defaultTaxRate=VALUES(defaultTaxRate),
        upiId=VALUES(upiId)`,
      [
        shopId, shop.name, shop.tagline, shop.logo, shop.address, shop.city, shop.district, shop.state, shop.pincode,
        shop.mobile, shop.altMobile, shop.email, shop.gstin, shop.stateCode, shop.invoicePrefix, shop.nextInvoiceNum || 1001,
        shop.nextOrderNum || 1, shop.footerMessage, shop.terms, shop.printFormat, shop.taxInclusive ? 1 : 0, shop.defaultTaxRate || 12, shop.upiId
      ]
    );
    res.json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CATEGORIES =================
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { id, name } = req.body;
    await pool.query('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);
    res.json({ success: true, category: { id, name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ? OR name = ?', [id, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= PRODUCTS =================
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY updatedAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || p.code || `PRD-${Date.now().toString().slice(-4)}`;
    await pool.query(
      `INSERT INTO products (
        id, code, name, category, brand, unit, purchasePrice, sellingPrice,
        discount, taxRate, openingStock, currentStock, minimumStock, boxQty, piecesPerBox, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        code=VALUES(code), name=VALUES(name), category=VALUES(category), brand=VALUES(brand),
        unit=VALUES(unit), purchasePrice=VALUES(purchasePrice), sellingPrice=VALUES(sellingPrice),
        discount=VALUES(discount), taxRate=VALUES(taxRate), openingStock=VALUES(openingStock),
        currentStock=VALUES(currentStock), minimumStock=VALUES(minimumStock), boxQty=VALUES(boxQty),
        piecesPerBox=VALUES(piecesPerBox), status=VALUES(status)`,
      [
        id, p.code || id, p.name, p.category, p.brand, p.unit,
        p.purchasePrice || 0, p.sellingPrice || 0, p.discount || 0, p.taxRate || 12,
        p.openingStock || 0, p.currentStock || p.openingStock || 0, p.minimumStock || 10,
        p.boxQty || 1, p.piecesPerBox || 1, p.status || 'Active'
      ]
    );
    res.json({ success: true, product: { ...p, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    await pool.query(
      `UPDATE products SET
        code=?, name=?, category=?, brand=?, unit=?, purchasePrice=?, sellingPrice=?,
        discount=?, taxRate=?, openingStock=?, currentStock=?, minimumStock=?, boxQty=?, piecesPerBox=?, status=?
      WHERE id=?`,
      [
        p.code, p.name, p.category, p.brand, p.unit,
        p.purchasePrice, p.sellingPrice, p.discount, p.taxRate,
        p.openingStock, p.currentStock, p.minimumStock, p.boxQty, p.piecesPerBox, p.status,
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CUSTOMERS =================
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY updatedAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const c = req.body;
    const id = c.id || `CUST-${Date.now().toString().slice(-4)}`;
    await pool.query(
      `INSERT INTO customers (id, name, mobile, address, gstin, totalBilled, totalBills, creditBalance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), address=VALUES(address), gstin=VALUES(gstin),
         totalBilled=totalBilled + VALUES(totalBilled), totalBills=totalBills + VALUES(totalBills), creditBalance=VALUES(creditBalance)`,
      [
        id, c.name || 'Walk-in Customer', c.mobile, c.address || '', c.gstin || '',
        c.totalBilled || 0, c.totalBills || 0, c.creditBalance || 0
      ]
    );
    res.json({ success: true, customer: { ...c, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    await pool.query(
      `UPDATE customers SET name=?, mobile=?, address=?, gstin=?, totalBilled=?, totalBills=?, creditBalance=?
       WHERE id=?`,
      [c.name, c.mobile, c.address, c.gstin, c.totalBilled, c.totalBills, c.creditBalance, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SUPPLIERS =================
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY updatedAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const s = req.body;
    const id = s.id || `SUP-${Date.now().toString().slice(-4)}`;
    await pool.query(
      `INSERT INTO suppliers (id, name, contactPerson, mobile, address, gstin, balance, totalPurchases)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), contactPerson=VALUES(contactPerson), mobile=VALUES(mobile),
         address=VALUES(address), gstin=VALUES(gstin), balance=VALUES(balance), totalPurchases=VALUES(totalPurchases)`,
      [id, s.name, s.contactPerson || '', s.mobile || '', s.address || '', s.gstin || '', s.balance || 0, s.totalPurchases || 0]
    );
    res.json({ success: true, supplier: { ...s, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SALES =================
app.get('/api/sales', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY createdAt DESC');
    const parsed = rows.map(r => ({
      ...r,
      grandTotal: Number(r.grandTotal) || 0,
      subTotal: Number(r.subTotal) || 0,
      taxTotal: Number(r.taxTotal) || 0,
      discountTotal: Number(r.discountTotal) || 0,
      paymentMethod: r.paymentMode || r.paymentMethod || 'Cash',
      paymentMode: r.paymentMode || r.paymentMethod || 'Cash',
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sale = req.body;
    const itemsJson = JSON.stringify(sale.items || []);

    // 1. Insert Sale record
    await connection.query(
      `INSERT INTO sales (
        id, invoiceNo, date, customerName, customerMobile, customerAddress, customerGstin,
        items, subTotal, discountTotal, taxTotal, grandTotal, paymentMode, paymentStatus, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sale.id, sale.invoiceNo, sale.date, sale.customerName, sale.customerMobile, sale.customerAddress,
        sale.customerGstin, itemsJson, sale.subTotal || 0, sale.discountTotal || 0, sale.taxTotal || 0,
        sale.grandTotal || 0, sale.paymentMethod || sale.paymentMode || 'Cash', sale.paymentStatus || 'Paid', sale.createdBy || 'Admin'
      ]
    );

    // 2. Deduct product stock automatically
    if (Array.isArray(sale.items)) {
      for (const item of sale.items) {
        if (item.id) {
          await connection.query(
            `UPDATE products SET currentStock = GREATEST(0, currentStock - ?) WHERE id = ?`,
            [item.qty, item.id]
          );
        }
      }
    }

    // 3. Add / update Customer details if mobile is present
    if (sale.customerMobile) {
      const [existing] = await connection.query('SELECT * FROM customers WHERE mobile = ?', [sale.customerMobile]);
      if (existing.length > 0) {
        await connection.query(
          `UPDATE customers SET 
             name = COALESCE(NULLIF(?, ''), name),
             address = COALESCE(NULLIF(?, ''), address),
             gstin = COALESCE(NULLIF(?, ''), gstin),
             totalBilled = totalBilled + ?,
             totalBills = totalBills + 1
           WHERE mobile = ?`,
          [sale.customerName, sale.customerAddress, sale.customerGstin, sale.grandTotal || 0, sale.customerMobile]
        );
      } else {
        const custId = `CUST-${Date.now().toString().slice(-4)}`;
        await connection.query(
          `INSERT INTO customers (id, name, mobile, address, gstin, totalBilled, totalBills, creditBalance)
           VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
          [custId, sale.customerName || 'Walk-in Customer', sale.customerMobile, sale.customerAddress || '', sale.customerGstin || '', sale.grandTotal || 0]
        );
      }
    }

    // 4. Update next invoice number in shop settings
    await connection.query(
      `UPDATE shop SET nextInvoiceNum = nextInvoiceNum + 1, nextOrderNum = nextOrderNum + 1 WHERE id = 'main_shop'`
    );

    await connection.commit();
    res.json({ success: true, sale });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ================= PURCHASES (STOCK INWARD) =================
app.get('/api/purchases', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM purchases ORDER BY createdAt DESC');
    const parsed = rows.map(r => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const pur = req.body;
    const itemsJson = JSON.stringify(pur.items || []);

    await connection.query(
      `INSERT INTO purchases (id, invoiceNo, date, supplierId, supplierName, items, grandTotal, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pur.id, pur.invoiceNo, pur.date, pur.supplierId, pur.supplierName, itemsJson, pur.grandTotal || 0, pur.notes || '']
    );

    // Increase stock for each purchased item
    if (Array.isArray(pur.items)) {
      for (const item of pur.items) {
        if (item.productId) {
          const rate = item.rate ? Number(item.rate) : null;
          if (rate) {
            await connection.query(
              `UPDATE products SET currentStock = currentStock + ?, purchasePrice = ? WHERE id = ?`,
              [item.qty, rate, item.productId]
            );
          } else {
            await connection.query(
              `UPDATE products SET currentStock = currentStock + ? WHERE id = ?`,
              [item.qty, item.productId]
            );
          }
        }
      }
    }

    await connection.commit();
    res.json({ success: true, purchase: pur });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ================= RETURNS =================
app.get('/api/returns', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM returns ORDER BY createdAt DESC');
    const parsed = rows.map(r => ({
      ...r,
      returnedItems: typeof r.returnedItems === 'string' ? JSON.parse(r.returnedItems) : (r.returnedItems || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/returns', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const ret = req.body;
    const itemsJson = JSON.stringify(ret.returnedItems || []);

    await connection.query(
      `INSERT INTO returns (id, date, invoiceNo, customerName, customerMobile, returnedItems, totalRefund, reason, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ret.id, ret.date, ret.invoiceNo, ret.customerName, ret.customerMobile, itemsJson, ret.totalRefund || 0, ret.reason || '', ret.createdBy || 'Admin']
    );

    // Replenish stock for returned items
    if (Array.isArray(ret.returnedItems)) {
      for (const rItem of ret.returnedItems) {
        if (rItem.id) {
          await connection.query(
            `UPDATE products SET currentStock = currentStock + ? WHERE id = ?`,
            [rItem.qty, rItem.id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ success: true, return: ret });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ================= WIPE & RESEED ALL DATA =================
app.post('/api/wipe', async (req, res) => {
  try {
    await pool.query('DELETE FROM sales');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM customers');
    await pool.query('DELETE FROM suppliers');
    await pool.query('DELETE FROM purchases');
    await pool.query('DELETE FROM returns');

    await pool.query(`
      UPDATE shop SET nextInvoiceNum = 1, nextOrderNum = 1, isWiped = 1 WHERE id = 'main_shop'
    `);

    res.json({ success: true, message: 'All database records cleared completely and Invoice numbers reset to 1!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reseed', async (req, res) => {
  try {
    await pool.query(`
      UPDATE shop SET nextInvoiceNum = 1, nextOrderNum = 1, isWiped = 0 WHERE id = 'main_shop'
    `);

    await pool.query('DELETE FROM sales');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM customers');
    await pool.query('DELETE FROM suppliers');
    await pool.query('DELETE FROM purchases');
    await pool.query('DELETE FROM returns');

    for (const p of SEED_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (
          id, code, name, category, brand, unit, purchasePrice, sellingPrice,
          discount, taxRate, openingStock, currentStock, minimumStock, boxQty, piecesPerBox, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
        [p.id, p.code, p.name, p.category, p.brand, p.unit, p.purchasePrice, p.sellingPrice, p.discount, p.taxRate, p.openingStock, p.currentStock, p.minimumStock, p.status]
      );
    }

    for (const c of SEED_CUSTOMERS) {
      await pool.query(
        `INSERT INTO customers (id, name, mobile, address, gstin, totalBilled, totalBills, creditBalance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.mobile, c.address, c.gstin, c.totalBilled, c.totalBills, c.creditBalance]
      );
    }

    res.json({ success: true, message: 'Database clean reset, Invoice numbers reset to 1, and 10 products + 10 customers seeded!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
