import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../../stores/chatStore.js';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import './ChatInterface.css';

const ChatInterface = observer(() => {
  useEffect(() => {
    // Restore current conversation if it exists and we don't have messages loaded
    if (chatStore.currentConversationId && chatStore.messages.length === 0) {
      // If we have a conversation ID but no messages, restore it from server
      chatStore.loadConversation(chatStore.currentConversationId);
    }
    // Otherwise, preserve existing messages (they're already in memory)
  }, []);

  return (
    <div className="chat-interface">
      {/* Header merged into global Navbar */}
      {chatStore.error && (
        <div className="error-message">{chatStore.error}</div>
      )}
      <MessageList />
      <MessageInput />
    </div>
  );
});

export default ChatInterface;


