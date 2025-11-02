import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import authStore from '../../stores/authStore.js';
import './LoginForm.css';

const LoginForm = observer(() => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    let result;
    if (isRegister) {
      result = await authStore.register(username, password);
    } else {
      result = await authStore.login(username, password);
    }

    if (result.success) {
      navigate('/chat');
    }
  };

  const fillDemoCredentials = () => {
    if (activeTab === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('demo');
      setPassword('demo123');
    }
  };

  return (
    <div className="login-container">
      {/* Left Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to AI Support</h1>
          <p className="welcome-text">
            Experience intelligent customer support powered by cutting-edge AI technology. 
            Get instant, accurate answers to your questions with our smart chat assistant.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Instant AI Responses</span>
            </div>
            <div className="feature-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Context-Aware Answers</span>
            </div>
            <div className="feature-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
        <div className="decorative-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="login-section">
        <div className="login-wrapper">
          {/* Toggle Bar */}
          <div className="toggle-bar">
            <button
              type="button"
              className={`toggle-option ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
              disabled={authStore.isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>User</span>
            </button>
            <button
              type="button"
              className={`toggle-option ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              disabled={authStore.isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span>Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <div className={`login-card ${activeTab === 'admin' ? 'admin-card' : ''}`}>
            <div className="card-header">
              <h1>{activeTab === 'admin' ? 'ADMIN LOGIN' : 'USER LOGIN'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">
                  {activeTab === 'admin' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="8"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin' : 'Enter your username'}
                  required
                  disabled={authStore.isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin123' : 'Enter your password'}
                  required
                  disabled={authStore.isLoading}
                />
              </div>

              {authStore.error && (
                <div className="error-message">{authStore.error}</div>
              )}

              <button 
                type="submit" 
                className={`submit-button ${activeTab === 'admin' ? 'admin-button' : 'user-button'}`}
                disabled={authStore.isLoading}
              >
                {authStore.isLoading 
                  ? <span className="button-loading">⏳ Loading...</span>
                  : activeTab === 'admin' 
                    ? <span>🔐 Admin Login</span>
                    : isRegister 
                      ? <span>📝 Register</span>
                      : <span>🚀 Sign In</span>
                }
              </button>

              {activeTab === 'user' && (
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => setIsRegister(!isRegister)}
                  disabled={authStore.isLoading}
                >
                  {isRegister 
                    ? '↩️ Already have an account? Sign in' 
                    : "✨ Don't have an account? Register"
                  }
                </button>
              )}
            </form>

            {/* Demo Section */}
            {activeTab === 'admin' ? (
              <div className="admin-demo-box">
                <div className="demo-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Demo Credentials</span>
                </div>
                <div className="demo-credentials">
                  <div className="credential-row">
                    <span className="credential-label">Username:</span>
                    <code>admin</code>
                  </div>
                  <div className="credential-row">
                    <span className="credential-label">Password:</span>
                    <code>admin123</code>
                  </div>
                </div>
                <button
                  type="button"
                  className="demo-fill-button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                >
                  ✨ Click to Fill
                </button>
              </div>
            ) : (
              <div className="demo-section">
                <button
                  type="button"
                  className="demo-button"
                  onClick={fillDemoCredentials}
                >
                  🎭 Fill Demo Credentials
                </button>
                <p className="demo-text">
                  <strong>New user?</strong> Click above or register to create your account
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default LoginForm;


