import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../db';

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        title: user.title,
        targetRole: user.target_role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, title, targetRole } = req.body;

    const updates: any = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof title === 'string' && title.trim()) updates.title = title.trim();
    if (typeof targetRole === 'string' && targetRole.trim()) updates.target_role = targetRole.trim();

    const updated = await db.updateUser(userId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User record not found.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        title: updated.title,
        targetRole: updated.target_role,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update user profile.' });
  }
}
