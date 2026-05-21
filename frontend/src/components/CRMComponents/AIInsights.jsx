import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const AIInsights = () => {
  const [conversation, setConversation] = useState("");

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };
  const [interactions, setInteractions] = useState([
  {
    sentDate: "",
    sentHour: "09",
    sentMinute: "00",
    sentPeriod: "AM",
    channel: "Email",
    replyDate: "",
    replyHour: "09",
    replyMinute: "00",
    replyPeriod: "AM",
  },
]);

const addRow = () => {
  setInteractions([
    ...interactions,
    {
      sentDate: "",
      sentHour: "09",
      sentMinute: "00",
      sentPeriod: "AM",
      channel: "Email",
      replyDate: "",
      replyHour: "09",
      replyMinute: "00",
      replyPeriod: "AM",
    },
  ]);
};

const removeRow = (index) => {
  const updated = interactions.filter((_, i) => i !== index);
  setInteractions(updated);
};

const handleChange = (index, field, value) => {
  const updated = [...interactions];
  updated[index][field] = value;
  setInteractions(updated);
};
  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
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
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "40px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          AI Insight & FollowUp AI
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Manage follow-up optimization and generate AI-powered conversation insights.
        </p>
      </div>
      {/* FOLLOW-UP AI SECTION */}
<div
  style={{
    marginBottom: "30px",
  }}
>
  {/* Heading */}
  <div style={{ marginBottom: "20px" }}>
    {/* <h2
      style={{
        margin: 0,
        fontSize: "32px",
        fontWeight: "700",
        color: "#111827",
      }}
    >
      FollowUp AI
    </h2> */}

    {/* <p
      style={{
        marginTop: "8px",
        color: "#6b7280",
      }}
    >
      Optimize best follow-up timing using interaction history.
    </p> */}
  </div>

  {/* Main Grid */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "25px",
      alignItems: "start",
    }}
  >
    {/* LEFT SIDE */}
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Interaction History
        </h3>

        <button
          onClick={addRow}
          style={{
            background: "#44a6e3",
            color: "#fff",
            border: "none",
            padding: "12px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Add Row
        </button>
      </div>

      {/* Select Lead */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div>
          <label style={labelStyle}>SELECT LEAD</label>

          <select style={inputStyle}>
            <option>Choose lead by name/email</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>LEAD ID</label>

          <input
            type="text"
            placeholder="e.g. LEAD_12345"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Interaction Rows */}
      {interactions.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            background: "#f9fafb",
          }}
        >
          <h4
            style={{
              marginTop: 0,
              marginBottom: "15px",
              color: "#111827",
            }}
          >
            Interaction #{index + 1}
          </h4>

          {/* Sent */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <input
              type="date"
              style={inputStyle}
              value={item.sentDate}
              onChange={(e) =>
                handleChange(index, "sentDate", e.target.value)
              }
            />

            <select style={inputStyle}>
              <option>09</option>
            </select>

            <select style={inputStyle}>
              <option>00</option>
            </select>

            <select style={inputStyle}>
              <option>AM</option>
              <option>PM</option>
            </select>

            <select
              style={inputStyle}
              value={item.channel}
              onChange={(e) =>
                handleChange(index, "channel", e.target.value)
              }
            >
              <option>Email</option>
              <option>Call</option>
              <option>WhatsApp</option>
            </select>
          </div>

          {/* Reply */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: "12px",
            }}
          >
            <input
              type="date"
              style={inputStyle}
              value={item.replyDate}
              onChange={(e) =>
                handleChange(index, "replyDate", e.target.value)
              }
            />

            <select style={inputStyle}>
              <option>09</option>
            </select>

            <select style={inputStyle}>
              <option>00</option>
            </select>

            <select style={inputStyle}>
              <option>AM</option>
              <option>PM</option>
            </select>

            <button
              onClick={() => removeRow(index)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        style={{
          width: "100%",
          background: "#44a6e3",
          color: "#fff",
          border: "none",
          padding: "15px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Optimize Follow-up
      </button>
    </div>

    {/* RIGHT SIDE */}
    {/* <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        height: "fit-content",
      }}
    >
      <h3
        style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#111827",
        }}
      >
        Optimization Result
      </h3>

      
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "15px",
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
          }}
        >
          BEST DAY
        </p>

        <h3 style={{ margin: 0, color: "#111827" }}>
          Tuesday
        </h3>
      </div>

      
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "15px",
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
          }}
        >
          BEST TIME
        </p>

        <h3 style={{ margin: 0, color: "#111827" }}>
          10:30 AM
        </h3>
      </div>

     
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "15px",
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
          }}
        >
          BEST CHANNEL
        </p>

        <h3 style={{ margin: 0, color: "#111827" }}>
          WhatsApp
        </h3>
      </div>

      
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "14px",
          padding: "18px",
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#2563eb",
          }}
        >
          MODEL CONFIDENCE
        </p>

        <h2 style={{ margin: 0, color: "#2563eb" }}>
          92%
        </h2>
      </div>
    </div> */}
     <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              height: "450px",
            }}
          >
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              Optimization Result
            </h3>

            <div
              style={{
                background: "#f8f9fc",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            >
              <p style={{ color: "#666" }}>
                Submit interaction history to view best day, best time, best
                channel and model confidence.
              </p>
            </div>
          </div>
  </div>
</div>
      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "25px",
        }}
      >
        {/* Left Section */}
        <div style={cardStyle}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "25px",
              color: "#111827",
            }}
          >
            Input
          </h2>

          {/* Source Type */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              SOURCE TYPE
            </label>

            <select style={inputStyle}>
              <option>Call Transcript</option>
              <option>WhatsApp Chat</option>
              <option>Meeting Notes</option>
            </select>
          </div>

          {/* Upload */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              UPLOAD FILE (OPTIONAL)
            </label>

            <input type="file" style={inputStyle} />

            <p
              style={{
                marginTop: "10px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Audio files and transcripts are supported.
            </p>
          </div>

          {/* Conversation Text */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              CONVERSATION TEXT (OPTIONAL)
            </label>

            <textarea
              rows="12"
              placeholder="Paste the client conversation transcript here..."
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              style={{
                ...inputStyle,
                resize: "none",
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <button
              style={{
                padding: "14px 24px",
                borderRadius: "12px",
                border: "none",
                background: "#10b981",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Generate Insights
            </button>

            <button
              onClick={() => setConversation("")}
              style={{
                padding: "14px 24px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div style={cardStyle}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "25px",
              color: "#111827",
            }}
          >
            Insights Summary
          </h2>

          {/* Pain Points */}
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "18px",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              CLIENT PAIN POINTS
            </p>

            <p
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              No explicit pain points identified.
            </p>
          </div>

          {/* Budget + Urgency */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                BUDGET PROBABILITY
              </p>

              <span
                style={{
                  background: "#e5e7eb",
                  padding: "8px 14px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Unknown
              </span>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                URGENCY LEVEL
              </p>

              <span
                style={{
                  background: "#e5e7eb",
                  padding: "8px 14px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Unknown
              </span>
            </div>
          </div>

          {/* Suggested Action */}
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "18px",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              SUGGESTED NEXT ACTION
            </p>

            <p
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Follow up to clarify requirements
            </p>
          </div>

          {/* Follow Up Timeline */}
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              FOLLOW-UP TIMELINE
            </p>

            <p
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Not available
            </p>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#374151",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#f9fafb",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

export default AIInsights;