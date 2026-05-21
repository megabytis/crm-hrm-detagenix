import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const CRMChatbot = () => {
  const [message, setMessage] = useState("");

  const quickPrompts = [
    "Show high probability leads from last 30 days",
    "Add a new lead named Priya Sharma with email priya@acme.com and role position Data Analyst",
    "Analyze this meeting note: Customer is blocked by integration timeline and budget approval pending",
    "Enrich company Acme Corp using website https://acme.com",
    "Get CRM stats",
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
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "40px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            CRM AI Chatbot
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Natural language assistant powered by Gemini tool routing.
          </p>
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr",
            gap: "25px",
          }}
        >
          {/* Chat Section */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Chat Box */}
            <div
              style={{
                height: "620px",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                padding: "16px",
                background: "#e6eaef",
                marginBottom: "20px",
                overflowY: "auto",
              }}
            >
              {/* Bot Message */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  color: "#374151",
                  maxWidth: "85%",
                  fontSize: "15px",
                  lineHeight: "24px",
                }}
              >
                CRM Assistant is ready. Ask me to fetch leads, add a lead,
                analyze conversations, enrich company data, or get stats.
              </div>
            </div>

            {/* Input Section */}
           <div
  style={{
    display: "flex",
    gap: "12px",
  }}
>
  <input
    type="text"
    placeholder="Ask something like: Show high probability leads from last 30 days"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onFocus={(e) => {
      e.target.style.border = "1px solid #111827";
      e.target.style.boxShadow = "0 0 0 2px rgba(17,24,39,0.08)";
    }}
    onBlur={(e) => {
      e.target.style.border = "1px solid #d1d5db";
      e.target.style.boxShadow = "none";
    }}
    style={{
      flex: 1,
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#111827",
      outline: "none",
      fontSize: "15px",
      transition: "all 0.2s ease",
    }}
  />

  <button
  onMouseEnter={(e) => {
    e.target.style.background = "#059669";
    e.target.style.transform = "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "#10b981";
    e.target.style.transform = "translateY(0)";
  }}
  style={{
    padding: "0 24px",
    borderRadius: "12px",
    border: "none",
    background: "#10b981",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.2s ease",
  }}
>
  Send
</button>
</div>
          </div>

          {/* Quick Prompt Sidebar */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              height: "fit-content",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#111827",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              Quick Prompts
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(prompt)}
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px",
                    color: "#374151",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    lineHeight: "22px",
                  }}
                >
                  {prompt}
                </button>
              ))}

              {/* Clear Button */}
              <button
  onMouseEnter={(e) => {
    e.target.style.background = "#d1d5db";
    e.target.style.transform = "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "#e5e7eb";
    e.target.style.transform = "translateY(0)";
  }}
  style={{
    marginTop: "10px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    color: "#111827",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  }}
>
  Clear Chat Memory
</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRMChatbot;