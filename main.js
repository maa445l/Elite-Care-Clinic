'use strict';
const { app, BrowserWindow, Menu, Tray, dialog, shell, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

if (!app.requestSingleInstanceLock()) { app.quit(); }
app.setAppUserModelId('pk.elitecare.clinic');

let manualCheck = false, resetWin = null, win = null, tray = null, srv = null, cfg = null, quitting = false, setupWin = null, setupDone = null;
const hidden = process.argv.includes('--hidden');
const iconPath = path.join(__dirname, 'build', 'icon.png');
const cfgFile = () => path.join(app.getPath('userData'), 'settings.json');
const loadCfg = () => { try { return JSON.parse(fs.readFileSync(cfgFile(), 'utf8')); } catch (e) { return null; } };
const saveCfg = (c) => { fs.mkdirSync(app.getPath('userData'), { recursive: true }); fs.writeFileSync(cfgFile(), JSON.stringify(c, null, 2)); };

app.on('second-instance', () => { if (win) { win.show(); if (win.isMinimized()) win.restore(); win.focus(); } });

// ---------- first-run choice: server or client ----------
function runSetup() {
  return new Promise((resolve) => {
    setupDone = resolve;
    setupWin = new BrowserWindow({
      width: 560, height: 560, resizable: false, autoHideMenuBar: true, icon: iconPath, title: 'Elite Care Clinic setup',
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    setupWin.setMenu(null);
    setupWin.loadFile(path.join(__dirname, 'setup.html'));
    setupWin.on('closed', () => { setupWin = null; if (setupDone) { setupDone(null); setupDone = null; } });
  });
}
ipcMain.handle('setup:save', (e, c) => { const d = setupDone; setupDone = null; if (setupWin) setupWin.close(); if (d) d(c); });
ipcMain.handle('setup:cancel', () => { if (setupWin) setupWin.close(); });
ipcMain.handle('setup:pick', async () => {
  const r = await dialog.showOpenDialog(setupWin, { properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('reset:save', (e, pw) => {
  if (!srv) return { error: 'This computer is not the server.' };
  try { const name = srv.resetOwnerPassword(String(pw || '')); if (resetWin) resetWin.close(); dialog.showMessageBox({ type: 'info', message: 'Password changed', detail: 'The owner account "' + name + '" now uses the new password. Everyone was signed out.' }); return { ok: true }; }
  catch (err) { return { error: err.message }; }
});
ipcMain.handle('reset:cancel', () => { if (resetWin) resetWin.close(); });
function openReset() {
  if (resetWin) { resetWin.focus(); return; }
  resetWin = new BrowserWindow({ width: 460, height: 360, resizable: false, autoHideMenuBar: true, icon: iconPath, title: 'Reset owner password', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  resetWin.setMenu(null);
  resetWin.loadFile(path.join(__dirname, 'reset.html'));
  resetWin.on('closed', () => { resetWin = null; });
}

// ---------- updates: always ask first ----------
let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) { autoUpdater = null; }
function setupUpdates() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on('update-available', async (info) => {
    manualCheck = false;
    const r = await dialog.showMessageBox(win || undefined, {
      type: 'question', buttons: ['Update now', 'Later'], defaultId: 0, cancelId: 1,
      message: 'A new version of Elite Care Clinic is available (' + info.version + ')',
      detail: 'Update now downloads it in the background. When it is ready you choose when to restart. A backup is made automatically first.',
    });
    if (r.response === 0) { try { autoUpdater.downloadUpdate(); } catch (e) { dialog.showErrorBox('Update failed', e.message); } }
  });
  autoUpdater.on('update-not-available', () => {
    if (manualCheck) { manualCheck = false; dialog.showMessageBox(win || undefined, { type: 'info', message: 'You have the latest version', detail: 'Version ' + app.getVersion() }); }
  });
  autoUpdater.on('update-downloaded', async (info) => {
    const r = await dialog.showMessageBox(win || undefined, {
      type: 'question', buttons: ['Restart and install', 'Later'], defaultId: 1, cancelId: 1,
      message: 'Version ' + info.version + ' is ready',
      detail: 'The app will close and open again. If this is the server computer, the other computers lose connection for about a minute. Choose Later if the clinic is busy; it will install the next time you restart the app.',
    });
    if (r.response === 0) {
      try { if (srv) srv.backupNow(); } catch (e) {}
      quitting = true;
      autoUpdater.quitAndInstall();
    } else { autoUpdater.autoInstallOnAppQuit = true; }
  });
  autoUpdater.on('error', (e) => {
    if (manualCheck) { manualCheck = false; dialog.showMessageBox(win || undefined, { type: 'info', message: 'Could not check for updates', detail: 'Check the internet connection and try again later.\n\n' + (e && e.message ? e.message : '') }); }
  });
  const check = () => { try { autoUpdater.checkForUpdates().catch(() => {}); } catch (e) {} };
  setTimeout(check, 20 * 1000);
  setInterval(check, 6 * 60 * 60 * 1000);
}
function checkNow() {
  if (!autoUpdater || !app.isPackaged) { dialog.showMessageBox({ type: 'info', message: 'Updates are only available in the installed app.' }); return; }
  manualCheck = true;
  autoUpdater.checkForUpdates().catch(() => { manualCheck = false; dialog.showMessageBox({ type: 'info', message: 'Could not check for updates', detail: 'Check the internet connection and try again.' }); });
}

// ---------- main window ----------
function normalizeAddress(a) {
  let u = String(a || '').trim();
  if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
  if (!/:\d+(\/|$)/.test(u.replace(/^https?:\/\//i, ''))) u = u.replace(/\/$/, '') + ':3737';
  return u;
}
function createWindow(url) {
  win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 900, minHeight: 600, show: false, icon: iconPath, title: 'Elite Care Clinic',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  const origin = new URL(url).origin;
  win.once('ready-to-show', () => { if (!hidden || !srv) win.show(); });
  win.webContents.setWindowOpenHandler(({ url: u }) => { if (/^https?:/i.test(u) && new URL(u).origin !== origin) shell.openExternal(u); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, u) => { if (!u.startsWith('data:') && new URL(u).origin !== origin) e.preventDefault(); });
  win.webContents.on('did-fail-load', (e, code, desc, u, isMain) => {
    if (!isMain || code === -3) return;
    const page = '<body style="font:16px Segoe UI,sans-serif;padding:40px;color:#12303d"><h2>Cannot reach the clinic server</h2><p>Address tried: ' + url + '</p><p>Check that the server computer is switched on, that this computer is on the same network, and that the address is right.</p><p>Then press Ctrl+R to try again, or use File, Change setup.</p></body>';
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
  });
  win.on('close', (e) => {
    if (srv && !quitting) {
      e.preventDefault();
      win.hide();
      if (tray && process.platform === 'win32' && !app.__toldBackground) {
        app.__toldBackground = true;
        try { tray.displayBalloon({ title: 'Elite Care Clinic is still running', content: 'The other computers can still connect. To stop it, right-click this icon and choose Quit.' }); } catch (x) {}
      }
    }
  });
  win.on('closed', () => { win = null; });
  win.loadURL(url);
}

function buildMenu() {
  const isServer = cfg && cfg.mode === 'server';
  const file = [];
  if (isServer) {
    file.push(
      { label: 'Backup now', click: async () => { try { const n = srv.backupNow(); dialog.showMessageBox({ type: 'info', message: 'Backup saved', detail: n + '\n\nFolder: ' + srv.getBackupDir() }); } catch (e) { dialog.showErrorBox('Backup failed', e.message); } } },
      { label: 'Choose backup folder...', click: async () => {
        const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] });
        if (r.canceled) return;
        srv.setBackupDir(r.filePaths[0]); cfg.backupDir = r.filePaths[0]; saveCfg(cfg);
        try { const n = srv.backupNow(); dialog.showMessageBox({ type: 'info', message: 'Backup folder changed', detail: 'A test backup was saved:\n' + n }); } catch (e) { dialog.showErrorBox('That folder cannot be written to', e.message); }
      } },
      { label: 'Open data folder', click: () => shell.openPath(path.dirname(srv.store.file)) },
      { label: 'Open backup folder', click: () => shell.openPath(srv.getBackupDir()) },
      { label: 'Show connection address', click: () => {
        const a = srv.addresses();
        dialog.showMessageBox({ type: 'info', message: 'Other computers connect to:', detail: (a.length ? a.map((x) => 'http://' + x + ':' + srv.port).join('\n') : 'No network connection found.') + '\n\nIn a browser, or in this app on the other computers (File, Change setup, Client).' });
      } },
      { label: 'Forgot the owner password...', click: openReset },
      { type: 'separator' },
      { label: 'Start with Windows', type: 'checkbox', checked: !!cfg.autoStart, click: (m) => { cfg.autoStart = m.checked; saveCfg(cfg); app.setLoginItemSettings({ openAtLogin: m.checked, args: ['--hidden'] }); } },
    );
  }
  file.push(
    { label: 'Check for updates... (version ' + app.getVersion() + ')', click: checkNow },
    { label: 'Change setup...', click: async () => {
      const r = await dialog.showMessageBox({ type: 'question', buttons: ['Change', 'Cancel'], defaultId: 1, message: 'Change what this computer does?', detail: 'Your clinic data is not deleted. The app will restart and ask again.' });
      if (r.response === 0) { try { fs.unlinkSync(cfgFile()); } catch (e) {} quitting = true; app.relaunch(); app.quit(); }
    } },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit(); } },
  );
  const tpl = [
    { label: 'File', submenu: file },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

function makeTray() {
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }));
    tray.setToolTip('Elite Care Clinic server');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open Elite Care Clinic', click: () => { if (win) { win.show(); win.focus(); } } },
      { label: 'Quit (stops the server)', click: () => { quitting = true; app.quit(); } },
    ]));
    tray.on('double-click', () => { if (win) { win.show(); win.focus(); } });
  } catch (e) { tray = null; }
}

