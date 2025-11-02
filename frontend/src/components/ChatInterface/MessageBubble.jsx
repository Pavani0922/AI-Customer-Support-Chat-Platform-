import { observer } from 'mobx-react-lite';
import { formatDate } from '../../utils/formatters.js';
import './ChatInterface.css';

const MessageBubble = observer(({ message, index }) => {
  const isUser = message.role === 'user';

  return (
    <div 
      className={`message-bubble ${isUser ? 'user' : 'assistant'}`}
      style={{ 
        animationDelay: `${index * 0.05}s` 
      }}
    >
      <div className="message-content">
        {!isUser && (
          <div className="message-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        )}
        <div className="message-text">{message.content}</div>
        <div className="message-timestamp">
          {formatDate(message.timestamp)}
        </div>
        {isUser && (
          <div className="message-avatar user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;


