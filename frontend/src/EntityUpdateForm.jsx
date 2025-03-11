import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './EntityForm.css'; // Reusing the EntityForm styles

const EntityUpdateForm = () => {
  const { id } = useParams(); // Get entity ID from URL
  const navigate = useNavigate(); // For redirection after update
  
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // State for loading, error handling, and API diagnostics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDetails, setApiDetails] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch entity data on component mount
  useEffect(() => {
    fetchEntityData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch entity data by ID
  const fetchEntityData = async () => {
    setLoading(true);
    setError(null);
    setApiDetails(null);
    
    try {
      console.log(`Fetching entity with ID: ${id}`);
      const response = await axios.get(`/api/items/${id}`);
      console.log('API response:', response);
      
      // Populate form with entity data
      setFormData({
        name: response.data.name,
        description: response.data.description
      });
    } catch (err) {
      console.error('Error fetching entity:', err);
      
      // Detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      
      setApiDetails(errorDetails);
      setError(`Failed to load entity: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (update entity)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setApiDetails(null);
    setUpdateSuccess(false);
    
    try {
      // Send PUT request to update entity
      const response = await axios.put(`/api/items/${id}`, formData);
      console.log('Update response:', response);
      
      // Show success message
      setUpdateSuccess(true);
      
      // Redirect back to entity list after 2 seconds
      setTimeout(() => {
        navigate('/entity-form');
      }, 2000);
    } catch (err) {
      console.error('Error updating entity:', err);
      
      // Detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      };
      
      setApiDetails(errorDetails);
      setError(`Failed to update entity: ${err.message}`);
    }
  };

  return (
    <div className="entity-form-page">
      <header className="entity-header">
        <h1>Update Strategic Entity</h1>
        <nav className="entity-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/entity-form" className="nav-link">Entities List</Link>
          <Link to="/exploratory-analysis" className="nav-link">Analysis</Link>
        </nav>
      </header>

      <section className="form-section">
        <div className="section-header">
          <h2>Update Strategic Entity</h2>
          <p>Edit details for this geopolitical entity</p>
        </div>
        
        {loading ? (
          <div className="loading-indicator">Loading entity data...</div>
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
            <button onClick={fetchEntityData} className="retry-button">Retry</button>
          </div>
        ) : (
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
            
            <div className="form-actions">
              <button type="submit" className="submit-button">Update Entity</button>
              <Link to="/entity-form" className="cancel-button">Cancel</Link>
            </div>
            
            {updateSuccess && (
              <div className="success-message">Entity successfully updated! Redirecting...</div>
            )}
          </form>
        )}
      </section>

      {/* Debug info */}
      <div className="debug-info">
        <h3>Debug Information</h3>
        <p><strong>Entity ID:</strong> {id}</p>
        <p><strong>API URL:</strong> {`${window.location.protocol}//${window.location.hostname}:${window.location.port}/api/items/${id}`}</p>
        <p><strong>API Status:</strong> {error ? 'Error' : loading ? 'Loading' : 'Connected'}</p>
      </div>
    </div>
  );
};

export default EntityUpdateForm;