import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ExploratoryAnalysis from './ExploratoryAnalysis';
import EntityForm from './EntityForm'; // Import the entity form component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exploratory-analysis" element={<ExploratoryAnalysis />} />
        <Route path="/entity-form" element={<EntityForm />} />
      </Routes>
    </Router>
  );
}

export default App;