import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '2NZ98TsqYW9Ftow.root',
  password: process.env.DB_PASSWORD || 'IbLVkvv6WzgJB8k8',
  database: process.env.DB_NAME || 'gugancrakers',
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDb() {
  const connection = await pool.getConnection();
  try {
    console.log('Connected to TiDB Cloud MySQL database!');

    // 1. Shop table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shop (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        tagline VARCHAR(255),
        logo TEXT,
        address TEXT,
        city VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        mobile VARCHAR(50),
        altMobile VARCHAR(50),
        email VARCHAR(100),
        gstin VARCHAR(50),
        stateCode VARCHAR(20),
        invoicePrefix VARCHAR(20),
        nextInvoiceNum INT,
        nextOrderNum INT,
        footerMessage TEXT,
        terms TEXT,
        printFormat VARCHAR(20),
        taxInclusive BOOLEAN,
        defaultTaxRate DECIMAL(5,2),
        upiId VARCHAR(100),
        website VARCHAR(255),
        isWiped INT DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query(`ALTER TABLE shop ADD COLUMN isWiped INT DEFAULT 0`);
    } catch (e) {
      // Ignore if column already exists
    }
    try {
      await connection.query(`ALTER TABLE shop ADD COLUMN website VARCHAR(255) DEFAULT ''`);
    } catch (e) {
      // Ignore if column already exists
    }

    // 2. Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        brand VARCHAR(100),
        unit VARCHAR(50),
        purchasePrice DECIMAL(10,2) DEFAULT 0,
        sellingPrice DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(5,2) DEFAULT 0,
        taxRate DECIMAL(5,2) DEFAULT 12,
        openingStock INT DEFAULT 0,
        currentStock INT DEFAULT 0,
        minimumStock INT DEFAULT 10,
        boxQty INT DEFAULT 1,
        piecesPerBox INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Active',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL UNIQUE,
        address TEXT,
        gstin VARCHAR(50),
        totalBilled DECIMAL(12,2) DEFAULT 0,
        totalBills INT DEFAULT 0,
        creditBalance DECIMAL(12,2) DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Suppliers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        mobile VARCHAR(50),
        address TEXT,
        gstin VARCHAR(50),
        balance DECIMAL(12,2) DEFAULT 0,
        totalPurchases DECIMAL(12,2) DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Sales / Invoices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(100) PRIMARY KEY,
        invoiceNo VARCHAR(100) NOT NULL UNIQUE,
        date VARCHAR(100),
        customerName VARCHAR(255),
        customerMobile VARCHAR(50),
        customerAddress TEXT,
        customerGstin VARCHAR(50),
        items JSON,
        subTotal DECIMAL(12,2) DEFAULT 0,
        discountTotal DECIMAL(12,2) DEFAULT 0,
        taxTotal DECIMAL(12,2) DEFAULT 0,
        grandTotal DECIMAL(12,2) DEFAULT 0,
        paymentMode VARCHAR(50) DEFAULT 'Cash',
        paymentStatus VARCHAR(50) DEFAULT 'Paid',
        createdBy VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Purchases table (Stock Inward)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id VARCHAR(100) PRIMARY KEY,
        invoiceNo VARCHAR(100),
        date VARCHAR(100),
        supplierId VARCHAR(100),
        supplierName VARCHAR(255),
        items JSON,
        grandTotal DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Sales Returns table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS returns (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(100),
        invoiceNo VARCHAR(100),
        customerName VARCHAR(255),
        customerMobile VARCHAR(50),
        returnedItems JSON,
        totalRefund DECIMAL(12,2) DEFAULT 0,
        reason TEXT,
        createdBy VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database tables initialized successfully!');
  } catch (err) {
    console.error('Database initialization error:', err);
  } finally {
    connection.release();
  }
}

export default pool;
