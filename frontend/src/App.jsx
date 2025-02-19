import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ExploratoryAnalysis from './ExploratoryAnalysis'; // ✅ Import the analysis page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exploratory-analysis" element={<ExploratoryAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;