app.on('before-quit', (e) => {
  quitting = true;
  if (srv && !srv.__closing) {
    e.preventDefault();
    srv.__closing = true;
    srv.close().then(() => app.quit(), () => app.quit());
  }
});
app.on('session-end', () => { try { if (srv) srv.store.flush(); } catch (e) {} });
app.on('window-all-closed', () => { if (!srv) app.quit(); });

app.whenReady().then(async () => {
  cfg = loadCfg();
  if (!cfg) {
    cfg = await runSetup();
    if (!cfg) { app.quit(); return; }
    saveCfg(cfg);
    if (cfg.mode === 'server') app.setLoginItemSettings({ openAtLogin: !!cfg.autoStart, args: ['--hidden'] });
  }
  let url;
  if (cfg.mode === 'server') {
    try {
      const { start } = require('./server/server');
      srv = await start({
        dataDir: cfg.dataDir || path.join(app.getPath('userData'), 'data'),
        backupDir: cfg.backupDir || undefined,
        port: cfg.port || 3737,
        webDir: path.join(__dirname, 'web'),
      });
    } catch (e) {
      dialog.showErrorBox('The clinic server could not start', e.message + '\n\nIf Elite Care Clinic is already running (check the tray icon near the clock), close it first.');
      quitting = true; app.quit(); return;
    }
    url = 'http://localhost:' + srv.port;
    makeTray();
  } else {
    url = normalizeAddress(cfg.address);
  }
  buildMenu();
  createWindow(url);
  setupUpdates();
});
