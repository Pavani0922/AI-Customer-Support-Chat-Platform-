import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import chatStore from '../../stores/chatStore.js';
import authStore from '../../stores/authStore.js';
import './Navbar.css';

const Navbar = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authStore.user?.role === 'admin';

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h3>AI Customer Support</h3>
          {location.pathname === '/chat' && (
            <div className="navbar-chat-tools">
              <button
                type="button"
                className="navbar-clear"
                onClick={() => {
                  if (window.confirm('Clear this chat?')) {
                    chatStore.clearChat();
                  }
                }}
                title="Clear current chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Clear Chat
              </button>
            </div>
          )}
        </div>
        <div className="navbar-actions">
          {isAdmin && (
            <button 
              className="navbar-button"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          )}
          <button 
            className="navbar-button"
            onClick={() => navigate('/chat')}
          >
            Chat
          </button>
          <div className="user-info">
            <span>{authStore.user?.username}</span>
          </div>
          <button 
            className="navbar-button logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;


