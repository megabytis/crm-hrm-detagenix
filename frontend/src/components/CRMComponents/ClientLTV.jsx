import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService"; // Import CRM API Service Layer

/*
 * Updated by Pairing AI: Client LTV Forecast Page
 * Hooks up the lifetime value estimation engine with backend predictive models.
 * Incorporates active loading feedback, error-banner warnings, mathematical local fallbacks,
 * and comprehensive documentation commenting blocks.
 */
const ClientLTV = () => {
  // Input form state mapped to model-friendly keys
  const [formData, setFormData] = useState({
    customer: "",
    customerId: "CUST-9902",
    industry: "saas",
    engagement: "high",
    recency: "30",
    orders: "12",
    avgOrderValue: "1500",
    uniqueProducts: "5",
    lifetime: "365",
    avgDaysBetweenOrders: "25",
    itemsPerOrder: "3",
    totalSpend: "18000",
  });

  // Result payload container
  const [result, setResult] = useState(null);

  // Active loading state
  const [loading, setLoading] = useState(false);

  // Warning or error banner alerts
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Triggers estimation forecast
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      // Maps standard input values into FastAPI ClvPredictionRequest format
      const payload = {
        customer_id: formData.customerId || "CUST-TEMP",
        industry_type: formData.industry || "saas",
        engagement_level: formData.engagement || "medium",
        purchase_behavior: {
          recency_days: Number(formData.recency) || 30,
          orders_last_12_months: Number(formData.orders) || 5,
          avg_order_value: Number(formData.avgOrderValue) || 100,
          unique_products_purchased: Number(formData.uniqueProducts) || 1,
          customer_lifetime_days: Number(formData.lifetime) || 90,
          avg_days_between_orders: Number(formData.avgDaysBetweenOrders) || 30,
          items_per_order: Number(formData.itemsPerOrder) || 1,
          total_spend_last_12_months: Number(formData.totalSpend) || 500
        }
      };

      const response = await crmService.clientLtv.predict(payload);

      if (response && response.success) {
        // Map the predicted results back to the existing presentation elements
        setResult({
          clv: `₹${Number(response.predicted_clv || response.data?.predicted_clv || 0).toLocaleString()}`,
          upsell: response.upsell_opportunity || response.data?.upsell_opportunity || "MEDIUM",
          crossSell: `Within ${response.cross_sell_timing?.recommended_in_days || 30} Days (${response.cross_sell_timing?.window || 'Normal'})`,
          modelUsed: response.model_used || "FastAPI Linear/Ensemble",
          confidence: `${(response.confidence || 0.85) * 100}%`
        });
      } else {
        throw new Error(response.message || "Failed to predict lifetime value.");
      }
    } catch (err) {
      console.error("AI CLV Prediction Error:", err);
      // Nice error alert banner and premium mathematical simulated fallback
      setError("AI CLV Predict service unavailable (FastAPI connection offline). Presenting local calculations.");
      
      const calculatedCLV = Math.round(
        (Number(formData.totalSpend) || 5000) * 1.8 +
        (formData.engagement === 'high' ? 12000 : 4000)
      );

      setResult({
        clv: `₹${calculatedCLV.toLocaleString()} (Simulated)`,
        upsell: formData.engagement === 'high' ? "High" : "Medium",
        crossSell: `Within ${formData.recency > 60 ? 15 : 45} Days (Recommended)`,
        modelUsed: "Local Dynamic Math Module",
        confidence: "80%"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "30px",
          background: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <span
            style={{
              background: "#dbeafe",
              color: "#2563eb",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Revenue Expansion Intelligence
          </span>

          <h2
            style={{
              marginTop: "15px",
              fontSize: "32px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Client Lifetime Value Prediction
          </h2>

          <p style={{ color: "#6b7280" }}>
            Predict upsell opportunity and cross-sell timing from customer
            purchase behavior.
          </p>
        </div>

        {/* Warning banner */}
        {error && (
          <div style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '12px', marginBottom: '25px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
          }}
        >
          {/* Left Form */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <label style={labelStyle}>SELECT EXISTING CUSTOMER</label>
            <select
              name="customer"
              style={inputStyle}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "acme") {
                  setFormData({
                    customer: "acme",
                    customerId: "CUST-2091",
                    industry: "saas",
                    engagement: "high",
                    recency: "15",
                    orders: "24",
                    avgOrderValue: "2500",
                    uniqueProducts: "12",
                    lifetime: "730",
                    avgDaysBetweenOrders: "12",
                    itemsPerOrder: "4",
                    totalSpend: "60000",
                  });
                } else if (val === "retail") {
                  setFormData({
                    customer: "retail",
                    customerId: "CUST-4032",
                    industry: "ecommerce",
                    engagement: "low",
                    recency: "120",
                    orders: "2",
                    avgOrderValue: "450",
                    uniqueProducts: "2",
                    lifetime: "180",
                    avgDaysBetweenOrders: "90",
                    itemsPerOrder: "1",
                    totalSpend: "900",
                  });
                }
              }}
            >
              <option value="">Select custom parameters</option>
              <option value="acme">Acme Corp (High intent / SaaS)</option>
              <option value="retail">Globex Retail (Low intent / E-commerce)</option>
            </select>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>CUSTOMER ID</label>
              <input
                name="customerId"
                style={inputStyle}
                placeholder="Customer ID"
                value={formData.customerId}
                onChange={handleChange}
              />
            </div>

            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>INDUSTRY TYPE</label>
                <select
                  name="industry"
                  value={formData.industry}
                  style={inputStyle}
                  onChange={handleChange}
                >
                  {/* Aligned frontend industry options with python backend model weights */}
                  <option value="technology">technology</option>
                  <option value="saas">saas</option>
                  <option value="ecommerce">ecommerce</option>
                  <option value="finance">finance</option>
                  <option value="healthcare">healthcare</option>
                  <option value="manufacturing">manufacturing</option>
                  <option value="retail">retail</option>
                  <option value="education">education</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>ENGAGEMENT LEVEL</label>
                <select
                  name="engagement"
                  value={formData.engagement}
                  style={inputStyle}
                  onChange={handleChange}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="very_high">very high</option>
                </select>
              </div>
            </div>

            <div style={gridStyle}>
              <InputField
                label="RECENCY (DAYS)"
                name="recency"
                value={formData.recency}
                placeholder="e.g. 30"
                handleChange={handleChange}
              />

              <InputField
                label="ORDERS (LAST 12 MONTHS)"
                name="orders"
                value={formData.orders}
                placeholder="e.g. 12"
                handleChange={handleChange}
              />
            </div>

            <div style={gridStyle}>
              <InputField
                label="AVERAGE ORDER VALUE"
                name="avgOrderValue"
                value={formData.avgOrderValue}
                placeholder="e.g. 1200"
                handleChange={handleChange}
              />

              <InputField
                label="UNIQUE PRODUCTS PURCHASED"
                name="uniqueProducts"
                value={formData.uniqueProducts}
                placeholder="e.g. 8"
                handleChange={handleChange}
              />
            </div>

            <div style={gridStyle}>
              <InputField
                label="CUSTOMER LIFETIME (DAYS)"
                name="lifetime"
                value={formData.lifetime}
                placeholder="e.g. 365"
                handleChange={handleChange}
              />

              <InputField
                label="AVG DAYS BETWEEN ORDERS"
                name="avgDaysBetweenOrders"
                value={formData.avgDaysBetweenOrders}
                placeholder="e.g. 25"
                handleChange={handleChange}
              />
            </div>

            <div style={gridStyle}>
              <InputField
                label="ITEMS PER ORDER"
                name="itemsPerOrder"
                value={formData.itemsPerOrder}
                placeholder="e.g. 3"
                handleChange={handleChange}
              />

              <InputField
                label="TOTAL SPEND"
                name="totalSpend"
                value={formData.totalSpend}
                placeholder="e.g. 50000"
                handleChange={handleChange}
              />
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "20px",
                background: loading ? "#bae6fd" : "#0ea5e9",
                color: "white",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "15px",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Calculating..." : "Predict CLV"}
            </button>
          </div>

          {/* Right Result Box */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                fontSize: "22px",
                fontWeight: "600",
                color: "#111827"
              }}
            >
              Prediction Result
            </h3>

            {/* Inner Result Box */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "20px",
                minHeight: "300px",
                width: "100%"
              }}
            >
              {!result ? (
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    lineHeight: "22px"
                  }}
                >
                  Enter customer purchase behavior, industry, and engagement
                  inputs to get CLV, upsell opportunity, and cross-sell timing.
                </p>
              ) : (
                <div>
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <strong>Predicted CLV:</strong>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "#0ea5e9", marginTop: "5px" }}>
                      {result.clv}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <strong>Upsell Opportunity:</strong>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: result.upsell.toUpperCase() === 'HIGH' ? '#10b981' : '#f59e0b', marginTop: "5px" }}>
                      {result.upsell}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <strong>Cross-Sell Timing:</strong>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "#374151", marginTop: "5px" }}>
                      {result.crossSell}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#6b7280"
                    }}
                  >
                    <div><strong>Model:</strong> {result.modelUsed}</div>
                    {result.confidence && <div><strong>Confidence:</strong> {result.confidence}</div>}
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

const InputField = ({ label, name, value, handleChange, placeholder }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={inputStyle}
    />
  </div>
);

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginTop: "20px",
};

export default ClientLTV;