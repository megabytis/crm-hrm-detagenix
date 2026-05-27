import React, { useState } from 'react';
import './AddLead.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';
import { crmService } from '../../../services/crmService';
import { useNavigate } from 'react-router-dom';
import  {  useEffect } from 'react';

const AddLead = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  /**
   * Added state to persist the newly created lead's data locally.
   * This enables the user to view the confirmation and full lead payload 
   * in-page without forcing a redirection away from their workflow.
   */
  const [addedLead, setAddedLead] = useState(null);
  
  /**
   * Controls the visible state of the inline success banner.
   */
  const [showSuccess, setShowSuccess] = useState(false);

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
    priority: 'Warm',
  });
   const generateLeadId = async () => {
  try {
    const response = await crmService.leads.getAll();
    const leadsList = response?.data || [];

    const companyShort = "DTGNX";
    const year = new Date().getFullYear();

    /*
      ========================================================================
      ORIGINAL COUNT-BASED FRONTEND GENERATOR
      (Commented out to keep compatibility and record design decisions)
      ------------------------------------------------------------------------
      const totalLeads = response?.data?.length || 0;
      const nextNumber = String(totalLeads + 1).padStart(3, "0");
      const generatedId = `${companyShort}${year}${nextNumber}`;
      ========================================================================
    */

    /*
      ========================================================================
      PREVIOUS FRONTEND INCREMENTER (WITHOUT PREFIX FILTER)
      (Commented out as requested - collapsed during prefix correction to
       avoid alphabetical sorting overlap with dummy prefixes starting with "L")
      ------------------------------------------------------------------------
      let nextNum = 1;
      if (leadsList.length > 0) {
        const sortedLeads = [...leadsList].sort((a, b) => {
          if (!a.leadId) return 1;
          if (!b.leadId) return -1;
          return b.leadId.localeCompare(a.leadId);
        });
        const lastLead = sortedLeads[0];
        if (lastLead && lastLead.leadId) {
          const suffix = lastLead.leadId.slice(-3);
          const lastNumber = parseInt(suffix, 10);
          if (!isNaN(lastNumber)) {
            nextNum = lastNumber + 1;
          }
        }
      }
      const generatedId = `${companyShort}${year}${String(nextNum).padStart(3, "0")}`;
      ========================================================================
    */

    // REPLACED BY SECURE SEQUENCE DEVIATION SCANNER (WITH PREFIX FILTER):
    // Filters and sorts current database records starting with "DTGNX" only,
    // avoiding sorting overlap with dummy prefixes (e.g. "LEAD-DUMMY-WON-X" starting with "L").
    let nextNum = 1;
    const dtgnxLeads = leadsList.filter(l => l.leadId && l.leadId.startsWith("DTGNX"));
    if (dtgnxLeads.length > 0) {
      const sortedLeads = [...dtgnxLeads].sort((a, b) => b.leadId.localeCompare(a.leadId));
      const lastLead = sortedLeads[0];
      if (lastLead && lastLead.leadId) {
        const suffix = lastLead.leadId.slice(-3);
        const lastNumber = parseInt(suffix, 10);
        if (!isNaN(lastNumber)) {
          nextNum = lastNumber + 1;
        }
      }
    }

    const generatedId = `${companyShort}${year}${String(nextNum).padStart(3, "0")}`;

    setFormData((prev) => ({
      ...prev,
      leadId: generatedId,
    }));

  } catch (error) {
    console.error("Error generating lead ID:", error);
  }
};
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
useEffect(() => {
  generateLeadId();
}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map frontend priority categories ("Low", "Medium", "High") to Mongoose database enums ("Cold", "Warm", "Hot")
      const priorityMap = {
        'Low': 'Cold',
        'Medium': 'Warm',
        'High': 'Hot',
        'Cold': 'Cold',
        'Warm': 'Warm',
        'Hot': 'Hot'
      };

      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        linkedinProfile: formData.linkedinProfile,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyEmail: formData.companyEmail,
        source: formData.source || "Other", // Safe fallback to prevent empty string enum validation failures
        status: formData.status,
        role: formData.role,
        leadId: formData.leadId,
        priority: priorityMap[formData.priority] || "Warm",
        requirementDetails: formData.requirementDetails,
      };
     
      const response = await crmService.leads.create(leadData);

      if (response.success || response.data) {
        const createdLead = response.data || leadData;
        
        // Save the successfully created lead state to render in the sidebar
        setAddedLead(createdLead);
        setShowSuccess(true);
        
        // Clear out form inputs to keep the workspace ready for the next lead
        setFormData({
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
        
        // Re-fetch current database length to auto-generate next serial DTGNX ID
        generateLeadId();
        
        // Smooth viewport slide to top to ensure visibility of the success alert toast
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert(error.message || 'Failed to add lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="add-lead-page-container">
        {/* Premium inline toast notification indicating successful lead creation */}
        {showSuccess && addedLead && (
          <div className="success-alert">
            <span className="success-alert-icon">✨</span>
            <div>
              <strong>Success!</strong> Lead <strong>{addedLead.name}</strong> ({addedLead.leadId}) has been successfully created.
            </div>
          </div>
        )}

        <div className="add-lead-header">
          <h2>Add Lead</h2>
          <p>Fill in the details below to create a new lead in the system.</p>
        </div>

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
                    required
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
  value={formData.leadId}
  readOnly
  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
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
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
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

              {/* 
                ======================================================================
                AI DEVELOPER REFERENCE - COMMENTED OUT FOR FUTURE USE:
                If you ever want to revert back to the simple tabular key-value view,
                uncomment the block below and replace the AI prediction block.
                ----------------------------------------------------------------------
                addedLead && (
                  <div className="added-lead-details">
                    <div className="lead-detail-item">
                      <span className="lead-detail-label">Lead ID</span>
                      <span className="lead-detail-value" style={{ fontWeight: '700', color: '#2563eb' }}>
                        {addedLead.leadId}
                      </span>
                    </div>
                    <div className="lead-detail-item">
                      <span className="lead-detail-label">Name</span>
                      <span className="lead-detail-value">{addedLead.name}</span>
                    </div>
                    <div className="lead-detail-item">
                      <span className="lead-detail-label">Email</span>
                      <span className="lead-detail-value">{addedLead.email}</span>
                    </div>
                  </div>
                )
                ======================================================================
              */}

              {addedLead ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#111827", fontWeight: 600 }}>{addedLead.name}</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{addedLead.email}</p>
                    {addedLead.phone && <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>{addedLead.phone}</p>}
                    {addedLead.location && <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>📍 {addedLead.location}</p>}
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
                        background: (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Hot" ? "#fee2e2" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Warm" ? "#fef3c7" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Cold" ? "#e0f2fe" : "#f3f4f6",
                        color: (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Hot" ? "#991b1b" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Warm" ? "#92400e" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Cold" ? "#075985" : "#374151",
                        border: `1px solid ${(typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Hot" ? "#fca5a5" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Warm" ? "#fcd34d" : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Cold" ? "#7dd3fc" : "#d1d5db"}`,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {(typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) || "Unknown"}
                    </span>
                  </div>

                  {typeof addedLead.ml_prediction === 'object' && addedLead.ml_prediction?.confidence !== undefined && (
                    <div>
                      <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 700, display: "block", marginBottom: "4px", letterSpacing: "0.05em" }}>
                        AI MODEL CONFIDENCE
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ 
                            width: `${(addedLead.ml_prediction.confidence * 100).toFixed(0)}%`, 
                            height: "100%", 
                            background: addedLead.ml_prediction.predicted_temperature === "Hot" ? "#ef4444" : addedLead.ml_prediction.predicted_temperature === "Warm" ? "#f59e0b" : "#3b82f6",
                            borderRadius: "3px" 
                          }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                          {(addedLead.ml_prediction.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "8px", background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                      NEXT ACTION RECOMMENDATION
                    </span>
                    <p style={{ margin: 0, fontSize: "12px", color: "#4b5563", lineHeight: 1.4 }}>
                      {(typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Hot" 
                        ? "🔥 Highly engaged prospect! Direct sales should schedule a discovery call immediately."
                        : (typeof addedLead.ml_prediction === 'object' ? addedLead.ml_prediction?.predicted_temperature : addedLead.ml_prediction) === "Warm"
                        ? "⚡ Interested lead. Send an introductory product demo email and add to newsletter nurture."
                        : "❄️ Lower engagement. Keep in email marketing loop for regular monthly updates."}
                    </p>
                  </div>
                  
                  {/* Action Buttons for Easy Workflow Navigation and View Resetting */}
                  <div className="sidebar-actions" style={{ marginTop: "12px" }}>
                    <button 
                      type="button" 
                      className="sidebar-btn primary"
                      onClick={() => navigate('/leads-management')}
                    >
                      Go to Leads Management
                    </button>
                    <button 
                      type="button" 
                      className="sidebar-btn"
                      onClick={() => {
                        setAddedLead(null);
                        setShowSuccess(false);
                      }}
                    >
                      Clear Info View
                    </button>
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