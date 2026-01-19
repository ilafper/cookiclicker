const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  
  mainWindow.loadURL('http://localhost:4200');

  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Ventana lista, IPC disponible');
  });
}

app.on('ready', createWindow);



// Crear o abrir base de datos
const dbPath = path.join(app.getPath('userData'), 'datos.db');


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error abriendo la base de datos', err);
  else console.log('Base de datos SQLite lista en:', dbPath);
});

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    n_clicks INTEGER
  )
`, () => {
  // Insertar datos iniciales solo si la tabla está vacía
  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (err) return console.error(err);

    if (row.count === 0) {
      // Tabla vacía → insertar datos base
      const stmt = db.prepare(`INSERT INTO users (name, n_clicks) VALUES (?, ?)`);
      stmt.run('juan',12);
      stmt.run('maria', 15);
      stmt.run('carlos', 30);
      stmt.finalize();

      console.log('Datos iniciales insertados sISISISIS');
    }
  });
});





// Leer todos los usuarios
ipcMain.handle('get-users', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users order by n_clicks DESC LIMIT 5', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});


// Crear nuevo usuario
ipcMain.handle('create-user', (event, user) => {
  return new Promise((resolve, reject) => {
    const { name, n_clicks } = user;
    db.run(
      'INSERT INTO users (name, n_clicks) VALUES (?, ?)',
      [name, n_clicks || 0],
      function(err) {
        if (err) reject(err);
        else resolve({ 
          id: this.lastID, 
          name:name, 
          n_clicks: n_clicks || 0 
        });
      }
    );
  });
});






