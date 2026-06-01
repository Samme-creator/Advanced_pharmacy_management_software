================================================================================
                    MEDICARE PRO - PHARMACY MANAGEMENT SUITE
                             Windows Version 1.0.0
================================================================================

Welcome to Medicare Pro, a modern, highly optimized, production-ready pharmacy
and medical inventory management suite.

The application utilizes high-performance React for the front-end dashboard,
an embedded Express Node.js application server module, and an ACID-compliant,
fine-tuned SQLite micro-database.

--------------------------------------------------------------------------------
1. PACKAGING THE STANDALONE WINDOWS APP
--------------------------------------------------------------------------------
To compile and package the software into a SINGLE, fully self-contained portable
executable (.exe) that can be distributed and executed on any Windows computer
WITHOUT requiring Node.js, Python, SQLite, or other installations:

Step A: Prerequisites
        - Windows 10 or 11
        - Node.js LTS (v18 or higher) installed on the packaging computer.
          Download link: https://nodejs.org/

Step B: Automate Build Process
        - Double-click the file named "build.bat" located at the root of the
          extracted folder.
        - Alternatively, open Command Prompt (cmd) in this folder and run:
          > build.bat

        This script automatically:
        1. Installs all required packages (npm install)
        2. Compiles React components using Vite containing static distributions.
        3. Bundles the SQLite express server into a compact, single file
           (using fast esbuild).
        4. Recompiles the binary database module (better-sqlite3) against the
           safe Electron native headers (resolving any Node.js module version issues).
        5. Packages public static media, database, and system configurations
           into a streamlined, single-file executable in the "release" directory.

--------------------------------------------------------------------------------
2. HOW THE BUILT (.EXE) WORKS
--------------------------------------------------------------------------------
Once the builder script completes, a new folder named "release" is created.
Inside, you will find:
   -> release\Medicare Pro 1.0.0.exe

This is your master standalone application binary:
- Copyable: You can copy this file to any Windows computer (via USB, email, etc.).
- Independent: No Node.js launcher or Python installer is needed on the client.
- Offline: Runs 100% locally with zero internet access, unless querying the AI.
- Automated Data Management: It automatically boots up the private SQLite database
  safely inside the OS user's directory. Your business data is always safe,
  persisted, and won't get overwritten when updating the app binaries.

--------------------------------------------------------------------------------
3. RUNNING AND TROUBLESHOOTING
--------------------------------------------------------------------------------
- Database Location & Custom Drives (e.g., D: drive):
  By default, Medicare Pro stores user database files securely on the C: drive:
  C:\Users\<Your_Username>\AppData\Roaming\medicare-pro\medicare_pro.db

  TO TRANSFER/SAVE THE DATABASE ON THE D: DRIVE OR A CUSTOM FOLDER:
  1. Go to the directory containing your main executable "Medicare Pro 1.0.0.exe".
  2. Create a new simple text file named "database_path.txt" in that same folder.
  3. Open the "database_path.txt" file and type the exact path where you want the
     database of your pharmacy to be saved. For example:
     D:\MedicareData
  4. Save and close the text file. Now, when you run "Medicare Pro 1.0.0.exe",
     the app will automatically read that path, configure the engine, create the
     folder, and run/save your database on the D: drive!

  PORTABLE MODE (USB DRIVE):
  If you want the database to stay in the exact same folder as the .exe file
  (perfect for carrying the software and database on a USB flash drive), just
  write a single dot "." in your "database_path.txt" file. All data will be
  stored alongside the executable in portable mode!

- Startup failures / Blank screens / Port conflicts:
  1. If the app displays "Connecting to Engine..." for a long period of time,
     make sure another instance of Medicare Pro is not already running.
     Check Windows Task Manager (Ctrl + Shift + Esc) and terminate any stray
     processes.
  2. If sqlite driver conflicts arise on startup, it means Node binary headers
     changed. Rebuild them by executing "npm run rebuild".

- AI Chatbot Optimizer:
  The built-in Pharmacological AI Advisor panel is scaled down and framed on the
  right-hand corner. It handles all drug queries, interactions, and generic
  suggestions. Note: The LLM advisor uses Gemini model API capabilities and
  requires an active internet connection to deliver AI advice.

--------------------------------------------------------------------------------
4. ENHANCED PERFORMANCE DETAILS
--------------------------------------------------------------------------------
- Ultra-Fast Queries:
  Database engines are pre-configured to run with WAL (Write-Ahead Logging)
  journaling. All lookup parameters such as medicines, suppliers, custom items,
  sales invoices, and usernames are indexing-enabled. Large catalogs execute in
  microseconds with minimal disk utility overhead.
- Ram Optimizations:
  Dynamic engine caches are tuned to cap at only ~4MB. Temporary indices are
  handled natively in memory context instead of causing slow disk reads, ensuring
  very low background footprint and snappy dashboard refresh cycles.

================================================================================
Developed and Fine-Tuned by the Medicare Pro Team.
================================================================================
