import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../../stores/chatStore.js';
import MessageBubble from './MessageBubble.jsx';

const MessageList = observer(() => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll on initial mount
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatStore.messages]);

  // Also scroll when typing indicator toggles
  useEffect(() => {
    if (chatStore.isTyping) {
      scrollToBottom();
    }
  }, [chatStore.isTyping]);

  const handleSuggestionClick = async (question) => {
    if (!chatStore.isLoading) {
      await chatStore.sendMessage(question);
    }
  };

  if (chatStore.messages.length === 0) {
    return (
      <div className="empty-messages">
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          background: '#39ff14', 
          marginBottom: '1rem',
          boxShadow: '0 0 12px rgba(57, 255, 20, 0.5)'
        }}></div>
        <h3>How can I help you today?</h3>
        <p className="empty-subtitle">Ask me anything and I'll help you out</p>
        <div className="suggestions">
          <div 
            className="suggestion-item"
            onClick={() => handleSuggestionClick('How can I get started?')}
            style={{ cursor: chatStore.isLoading ? 'not-allowed' : 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            How can I get started?
          </div>
          <div 
            className="suggestion-item"
            onClick={() => handleSuggestionClick('What services do you offer?')}
            style={{ cursor: chatStore.isLoading ? 'not-allowed' : 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            What services do you offer?
          </div>
          <div 
            className="suggestion-item"
            onClick={() => handleSuggestionClick('Contact information')}
            style={{ cursor: chatStore.isLoading ? 'not-allowed' : 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Contact information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {chatStore.messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} />
      ))}
      {chatStore.isTyping && (
        <div className="typing-indicator-wrapper">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">Agent is typing...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default MessageList;


