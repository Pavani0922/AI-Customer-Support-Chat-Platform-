import { makeAutoObservable, runInAction } from 'mobx';
import { authAPI } from '../services/api.js';
import { tokenService } from '../services/tokenService.js';

class AuthStore {
  user = null;
  isAuthenticated = false;
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.checkAuth();
  }

  checkAuth = () => {
    const token = tokenService.getToken();
    const user = tokenService.getUser();
    
    if (token && user) {
      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
      });
    }
  };

  login = async (username, password) => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        tokenService.setToken(response.token);
        tokenService.setUser(response.user);
        runInAction(() => {
          this.user = response.user;
          this.isAuthenticated = true;
        });
        return { success: true };
      } else {
        runInAction(() => {
          this.error = response.message || 'Login failed';
        });
        return { success: false, error: this.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      runInAction(() => {
        this.error = errorMessage;
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  logout = () => {
    tokenService.clear();
    runInAction(() => {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    });
  };

  register = async (username, password, role = 'user') => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    try {
      const response = await authAPI.register(username, password, role);
      
      if (response.success) {
        tokenService.setToken(response.token);
        tokenService.setUser(response.user);
        runInAction(() => {
          this.user = response.user;
          this.isAuthenticated = true;
        });
        return { success: true };
      } else {
        runInAction(() => {
          this.error = response.message || 'Registration failed';
        });
        return { success: false, error: this.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      runInAction(() => {
        this.error = errorMessage;
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}

export default new AuthStore();


