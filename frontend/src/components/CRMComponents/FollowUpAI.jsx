import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const FollowUpAI = () => {
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
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#111",
            }}
          >
            Follow-up Optimization AI
          </h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Submit historical interactions and get the best day, time and
            channel to follow up.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "25px",
          }}
        >
          {/* Left Form */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Select Lead */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>SELECT LEAD</label>
              <select style={inputStyle}>
                <option>Choose lead by name/email</option>
              </select>
            </div>

            {/* Lead ID */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>LEAD ID</label>
              <input
                type="text"
                placeholder="e.g. LEAD_12345"
                style={inputStyle}
              />
            </div>

            {/* Interaction History */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "20px" }}>Interaction History</h3>

              <button
                onClick={addRow}
                style={{
                  background: "#1da1f2",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                + Add Row
              </button>
            </div>

            {interactions.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                {/* Sent Section */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr",
                    gap: "10px",
                    marginBottom: "20px",
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

                {/* Reply Section */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                    gap: "10px",
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
                      background: "#ff4d4f",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <button
              style={{
                width: "100%",
                background: "#1da1f2",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Optimize Follow-up
            </button>
          </div>

          {/* Right Result Panel */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              height: "fit-content",
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
    </DashboardLayout>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
};

export default FollowUpAI;