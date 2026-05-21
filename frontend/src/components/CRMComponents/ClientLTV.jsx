import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const ClientLTV = () => {
  const [formData, setFormData] = useState({
    customer: "",
    customerId: "",
    industry: "",
    engagement: "",
    recency: "",
    orders: "",
    avgOrderValue: "",
    uniqueProducts: "",
    lifetime: "",
    avgDaysBetweenOrders: "",
    itemsPerOrder: "",
    totalSpend: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = () => {
    setResult({
      clv: "₹85,000",
      upsell: "High",
      crossSell: "Within 20 Days",
    });
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
              onChange={handleChange}
            >
              <option>Choose from CRM leads</option>
            </select>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>CUSTOMER ID</label>
              <input
                name="customerId"
                style={inputStyle}
                placeholder="Customer ID"
                onChange={handleChange}
              />
            </div>

            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>INDUSTRY TYPE</label>
                <select
                  name="industry"
                  style={inputStyle}
                  onChange={handleChange}
                >
                  <option>saas</option>
                  <option>ecommerce</option>
                  <option>finance</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>ENGAGEMENT LEVEL</label>
                <select
                  name="engagement"
                  style={inputStyle}
                  onChange={handleChange}
                >
                  <option>medium</option>
                  <option>high</option>
                  <option>low</option>
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
              style={{
                width: "100%",
                marginTop: "20px",
                background: "#0ea5e9",
                color: "white",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Predict CLV
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
      minHeight: "200px",   // form ke according bada area
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
          <strong>Predicted CLV:</strong> {result.clv}
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
          <strong>Upsell Opportunity:</strong> {result.upsell}
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}
        >
          <strong>Cross-Sell Timing:</strong> {result.crossSell}
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

const InputField = ({ label, name, value, handleChange,placeholder }) => (
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