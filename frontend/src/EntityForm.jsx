import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EntityForm.css';

const EntityForm = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // State for items list and API diagnostics
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDetails, setApiDetails] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setApiDetails(null);
    setSubmitSuccess(false);
    
    try {
      // Send POST request to add new item
      const response = await axios.post('/api/items', formData);
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      
      // Show success message
      setSubmitSuccess(true);
      
      // Refresh items list
      fetchItems();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding item:', err);
      
      // Detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      
      setApiDetails(errorDetails);
      setError(`Failed to add item: ${err.message}`);
    }
  };

  // Fetch all items from API
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    setApiDetails(null);
    
    try {
      console.log('Fetching items from /api/items...');
      const response = await axios.get('/api/items');
      console.log('API response:', response);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      
      // Detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      
      setApiDetails(errorDetails);
      setError(`Failed to load items: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to retry the API call
  const retryFetch = () => {
    fetchItems();
  };

  return (
    <div className="entity-form-page">
      <header className="entity-header">
        <h1>Strategic Entities Management</h1>
        <nav className="entity-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/exploratory-analysis" className="nav-link">Analysis</Link>
        </nav>
      </header>

      <section className="form-section">
        <div className="section-header">
          <h2>Add New Strategic Entity</h2>
          <p>Create a new entity related to India&apos;s geopolitical landscape</p>
        </div>
        
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-group">
            <label htmlFor="name">Entity Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter entity name"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the entity's strategic significance"
              className="form-textarea"
              rows="4"
            />
          </div>
          
          <button type="submit" className="submit-button">Add Entity</button>
          
          {submitSuccess && (
            <div className="success-message">Entity successfully added!</div>
          )}
          
          {error && (
            <div className="error-message">{error}</div>
          )}
        </form>
      </section>

      <section className="entities-list-section">
        <div className="section-header">
          <h2>Strategic Entities</h2>
          <p>Current entities in the geopolitical database</p>
        </div>
        
        {loading ? (
          <div className="loading-indicator">Loading entities...</div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            {apiDetails && (
              <div className="error-details">
                <h4>API Diagnostics:</h4>
                <p><strong>Status:</strong> {apiDetails.status || 'N/A'}</p>
                <p><strong>Status Text:</strong> {apiDetails.statusText || 'N/A'}</p>
                <p><strong>Message:</strong> {apiDetails.message || 'N/A'}</p>
                {apiDetails.data && (
                  <p><strong>Response Data:</strong> {JSON.stringify(apiDetails.data)}</p>
                )}
              </div>
            )}
            <button onClick={retryFetch} className="retry-button">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-message">No entities found. Add your first one above!</div>
        ) : (
          <div className="entities-grid">
            {items.map((item) => (
              <div key={item._id} className="entity-card">
                <h3 className="entity-name">{item.name}</h3>
                <p className="entity-description">{item.description}</p>
                <div className="entity-meta">
                  <span className="entity-date">
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Debug info */}
      <div className="debug-info">
        <h3>Debug Information</h3>
        <p><strong>API URL:</strong> {window.location.protocol}//{window.location.hostname}:{window.location.port}/api/items</p>
        <p><strong>API Status:</strong> {error ? 'Error' : 'Connected'}</p>
      </div>
    </div>
  );
};

export default EntityForm;