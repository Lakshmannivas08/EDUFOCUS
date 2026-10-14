import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import backend Express router
// Note: backend is in CommonJS, can require or import
import backendApp from './backend/server.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Mount backend API routes under /api
  app.use(backendApp);

  // In development, hook up Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EDUFOCUS] Full-stack Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[EDUFOCUS] Backend API ready at http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[EDUFOCUS] Failed to start server:', err);
  process.exit(1);
});
