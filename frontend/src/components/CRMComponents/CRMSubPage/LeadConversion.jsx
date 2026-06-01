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
  
  // ==============================================================================
  // LEGACY PREDICTION DATA STATE
  // Kept for reference. Do not delete.
  // ------------------------------------------------------------------------------
  // const [predictionData, setPredictionData] = useState({
  //   industry: '',
  //   budget: '',
  //   responseSpeed: '',
  //   meetingCount: '',
  //   emailOpenRate: '',
  //   websiteVisits: ''
  // });
  // ==============================================================================

  // UPDATED PREDICTION DATA STATE (SUPPORTING ADDITIONAL FIELDS REQUIRED BY NEW CATBOOST MODEL)
  const [predictionData, setPredictionData] = useState({
    industry: '',
    budget: '',
    responseSpeed: '', // Kept for state structure backwards compatibility, but not used by new model
    meetingCount: '',
    emailOpenRate: '', // Mapped to binary 0 or 1 per CTO instruction
    websiteVisits: '',
    mailResponseCount: '', // NEW: required parameter for CatBoost feature engineering
    leadId: '' // NEW: required unique identifier
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
  // ==============================================================================
  // LEGACY JSON-BASED PREDICT HANDLER
  // Kept for reference. Do not delete.
  // ------------------------------------------------------------------------------
  // const handlePredict = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setShowSuccessBanner(false);
  //   
  //   try {
  //     const payload = {
  //       industry: predictionData.industry || "SaaS", // Fallback to SaaS to prevent Pydantic min_length=1 (422) validation failures
  //       budget: Number(predictionData.budget) || 0,
  //       response_speed: Number(predictionData.responseSpeed) || 0,
  //       meeting_count: Number(predictionData.meetingCount) || 0,
  //       email_open_rate: Number(predictionData.emailOpenRate) || 0,
  //       website_visits: Number(predictionData.websiteVisits) || 0
  //     };
  //     
  //     const response = await crmService.leadConversion.predict(payload);
  //     
  //     if (response.success && response.data) {
  //       setPredictionResult(response.data.result || response.data);
  //       setShowSuccessBanner(true);
  //       
  //       // Scroll smoothly to see the success notification and the prediction sidebar
  //       window.scrollTo({ top: 0, behavior: 'smooth' });
  //     } else if (response.result) {
  //       setPredictionResult(response.result.result || response.result);
  //       setShowSuccessBanner(true);
  //       window.scrollTo({ top: 0, behavior: 'smooth' });
  //     } else {
  //       alert("Failed to retrieve prediction results. Please ensure backend is active.");
  //     }
  //   } catch (error) {
  //     console.error("API Lead Prediction Failed:", error);
  //     alert(error.message || "Failed to generate prediction probability. Please check backend.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // ==============================================================================

  // UPDATED MULTIPART FORM-DATA PREDICT HANDLER (SUPPORTING NEW CATBOOST & GEMINI PIPELINE WITH DOCUMENT UPLOADER)
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowSuccessBanner(false);
    
    try {
      if (!selectedFile) {
        alert("Please upload a supporting document (PDF or DOCX) to get AI-powered insights!");
        setLoading(false);
        return;
      }

      // Construct Multipart Form-data to carry file attachment and numeric features
      const formData = new FormData();
      formData.append("lead_id", predictionData.leadId || `DTGNX-${Date.now()}`);
      formData.append("industry", predictionData.industry || "SaaS");
      formData.append("budget", Number(predictionData.budget) || 0);
      formData.append("meet_count", Number(predictionData.meetingCount) || 0);
      formData.append("email_open_rate", Number(predictionData.emailOpenRate) || 0);
      formData.append("website_visits", Number(predictionData.websiteVisits) || 0);
      formData.append("mail_response_count", Number(predictionData.mailResponseCount) || 0);
      formData.append("document", selectedFile);
      
      const response = await crmService.leadConversion.predict(formData);
      
      if (response.success && response.data) {
        // Safe mapping of nested API outputs
        setPredictionResult(response.data.result || response.data);
        setShowSuccessBanner(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (response.result) {
        setPredictionResult(response.result.result || response.result);
        setShowSuccessBanner(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Failed to retrieve prediction results. Please check your backend.");
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
          <p>Predict conversion probability and generate intelligent AI summaries utilizing custom CatBoost ML Models & Gemini LLMs.</p>
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
              <span>✨ CatBoost Lead Scoring & Gemini Insights</span>
            </div>
            
            <form onSubmit={handlePredict} className="conversion-form">
              <div className="prediction-inputs-section">
                <div className="form-group-title">Input Prediction Data</div>
                
                {/* Row 1: Lead ID & Industry */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="leadId">LEAD ID</label>
                    <input 
                      type="text" 
                      id="leadId" 
                      value={predictionData.leadId} 
                      placeholder="e.g. DTGNX-0982"
                      onChange={handlePredictionChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="industry">INDUSTRY</label>
                    <select id="industry" value={predictionData.industry} onChange={handlePredictionChange} required>
                      <option value="">Select Industry</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Budget & Meeting Count */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="budget">BUDGET ($)</label>
                    <input 
                      type="number" 
                      id="budget" 
                      value={predictionData.budget} 
                      onChange={handlePredictionChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="meetingCount">TOTAL MEET COUNT</label>
                    <input 
                      type="number" 
                      id="meetingCount" 
                      value={predictionData.meetingCount} 
                      onChange={handlePredictionChange}
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Email Open Rate & Mail Response Count */}
                <div className="form-row">
                  <div className="form-group">
                    {/* CTO Spec: Show binary 0 or 1 in email open rate so user chooses between them */}
                    <label htmlFor="emailOpenRate">EMAIL OPEN RATE (0 OR 1)</label>
                    <select 
                      id="emailOpenRate" 
                      value={predictionData.emailOpenRate} 
                      onChange={handlePredictionChange}
                      required
                    >
                      <option value="">Select Open Rate</option>
                      <option value="0">0 (No opened emails)</option>
                      <option value="1">1 (Opened emails)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mailResponseCount">MAIL RESPONSE COUNT</label>
                    <input 
                      type="number" 
                      id="mailResponseCount" 
                      value={predictionData.mailResponseCount} 
                      onChange={handlePredictionChange}
                      required
                    />
                  </div>
                </div>

                {/* Row 4: Website Visits & File Uploader */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="websiteVisits">WEBSITE VISITS</label>
                    <input
                      type="number"
                      id="websiteVisits"
                      value={predictionData.websiteVisits}
                      onChange={handlePredictionChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="document">UPLOAD DOCUMENT (PDF/DOCX)</label>
                    <input 
                      type="file" 
                      id="document" 
                      accept=".pdf,.docx" 
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sample buttons updated for high/low intent mapping */}
              <div className="sample-buttons">
                <button type="button" className="sample-btn" onClick={() => setPredictionData({
                  leadId: 'DTGNX-HIGH-SAMPLE',
                  industry: 'SaaS',
                  budget: 85000,
                  meetingCount: 5,
                  emailOpenRate: '1',
                  websiteVisits: 28,
                  mailResponseCount: 9
                })}>Use high-intent sample</button>
                <button type="button" className="sample-btn" onClick={() => setPredictionData({
                  leadId: 'DTGNX-LOW-SAMPLE',
                  industry: 'Finance',
                  budget: 4500,
                  meetingCount: 0,
                  emailOpenRate: '0',
                  websiteVisits: 1,
                  mailResponseCount: 0
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
              
              {/* Render dynamic CatBoost classifier & Gemini insights in real-time */}
              {predictionResult ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", padding: "10px 0" }}>
                  
                  {/* Score Indicator */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
                    <div style={{ fontSize: "56px", fontWeight: "800", color: "#10b981", margin: "10px 0", lineHeight: "1" }}>
                      {predictionResult.conversion_probability !== undefined 
                        ? `${(predictionResult.conversion_probability * 100).toFixed(1)}%`
                        : `${predictionResult.conversion_probability_pct || 0}%`}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Conversion Probability
                    </div>
                  </div>

                  {/* Quality & Classification metrics */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ flex: 1, background: "#f3f4f6", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500", textTransform: "uppercase" }}>Lead Tier</div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginTop: "4px" }}>
                        {predictionResult.lead_tier || "N/A"}
                      </div>
                    </div>
                    <div style={{ flex: 1, background: "#f3f4f6", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500", textTransform: "uppercase" }}>Quality Score</div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginTop: "4px" }}>
                        {predictionResult.lead_quality_score !== undefined ? `${predictionResult.lead_quality_score}/100` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  {predictionResult.ai_summary && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>AI SUMMARY OF LEAD</h4>
                      <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.5", background: "#f9fafb", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                        {predictionResult.ai_summary}
                      </div>
                    </div>
                  )}

                  {/* Recommended Tactical Actions */}
                  {predictionResult.recommended_actions && predictionResult.recommended_actions.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>RECOMMENDED NEXT ACTIONS</h4>
                      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#4b5563" }}>
                        {predictionResult.recommended_actions.map((act, idx) => (
                          <li key={idx} style={{ marginBottom: "6px" }}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Model Metadata footer */}
                  <div style={{ width: "100%", textAlign: "left", background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px", color: "#6b7280" }}>
                    <div><strong>Model Type:</strong> CatBoost Classifier & Gemini LLM</div>
                    <div style={{ marginTop: "4px" }}><strong>Lead ID:</strong> {predictionResult.lead_id || "N/A"}</div>
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📉</div>
                  <p>No data available. Fill in the parameters, upload a pitch/meeting document, and execute prediction to see real-time CatBoost score & Gemini summary.</p>
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
