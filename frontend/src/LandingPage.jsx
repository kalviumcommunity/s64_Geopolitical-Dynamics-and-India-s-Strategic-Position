import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for entity links
import axios from 'axios'; // For API calls
import './LandingPage.css';
import indiaMap from './assets/india-map.png';
import strategyIcon from './assets/strategy.png';
import economyIcon from './assets/economic.png';
import diplomacyIcon from './assets/diplomacy.png';
import whitePaperPdf from './assets/india-geopolitical-whitepaper.pdf';

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  
  // State for entities and loading/error states
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch entities on component mount
  useEffect(() => {
    fetchEntities();
  }, []);
  
  // Function to fetch entities from API
  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/items');
      setEntities(response.data || []);
    } catch (err) {
      console.error('Error fetching entities:', err);
      setError('Failed to load strategic entities');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle white paper download
  const downloadWhitePaper = () => {
    // Create an anchor element
    const link = document.createElement('a');
    // Set the href to the PDF path
    link.href = whitePaperPdf;
    // Set download attribute with filename
    link.download = 'India-Geopolitical-Whitepaper-2024.pdf';
    // Append to document
    document.body.appendChild(link);
    // Trigger click
    link.click();
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>India's Evolving Geostrategic Landscape</h1>
          <p className="hero-subtitle">Analyzing Power Shifts in the Indo-Pacific Century</p>
          <div className="cta-container">
            <button className="cta-primary" onClick={() => navigate("/exploratory-analysis")}>
              Explore Analysis
            </button>
            <button className="cta-primary" onClick={() => navigate("/entity-form")}>
              Strategic Entities
            </button>
            <button className="cta-secondary" onClick={downloadWhitePaper}>Download White Paper</button>
          </div>
        </div>
      </header>

      {/* Key Pillars Section */}
      <section className="pillars-section">
        <div className="section-header">
          <h2>Strategic Dimensions</h2>
          <p>Core factors shaping India's global position</p>
        </div>
        
        <div className="pillars-grid">
          <div className="pillar-card">
            <img src={strategyIcon} alt="Military strategy" className="pillar-icon" />
            <h3>Security Architecture</h3>
            <ul>
              <li>Quad Alliance Dynamics</li>
              <li>Border Security Challenges</li>
              <li>Naval Modernization</li>
            </ul>
          </div>

          <div className="pillar-card">
            <img src={economyIcon} alt="Economic growth" className="pillar-icon" />
            <h3>Economic Diplomacy</h3>
            <ul>
              <li>GDP Growth Projections</li>
              <li>Trade Corridor Strategy</li>
              <li>Energy Security</li>
            </ul>
          </div>

          <div className="pillar-card">
            <img src={diplomacyIcon} alt="Diplomacy" className="pillar-icon" />
            <h3>Multilateral Engagement</h3>
            <ul>
              <li>G20 Leadership</li>
              <li>BRICS Evolution</li>
              <li>Climate Negotiations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className="data-section">
        <div className="section-header">
          <h2>Strategic Metrics</h2>
          <p>Quantifying India's geopolitical influence</p>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">73%</div>
            <div className="metric-label">Regional Trade Share Growth (2010-2023)</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">$721B</div>
            <div className="metric-label">Defense Modernization Budget (2024-2030)</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">48</div>
            <div className="metric-label">Strategic Partnerships Signed (2023)</div>
          </div>
        </div>
      </section>
      
      {/* Strategic Entities Section */}
      <section className="entities-section">
        <div className="section-header">
          <h2>Strategic Entities</h2>
          <p>Key geopolitical factors in India's strategic landscape</p>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading strategic entities...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : entities.length === 0 ? (
          <div className="empty-message">No strategic entities available.</div>
        ) : (
          <div className="entities-grid">
            {entities.slice(0, 3).map((entity) => (
              <div key={entity._id} className="entity-card">
                <h3 className="entity-name">{entity.name}</h3>
                <p className="entity-description">{entity.description}</p>
                <div className="entity-meta">
                  <span className="entity-date">
                    Added: {new Date(entity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="entities-action">
          <button className="entities-button" onClick={() => navigate('/entity-form')}>
            View All Entities
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>GeoStrategic Insights</h4>
            <p>© 2023 All rights reserved</p>
          </div>
          <div className="footer-links">
            <a href="#methodology">Methodology</a>
            <a href="#sources">Sources</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;