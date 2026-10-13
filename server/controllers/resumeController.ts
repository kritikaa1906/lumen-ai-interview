import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { resumeService } from '../services/resumeService';

export async function uploadResume(req: AuthRequest, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded. Please upload a PDF resume.' });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum 5MB limit.' });
    }

    const saved = await resumeService.processResumeUpload({
      userId: req.user!.id,
      originalName: file.originalname,
      buffer: file.buffer,
      size: file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume analyzed and saved successfully.',
      resume: saved,
    });
  } catch (err: any) {
    console.error('[ResumeController] Upload error:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to process resume file.',
    });
  }
}

export async function getResumes(req: AuthRequest, res: Response) {
  try {
    const resumes = await db.getResumesByUserId(req.user!.id);
    return res.json({
      success: true,
      resumes,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch resume profiles.' });
  }
}

export async function deleteResume(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid resume ID.' });
    }

    const deleted = await db.deleteResume(id, req.user!.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Resume not found or you lack permission to delete it.' });
    }

    return res.json({
      success: true,
      message: 'Resume removed successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to delete resume profile.' });
  }
}
