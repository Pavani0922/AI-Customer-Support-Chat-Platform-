import { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../../stores/chatStore.js';
import './ChatInterface.css';

const MessageInput = observer(() => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatStore.isLoading) return;

    const message = input.trim();
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await chatStore.sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="message-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={chatStore.isLoading}
      />
      <button 
        type="submit" 
        className="send-button"
        disabled={!input.trim() || chatStore.isLoading}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  );
});

export default MessageInput;


