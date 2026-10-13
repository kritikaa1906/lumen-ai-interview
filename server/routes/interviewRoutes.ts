import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  saveAnswer,
  completeInterview,
  getResults,
} from '../controllers/interviewController';

export const interviewRoutes = Router();

interviewRoutes.use(requireAuth as any);
interviewRoutes.post('/', createInterview as any);
interviewRoutes.get('/', getInterviews as any);
interviewRoutes.get('/:id', getInterviewById as any);
interviewRoutes.patch('/:id', updateInterview as any);
interviewRoutes.post('/:id/answers', saveAnswer as any);
interviewRoutes.post('/:id/complete', completeInterview as any);
interviewRoutes.get('/:id/results', getResults as any);
