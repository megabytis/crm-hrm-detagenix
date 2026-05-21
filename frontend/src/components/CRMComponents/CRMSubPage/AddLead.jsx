import React, { useState } from 'react';
import './AddLead.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';
import { crmService } from '../../../services/crmService';
import { useNavigate } from 'react-router-dom';

const AddLead = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
  leadId: formData.leadId,
        priority: formData.priority,
        requirementDetails: formData.requirementDetails,
      };

      const response = await crmService.leads.create(leadData);

      if (response.success || response.data) {
        alert('Lead added successfully!');
        navigate('/leads-management');
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

              <div className="prediction-placeholder">
                <div className="prediction-icon">📋</div>

                <p>
                  Fill in the lead details to create and manage
                  leads effectively.
                </p>
              </div>
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