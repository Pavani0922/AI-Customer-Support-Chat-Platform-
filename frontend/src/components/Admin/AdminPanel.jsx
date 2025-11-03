import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import adminStore from '../../stores/adminStore.js';
import './AdminPanel.css';

const AdminPanel = observer(() => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'file'

  useEffect(() => {
    adminStore.fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    // Auto-fill title with filename if title is empty
    if (!title.trim() && file) {
      const filename = file.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For manual mode, require both title and content
    if (uploadMode === 'manual' && (!title.trim() || !content.trim())) {
      return;
    }
    
    // For file mode, require at least a file
    if (uploadMode === 'file' && !selectedFile) {
      return;
    }

    const result = await adminStore.uploadFAQ(
      title.trim() || undefined, 
      content.trim() || undefined, 
      selectedFile
    );
    
    if (result.success) {
      setTitle('');
      setContent('');
      setSelectedFile(null);
      adminStore.fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      await adminStore.deleteData(id);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <h1>Admin Panel - FAQ Management</h1>

        <div className="admin-section">
          <h2>Upload New FAQ</h2>
          
          {/* Upload Mode Toggle */}
          <div className="upload-mode-toggle">
            <button
              type="button"
              className={uploadMode === 'manual' ? 'active' : ''}
              onClick={() => setUploadMode('manual')}
            >
              Manual Input
            </button>
            <button
              type="button"
              className={uploadMode === 'file' ? 'active' : ''}
              onClick={() => setUploadMode('file')}
            >
              Upload File (PDF/TXT)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="faq-form">
            {uploadMode === 'file' && (
              <div className="form-group">
                <label htmlFor="file">Upload File</label>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  disabled={adminStore.isUploading}
                  required={uploadMode === 'file'}
                />
                {selectedFile && (
                  <span className="file-name">Selected: {selectedFile.name}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">Title {uploadMode === 'file' && '(Optional)'}</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={uploadMode === 'file' ? "Leave blank to use filename" : "Enter FAQ title"}
                required={uploadMode === 'manual'}
                disabled={adminStore.isUploading}
              />
            </div>

            {uploadMode === 'manual' && (
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter FAQ content..."
                  rows={6}
                  required={uploadMode === 'manual'}
                  disabled={adminStore.isUploading}
                />
              </div>
            )}

            {adminStore.error && (
              <div className="error-message">{adminStore.error}</div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={adminStore.isUploading}
            >
              {adminStore.isUploading ? 'Uploading...' : 'Upload FAQ'}
            </button>
          </form>
        </div>

        <div className="admin-section">
          <h2>Uploaded FAQs ({adminStore.uploadedData.length})</h2>
          
          {adminStore.uploadedData.length > 0 && adminStore.stats && (
            <div className="stats-bar">
              <span>📊 Total: {adminStore.stats.total}</span>
              <span>✅ With Embeddings: {adminStore.stats.withEmbeddings}</span>
              <span>🔍 Keyword Only: {adminStore.stats.keywordOnly}</span>
              {adminStore.stats.totalContentLength > 0 && (
                <span>📄 Total Content: {(adminStore.stats.totalContentLength / 1000).toFixed(1)}K chars</span>
              )}
            </div>
          )}
          
          {adminStore.isLoading ? (
            <div className="loading">Loading...</div>
          ) : adminStore.uploadedData.length === 0 ? (
            <div className="empty-state">No FAQs uploaded yet.</div>
          ) : (
            <div className="faq-list">
              {adminStore.uploadedData.map((faq) => (
                <div key={faq._id} className="faq-item">
                  <div className="faq-header">
                    <h3>{faq.title}</h3>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(faq._id)}
                      disabled={adminStore.isLoading}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="faq-content">{faq.content}</p>
                  <div className="faq-meta">
                    <span>Type: {faq.fileType}</span>
                    {faq.fileName && <span> • File: {faq.fileName}</span>}
                    {faq.contentLength && <span> • Size: {(faq.contentLength / 1000).toFixed(1)}K chars</span>}
                    <span> • 
                      {faq.embeddingStatus === 'generated' ? (
                        <span style={{ color: '#4caf50' }}> ✅ Semantic Search Enabled</span>
                      ) : faq.embeddingStatus === 'failed' || faq.embeddingStatus === 'error' ? (
                        <span style={{ color: '#f44336' }}> ⚠️ Keyword Search Only</span>
                      ) : (
                        <span style={{ color: '#ff9800' }}> 🔍 Keyword Search Only</span>
                      )}
                    </span>
                    <span> • Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AdminPanel;


