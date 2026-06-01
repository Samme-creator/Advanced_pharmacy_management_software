const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;
let serverStartupFailed = false;
let startupError = null;

function handleStartupError(error) {
  serverStartupFailed = true;
  startupError = error;
  if (mainWindow) {
    const safeStack = (error && error.stack) ? error.stack.replace(/`/g, '\\`').replace(/\${/g, '\\${') : 'Unknown backend crash details';
    const safeMsg = (error && error.message) ? error.message.replace(/`/g, '\\`').replace(/\${/g, '\\${') : 'Database/Port conflict dynamic crash';
    mainWindow.webContents.executeJavaScript(`
      document.body.style.backgroundColor = "#020617";
      document.body.style.color = "#ef4444";
      document.body.style.display = "flex";
      document.body.style.flexDirection = "column";
      document.body.style.alignItems = "center";
      document.body.style.justifyContent = "center";
      document.body.style.height = "100vh";
      document.body.style.margin = "0";
      document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
      document.body.style.textAlign = "center";
      document.body.innerHTML = \`
        <div style="background: #0f172a; padding: 32px; border-radius: 12px; border: 1px solid #1e293b; max-width: 80%; width: 640px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #f87171;">System Startup Failure</h1>
          <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
            The Medicare Pro core engine failed to boot up on port 3000. 
            This is usually caused by another database terminal instance running, or a process port lock.
          </p>
          <div style="text-align: left; background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; max-height: 180px; overflow-y: auto;">
            <div style="color: #ef4444; font-weight: bold; font-family: monospace; font-size: 11px; margin-bottom: 8px;">Error: ${safeMsg}</div>
            <pre style="margin: 0; color: #cbd5e1; font-family: monospace; font-size: 10px; line-height: 1.4; white-space: pre-wrap; word-break: break-all;">${safeStack}</pre>
          </div>
          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 11px;">
            Troubleshooting: Open <strong>Windows Task Manager</strong> (Ctrl+Shift+Esc), end all "Medicare Pro" processes, then restart the application.
          </p>
        </div>
      \`;
    `).catch(() => {});
  }
}

process.on('uncaughtException', (error) => {
  console.error('Main process uncaught exception:', error);
  handleStartupError(error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Main process unhandled rejection:', reason);
  handleStartupError(new Error(reason ? (reason.stack || String(reason)) : 'Unhandled promise rejection'));
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Medicare Pro",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadApp = () => {
    if (serverStartupFailed) {
      if (startupError) {
        handleStartupError(startupError);
      }
      return;
    }

    // Force 127.0.0.1 to avoid IPv6 localhost resolution issues on some Windows machines
    const url = 'http://127.0.0.1:3000';
    console.log(`Main: Loading URL: ${url}`);
    
    // Only show loading screen if the window is still blank or showing initializing
    mainWindow.webContents.executeJavaScript(`
      if (document.body.innerHTML.trim() === "" || document.body.innerText.includes("Initializing")) {
        document.body.style.backgroundColor = "#020617";
        document.body.style.color = "#ffffff";
        document.body.style.display = "flex";
        document.body.style.alignItems = "center";
        document.body.style.justifyContent = "center";
        document.body.style.height = "100vh";
        document.body.style.margin = "0";
        document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
        document.body.innerHTML = \`
          <div style="text-align: center; background: #0f172a; padding: 16px 28px; border-radius: 8px; border: 1px solid #1e293b; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);">
            <h2 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; letter-spacing: -0.01em;">Medicare Pro</h2>
            <p style="margin: 0; color: #64748b; font-size: 11px;">Connecting to Engine...</p>
            <div style="margin-top: 12px; height: 1.5px; width: 60px; background: #1e293b; border-radius: 1px; position: relative; overflow: hidden; margin-left: auto; margin-right: auto;">
              <div style="position: absolute; height: 100%; width: 40%; background: #22c55e; animation: loading 1.2s infinite ease-in-out;"></div>
            </div>
            <style>
              @keyframes loading {
                0% { left: -40%; }
                100% { left: 100%; }
              }
            </style>
          </div>
        \`;
      }
    `).catch(() => {});

    mainWindow.loadURL(url).catch((err) => {
      if (serverStartupFailed) {
        return;
      }
      console.log(`Main: Server not responding at ${url}. Retrying...`);
      setTimeout(loadApp, 1000);
    });
  };

  loadApp();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open DevTools in production for now to help debug blank screen
  mainWindow.webContents.openDevTools();
}

function startServer() {
  const fs = require('fs');
  const userDataPath = app.getPath('userData');
  let dbPath = path.join(userDataPath, 'medicare_pro.db');
  
  const execDir = app.isPackaged ? path.dirname(process.execPath) : __dirname;
  const configFilePath = path.join(execDir, 'database_path.txt');
  
  console.log('Main: Checking for database path configuration details...');
  
  let targetDir = null;
  
  if (fs.existsSync(configFilePath)) {
    try {
      let customDir = fs.readFileSync(configFilePath, 'utf8').trim();
      if (customDir) {
        if (customDir.startsWith('.') || !path.isAbsolute(customDir)) {
          customDir = path.resolve(execDir, customDir);
        }
        targetDir = customDir;
        console.log('Main: Found database_path.txt override:', targetDir);
      }
    } catch (err) {
      console.error('Main: Failed to read database_path.txt override, falling back:', err);
    }
  }
  
  // If no custom config file exists and we are packaged, save database by default in the executable folder (portable mode)
  if (!targetDir && app.isPackaged) {
    try {
      const portableDir = path.join(execDir, 'database');
      // Verify we have write access (skip folder portable mode if we are in C:\Program Files or read-only volume)
      if (!fs.existsSync(portableDir)) {
        fs.mkdirSync(portableDir, { recursive: true });
      }
      
      const testFile = path.join(portableDir, '.check_writable');
      fs.writeFileSync(testFile, 'writable_test');
      fs.unlinkSync(testFile);
      
      targetDir = portableDir;
      console.log('Main: Running in Automatic Portable Mode. Database directory:', targetDir);
    } catch (writeErr) {
      console.warn('Main: Executable directory is read-only. Falling back securely to user AppData root:', writeErr);
    }
  }
  
  if (targetDir) {
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      dbPath = path.join(targetDir, 'medicare_pro.db');
    } catch (err) {
      console.error('Main: Failed to initialize resolved targeted folder. Defaulting to AppData:', err);
    }
  }
  
  // Set environment variables for the server module
  process.env.NODE_ENV = 'production';
  process.env.PORT = '3000';
  process.env.DATABASE_PATH = dbPath;

  console.log('Main: Initializing Server...');
  console.log('Main: Database will be at:', dbPath);

  try {
    // We require the bundled server directly. 
    // In packaging, dist/server.cjs is relative to this file.
    // Electron's require is patched to support ASAR.
    const serverPath = path.join(__dirname, 'dist', 'server.cjs');
    console.log('Main: Loading Server Module from:', serverPath);
    
    // Check if file exists in ASAR
    const fs = require('fs');
    if (fs.existsSync(serverPath)) {
      console.log('Main: Server file confirmed to exist.');
    } else {
      throw new Error(`Server file missing at ${serverPath}`);
    }

    require(serverPath);
    console.log('Main: Server module required successfully.');
  } catch (error) {
    console.error('Main: CRITICAL ERROR loading server module!');
    console.error(error);
    handleStartupError(error);
  }
}

app.on('ready', () => {
  createWindow();
  startServer();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
