import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './server/config/env';
import { healthRoutes } from './server/routes/healthRoutes';
import { authRoutes } from './server/routes/authRoutes';
import { profileRoutes } from './server/routes/profileRoutes';
import { resumeRoutes } from './server/routes/resumeRoutes';
import { interviewRoutes } from './server/routes/interviewRoutes';
import { analyticsRoutes } from './server/routes/analyticsRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount API routes
  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Global API error handler
  app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'An unexpected server error occurred.',
    });
  });

  // Serve frontend
  if (ENV.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In development, hook up Vite dev server middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`[Lumen Studio] Server operational on http://0.0.0.0:${ENV.PORT}`);
    console.log(`[Lumen Studio] Mode: ${ENV.NODE_ENV}`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('[Lumen Studio] Failed to start server:', err);
  process.exit(1);
});
