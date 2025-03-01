import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ExploratoryAnalysis.css';

const ExploratoryAnalysis = () => {
  const [selectedMetric, setSelectedMetric] = useState('trade');
  const [timeRange, setTimeRange] = useState('decade');
  const [analysisData, setAnalysisData] = useState([]);

  //imulated API call with dynamic data generation
  // useEffect(() => {
  //   const generateData = () => {
  //     const baseValues = {
  //       trade: { base: 50, variance: 15 },
  //       defense: { base: 20, variance: 8 },
  //       alliances: { base: 5, variance: 3 }
  //     };
      
  //     return Array.from({ length: timeRange === 'decade' ? 10 : 5 }, (_, i) => ({
  //       year: new Date().getFullYear() - (timeRange === 'decade' ? 9 - i : 4 - i),
  //       trade: Math.floor(baseValues.trade.base + Math.random() * baseValues.trade.variance * (i + 1)),
  //       defense: Math.floor(baseValues.defense.base + Math.random() * baseValues.defense.variance * (i + 1)),
  //       alliances: Math.floor(baseValues.alliances.base + Math.random() * baseValues.alliances.variance * (i + 1))
  //     }));
  //   };

  //   setAnalysisData(generateData());
  // }, [timeRange, selectedMetric]);  // 🔥 Added `selectedMetric` dependency


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:8000/api/data?metric=${selectedMetric}&timeRange=${timeRange}`
  //       );
  //       const data = await response.json();
  //       console.log("Fetched Data:", data);
  //       setAnalysisData(data);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  
  //   if (selectedMetric && timeRange) {
  //     fetchData();
  //   }
  // }, [timeRange, selectedMetric]);
  const generateData = (metric, timeRange) => {
    const baseValues = {
      trade: { base: 50, variance: 15 },
      defense: { base: 20, variance: 8 },
      alliances: { base: 5, variance: 3 }
    };
  
    if (!baseValues[metric]) return null; // Handle invalid metric
  
    return Array.from({ length: timeRange === "decade" ? 10 : 5 }, (_, i) => ({
      year: new Date().getFullYear() - (timeRange === "decade" ? 9 - i : 4 - i),
      [metric]: Math.floor(
        baseValues[metric].base +
          Math.random() * baseValues[metric].variance * (i + 1)
      ),
    }));
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/data?metric=${selectedMetric}&timeRange=${timeRange}`
        );
        const result = await response.json();
  
        if (response.ok) {
          setAnalysisData(result.data); // ✅ Store only the `data` array
        } else {
          console.error("Error fetching data:", result.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (selectedMetric && timeRange) {
      fetchData();
    }
  }, [timeRange, selectedMetric]); // ✅ Fetch when these change


  const metricConfig = {
    trade: { label: 'Trade Growth (%)', color: '#4a90e2' },
    defense: { label: 'Defense Budget ($B)', color: '#50e3c2' },
    alliances: { label: 'Strategic Alliances', color: '#e3507a' }
  };

  return (
    <section className="exploratory-analysis" aria-labelledby="exploratory-heading">
      <div className="analysis-header">
        <div className="section-header">
          <h2 id="exploratory-heading">Strategic Evolution Analysis</h2>
          <p>Interactive exploration of India's geopolitical trajectory</p>
        </div>
        
        <div className="analysis-controls">
          <div className="control-group">
            <label htmlFor="metric-select">Primary Metric:</label>
            <select 
              id="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="analysis-select"
            >
              <option value="trade">Trade Growth</option>
              <option value="defense">Defense Budget</option>
              <option value="alliances">Strategic Alliances</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="time-range">Time Range:</label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="analysis-select"
            >
              <option value="decade">10 Years</option>
              <option value="quinquennium">5 Years</option>
            </select>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year"
              label={{ 
                value: 'Year',
                position: 'bottom',
                offset: 0 
              }}
            />
            <YAxis
              label={{
                value: metricConfig[selectedMetric].label,
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: 'none',
                borderRadius: '4px'
              }}
            />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={metricConfig[selectedMetric].color}
              strokeWidth={2}
              dot={{ fill: metricConfig[selectedMetric].color, r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="metrics-context">
        <div className="context-card">
          <h4>Key Insights</h4>
          <ul className="insights-list">
            {analysisData.length > 1 ? (
              <>
                <li>5-year CAGR: {calculateCAGR(analysisData, selectedMetric)}%</li>
                <li>2023 Value: {analysisData[analysisData.length - 1]?.[selectedMetric]}</li>
                <li>Peak Growth Year: {findPeakYear(analysisData, selectedMetric)}</li>
              </>
            ) : (
              <li>Data unavailable</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

// ✅ Improved Helper functions
const calculateCAGR = (data, metric) => {
  if (!data || data.length < 2) return 0;
  const start = data[0][metric] || 1;  // Avoid division by zero
  const end = data[data.length - 1][metric] || 1;
  return ((Math.pow(end / start, 1 / (data.length - 1)) - 1) * 100).toFixed(2);
};

const findPeakYear = (data, metric) => {
  if (!data || data.length === 0) return 'N/A';
  const maxEntry = data.reduce((max, curr) => (curr[metric] > max[metric] ? curr : max), data[0]);
  return maxEntry.year || 'N/A';
};

export default ExploratoryAnalysis;