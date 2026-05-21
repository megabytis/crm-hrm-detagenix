import React, { useState, useMemo } from 'react';
import './LeadGeneration.css';
import DashboardLayout from '../../DashboardComponents/DashboardLayout';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaSyncAlt, 
  FaSpinner, 
  FaRocket, 
  FaRegLightbulb 
} from 'react-icons/fa';

const LeadGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    query: '',
    maxResults: 10,
    industry: '',
    location: '',
    quality: 'All'
  });

  const mockLeadsData = [
    {
      id: 1,
      name: 'Chennai Dental Care',
      industry: 'Healthcare',
      websiteStatus: 'No Website',
      email: 'contact@chennaidental.com',
      phone: '+91 98450 12345',
      score: 85,
      type: 'Hot'
    },
    {
      id: 2,
      name: 'SkyTech Solutions',
      industry: 'Technology',
      websiteStatus: 'Weak Website',
      email: 'info@skytech.in',
      phone: '+91 99620 54321',
      score: 65,
      type: 'Warm'
    },
    {
      id: 3,
      name: 'Green Leaf Restaurant',
      industry: 'Restaurants',
      websiteStatus: 'No Website',
      email: 'hello@greenleaf.com',
      phone: '+91 44 2433 1122',
      score: 45,
      type: 'Cold'
    },
    {
      id: 4,
      name: 'Elite Education Hub',
      industry: 'Education',
      websiteStatus: 'Active Website',
      email: 'admin@eliteedu.org',
      phone: '+91 98840 98765',
      score: 72,
      type: 'Warm'
    },
    {
      id: 5,
      name: 'Modern Retail Mart',
      industry: 'Retail',
      websiteStatus: 'Weak Website',
      email: 'support@modernretail.com',
      phone: '+91 97900 11223',
      score: 91,
      type: 'Hot'
    }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateLeads = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLeads(mockLeadsData);
      setLoading(false);
    }, 2000);
  };

  const loadSampleQuery = () => {
    setFormData({
      query: 'Find businesses in Chennai without websites',
      maxResults: 15,
      industry: 'Healthcare',
      location: 'Chennai',
      quality: 'All'
    });
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter(l => l.type === 'Hot').length;
    const warm = leads.filter(l => l.type === 'Warm').length;
    const cold = leads.filter(l => l.type === 'Cold').length;
    return { total, hot, warm, cold };
  }, [leads]);

  return (
    <DashboardLayout>
      <div className="lead-generation-container">
        <div className="lead-generation-header">
          <h2>Lead Generation</h2>
          <p>Search and generate qualified business leads using AI-powered discovery.</p>
        </div>

        <div className="lead-generation-main-content">
          {/* LEFT CARD: Discovery Form */}
          <div className="discovery-form-card">
            <h3 className="card-title">Lead Discovery Query</h3>
            <span className="helper-text">
              <FaRegLightbulb style={{ marginRight: '6px', color: '#f59e0b' }} />
              Example: “Find businesses in Chennai without websites”
            </span>

            <form className="discovery-form" onSubmit={handleGenerateLeads}>
              <div className="form-group">
                <label htmlFor="query">QUERY INPUT</label>
                <textarea 
                  id="query" 
                  rows="3"
                  placeholder="Give me details of businesses in Chennai that have no websites"
                  value={formData.query}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="maxResults">MAX RESULTS</label>
                <input 
                  type="number" 
                  id="maxResults" 
                  value={formData.maxResults}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="industry">INDUSTRY</label>
                <select id="industry" value={formData.industry} onChange={handleInputChange}>
                  <option value="">Select Industry</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">LOCATION</label>
                <input 
                  type="text" 
                  id="location" 
                  placeholder="Enter city or region"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quality">LEAD QUALITY FILTER</label>
                <select id="quality" value={formData.quality} onChange={handleInputChange}>
                  <option value="All">All</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div className="button-group">
                <button type="submit" className="generate-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      Generate Qualified Leads
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="sample-btn" 
                  onClick={loadSampleQuery}
                  disabled={loading}
                >
                  Load Sample Query
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT CARD: Leads Summary */}
          <div className="leads-summary-card">
            <h3 className="card-title">Qualified Leads Summary</h3>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Leads</span>
              </div>
              <div className="stat-item" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="stat-value" style={{ color: '#ef4444' }}>{stats.hot}</span>
                <span className="stat-label">Hot Leads</span>
              </div>
              <div className="stat-item" style={{ borderLeft: '4px solid #f59e0b' }}>
                <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.warm}</span>
                <span className="stat-label">Warm Leads</span>
              </div>
              <div className="stat-item" style={{ borderLeft: '4px solid #3b82f6' }}>
                <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.cold}</span>
                <span className="stat-label">Cold Leads</span>
              </div>
            </div>

            <div className="table-area">
              <div className="table-controls">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search leads..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="action-buttons">
                  <button className="icon-btn" title="Filter"><FaFilter /></button>
                  <button className="icon-btn" title="Refresh"><FaSyncAlt /></button>
                  <button className="icon-btn" title="Export CSV"><FaDownload /></button>
                </div>
              </div>

              <div className="leads-table-container">
                {leads.length > 0 ? (
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>BUSINESS NAME</th>
                        <th>INDUSTRY</th>
                        <th>WEBSITE STATUS</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>LEAD SCORE</th>
                        <th>LEAD TYPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td style={{ fontWeight: '600' }}>{lead.name}</td>
                          <td>{lead.industry}</td>
                          <td>
                            <span className={`status-tag status-${lead.websiteStatus.toLowerCase().split(' ')[0]}`}>
                              {lead.websiteStatus}
                            </span>
                          </td>
                          <td>{lead.email}</td>
                          <td>{lead.phone}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: lead.score > 80 ? '#dcfce7' : lead.score > 60 ? '#fef3c7' : '#fee2e2',
                              color: lead.score > 80 ? '#166534' : lead.score > 60 ? '#92400e' : '#991b1b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              margin: '0 auto'
                            }}>
                              {lead.score}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${lead.type.toLowerCase()}`}>
                              {lead.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>No leads generated yet. Submit a search query to generate CRM-ready lead intelligence.</p>
                  </div>
                )}
              </div>

              {leads.length > 0 && (
                <div className="pagination">
                  <span>Showing 1 to {filteredLeads.length} of {leads.length} entries</span>
                  <div className="page-buttons">
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadGeneration;
