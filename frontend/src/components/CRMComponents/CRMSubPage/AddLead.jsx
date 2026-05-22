import React, { useState } from 'react';
import './AddLead.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';
import { crmService } from '../../../services/crmService';
import { useNavigate } from 'react-router-dom';

const AddLead = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  // PAIRING AI: addedLeadResult stores the returned lead document containing dynamic ML scores and predictions for immediate UI display
  const [addedLeadResult, setAddedLeadResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedinProfile: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
    source: '',
    role: '',
    leadId: '',
    requirementDetails: '',
    status: 'New',
    priority: 'Medium',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        linkedinProfile: formData.linkedinProfile,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyEmail: formData.companyEmail,
        source: formData.source,
        status: formData.status,
        role: formData.role,
        // PAIRING AI: Aligned React form 'role' with MongoDB database schema 'role_position' contract for consistency
        role_position: formData.role,
        leadId: formData.leadId,
        priority: formData.priority,
        requirementDetails: formData.requirementDetails,
      };

      const response = await crmService.leads.create(leadData);

      if (response.success || response.data) {
        alert('Lead added successfully!');
        // PAIRING AI: Instead of immediate redirection, preserve response to show live ML predictions directly on screen
        setAddedLeadResult(response.data);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="add-lead-page-container">
        <div className="add-lead-header">
          <h2>Add Lead</h2>
          <p>Fill in the details below to create a new lead in the system.</p>
        </div>

        {/* PAIRING AI: Dynamic AI Lead Intelligence notification bar displayed immediately upon successful lead entry creation */}
        {addedLeadResult && (
          <div style={{
            background: (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#fee2e2" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#fef3c7" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#e0f2fe" : "#f3f4f6",
            color: (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#991b1b" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#92400e" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#075985" : "#374151",
            border: `1px solid ${(typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#fca5a5" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#fcd34d" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#7dd3fc" : "#d1d5db"}`,
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            fontWeight: 600,
            fontSize: "15px"
          }}>
            <span>🤖 AI Lead Intelligence Check:</span>
            <span style={{ 
              background: "#fff", 
              padding: "4px 12px", 
              borderRadius: "20px", 
              border: "inherit",
              fontSize: "14px"
            }}>
              {(typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) || "Unscored"}
            </span>
            <span style={{ fontWeight: 400, fontSize: "14px", marginLeft: "10px", color: "inherit" }}>
              This lead has been successfully registered in the system.
            </span>
          </div>
        )}

        <div className="add-lead-main-content">
          <form className="add-lead-form" onSubmit={handleSubmit}>
            <div className="form-section">

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">NAME</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">EMAIL</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">PHONE</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">LOCATION</label>
                  <input
                    type="text"
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="linkedinProfile">
                  LINKEDIN PROFILE
                </label>

                <input
                  type="url"
                  id="linkedinProfile"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">COMPANY NAME</label>

                  <input
                    type="text"
                    id="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="companyWebsite">
                    COMPANY WEBSITE
                  </label>

                  <input
                    type="url"
                    id="companyWebsite"
                    placeholder="https://..."
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="companyEmail">
                  COMPANY EMAIL
                </label>

                <input
                  type="email"
                  id="companyEmail"
                  placeholder="company@example.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
  <div className="form-group">
    <label htmlFor="role">ROLE</label>

    <input
      type="text"
      id="role"
      // placeholder="e.g. HR Manager"
      value={formData.role}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label htmlFor="leadId">LEAD ID</label>

    <input
      type="text"
      id="leadId"
      placeholder="Enter Lead ID"
      value={formData.leadId}
      onChange={handleChange}
    />
  </div>
</div>

              <div className="form-group full-width">
   <label htmlFor="source">LEAD SOURCE</label>

  <select
    id="source"
    value={formData.source}
    onChange={handleChange}
  >
    <option value="">Select Source</option>
    <option value="LinkedIn">LinkedIn</option>
    <option value="Website">Website</option>
    <option value="Referral">Referral</option>
    <option value="Instagram">Instagram</option>
    <option value="Walk-in">Walk-in</option>
    <option value="Cold Call">Cold Call</option>
     <option value="Other">Other</option>
  </select>
</div>
      <div className="form-group full-width">
  <label htmlFor="requirementDetails">
    REQUIREMENT DETAILS
  </label>

  <textarea
    id="requirementDetails"
    placeholder="Briefly describe the lead requirement..."
    value={formData.requirementDetails}
    onChange={handleChange}
  ></textarea>
</div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">STATUS</label>

                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {/* Aligned frontend status options with backend Lead.js schema requirements */}
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">PRIORITY</label>

                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </form>

          <div className="prediction-sidebar">
            <div className="prediction-card">
              <h3>Lead Information</h3>

              {/* PAIRING AI: If lead has been successfully registered, render complete details, AI Model Confidence rating bar, next best action suggestions, and temperature scores in real-time */}
              {addedLeadResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#111827", fontWeight: 600 }}>{addedLeadResult.name}</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{addedLeadResult.email}</p>
                    {addedLeadResult.phone && <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>{addedLeadResult.phone}</p>}
                    {addedLeadResult.location && <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>📍 {addedLeadResult.location}</p>}
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 700, display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
                      AI LEAD TEMPERATURE
                    </span>
                    <span
                      style={{
                        padding: "6px 14px",
                        fontSize: "13px",
                        borderRadius: "20px",
                        background: (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#fee2e2" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#fef3c7" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#e0f2fe" : "#f3f4f6",
                        color: (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#991b1b" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#92400e" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#075985" : "#374151",
                        border: `1px solid ${(typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" ? "#fca5a5" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm" ? "#fcd34d" : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Cold" ? "#7dd3fc" : "#d1d5db"}`,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {(typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) || "Unknown"}
                    </span>
                  </div>

                  {typeof addedLeadResult.ml_prediction === 'object' && addedLeadResult.ml_prediction?.confidence !== undefined && (
                    <div>
                      <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 700, display: "block", marginBottom: "4px", letterSpacing: "0.05em" }}>
                        AI MODEL CONFIDENCE
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ 
                            width: `${(addedLeadResult.ml_prediction.confidence * 100).toFixed(0)}%`, 
                            height: "100%", 
                            background: addedLeadResult.ml_prediction.predicted_temperature === "Hot" ? "#ef4444" : addedLeadResult.ml_prediction.predicted_temperature === "Warm" ? "#f59e0b" : "#3b82f6",
                            borderRadius: "3px" 
                          }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                          {(addedLeadResult.ml_prediction.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "8px", background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                      NEXT ACTION RECOMMENDATION
                    </span>
                    <p style={{ margin: 0, fontSize: "12px", color: "#4b5563", lineHeight: 1.4 }}>
                      {(typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Hot" 
                        ? "🔥 Highly engaged prospect! Direct sales should schedule a discovery call immediately."
                        : (typeof addedLeadResult.ml_prediction === 'object' ? addedLeadResult.ml_prediction?.predicted_temperature : addedLeadResult.ml_prediction) === "Warm"
                        ? "⚡ Interested lead. Send an introductory product demo email and add to newsletter nurture."
                        : "❄️ Lower engagement. Keep in email marketing loop for regular monthly updates."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prediction-placeholder">
                  <div className="prediction-icon">📋</div>
                  <p>
                    Fill in the lead details to create and manage
                    leads effectively.
                  </p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>Lead Tips</h3>
              <ul>
                <li>Verify email and phone before saving.</li>
                <li>Keep source details accurate.</li>
                <li>LinkedIn profile helps in follow-ups.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddLead;