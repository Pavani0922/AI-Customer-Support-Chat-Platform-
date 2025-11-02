import { makeAutoObservable, runInAction } from 'mobx';
import { chatAPI } from '../services/api.js';

class ChatStore {
  messages = [];
  currentConversationId = null;
  currentSessionId = null;
  conversations = [];
  isLoading = false;
  isTyping = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.currentSessionId = this.generateSessionId();
  }

  generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    runInAction(() => {
      this.messages.push(userMessage);
      this.isLoading = true;
      this.isTyping = true;
      this.error = null;
    });

    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await chatAPI.sendMessage(content.trim(), this.currentSessionId);

      if (response.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };

        runInAction(() => {
          this.messages.push(assistantMessage);
          this.currentConversationId = response.conversationId;
          this.currentSessionId = response.sessionId;
          this.isLoading = false;
          this.isTyping = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to send message';
        this.isLoading = false;
        this.isTyping = false;
        
        // Remove user message on error (optional - you can keep it)
        // this.messages = this.messages.filter(msg => msg !== userMessage);
      });
    }
  };

  loadConversation = async (conversationId) => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await chatAPI.getConversation(conversationId);
      
      if (response.success) {
        runInAction(() => {
          this.messages = response.conversation.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          this.currentConversationId = conversationId;
          this.currentSessionId = response.conversation.sessionId;
          this.isLoading = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to load conversation';
        this.isLoading = false;
      });
    }
  };

  loadConversations = async () => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await chatAPI.getConversations();
      
      if (response.success) {
        runInAction(() => {
          this.conversations = response.conversations;
          this.isLoading = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to load conversations';
        this.isLoading = false;
      });
    }
  };

  clearChat = () => {
    this.messages = [];
    this.currentConversationId = null;
    this.currentSessionId = this.generateSessionId();
    this.error = null;
  };

  setTyping = (isTyping) => {
    this.isTyping = isTyping;
  };
}

export default new ChatStore();


