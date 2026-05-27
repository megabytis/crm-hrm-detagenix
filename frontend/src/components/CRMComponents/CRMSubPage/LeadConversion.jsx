import React, { useState, useEffect } from 'react';
import './LeadConversion.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';
import { crmService } from '../../../services/crmService';

const LeadConversion = () => {
  const [loading, setLoading] = useState(false);
  
  // Real Database Metrics State
  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    pending: 0,
    rate: 0
  });

  // Dynamic ML Prediction Result States
  const [predictionResult, setPredictionResult] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Load leads data and calculate conversion stats dynamically from Mongoose collection
  useEffect(() => {
    const fetchLeadConversionStats = async () => {
      try {
        const response = await crmService.leads.getAll();
        const leads = response?.data || [];
        
        const total = leads.length;
        
        // Count Won, Qualified, or Proposal Sent leads as successfully converted
        const converted = leads.filter(l => 
          l.status === 'Qualified' || 
          l.status === 'Won' || 
          l.status === 'Proposal Sent'
        ).length;
        
        // Count New or Contacted leads as pending nurturing
        const pending = leads.filter(l => 
          l.status === 'New' || 
          l.status === 'Contacted'
        ).length;
        
        const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';
        
        setStats({ total, converted, pending, rate });
      } catch (error) {
        console.error("Error loading database stats for Lead Conversion metrics:", error);
      }
    };
    
    fetchLeadConversionStats();
  }, []);

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

  /*
    ========================================================================
    LEGACY MOCK PREDICT HANDLER
    (Commented out as requested for record keeping and review references)
    ------------------------------------------------------------------------
    const handlePredict = (e) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alert('Prediction generated successfully!');
      }, 1500);
    };
    ========================================================================
  */

  // ACTIVE API-DRIVEN PREDICTION ENGINE:
  // Maps React camelCase form keys to Mongoose controller snake_case parameters.
  // Sends payload to express endpoint `/crm/engagement/conversion/predict`, 
  // which forwards it to FastAPI's calibrated RandomForest classifier.
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowSuccessBanner(false);
    
    try {
      const payload = {
        industry: predictionData.industry || "SaaS", // Fallback to SaaS to prevent Pydantic min_length=1 (422) validation failures
        budget: Number(predictionData.budget) || 0,
        response_speed: Number(predictionData.responseSpeed) || 0,
        meeting_count: Number(predictionData.meetingCount) || 0,
        email_open_rate: Number(predictionData.emailOpenRate) || 0,
        website_visits: Number(predictionData.websiteVisits) || 0
      };
      
      const response = await crmService.leadConversion.predict(payload);
      
      if (response.success && response.data) {
        setPredictionResult(response.data.result || response.data);
        setShowSuccessBanner(true);
        
        // Scroll smoothly to see the success notification and the prediction sidebar
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (response.result) {
        setPredictionResult(response.result.result || response.result);
        setShowSuccessBanner(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Failed to retrieve prediction results. Please ensure backend is active.");
      }
    } catch (error) {
      console.error("API Lead Prediction Failed:", error);
      alert(error.message || "Failed to generate prediction probability. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  /*
    ========================================================================
    LEGACY HARDCODED METRICS DATA
    (Commented out as requested for record keeping and review references)
    ------------------------------------------------------------------------
    const metrics = [
      { title: 'Total Leads', value: '1,284', icon: '👥', color: '#dbeafe', textColor: '#3b82f6', trend: '+12.5%', trendUp: true },
      { title: 'Converted Leads', value: '452', icon: '✅', color: '#dcfce7', textColor: '#22c55e', trend: '+8.2%', trendUp: true },
      { title: 'Pending Leads', value: '832', icon: '⏳', color: '#fef3c7', textColor: '#f59e0b', trend: '-2.4%', trendUp: false },
      { title: 'Conversion Rate', value: '35.2%', icon: '📈', color: '#fce7f3', textColor: '#ec4899', trend: '+4.1%', trendUp: true },
    ];
    ========================================================================
  */

  // DYNAMIC STATE-DRIVEN METRICS:
  // Dynamically constructed from current local MongoDB collections data.
  const metrics = [
    { 
      title: 'Total Leads', 
      value: stats.total.toLocaleString(), 
      icon: '👥', 
      color: '#dbeafe', 
      textColor: '#3b82f6', 
      trend: 'Real-time', 
      trendUp: true 
    },
    { 
      title: 'Converted Leads', 
      value: stats.converted.toLocaleString(), 
      icon: '✅', 
      color: '#dcfce7', 
      textColor: '#22c55e', 
      trend: 'Real-time', 
      trendUp: true 
    },
    { 
      title: 'Pending Leads', 
      value: stats.pending.toLocaleString(), 
      icon: '⏳', 
      color: '#fef3c7', 
      textColor: '#f59e0b', 
      trend: 'Real-time', 
      trendUp: false 
    },
    { 
      title: 'Conversion Rate', 
      value: `${stats.rate}%`, 
      icon: '📈', 
      color: '#fce7f3', 
      textColor: '#ec4899', 
      trend: 'Real-time', 
      trendUp: true 
    },
  ];

  return (
    <DashboardLayout>
      <div className="lead-conversion-container">
        <div className="lead-conversion-header">
          <h2>Lead Conversion</h2>
          <p>Retrain from historical outcomes and predict conversion probability from business inputs.</p>
        </div>

        {/* Dynamic Green Success Notification Banner matching screenshot */}
        {showSuccessBanner && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span> Prediction generated successfully!
          </div>
        )}

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
                <button type="button" className="sample-btn" onClick={() => setPredictionData({
                  industry: 'SaaS',
                  budget: 75000,
                  responseSpeed: 1,
                  meetingCount: 5,
                  emailOpenRate: 85,
                  websiteVisits: 12
                })}>Use high-intent sample</button>
                <button type="button" className="sample-btn" onClick={() => setPredictionData({
                  industry: 'Finance',
                  budget: 5000,
                  responseSpeed: 10,
                  meetingCount: 1,
                  emailOpenRate: 15,
                  websiteVisits: 2
                })}>Use low-intent sample</button>
              </div>

              <button type="submit" className="predict-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Predict Conversion Probability'}
              </button>
            </form>
          </div>

          <div className="result-sidebar">
            <div className="result-card">
              <h3>Prediction Result</h3>
              
              {/* Render dynamic Calibrated RandomForest classifier predictions in real-time */}
              {predictionResult ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "64px", fontWeight: "800", color: "#10b981", margin: "10px 0" }}>
                    {predictionResult.conversion_probability_pct}%
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                    Conversion Probability
                  </div>
                  
                  <div style={{ width: "100%", textAlign: "left", background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                      <strong>Model Type:</strong> {predictionResult.model_name || "Calibrated RandomForestClassifier"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      <strong>Trained At:</strong> {predictionResult.trained_at ? new Date(predictionResult.trained_at).toLocaleString() : "Recently"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📉</div>
                  <p>No data available. Train model (recommended), then submit the required inputs to view conversion probability percentage.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadConversion;
