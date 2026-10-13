import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../db';

export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const analytics = await db.getUserAnalytics(userId);

    return res.json({
      success: true,
      analytics,
    });
  } catch (err: any) {
    console.error('[AnalyticsController] getAnalytics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to aggregate analytics.' });
  }
}
