import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EntityForm.css';

const EntityForm = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    created_by: ''
  });
  
  // State for items list and API diagnostics
  const [items, setItems] = useState([]);
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [error, setError] = useState(null);
  const [apiDetails, setApiDetails] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
    fetchCreators();
  }, []);
  
  // Fetch items when selected creator changes
  useEffect(() => {
    fetchItems();
  }, [selectedCreator]);

  // Fetch all unique creators from API
  const fetchCreators = async () => {
    setLoadingCreators(true);
    setError(null);
    
    try {
      console.log('Fetching creators...');
      const response = await axios.get('/api/creators');
      console.log('Creators API response:', response);
      setCreators(response.data || []);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(`Failed to load creators: ${err.message}`);
    } finally {
      setLoadingCreators(false);
    }
  };

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
      console.log('Item creation response:', response);
      
      // Reset form but keep the selected creator
      setFormData({
        name: '',
        description: '',
        created_by: formData.created_by // Keep the creator name
      });
      
      // Show success message
      setSubmitSuccess(true);
      
      // Refresh items list and creators list
      fetchItems();
      fetchCreators();
      
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

  // Handle entity deletion
  const handleDeleteEntity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entity?')) {
      return; // User cancelled deletion
    }
    
    setError(null);
    setApiDetails(null);
    
    try {
      // Send DELETE request to remove entity
      await axios.delete(`/api/items/${id}`);
      
      // Refresh the items list
      fetchItems();
      // Also refresh creators as we might have removed the only entity by a specific creator
      fetchCreators();
    } catch (err) {
      console.error('Error deleting entity:', err);
      
      // Detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      
      setApiDetails(errorDetails);
      setError(`Failed to delete entity: ${err.message}`);
    }
  };

  // Fetch all items from API with optional creator filtering
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    setApiDetails(null);
    
    try {
      console.log(`Fetching items${selectedCreator ? ` for creator: ${selectedCreator}` : ''}...`);
      const url = selectedCreator ? `/api/items?created_by=${selectedCreator}` : '/api/items';
      const response = await axios.get(url);
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
            <label htmlFor="name">Entity Name: <span className="field-hint">(3-100 characters)</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              minLength="3"
              maxLength="100"
              placeholder="Enter entity name"
              className="form-input"
            />
            {formData.name && formData.name.length < 3 && (
              <div className="field-error">Name must be at least 3 characters</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description: <span className="field-hint">(10-1000 characters)</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              minLength="10"
              maxLength="1000"
              placeholder="Describe the entity's strategic significance"
              className="form-textarea"
              rows="4"
            />
            {formData.description && formData.description.length < 10 && (
              <div className="field-error">Description must be at least 10 characters</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="created_by">Created By: <span className="field-hint">(2-50 characters)</span></label>
            <input
              type="text"
              id="created_by"
              name="created_by"
              value={formData.created_by}
              onChange={handleInputChange}
              required
              minLength="2"
              maxLength="50"
              placeholder="Enter creator's name"
              className="form-input"
            />
            {formData.created_by && formData.created_by.length < 2 && (
              <div className="field-error">Creator name must be at least 2 characters</div>
            )}
          </div>
          
          <button type="submit" className="submit-button">Add Entity</button>
          
          {submitSuccess && (
            <div className="success-message">Entity successfully added!</div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
              {apiDetails && apiDetails.data && apiDetails.data.validationErrors && (
                <ul className="validation-errors">
                  {Object.entries(apiDetails.data.validationErrors).map(([field, message]) => (
                    <li key={field}><strong>{field}:</strong> {message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      </section>

      <section className="entities-list-section">
        <div className="section-header">
          <h2>Strategic Entities</h2>
          <p>Current entities in the geopolitical database</p>
        </div>
        
        <div className="filter-section">
          <label htmlFor="creator-filter">Filter by Creator:</label>
          {loadingCreators ? (
            <div className="loading-indicator-inline">Loading creators...</div>
          ) : (
            <select
              id="creator-filter"
              className="form-input"
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
            >
              <option value="">All Creators</option>
              {creators.map(creator => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          )}
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
              <div key={item.id || item._id} className="entity-card">
                <h3 className="entity-name">{item.name}</h3>
                <p className="entity-description">{item.description}</p>
                <div className="entity-meta">
                  <span className="entity-creator">
                    Created by: {item.created_by || 'Unknown'}
                  </span>
                  <span className="entity-date">
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="entity-actions">
                  <Link to={`/update-entity/${item.id || item._id}`} className="edit-button">Edit</Link>
                  <button 
                    onClick={() => handleDeleteEntity(item.id || item._id)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Debug info */}
      <div className="debug-info">
        <h3>Debug Information</h3>
        <p><strong>API URL:</strong> {`${window.location.protocol}//${window.location.hostname}:${window.location.port}/api/items`}</p>
        <p><strong>API Status:</strong> {error ? 'Error' : 'Connected'}</p>
        <p><strong>Creators loaded:</strong> {creators.length}</p>
        <p><strong>Items loaded:</strong> {items.length}</p>
      </div>
    </div>
  );
};

export default EntityForm;