import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profileController';

export const profileRoutes = Router();

profileRoutes.use(requireAuth as any);
profileRoutes.get('/', getProfile as any);
profileRoutes.patch('/', updateProfile as any);
