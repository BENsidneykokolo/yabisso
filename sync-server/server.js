const express = require('express');
const multer = require('multer');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Servir statiquement le dossier "uploads" (pour que le Tel2 puisse lire l'image/video)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration de Multer pour stocker physiquement les fichiers dans /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `mesh-${suffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// Écoute des WebSockets
wss.on('connection', (ws) => {
  clients.push(ws);
  console.log(`[Mesh Relay] Un appareil s'est connecté ! Total: ${clients.length}`);

  // Transmettre chaque message entrant à TOUS les AUTRES téléphones connectés
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`[Mesh Relay] Broadcast message reçu de type:`, data?.action);

      // On simule un "Mesh Broadcast"
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    } catch(e) { console.error('Erreur parsing WS', e); }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log(`[Mesh Relay] Appareil déconnecté. Restant(s): ${clients.length}`);
  });
});

// Route d'upload HTTP 
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fichier manquant' });
  }
  
  // Obtenir l'IP LAN du serveur pour la passer à l'application mobile
  const nets = os.networkInterfaces();
  let localIp = '192.168.1.XX';
  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
              localIp = net.address;
          }
      }
  }

  const fileUrl = `http://${localIp}:4000/uploads/${req.file.filename}`;
  console.log(`[Mesh Relay] Fichier uploadé avec succès: ${fileUrl}`);
  res.json({ url: fileUrl });
});

app.get('/health', (req, res) => res.json({ status: 'ok', peers: clients.length }));

const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Mesh Sync Relay Server en écoute sur le port ${PORT}`);
  console.log(`===============================================`);
  console.log(`1. Récupération des médias : http://[IP_PC]:${PORT}/uploads/nomfichier`);
  console.log(`2. Uploads :                 POST http://[IP_PC]:${PORT}/upload`);
  console.log(`3. Synchronisation Loba :    ws://[IP_PC]:${PORT}`);
  console.log(`En attente de téléphones...`);
});
