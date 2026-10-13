import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getAnalytics } from '../controllers/analyticsController';

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth as any);
analyticsRoutes.get('/', getAnalytics as any);
