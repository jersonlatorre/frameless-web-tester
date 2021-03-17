const { app, BrowserWindow, ipcMain } = require('electron')
const contextMenu = require('electron-context-menu')

let isPopup = false
let isFullscreen = false
let mainWindow
let popupWindow
let url = 'http://127.0.0.1:5500'

ipcMain.on('change-url', (evt, newUrl) => {
  url = newUrl
  mainWindow.loadURL(url)
  popupWindow.close()
})

contextMenu({
  prepend: (params, window) => [
    {
      label: 'Cambiar Url...',

      click: () => {
        if (isPopup) return
        isPopup = true

        popupWindow = new BrowserWindow({
          width: 300,
          height: 100,
          // resizable: false,
          // minimizable: false,
          webPreferences: {
            nodeIntegration: true,
            devTools: true
          }
        })

        popupWindow.loadFile('./popup/index.html')
        popupWindow.removeMenu()
        popupWindow.setTitle('')

        popupWindow.webContents.on('did-finish-load', () => {
          popupWindow.webContents.send('set-url', url)
        })

        popupWindow.on('close', () => {
          isPopup = false
        })
      }
    },
    {
      label: 'Toggle Fullscreen',

      click: () => {
        isFullscreen = !isFullscreen
        mainWindow.setFullScreen(isFullscreen)
      }
    },
    {
      label: 'Inspect',

      click: () => {
        mainWindow.openDevTools()
      }
    }
  ]
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // titleBarStyle: 'customButtonsOnHover',
    // frame: false,
    webPreferences: {
      zoomFactor: 1
    }
  })

  mainWindow.loadURL(url)
  mainWindow.removeMenu()
  mainWindow.setTitle('')

  mainWindow.on('close', () => {
    try {
      popupWindow.close()
    } catch (error) {}
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit()
})
