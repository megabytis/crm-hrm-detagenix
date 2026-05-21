import React from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import {
  RefreshCcw,
  Database,
  Activity,
  Target,
  Gauge,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MlStats = () => {
    const histogramData = [
  { name: "Hot", value: 12 },
  { name: "Warm", value: 18 },
  { name: "Cold", value: 8 },
];

const pieData = [
  { name: "Hot", value: 35, color: "#ef4444" },
  { name: "Warm", value: 45, color: "#f59e0b" },
  { name: "Cold", value: 20, color: "#06b6d4" },
];
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  };

  const statCard = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: "0.5px",
  };

  const valueStyle = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#111827",
    marginTop: "10px",
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "30px",
          background: "#f4f7fb",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#e0f2fe",
                color: "#0284c7",
                padding: "8px 14px",
                borderRadius: "30px",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "15px",
              }}
            >
              <Activity size={15} />
              ML Intelligence Center
            </div>

            <h1
              style={{
                fontSize: "42px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "10px",
              }}
            >
              Model Performance Dashboard
            </h1>

            <p
              style={{
                color: "#6b7280",
                fontSize: "16px",
                maxWidth: "700px",
                lineHeight: "28px",
              }}
            >
              Live analytics from MongoDB with lead temperature distribution,
              prediction coverage, and model quality signals.
            </p>
          </div>

          <button
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={statCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={labelStyle}>TOTAL LEADS</span>
              <Database size={18} color="#3b82f6" />
            </div>

            <h2 style={valueStyle}>0</h2>
          </div>

          <div style={statCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={labelStyle}>PREDICTIONS</span>
              <Activity size={18} color="#10b981" />
            </div>

            <h2 style={valueStyle}>0</h2>
          </div>

          <div style={statCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={labelStyle}>COVERAGE</span>
              <Target size={18} color="#8b5cf6" />
            </div>

            <h2 style={valueStyle}>0.0%</h2>
          </div>

          <div style={statCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={labelStyle}>MODEL ACCURACY</span>
              <Gauge size={18} color="#f59e0b" />
            </div>

            <h2 style={valueStyle}>N/A</h2>
          </div>
        </div>

        {/* CHARTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "22px",
            marginBottom: "25px",
          }}
        >
          {/* Histogram */}
          <div style={{ ...cardStyle, height: "360px" }}>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Temperature Histogram
            </h3>

         <div
  style={{
    width: "100%",
    height: "260px",
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={histogramData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />

      <Bar
        dataKey="value"
        radius={[10, 10, 0, 0]}
        fill="#3b82f6"
      />
    </BarChart>
  </ResponsiveContainer>
</div>
          </div>

          {/* Pie Chart */}
          <div style={{ ...cardStyle, height: "360px" }}>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Lead Mix Composition
            </h3>

          <div
  style={{
    width: "100%",
    height: "250px",
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={85}
        innerRadius={45}
        paddingAngle={3}
      >
        {pieData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.color}
          />
        ))}
      </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <span style={{ color: "#ef4444", fontWeight: "600" }}>
                ● Hot
              </span>

              <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                ● Warm
              </span>

              <span style={{ color: "#06b6d4", fontWeight: "600" }}>
                ● Cold
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "22px",
          }}
        >
          {/* Prediction Health */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Prediction Health
            </h3>

            <div
              style={{
                background: "#f9fafb",
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ color: "#374151", fontWeight: "600" }}>
                  Coverage
                </span>

                <span style={{ color: "#0284c7", fontWeight: "700" }}>
                  0.0%
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "10px",
                  borderRadius: "20px",
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "0%",
                    height: "100%",
                    background: "#0ea5e9",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: "#f9fafb",
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Dominant Segment
              </h4>

              <div
                style={{
                  display: "inline-block",
                  background: "#e5e7eb",
                  padding: "8px 14px",
                  borderRadius: "30px",
                  color: "#374151",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                N/A (0 leads)
              </div>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Avg confidence in this segment: 0.0%
              </p>
            </div>
          </div>

          {/* Model Intelligence */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Model Intelligence
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {[
                { title: "MODEL TYPE", value: "N/A" },
                { title: "FEATURES", value: "N/A" },
                { title: "ACCURACY", value: "N/A" },
                { title: "TRAINING DATE", value: "N/A" },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "18px",
                    background: "#f9fafb",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "12px",
                      marginBottom: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {item.title}
                  </p>

                  <h4
                    style={{
                      color: "#111827",
                      fontWeight: "700",
                    }}
                  >
                    {item.value}
                  </h4>
                </div>
              ))}
            </div>

            <div
              style={{
                border: "1px solid #dbeafe",
                background: "#f0f9ff",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <h4
                style={{
                  color: "#0284c7",
                  marginBottom: "18px",
                  fontWeight: "700",
                }}
              >
                INFERENCE PIPELINE
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                {[
                  {
                    title: "BASE MODEL",
                    value: "Random Forest",
                  },
                  {
                    title: "PROBABILITY CALIBRATION",
                    value: "ENABLED (DEFAULT)",
                  },
                  {
                    title: "HYBRID RULE ENGINE",
                    value: "ENABLED (DEFAULT)",
                  },
                  {
                    title: "UNCERTAINTY DETECTION",
                    value: "ENABLED (70% threshold)",
                  },
                  {
                    title: "LLM FALLBACK",
                    value: "DISABLED (OPTIONAL)",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #dbeafe",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      {item.title}
                    </p>

                    <h5
                      style={{
                        fontSize: "15px",
                        color: "#111827",
                        fontWeight: "700",
                      }}
                    >
                      {item.value}
                    </h5>
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginTop: "18px",
                  color: "#6b7280",
                  fontSize: "13px",
                  lineHeight: "24px",
                }}
              >
                Production scoring uses Random Forest classification with
                post-processing calibration and rule-based refinement.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Last updated from MongoDB stats pipeline:
              2026-05-12T15:28:20.645287
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MlStats;