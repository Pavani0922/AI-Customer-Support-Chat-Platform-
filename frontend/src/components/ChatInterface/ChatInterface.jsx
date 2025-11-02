import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../../stores/chatStore.js';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import './ChatInterface.css';

const ChatInterface = observer(() => {
  useEffect(() => {
    chatStore.clearChat();
  }, []);

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>AI Customer Support</h2>
        {chatStore.error && (
          <div className="error-message">{chatStore.error}</div>
        )}
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
});

export default ChatInterface;


