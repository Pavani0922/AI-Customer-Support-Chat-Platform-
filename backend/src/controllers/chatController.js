import chatService from '../services/chatService.js';
import { v4 as uuidv4 } from 'uuid';

export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Generate sessionId if not provided
    const currentSessionId = sessionId || uuidv4();

    const result = await chatService.processMessage(
      userId,
      currentSessionId,
      message.trim()
    );

    res.json({
      success: true,
      response: result.response,
      sessionId: currentSessionId,
      conversationId: result.conversationId
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const conversations = await chatService.getUserConversations(userId);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await chatService.getConversation(userId, id);

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};



