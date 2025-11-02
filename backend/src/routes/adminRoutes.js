import express from 'express';
import { uploadFAQ, getFAQs, deleteFAQ } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.post('/upload', uploadSingle, uploadFAQ);
router.get('/data', getFAQs);
router.delete('/data/:id', deleteFAQ);

export default router;


