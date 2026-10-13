import { Router, Request, Response } from 'express';
import { db } from '../db';
import { geminiService } from '../services/geminiService';

export const healthRoutes = Router();

healthRoutes.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'Lumen AI Interview Studio',
    version: '1.0.0',
    hasGeminiKey: geminiService.hasLiveApiKey(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRoutes.get('/health/db', async (req: Request, res: Response) => {
  try {
    const health = await db.getHealth();
    return res.json({
      success: true,
      health,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Database health check failed',
      details: err.message,
    });
  }
});
