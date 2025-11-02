import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import authStore from '../../stores/authStore.js';
import './Navbar.css';

const Navbar = observer(() => {
  const navigate = useNavigate();
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


