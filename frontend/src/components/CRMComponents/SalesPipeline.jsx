import React from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
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

const SalesForecasting = () => {
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };
  const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 25000 },
  { month: "May", revenue: 22000 },
  { month: "Jun", revenue: 30000 },
];

const dealData = [
  { month: "Jan", deals: 5 },
  { month: "Feb", deals: 8 },
  { month: "Mar", deals: 6 },
  { month: "Apr", deals: 12 },
  { month: "May", deals: 10 },
  { month: "Jun", deals: 15 },
];

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
            >
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This Year</option>
            </select>

            <button
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Alert */}
        {/* <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "25px",
            fontWeight: "500",
          }}
        >
          Request timeout. Please check if backend is running.
        </div> */}

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
              ₹0
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
              ₹0
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#608565",
                fontSize: "13px",
              }}
            >
              Trend: Stable
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
                background: "#fef3c7",
                color: "#92400e",
                padding: "6px 14px",
                borderRadius: "30px",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              Watch
            </div>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              0.0% Close rate
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
                color: "#568e61",
                fontSize: "34px",
              }}
            >
              Stable
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
    <LineChart data={revenueData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
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
    <BarChart data={dealData}>
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
                0
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
                0
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
                ₹0
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
                6 months
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
              No insight available yet. Please refresh after
              adding lead data.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesForecasting;