import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ExploratoryAnalysis from './ExploratoryAnalysis';
import EntityForm from './EntityForm'; // Import the entity form component
import EntityUpdateForm from './EntityUpdateForm'; // Import the entity update form component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exploratory-analysis" element={<ExploratoryAnalysis />} />
        <Route path="/entity-form" element={<EntityForm />} />
        <Route path="/update-entity/:id" element={<EntityUpdateForm />} />
      </Routes>
    </Router>
  );
}

export default App;