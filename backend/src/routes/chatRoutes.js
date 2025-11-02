import express from 'express';
import { sendMessage, getConversations, getConversation } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/message', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);

export default router;

