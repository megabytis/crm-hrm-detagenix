import React, { useState } from 'react';
import './LeadConversion.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';

const LeadConversion = () => {
  const [loading, setLoading] = useState(false);
  // const [trainingData, setTrainingData] = useState({
  //   historyLimit: '',
  //   minTrainRows: ''
  // });
  
  const [predictionData, setPredictionData] = useState({
    industry: '',
    budget: '',
    responseSpeed: '',
    meetingCount: '',
    emailOpenRate: '',
    websiteVisits: ''
  });
   const [selectedFile, setSelectedFile] = useState(null);
  const handleTrainingChange = (e) => {
    const { id, value } = e.target;
    setTrainingData(prev => ({ ...prev, [id]: value }));
  };

  const handlePredictionChange = (e) => {
    const { id, value } = e.target;
    setPredictionData(prev => ({ ...prev, [id]: value }));
  };

  const handlePredict = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate prediction
    setTimeout(() => {
      setLoading(false);
      alert('Prediction generated successfully!');
    }, 1500);
  };

  const metrics = [
    { title: 'Total Leads', value: '1,284', icon: '👥', color: '#dbeafe', textColor: '#3b82f6', trend: '+12.5%', trendUp: true },
    { title: 'Converted Leads', value: '452', icon: '✅', color: '#dcfce7', textColor: '#22c55e', trend: '+8.2%', trendUp: true },
    { title: 'Pending Leads', value: '832', icon: '⏳', color: '#fef3c7', textColor: '#f59e0b', trend: '-2.4%', trendUp: false },
    { title: 'Conversion Rate', value: '35.2%', icon: '📈', color: '#fce7f3', textColor: '#ec4899', trend: '+4.1%', trendUp: true },
  ];

  return (
    <DashboardLayout>
      <div className="lead-conversion-container">
        <div className="lead-conversion-header">
          <h2>Lead Conversion</h2>
          <p>Retrain from historical outcomes and predict conversion probability from business inputs.</p>
        </div>

        <div className="metrics-grid">
          {metrics.map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-card-header">
                <h3>{m.title}</h3>
                <div className="metric-icon-box" style={{ backgroundColor: m.color }}>
                  <span style={{ color: m.textColor }}>{m.icon}</span>
                </div>
              </div>
              <p className="metric-value">{m.value}</p>
              <p className={`metric-trend ${m.trendUp ? 'up' : 'down'}`}>
                {m.trend} from last month
              </p>
            </div>
          ))}
        </div>

        <div className="lead-conversion-main-content">
          <div className="conversion-form-section">
            <div className="form-title-badge">
              <span>✨ Conversion Probability Engine</span>
            </div>
            
            <form onSubmit={handlePredict} className="conversion-form">
              {/* <div className="training-section">
                <div className="form-group-title">Train Model From Historical Data</div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="historyLimit">HISTORY LIMIT</label>
                    <input 
                      type="number" 
                      id="historyLimit" 
                      value={trainingData.historyLimit} 
                      onChange={handleTrainingChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="minTrainRows">MINIMUM TRAIN ROWS</label>
                    <input 
                      type="number" 
                      id="minTrainRows" 
                      value={trainingData.minTrainRows} 
                      onChange={handleTrainingChange}
                    />
                  </div>
                </div>
              </div> */}

              <div className="prediction-inputs-section">
                <div className="form-group-title">Input Prediction Data</div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="industry">INDUSTRY</label>
                    <select id="industry" value={predictionData.industry} onChange={handlePredictionChange}>
                      <option value="">Select Industry</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="budget">BUDGET</label>
                    <input 
                      type="number" 
                      id="budget" 
                      value={predictionData.budget} 
                      onChange={handlePredictionChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="responseSpeed">RESPONSE SPEED (DAYS)</label>
                    <input 
                      type="number" 
                      id="responseSpeed" 
                      value={predictionData.responseSpeed} 
                      onChange={handlePredictionChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="meetingCount">MEETING COUNT</label>
                    <input 
                      type="number" 
                      id="meetingCount" 
                      value={predictionData.meetingCount} 
                      onChange={handlePredictionChange}
                    />
                  </div>
                </div>

               <div className="form-row">
  <div className="form-group">
    <label htmlFor="emailOpenRate">EMAIL OPEN RATE (%)</label>
    <input
      type="number"
      id="emailOpenRate"
      value={predictionData.emailOpenRate}
      onChange={handlePredictionChange}
    />
  </div>

  <div className="form-group">
    <label htmlFor="websiteVisits">WEBSITE VISITS</label>
    <input
      type="number"
      id="websiteVisits"
      value={predictionData.websiteVisits}
      onChange={handlePredictionChange}
    />
  </div>
</div>

<div className="form-row">
  <div className="form-group">
    <label htmlFor="document">UPLOAD DOCUMENT</label>
    <input type="file" id="document" />
  </div>
</div>
              </div>

              <div className="sample-buttons">
                <button type="button" className="sample-btn" onClick={() => setPredictionData({...predictionData, emailOpenRate: 85, meetingCount: 5})}>Use high-intent sample</button>
                <button type="button" className="sample-btn" onClick={() => setPredictionData({...predictionData, emailOpenRate: 15, meetingCount: 1})}>Use low-intent sample</button>
              </div>

              <button type="submit" className="predict-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Predict Conversion Probability'}
              </button>
            </form>
          </div>

          <div className="result-sidebar">
            <div className="result-card">
              <h3>Prediction Result</h3>
              <div className="result-placeholder">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📉</div>
                <p>No data available. Train model (recommended), then submit the required inputs to view conversion probability percentage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadConversion;
