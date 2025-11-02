import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import authStore from './stores/authStore.js';
import Navbar from './components/Layout/Navbar.jsx';
import LoginForm from './components/Login/LoginForm.jsx';
import ChatInterface from './components/ChatInterface/ChatInterface.jsx';
import AdminPanel from './components/Admin/AdminPanel.jsx';
import './styles/App.css';

const App = observer(() => {
  useEffect(() => {
    authStore.checkAuth();
  }, []);

  const PrivateRoute = ({ children }) => {
    return authStore.isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    if (!authStore.isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (authStore.user?.role !== 'admin') {
      return <Navigate to="/chat" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="app">
        {authStore.isAuthenticated && <Navbar />}
        <Routes>
          <Route path="/login" element={
            authStore.isAuthenticated ? <Navigate to="/chat" /> : <LoginForm />
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <ChatInterface />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
});

export default App;


