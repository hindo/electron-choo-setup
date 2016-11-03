'use strict'

const electron = require('electron')
const app = electron.app

const BrowserWindow = electron.BrowserWindow

const path = require('path')

let mainWindow
let createWindow = () => {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
