import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { uploadResume, getResumes, deleteResume } from '../controllers/resumeController';

export const resumeRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported for resume skill extraction.'));
    }
  },
});

resumeRoutes.use(requireAuth as any);
resumeRoutes.post('/', upload.single('resume'), uploadResume as any);
resumeRoutes.get('/', getResumes as any);
resumeRoutes.delete('/:id', deleteResume as any);
