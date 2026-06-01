import express from "express";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
const modelName = "gemini-3-flash-preview";

// Initialize Database
let db: any;

function initDb(dbPath: string) {
  console.log(`[SERVER] Initializing database at: ${dbPath}`);
  
  // Create parent directory recursively if it doesn't exist
  try {
    const parentDir = path.dirname(dbPath);
    if (parentDir && parentDir !== "." && parentDir !== ".." && !fs.existsSync(parentDir)) {
      console.log(`[SERVER] Creating database container directory: ${parentDir}`);
      fs.mkdirSync(parentDir, { recursive: true });
    }
  } catch (dirErr) {
    console.warn(`[SERVER] Failed during directory checks:`, dirErr);
  }
  
  db = new Database(dbPath);
  
  // High-performance SQLite Tuning PRAGMAs for fast execution times and low memory/disk footprints
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('cache_size = -4000'); // Dynamic page cache limit of ~4MB (very modest and fast)
  db.pragma('temp_store = MEMORY'); // Write temp tables to memory rather than disk
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      full_name TEXT,
      role TEXT,
      contact TEXT,
      status TEXT,
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      generic TEXT,
      category TEXT,
      buy_price REAL,
      sell_price REAL,
      stock INTEGER,
      min_stock INTEGER,
      barcode TEXT,
      expiry_date TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      company TEXT,
      contact TEXT,
      city TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_no TEXT,
      supplier_id INTEGER,
      total REAL,
      status TEXT,
      created_at TEXT,
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      medicine_id INTEGER,
      qty INTEGER,
      unit_price REAL,
      total REAL,
      FOREIGN KEY(purchase_id) REFERENCES purchases(id),
      FOREIGN KEY(medicine_id) REFERENCES medicines(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT,
      customer_id INTEGER,
      total REAL,
      discount REAL,
      tax REAL,
      net_total REAL,
      payment_method TEXT,
      amount_paid REAL,
      change_due REAL,
      created_at TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      medicine_id INTEGER,
      qty INTEGER,
      unit_price REAL,
      total REAL,
      FOREIGN KEY(sale_id) REFERENCES sales(id),
      FOREIGN KEY(medicine_id) REFERENCES medicines(id)
    );

    -- Speed Optimization B-Tree Indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
    CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
    CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales (customer_id);
    CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items (sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_items_medicine_id ON sale_items (medicine_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items (purchase_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_medicine_id ON purchase_items (medicine_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases (supplier_id);
  `);

  // Seed Initial Data (if empty)
  const userExists = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
  if (userExists.count === 0) {
    db.prepare("INSERT INTO users (username, password, full_name, role, contact, status) VALUES (?, ?, ?, ?, ?, ?)")
      .run("admin", "admin123", "Syed Samiullah", "Admin", "0300-1234567", "Active");
    
    // Seed Suppliers
    db.prepare("INSERT INTO suppliers (name, company, contact, city, status) VALUES (?, ?, ?, ?, ?)")
      .run("Ahmad Pharma", "GSK Distributors", "0946-712345", "Mingora", "Active");
    db.prepare("INSERT INTO suppliers (name, company, contact, city, status) VALUES (?, ?, ?, ?, ?)")
      .run("LifeSource", "Abbott Laboratories", "021-3456789", "Karachi", "Active");

    // Seed Medicines - Expanded Dataset
    const medicines = [
      ["Panadol 500mg", "Paracetamol", "Tablet", 12.0, 18.0, 450, 20, "OK"],
      ["Amoxicillin 250", "Amoxicillin", "Capsule", 45.0, 65.0, 5, 15, "Low Stock"],
      ["Brufen 400mg", "Ibuprofen", "Tablet", 6.5, 9.0, 120, 30, "OK"],
      ["Augmentin 625mg", "Co-amoxiclav", "Tablet", 185.0, 220.0, 80, 10, "OK"],
      ["Ceftriaxone 1g", "Ceftriaxone", "Injection", 250.0, 310.0, 45, 5, "OK"],
      ["Arinac Forte", "Ibuprofen/Pseudoephedrine", "Tablet", 8.0, 12.0, 200, 25, "OK"],
      ["Ventolin Inhaler", "Salbutamol", "Inhaler", 450.0, 520.0, 30, 8, "OK"],
      ["Polyfax Skin", "Polymyxin B/Bacitracin", "Ointment", 95.0, 125.0, 60, 10, "OK"],
      ["C-Cid Syrup", "Vitamin C", "Syrup", 110.0, 145.0, 40, 12, "OK"],
      ["Disprin", "Aspirin", "Tablet", 2.0, 5.0, 1000, 50, "OK"],
      ["Gravinate", "Dimenhydrinate", "Tablet", 4.0, 7.0, 350, 30, "OK"],
      ["Flagyl 400mg", "Metronidazole", "Tablet", 15.0, 22.0, 150, 40, "OK"],
      ["Loprin 75mg", "Aspirin", "Tablet", 3.0, 6.0, 600, 100, "OK"],
      ["Risek 20mg", "Omeprazole", "Capsule", 18.0, 25.0, 90, 20, "OK"],
      ["Zyrtec 10mg", "Cetirizine", "Tablet", 10.0, 15.0, 180, 25, "OK"],
      ["Hydryllin Syrup", "Aminophylline", "Syrup", 85.0, 110.0, 55, 15, "OK"],
      ["Soframycin", "Framycetin", "Cream", 65.0, 85.0, 25, 5, "OK"],
      ["Gaviscon Syrup", "Sodium Alginate", "Syrup", 210.0, 260.0, 35, 10, "OK"],
      ["Surbex Z", "Multivitamins/Zinc", "Tablet", 420.0, 500.0, 100, 20, "OK"],
      ["Bonalgi Tablet", "Paracetamol/Orphenadrine", "Tablet", 5.0, 8.0, 150, 30, "OK"],
      ["Citrizine 10", "Cetirizine", "Tablet", 12.0, 18.0, 300, 50, "OK"],
      ["Indrop-D 200k", "Vitamin D3", "Injection", 450.0, 550.0, 20, 5, "OK"],
      ["T-Day Tablet", "Loratadine", "Tablet", 15.0, 22.0, 100, 15, "OK"],
      ["Klaricid 250", "Clarithromycin", "Tablet", 650.0, 780.0, 40, 10, "OK"],
      ["Pariet 20mg", "Rabeprazole", "Tablet", 45.0, 60.0, 80, 15, "OK"],
      ["Avelox 400", "Moxifloxacin", "Tablet", 850.0, 990.0, 15, 5, "OK"],
      ["Daclo 50mg", "Diclofenac Sodium", "Tablet", 6.0, 10.0, 250, 40, "OK"],
      ["Zyloric 100", "Allopurinol", "Tablet", 12.0, 18.0, 120, 20, "OK"],
      ["Ativan 1mg", "Lorazepam", "Tablet", 45.0, 60.0, 150, 20, "OK"],
      ["Lexotanil 3mg", "Bromazepam", "Tablet", 180.0, 225.0, 90, 15, "OK"],
      ["Entamizole", "Metronidazole/Diloxanide", "Tablet", 12.0, 18.0, 400, 50, "OK"],
      ["Klaricid XL", "Clarithromycin", "Tablet", 950.0, 1150.0, 25, 5, "OK"],
      ["Avomine", "Promethazine", "Tablet", 5.0, 8.0, 200, 30, "OK"],
      ["Telfast 120", "Fexofenadine", "Tablet", 35.0, 48.0, 140, 20, "OK"],
      ["Motilium", "Domperidone", "Tablet", 8.0, 12.0, 300, 40, "OK"],
      ["Syp. Hydryllin", "Aminophylline", "Syrup", 85.0, 110.0, 60, 10, "OK"],
      ["Syp. Brufen", "Ibuprofen", "Syrup", 75.0, 95.0, 80, 15, "OK"],
      ["Syp. Flagyl", "Metronidazole", "Syrup", 65.0, 85.0, 90, 15, "OK"],
      ["Syp. Panadol", "Paracetamol", "Syrup", 55.0, 75.0, 120, 20, "OK"],
      ["Syp. Mucaine", "Oxetacaine", "Syrup", 180.0, 230.0, 40, 8, "OK"],
      ["Glucophage 500", "Metformin", "Tablet", 6.0, 10.0, 500, 50, "OK"],
      ["Lipiget 10mg", "Atorvastatin", "Tablet", 22.0, 30.0, 200, 30, "OK"],
      ["Concor 5mg", "Bisoprolol", "Tablet", 15.0, 22.0, 180, 25, "OK"],
      ["Exforge 5/80", "Amlodipine/Valsartan", "Tablet", 45.0, 65.0, 100, 15, "OK"],
      ["Cap. Risek 40", "Omeprazole", "Capsule", 35.0, 48.0, 150, 30, "OK"],
      ["Cap. Losec 20", "Omeprazole", "Capsule", 180.0, 240.0, 50, 10, "OK"],
      ["Inj. Venofer", "Iron Sucrose", "Injection", 450.0, 580.0, 30, 5, "OK"],
      ["C-Cid 500", "Vitamin C", "Tablet", 8.0, 12.0, 600, 50, "OK"],
      ["Sangobiion", "Vitamins & Minerals", "Capsule", 15.0, 22.0, 250, 30, "OK"],
      ["Cap. Getryl 2mg", "Glimepiride", "Capsule", 12.0, 18.0, 300, 40, "OK"],
      ["Amoxil 500mg", "Amoxicillin", "Capsule", 15.0, 22.0, 400, 50, "OK"],
      ["Xalatan Eye Drops", "Latanoprost", "Drops", 1250.0, 1500.0, 15, 5, "OK"],
      ["Ventolin Nebules", "Salbutamol", "Respules", 15.0, 25.0, 100, 20, "OK"],
      ["Nexum 40mg", "Esomeprazole", "Tablet", 25.0, 35.0, 120, 20, "OK"],
      ["Spasler-P", "Hyoscine", "Tablet", 8.0, 12.0, 250, 30, "OK"],
      ["Serc 16mg", "Betahistine", "Tablet", 18.0, 25.0, 150, 25, "OK"],
      ["Voren 50mg", "Diclofenac Sodium", "Tablet", 5.0, 8.0, 500, 50, "OK"],
      ["Kestine 10mg", "Ebastine", "Tablet", 15.0, 22.0, 180, 30, "OK"],
      ["Softin 10mg", "Loratadine", "Tablet", 10.0, 15.0, 200, 25, "OK"],
      ["Brufen Retard", "Ibuprofen", "Tablet", 12.0, 18.0, 150, 30, "OK"],
      ["Ponstan Forte", "Mefenamic Acid", "Tablet", 8.0, 12.0, 600, 50, "OK"],
      ["Buscopan", "Hyoscine", "Tablet", 6.0, 10.0, 300, 40, "OK"],
      ["No-Spa 40mg", "Drotaverine", "Tablet", 5.0, 8.0, 400, 50, "OK"],
      ["Synflex 550", "Naproxen", "Tablet", 15.0, 22.0, 100, 20, "OK"],
      ["Mobic 15mg", "Meloxicam", "Tablet", 25.0, 35.0, 80, 15, "OK"],
      ["Celebrex 200", "Celecoxib", "Capsule", 45.0, 60.0, 90, 20, "OK"],
      ["Arcoxia 90", "Etoricoxib", "Tablet", 55.0, 75.0, 60, 10, "OK"],
      ["Zestril 10mg", "Lisinopril", "Tablet", 12.0, 18.0, 100, 20, "OK"],
      ["Lipitor 20mg", "Atorvastatin", "Tablet", 85.0, 110.0, 50, 10, "OK"],
      ["Norvasc 5mg", "Amlodipine", "Tablet", 15.0, 22.0, 200, 40, "OK"],
      ["Co-Diovan 80", "Valsartan/HCTZ", "Tablet", 45.0, 60.0, 70, 15, "OK"],
      ["Diamicron 60", "Gliclazide", "Tablet", 18.0, 25.0, 150, 30, "OK"],
      ["Januvia 100", "Sitagliptin", "Tablet", 120.0, 150.0, 40, 8, "OK"],
      ["Jardiance 10", "Empagliflozin", "Tablet", 180.0, 220.0, 30, 5, "OK"],
      ["Trajenta 5mg", "Linagliptin", "Tablet", 110.0, 140.0, 45, 10, "OK"],
      ["Daonil 5mg", "Glibenclamide", "Tablet", 5.0, 8.0, 300, 40, "OK"],
      ["Mixtard 30/70", "Insulin", "Vial", 850.0, 1050.0, 25, 5, "OK"],
      ["Lantus SoloStar", "Insulin Glargine", "Pen", 2450.0, 2900.0, 10, 2, "OK"],
      ["Getryl 4mg", "Glimepiride", "Tablet", 18.0, 25.0, 150, 30, "OK"]
    ];

    const insertMed = db.prepare("INSERT INTO medicines (name, generic, category, buy_price, sell_price, stock, min_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const med of medicines) {
      insertMed.run(...med);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const currentDbPath = process.env.DATABASE_PATH || "medicare_pro.db";
  initDb(currentDbPath);

  app.use(express.json());

  // --- API ROUTES ---

  app.post("/api/ai/consult", async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await ai.models.generateContent({
        model: modelName,
        contents: `
          You are "MediCare AI", a senior pharmacological expert and digital assistant for MediCare Pro pharmacy system.
          
          KNOWLEDGE BASE & CONTEXT:
          1. Medications: Panadol (Paracetamol), Augmentin (Co-amoxiclav), Flagyl (Metronidazole), Risek (Omeprazole), Klaricid (Clarithromycin), Indrop-D (Vitamin D3), Surbex Z, etc.
          2. Categories: Analgesics, Antibiotics, Antacids, Antivirals, Supplements, Antihistamines, Antihypertensives.
          3. Capabilities: Drug interactions, generic alternatives, correct dosages, contraindications, and storage conditions.
          4. Style: Professional, clinical, formatted with Markdown (bold/lists).
          5. Dataset: You are powered by a catalog of 50+ regional medicines.
          
          SAFETY WARNING: Always mandate consulting a licensed doctor for prescriptions. Highlight high-risk side effects.
          
          User query: ${prompt}
        `
      });
      res.json({ response: result.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Consultation failed." });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", (req, res) => {
    const totalRevenue = db.prepare("SELECT SUM(net_total) as val FROM sales WHERE date(created_at) = date('now')").get() as any;
    const totalMedicines = db.prepare("SELECT COUNT(*) as count FROM medicines").get() as any;
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM medicines WHERE stock <= min_stock").get() as any;
    const totalSuppliers = db.prepare("SELECT COUNT(*) as count FROM suppliers").get() as any;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
    
    res.json({
      revenue: totalRevenue?.val || 0,
      medicines: totalMedicines?.count || 0,
      lowStock: lowStock?.count || 0,
      suppliers: totalSuppliers?.count || 0,
      customers: totalCustomers?.count || 0
    });
  });

  // Medicines
  app.get("/api/medicines", (req, res) => {
    const rows = db.prepare("SELECT * FROM medicines").all();
    res.json(rows);
  });

  app.post("/api/medicines", (req, res) => {
    const { name, generic, category, buy_price, sell_price, stock, min_stock, status } = req.body;
    const info = db.prepare("INSERT INTO medicines (name, generic, category, buy_price, sell_price, stock, min_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(name, generic, category, buy_price, sell_price, stock, min_stock, status);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/medicines/:id", (req, res) => {
    const { name, generic, category, buy_price, sell_price, stock, min_stock, status, expiry_date } = req.body;
    db.prepare(`
      UPDATE medicines 
      SET name = ?, generic = ?, category = ?, buy_price = ?, sell_price = ?, stock = ?, min_stock = ?, status = ?, expiry_date = ?
      WHERE id = ?
    `).run(name, generic, category, buy_price, sell_price, stock, min_stock, status, expiry_date, req.params.id);
    res.json({ success: true });
  });

  // Sales
  app.get("/api/sales", (req, res) => {
    const rows = db.prepare(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(rows);
  });

  app.post("/api/sales", (req, res) => {
    const { customer_name, items, subtotal, discount, tax, net_total, payment_method, amount_paid, change_due } = req.body;
    
    // Find or create customer
    let customerId = null;
    if (customer_name) {
      const existingCust = db.prepare("SELECT id FROM customers WHERE name = ?").get(customer_name) as any;
      if (existingCust) {
        customerId = existingCust.id;
      } else {
        const info = db.prepare("INSERT INTO customers (name, created_at) VALUES (?, ?)")
          .run(customer_name, new Date().toISOString());
        customerId = info.lastInsertRowid;
      }
    }

    const invoiceNo = "INV-" + Date.now();
    const saleInfo = db.prepare("INSERT INTO sales (invoice_no, customer_id, total, discount, tax, net_total, payment_method, amount_paid, change_due, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(invoiceNo, customerId, subtotal, discount, tax, net_total, payment_method, amount_paid, change_due, new Date().toISOString());
    
    const saleId = saleInfo.lastInsertRowid;

    // Add items and update stock
    for (const item of items) {
      db.prepare("INSERT INTO sale_items (sale_id, medicine_id, qty, unit_price, total) VALUES (?, ?, ?, ?, ?)")
        .run(saleId, item.id, item.qty, item.sell_price, item.qty * item.sell_price);
      
      db.prepare("UPDATE medicines SET stock = stock - ? WHERE id = ?")
        .run(item.qty, item.id);
    }

    res.json({ id: saleId, invoice_no: invoiceNo });
  });

  // Suppliers
  app.get("/api/suppliers", (req, res) => {
    const rows = db.prepare("SELECT * FROM suppliers").all();
    res.json(rows);
  });

  app.post("/api/suppliers", (req, res) => {
    const { name, company, contact, city, status } = req.body;
    const info = db.prepare("INSERT INTO suppliers (name, company, contact, city, status) VALUES (?, ?, ?, ?, ?)")
      .run(name, company, contact, city, status || "Active");
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/suppliers/:id", (req, res) => {
    const { name, company, contact, city, status } = req.body;
    db.prepare("UPDATE suppliers SET name = ?, company = ?, contact = ?, city = ?, status = ? WHERE id = ?")
      .run(name, company, contact, city, status, req.params.id);
    res.json({ success: true });
  });

  // Customers
  app.get("/api/customers", (req, res) => {
    const rows = db.prepare("SELECT * FROM customers").all();
    res.json(rows);
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, address } = req.body;
    const info = db.prepare("INSERT INTO customers (name, phone, address, created_at) VALUES (?, ?, ?, ?)")
      .run(name, phone, address, new Date().toISOString());
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/customers/:id", (req, res) => {
    const { name, phone, address } = req.body;
    db.prepare("UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?")
      .run(name, phone, address, req.params.id);
    res.json({ success: true });
  });

  // Purchases
  app.get("/api/purchases", (req, res) => {
    const rows = db.prepare(`
      SELECT p.*, s.name as supplier_name 
      FROM purchases p 
      JOIN suppliers s ON p.supplier_id = s.id 
      ORDER BY p.created_at DESC
    `).all();
    res.json(rows);
  });

  app.post("/api/purchases", (req, res) => {
    const { supplier_id, items, total } = req.body;
    const po_no = "PO-" + Date.now();
    
    const transaction = db.transaction(() => {
      const pInfo = db.prepare("INSERT INTO purchases (po_no, supplier_id, total, status, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(po_no, supplier_id, total, "Delivered", new Date().toISOString());
      
      const pId = pInfo.lastInsertRowid;

      for (const item of items) {
        db.prepare("INSERT INTO purchase_items (purchase_id, medicine_id, qty, unit_price, total) VALUES (?, ?, ?, ?, ?)")
          .run(pId, item.id, item.qty, item.buy_price, item.qty * item.buy_price);
        
        db.prepare("UPDATE medicines SET stock = stock + ? WHERE id = ?")
          .run(item.qty, item.id);
      }
      return pId;
    });

    const id = transaction();
    res.json({ id, po_no });
  });

  // Authentication
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare("SELECT id, username, full_name, role, status FROM users WHERE username = ? AND password = ?")
      .get(username, password);

    if (user) {
      if (user.status !== "Active") {
        return res.status(403).json({ error: "Account is deactivated. Contact Administrator." });
      }
      // Update last login
      db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(new Date().toISOString(), user.id);
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });

  // Users
  app.get("/api/users", (req, res) => {
    const rows = db.prepare("SELECT id, username, full_name, role, contact, status, last_login FROM users").all();
    res.json(rows);
  });

  app.post("/api/users", (req, res) => {
    const { username, password, full_name, role, contact, status } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (username, password, full_name, role, contact, status) VALUES (?, ?, ?, ?, ?, ?)")
        .run(username, password, full_name, role, contact, status || "Active");
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { username, full_name, role, contact, status, password } = req.body;
    if (password) {
      db.prepare("UPDATE users SET username = ?, full_name = ?, role = ?, contact = ?, status = ?, password = ? WHERE id = ?")
        .run(username, full_name, role, contact, status, password, req.params.id);
    } else {
      db.prepare("UPDATE users SET username = ?, full_name = ?, role = ?, contact = ?, status = ? WHERE id = ?")
        .run(username, full_name, role, contact, status, req.params.id);
    }
    res.json({ success: true });
  });

  app.patch("/api/users/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // Delete Medicines
  app.delete("/api/medicines/:id", (req, res) => {
    db.prepare("DELETE FROM medicines WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Delete Suppliers
  app.delete("/api/suppliers/:id", (req, res) => {
    db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Delete Customers
  app.delete("/api/customers/:id", (req, res) => {
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Delete Users
  app.delete("/api/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Delete Purchase
  app.delete("/api/purchases/:id", (req, res) => {
    db.prepare("DELETE FROM purchases WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM purchase_items WHERE purchase_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Delete Sales
  app.delete("/api/sales/:id", (req, res) => {
    db.prepare("DELETE FROM sales WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM sale_items WHERE sale_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, the bundled server.cjs is in the dist/ folder.
    // We want to serve assets from this same folder.
    const distPath = path.resolve(__dirname);
    console.log(`[SERVER] MEDICARE PRO PRODUCTION`);
    console.log(`[SERVER] Resource Directory: ${distPath}`);
    
    // Log directory contents to help debug
    try {
      const files = fs.readdirSync(distPath);
      console.log(`[SERVER] Files in resource directory: ${files.join(", ")}`);
    } catch (e) {
      console.error(`[SERVER] Failed to read resource directory:`, e);
    }
    
    if (fs.existsSync(path.join(distPath, "index.html"))) {
      console.log(`[SERVER] Verified: index.html exists in ${distPath}`);
    } else {
      console.error(`[SERVER] ERROR: index.html NOT FOUND in ${distPath}`);
    }
    
    // Explicitly handle root to ensure index.html is served correctly
    app.get("/", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log(`[SERVER] Attempting to serve index.html from: ${indexPath}`);
      
      if (!fs.existsSync(indexPath)) {
        console.error(`[SERVER] index.html NOT found at root get: ${indexPath}`);
        return res.status(404).send("System Files Missing. Please reinstall.");
      }

      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[SERVER] Root serving failed:`, err);
          res.status(500).send("Main system files error.");
        }
      });
    });

    // Serve static files from the dist directory
    app.use(express.static(distPath));
    
    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", mode: "production", time: new Date().toISOString(), path: distPath });
    });

    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      
      // If it's an API route that wasn't caught, return 404
      if (req.url.startsWith("/api")) {
        console.warn(`[SERVER] API route not found: ${req.url}`);
        return res.status(404).json({ error: "Endpoint not found" });
      }

      console.log(`[SERVER] Fallback serving index.html for: ${req.url}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[SERVER] Error sending index.html:`, err);
          res.status(500).send("Application shell error.");
        }
      });
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`[SERVER] MEDICARE PRO ENGINE started on http://127.0.0.1:${PORT}`);
  });
}

startServer();
