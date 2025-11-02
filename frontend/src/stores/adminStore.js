import { makeAutoObservable, runInAction } from 'mobx';
import { adminAPI } from '../services/api.js';

class AdminStore {
  uploadedData = [];
  isUploading = false;
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  uploadFAQ = async (title, content, file = null) => {
    this.isUploading = true;
    this.error = null;

    try {
      const response = await adminAPI.uploadFAQ(title, content, file);
      
      if (response.success) {
        runInAction(() => {
          this.uploadedData.push(response.faq);
          this.isUploading = false;
        });
        return { success: true };
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to upload FAQ';
        this.isUploading = false;
      });
      return { success: false, error: this.error };
    }
  };

  fetchData = async () => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await adminAPI.getFAQs();
      
      if (response.success) {
        runInAction(() => {
          this.uploadedData = response.faqs;
          this.isLoading = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch data';
        this.isLoading = false;
      });
    }
  };

  deleteData = async (id) => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await adminAPI.deleteFAQ(id);
      
      if (response.success) {
        runInAction(() => {
          this.uploadedData = this.uploadedData.filter(item => item._id !== id);
          this.isLoading = false;
        });
        return { success: true };
      }
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to delete item';
        this.isLoading = false;
      });
      return { success: false, error: this.error };
    }
  };
}

export default new AdminStore();


