const { app, BrowserWindow, shell } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    center: true,
    webPreferences: {
      nodeIntegration: true,
    },
    // frame: false,
    icon: "./public/favicon.ico",
    title: "Fusion Explorer",
    // titleBarStyle: {
    //   customButtonsOnHover: true,
    //   trafficLightPosition: { x: 10, y: 10 },
    // },
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    // transparent: true,
  });

  win.loadURL("https://localhost:3000/playground"); // Load your Next.js app's development server URL

  win.webContents.setWindowOpenHandler(({ url }) => {
    // config.fileProtocol is my custom file protocol
    // if (url.startsWith(config.fileProtocol)) {
    //   return { action: "allow" };
    // }
    // open url in a browser and prevent default
    if (url) {
      shell.openExternal(url);
      return { action: "allow" };
    } else {
      return { action: "deny" };
    }
  });
  // Uncomment the line below to open the DevTools in Electron
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//  pass information to the browser window of npub..
