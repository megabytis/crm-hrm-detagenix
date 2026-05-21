import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService"; // Import CRM API services
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

/*
 * Updated by Pairing AI: Sales Forecasting & Pipeline Component
 * This component has been connected to the backend reports service.
 * Added proper dynamic state management, loading indications, error fallbacks,
 * and comprehensive documentation as requested by the CTO.
 */
const SalesForecasting = () => {
  // Styles for the KPI and report cards
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };

  // State Management for the Sales Forecast Dashboard
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(6);

  // Default simulated dataset (fallback when database is unpopulated or backend is offline)
  const defaultMockData = {
    overview: {
      total_leads: 58,
      closed_deals: 15,
      open_deals: 43,
      reporting_months: selectedMonths,
    },
    monthly_revenue: {
      current_month: 30000,
      projected_next_month: 34000,
      closed_revenue_total: 122000,
      trend: "Increasing",
      currency: "INR"
    },
    pipeline_health: {
      status: "Good",
      close_rate: 25.8,
      open_pipeline_value: 85000,
      closed_deals: 15,
      total_deals: 58
    },
    deal_closure_trends: {
      trend: "Increasing",
      monthly_series: [
        { label: "Jan", closed_deals: 5, monthly_revenue: 12000 },
        { label: "Feb", closed_deals: 8, monthly_revenue: 18000 },
        { label: "Mar", closed_deals: 6, monthly_revenue: 15000 },
        { label: "Apr", closed_deals: 12, monthly_revenue: 25000 },
        { label: "May", closed_deals: 10, monthly_revenue: 22000 },
        { label: "Jun", closed_deals: 15, monthly_revenue: 30000 }
      ]
    },
    founder_insight: "Healthy pipeline. Improve close rate with targeted follow-ups on warm opportunities."
  };

  // Function to load the forecast details from the Node/FastAPI backend APIs
  const fetchForecast = async (months) => {
    setLoading(true);
    setError(null);
    try {
      // Calls /api/crm/reports/sales-forecast under the hood
      const response = await crmService.reports.getSalesForecast(months);
      if (response && response.success) {
        setForecastData(response.data || response.forecast);
      } else {
        setError("Invalid response format received from backend.");
      }
    } catch (err) {
      console.error("Error fetching sales forecast:", err);
      // Fallback message displayed nicely in the UI warning bar
      setError("AI Forecast service offline or database empty. Displaying simulated forecasting data.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger data reload on component mount or whenever reporting window length changes
  useEffect(() => {
    fetchForecast(selectedMonths);
  }, [selectedMonths]);

  // Handle refresh button clicks manually
  const handleRefresh = () => {
    fetchForecast(selectedMonths);
  };

  // Determine active dataset (prefer live API data, fall back to simulated dataset)
  const activeData = forecastData || defaultMockData;

  // Format Recharts friendly data structures from backend timelines
  const chartData = activeData.deal_closure_trends?.monthly_series?.map(item => ({
    month: item.label,
    revenue: item.monthly_revenue,
    deals: item.closed_deals
  })) || [];

  // Helper styles to customize pipeline health badges based on status
  const getPipelineHealthStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent":
        return { background: "#d1fae5", color: "#065f46" };
      case "good":
        return { background: "#dbeafe", color: "#1e40af" };
      case "watch":
        return { background: "#fef3c7", color: "#92400e" };
      case "poor":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#f3f4f6", color: "#374151" };
    }
  };

  // Helper to color-code positive or negative forecasting trends
  const getTrendColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case "increasing":
        return "#10b981";
      case "decreasing":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "30px",
          background: "#f5f7fb",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#dbeafe",
                color: "#2563eb",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "14px",
              }}
            >
              Founder Decision Intelligence
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                color: "#111827",
                fontWeight: "700",
              }}
            >
              Sales Forecasting
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "10px",
                maxWidth: "700px",
                lineHeight: "1.6",
              }}
            >
              Forecast monthly revenue, monitor pipeline health,
              and track closure trends to plan growth confidently.
            </p>
          </div>

          {/* Right Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <select
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
              value={selectedMonths}
              onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
            >
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={24}>Last 24 months</option>
            </select>

            <button
              onClick={handleRefresh}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
              }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Dynamic Alert Banner for Backend Failures/Offline indicators */}
        {error && (
          <div
            style={{
              background: "#fffbeb",
              color: "#b45309",
              border: "1px solid #fde68a",
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "25px",
              fontWeight: "500",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div style={cardStyle}>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              CURRENT MONTH REVENUE
            </p>

            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "34px",
              }}
            >
              ₹{activeData.monthly_revenue?.current_month?.toLocaleString('en-IN') ?? 0}
            </h2>
          </div>

          <div style={cardStyle}>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              PROJECTED NEXT MONTH
            </p>

            <h2
              style={{
                margin: 0,
                color: "#1a1d1c",
                fontSize: "34px",
              }}
            >
              ₹{activeData.monthly_revenue?.projected_next_month?.toLocaleString('en-IN') ?? 0}
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: getTrendColor(activeData.monthly_revenue?.trend),
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Trend: {activeData.monthly_revenue?.trend ?? "Stable"}
            </p>
          </div>

          <div style={cardStyle}>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              PIPELINE HEALTH
            </p>

            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: "30px",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "12px",
                ...getPipelineHealthStyle(activeData.pipeline_health?.status),
              }}
            >
              {activeData.pipeline_health?.status ?? "Watch"}
            </div>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              {activeData.pipeline_health?.close_rate ?? 0.0}% Close rate
            </p>
          </div>

          <div style={cardStyle}>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              CLOSURE TREND
            </p>

            <h2
              style={{
                margin: 0,
                color: getTrendColor(activeData.deal_closure_trends?.trend),
                fontSize: "34px",
              }}
            >
              {activeData.deal_closure_trends?.trend ?? "Stable"}
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Direction across selected months
            </p>
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
            marginBottom: "30px",
          }}
        >
          {/* Revenue Trend */}
          <div
            style={{
              ...cardStyle,
              height: "350px",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                color: "#111827",
              }}
            >
              Monthly Revenue Trend
            </h3>

            <div
              style={{
                width: "100%",
                height: "260px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deal Closure */}
          <div
            style={{
              ...cardStyle,
              height: "350px",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                color: "#111827",
              }}
            >
              Deal Closure Volume
            </h3>

            <div
              style={{
                width: "100%",
                height: "260px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deals" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Founder Brief */}
        <div style={cardStyle}>
          <h3
            style={{
              marginBottom: "25px",
              color: "#111827",
            }}
          >
            Founder Brief
          </h3>

          {/* Mini Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "18px",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                TOTAL LEADS
              </p>

              <h3
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                {activeData.overview?.total_leads ?? 0}
              </h3>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "18px",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                CLOSED DEALS
              </p>

              <h3
                style={{
                  margin: 0,
                  color: "#10b981",
                }}
              >
                {activeData.overview?.closed_deals ?? 0}
              </h3>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "18px",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                OPEN PIPELINE VALUE
              </p>

              <h3
                style={{
                  margin: 0,
                  color: "#2563eb",
                }}
              >
                ₹{activeData.pipeline_health?.open_pipeline_value?.toLocaleString('en-IN') ?? 0}
              </h3>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "18px",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                REPORTING WINDOW
              </p>

              <h3
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                {activeData.overview?.reporting_months ?? selectedMonths} months
              </h3>
            </div>
          </div>

          {/* Strategic Recommendation */}
          <div
            style={{
              background: "#ecfeff",
              border: "1px solid #a5f3fc",
              padding: "20px",
              borderRadius: "14px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                marginBottom: "10px",
                color: "#0f172a",
              }}
            >
              Strategic Recommendation
            </h4>

            <p
              style={{
                margin: 0,
                color: "#334155",
                lineHeight: "1.6",
              }}
            >
              {activeData.founder_insight || "No insight available yet. Please refresh after adding lead data."}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesForecasting;