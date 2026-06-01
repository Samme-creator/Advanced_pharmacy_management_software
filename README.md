# MediCare Pro Extra v3.0 - Documentation

## Project Overview
MediCare Pro Extra is a modern, high-performance Pharmacy Management System designed for local pharmacies in Pakistan. It is built as a complete offline-ready desktop application using a full-stack web architecture (React + Express + SQLite).

**Main Technology Stack:**
- **Frontend:** React 19, Vite, Tailwind CSS (Design matching your reference)
- **Backend:** Node.js Express (Server-side logic & API)
- **Database:** SQLite 3 (Locally stored in `medicare_pro.db`)
- **PDF Engine:** pdfMake (Professional tabular invoices)
- **AI Engine:** Google Gemini 1.5 Flash (Pharmacological Consulting)

---

## Installation & Setup Process

### 1. Requirements
- Node.js (v18 or higher)
- A Windows/Linux/Mac machine

### 2. How to Run (Development)
1. Ensure all dependencies are installed: `npm install`
2. Start the dev server: `npm run dev`
3. Open your browser at `http://localhost:3000`

### 3. How to Build the Standalone Application (.exe)
To convert this into a single executable file as requested:

1. **Build the production assets:**
   ```bash
   npm run build
   ```
2. **Package using 'pkg' or 'Electron':**
   You can use the `pkg` tool to bundle the `dist/server.cjs` and the SQLite database into a single `.exe`.
   ```bash
   npx pkg . --targets node18-win-x64 --output MediCareProExtra.exe
   ```

---

## Key Modules
1. **Dashboard:** Real-time revenue tracking and low stock alerts.
2. **Medicines:** Full inventory management with stock levels, buy/sell prices, and category filtering.
3. **Sales & Billing:** Drag-and-drop style cart, invoice generation, discount/tax calculation, and PDF printing.
4. **Reports:** Tabular and graphical reports using Recharts.
5. **AI Assistant:** A built-in pharmacological advisor powered by Gemini for drug lookup and interaction checks.

---

## Technical Features
- **Proper Tabular Forms:** All lists are optimized for readability with strict grid layouts.
- **Offline First:** Data is persisted locally in a SQL database.
- **Portability:** The entire app logic, server, and database can be bundled into a folder or exe.
- **UI Consistency:** Follows the blue-themed professional design provided in the proposal.

---

## Contact & Credits
- **Developed by:** Syed Samiullah
- **Institution:** University of Malakand, Dept. of AI
- **Specialization:** Advanced Pharmacy Management v3.0 Stable
