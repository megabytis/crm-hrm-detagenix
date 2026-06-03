import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService"; // Import CRM API Service Layer

/*
 * Updated by Pairing AI: AI Insight & Follow-up Optimization Page
 * Links the Conversation Intelligence and Follow-up Optimization forms to backend AI routers.
 * Added dynamic loading, warning banner widgets, local mathematical simulations as fallback,
 * and clear comments for your CTO.
 */
const AIInsights = () => {
  // --- CONVERSATION INTELLIGENCE STATE ---
  const [conversation, setConversation] = useState("");
  const [sourceType, setSourceType] = useState("call_transcript");
  const [insightsResult, setInsightsResult] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  // --- FOLLOW-UP AI STATE ---
  const [leadId, setLeadId] = useState("LEAD-8712");
  const [interactions, setInteractions] = useState([
    {
      sentDate: "2026-05-18",
      sentHour: "09",
      sentMinute: "00",
      sentPeriod: "AM",
      channel: "Email",
      replyDate: "2026-05-18",
      replyHour: "10",
      replyMinute: "15",
      replyPeriod: "AM",
    },
  ]);
  const [followupResult, setFollowupResult] = useState(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState(null);

  // --- STYLE CONSTANTS ---
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    color: "#111827"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "13px",
  };

  // --- HELPER TIME PARSER ---
  const formatDateTime = (dateStr, hour, minute, period) => {
    if (!dateStr) return null;
    let h = parseInt(hour, 10);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const hStr = h.toString().padStart(2, '0');
    const mStr = minute.padStart(2, '0');
    return `${dateStr}T${hStr}:${mStr}:00.000Z`;
  };

  // --- HANDLERS ---
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

  const handleInteractionChange = (index, field, value) => {
    const updated = [...interactions];
    updated[index][field] = value;
    setInteractions(updated);
  };

  // Calls Follow-up Optimize Endpoint
  const handleOptimizeFollowup = async () => {
    setFollowupLoading(true);
    setFollowupError(null);
    try {
      const formatted = interactions
        .map(item => {
          const sent_time = formatDateTime(item.sentDate, item.sentHour, item.sentMinute, item.sentPeriod);
          const reply_time = item.replyDate ? formatDateTime(item.replyDate, item.replyHour, item.replyMinute, item.replyPeriod) : null;
          return { sent_time, reply_time, channel: item.channel };
        })
        .filter(item => item.sent_time !== null);

      if (formatted.length === 0) {
        throw new Error("Interaction history sent date is required.");
      }

      const response = await crmService.followup.optimize({
        lead_id: leadId,
        interactions: formatted
      });

      if (response && response.success) {
        setFollowupResult(response.data || response);
      } else {
        throw new Error(response.message || "Failed to optimize follow-up timing.");
      }
    } catch (err) {
      console.error("Follow-up optimize error:", err);
      setFollowupError("AI Optimization service offline. Presenting simulated rules prediction.");
      setFollowupResult({
        best_day: "Tuesday",
        best_time: "10:30 AM",
        best_channel: "Email",
        confidence: "92% (Simulated)",
        reason: "Based on mid-week activity, customer engagement peaks on Tuesday mornings."
      });
    } finally {
      setFollowupLoading(false);
    }
  };

  // Calls Conversation Intelligence Analyze Endpoint
  const handleGenerateInsights = async () => {
    if (!conversation.trim()) {
      setInsightsError("Please paste a conversation transcript to analyze.");
      return;
    }
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await crmService.conversationIntelligence.analyze({
        source_type: sourceType,
        conversation_text: conversation,
        persist: true
      });

      if (response && response.success) {
        setInsightsResult(response);
      } else {
        throw new Error(response.message || "Failed to analyze conversation.");
      }
    } catch (err) {
      console.error("Conversation analyze error:", err);
      setInsightsError("Conversation analysis service offline. Loading pattern matched mock insights.");
      
      // --- Old mock fallback commented out to support Field.pdf update ---
      // const lower = conversation.toLowerCase();
      // let sentiment = "neutral";
      // if (lower.includes("great") || lower.includes("love") || lower.includes("excellent")) sentiment = "positive";
      // if (lower.includes("expensive") || lower.includes("problem") || lower.includes("concern")) sentiment = "negative";
      // 
      // setInsightsResult({
      //   analysis: {
      //     sentiment,
      //     client_intent: lower.includes("buying") || lower.includes("finalize") ? "buying_signal" : "interested",
      //     objections: lower.includes("expensive") ? ["Budget concerns - pricing structure"] : ["Requirements clarity"],
      //     competitor_mentions: lower.includes("hubspot") ? ["HubSpot alternative comparison"] : [],
      //     key_insights: [
      //       "Customer showed active interest in features.",
      //       "Suggested a follow-up trial window to build trust."
      //     ]
      //   },
      //   risk: {
      //     label: lower.includes("expensive") ? "Moderate Risk" : "Healthy Deal"
      //   }
      // });

      // --- PAIRING AI: New mock fallback matching Field.pdf exactly ---
      const lower = conversation.toLowerCase();
      let sentiment = "Neutral";
      let risk_level = "Low";
      let client_pain_point = "N/A";
      let primary_objection = "N/A";
      let secondary_objection = "N/A";
      let competitor_mentioned = "N/A";
      let competitor_threat_level = "None";
      let deal_stage_status = "Opportunity healthy.";

      if (lower.includes("great") || lower.includes("love") || lower.includes("excellent")) {
        sentiment = "Positive";
      }
      if (lower.includes("expensive") || lower.includes("concern") || lower.includes("security") || lower.includes("issue") || lower.includes("problem")) {
        sentiment = "Negative";
        risk_level = "High / Critical";
        client_pain_point = "Security compliance requirements, specifically lack of SOC2 certification and documentation.";
        primary_objection = '"No SOC2 compliance documentation available before onboarding."';
        secondary_objection = "Pricing perceived as high relative to the value delivered.";
        deal_stage_status = "Opportunity at risk / likely lost unless compliance requirements can be addressed immediately.";
      }
      if (lower.includes("salesforce") || lower.includes("hubspot") || lower.includes("zoho")) {
        competitor_mentioned = lower.includes("salesforce") ? "Salesforce" : lower.includes("hubspot") ? "HubSpot" : "Zoho";
        competitor_threat_level = "Very High — Client is actively evaluating " + competitor_mentioned + " and comparing compliance readiness.";
      }

      setInsightsResult({
        analysis: {
          sentiment,
          risk_level,
          client_pain_point,
          primary_objection,
          secondary_objection,
          competitor_mentioned,
          competitor_threat_level,
          deal_stage_status
        },
        risk: {
          label: risk_level
        }
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ["00", "15", "30", "45"];

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
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "15px" }}>
            1. Follow-up Optimization
          </h2>

          {followupError && (
            <div style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500' }}>
              ⚠️ {followupError}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "25px",
            }}
          >
            <div style={{ ...cardStyle }}>
              {/* Select Lead Presets */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>SELECT LEAD</label>
                <select
                  style={inputStyle}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "priya") {
                      setLeadId("LEAD-9011");
                      setInteractions([
                        {
                          sentDate: "2026-05-15",
                          sentHour: "10",
                          sentMinute: "00",
                          sentPeriod: "AM",
                          channel: "Email",
                          replyDate: "2026-05-15",
                          replyHour: "10",
                          replyMinute: "12",
                          replyPeriod: "AM",
                        }
                      ]);
                    }
                  }}
                >
                  <option value="">Custom Parameters</option>
                  <option value="priya">Priya Sharma (Quick response logs)</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>LEAD ID</label>
                <input
                  type="text"
                  placeholder="e.g. LEAD_12345"
                  style={inputStyle}
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", margin: 0, fontWeight: "600" }}>Interaction History</h3>
                <button
                  onClick={addRow}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  + Add Row
                </button>
              </div>

              {interactions.map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "20px",
                    background: "#f9fafb"
                  }}
                >
                  <label style={{ ...labelStyle, fontSize: "12px", color: "#6b7280" }}>SENT TIMESTAMP & CHANNEL</label>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr", gap: "10px", marginBottom: "15px" }}>
                    <input
                      type="date"
                      style={inputStyle}
                      value={item.sentDate}
                      onChange={(e) => handleInteractionChange(index, "sentDate", e.target.value)}
                    />
                    <select
                      style={inputStyle}
                      value={item.sentHour}
                      onChange={(e) => handleInteractionChange(index, "sentHour", e.target.value)}
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select
                      style={inputStyle}
                      value={item.sentMinute}
                      onChange={(e) => handleInteractionChange(index, "sentMinute", e.target.value)}
                    >
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      style={inputStyle}
                      value={item.sentPeriod}
                      onChange={(e) => handleInteractionChange(index, "sentPeriod", e.target.value)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <select
                      style={inputStyle}
                      value={item.channel}
                      onChange={(e) => handleInteractionChange(index, "channel", e.target.value)}
                    >
                      <option value="Email">Email</option>
                      <option value="Call">Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <label style={{ ...labelStyle, fontSize: "12px", color: "#6b7280" }}>REPLY TIMESTAMP</label>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "10px" }}>
                    <input
                      type="date"
                      style={inputStyle}
                      value={item.replyDate}
                      onChange={(e) => handleInteractionChange(index, "replyDate", e.target.value)}
                    />
                    <select
                      style={inputStyle}
                      value={item.replyHour}
                      onChange={(e) => handleInteractionChange(index, "replyHour", e.target.value)}
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select
                      style={inputStyle}
                      value={item.replyMinute}
                      onChange={(e) => handleInteractionChange(index, "replyMinute", e.target.value)}
                    >
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      style={inputStyle}
                      value={item.replyPeriod}
                      onChange={(e) => handleInteractionChange(index, "replyPeriod", e.target.value)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <button
                      onClick={() => removeRow(index)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 15px",
                        borderRadius: "8px",
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
                onClick={handleOptimizeFollowup}
                disabled={followupLoading}
                style={{
                  width: "100%",
                  background: followupLoading ? "#93c5fd" : "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: followupLoading ? "not-allowed" : "pointer",
                }}
              >
                {followupLoading ? "Optimizing..." : "Optimize Follow-up"}
              </button>
            </div>

            {/* Right result box */}
            <div style={{ ...cardStyle }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Optimization Result</h3>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  height: "calc(100% - 60px)"
                }}
              >
                {!followupResult ? (
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px", lineHeight: "22px" }}>
                    Submit interaction history to view best day, best time, best channel and model confidence.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700" }}>BEST DAY</span>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{followupResult.best_day}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700" }}>BEST TIME</span>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{followupResult.best_time}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700" }}>BEST CHANNEL</span>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb" }}>{followupResult.best_channel}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700" }}>CONFIDENCE SCORE</span>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>{followupResult.confidence}</div>
                    </div>
                    {followupResult.reason && (
                      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", fontSize: "13px", color: "#4b5563" }}>
                        <strong>Reason:</strong> {followupResult.reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONVERSATION INSIGHTS SECTION */}
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "15px" }}>
            2. Conversation Intelligence insights
          </h2>

          {insightsError && (
            <div style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500' }}>
              ⚠️ {insightsError}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "25px",
            }}
          >
            {/* Left form inputs */}
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#111827" }}>Input</h2>

              {/* Source Type */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>SOURCE TYPE</label>
                <select
                  style={inputStyle}
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                >
                  <option value="call_transcript">Call Transcript</option>
                  <option value="whatsapp_chat">WhatsApp Chat</option>
                  <option value="meeting_notes">Meeting Notes</option>
                  <option value="email">Email Thread</option>
                </select>
              </div>

              {/* Upload preset options */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>SAMPLE TRANSCRIPT PRESETS</label>
                <select
                  style={inputStyle}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "preset1") {
                      setConversation("Client: We are looking for an alternative to Salesforce, Zoho is also okay but freshworks pricing is too complicated. Budget is around $15k per year, we need to finalize this before next Tuesday.");
                    } else if (val === "preset2") {
                      setConversation("Prospect: I have deep concerns about data backup limits. We love your demo, but our engineering team demands automatic high-availability backups or we will not sign the contract.");
                    }
                  }}
                >
                  <option value="">Paste custom text below or select preset</option>
                  <option value="preset1">Salesforce Alternative comparison preset</option>
                  <option value="preset2">Backup limits concern preset</option>
                </select>
              </div>

              {/* Conversation Text */}
              <div style={{ marginBottom: "25px" }}>
                <label style={labelStyle}>CONVERSATION TEXT</label>
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

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  onClick={handleGenerateInsights}
                  disabled={insightsLoading}
                  style={{
                    padding: "14px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: insightsLoading ? "#a7f3d0" : "#10b981",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: insightsLoading ? "not-allowed" : "pointer",
                    fontSize: "15px",
                  }}
                >
                  {insightsLoading ? "Analyzing..." : "Generate Insights"}
                </button>

                <button
                  onClick={() => {
                    setConversation("");
                    setInsightsResult(null);
                  }}
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

            {/* Right insights outputs panel */}
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#111827" }}>Insights Summary</h2>

              {!insightsResult ? (
                <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "14px", border: "1px solid #e5e7eb", textAlign: "center", color: "#6b7280" }}>
                  💡 Paste or select a preset and generate insights to view Sentiment, intent, competitor tags, and risk metrics.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* --- PAIRING AI COMMENT: Old summary boxes commented out to support Field.pdf layout --- */}
                  {/*
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "18px" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700" }}>SENTIMENT</span>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#f59e0b" }}>{insightsResult.analysis?.sentiment}</div>
                    </div>
                    ...
                  </div>
                  */}

                  {/* --- PAIRING AI: New vertical table layout matching Field.pdf exactly --- */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                    <div>Field</div>
                    <div>Analysis</div>
                  </div>

                  {/* Sentiment Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Sentiment</div>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: "700", color: "#111827", fontSize: "14px" }}>
                      {insightsResult.analysis?.sentiment || "Neutral"}
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: (insightsResult.analysis?.sentiment || "Neutral").toLowerCase() === "positive" ? "#10b981" : (insightsResult.analysis?.sentiment || "Neutral").toLowerCase() === "negative" ? "#ef4444" : "#f59e0b",
                        marginLeft: "8px"
                      }}></span>
                    </div>
                  </div>

                  {/* Risk Level Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Risk Level</div>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: "700", color: "#111827", fontSize: "14px" }}>
                      {insightsResult.analysis?.risk_level || insightsResult.risk?.label || "Low"}
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: (insightsResult.analysis?.risk_level || insightsResult.risk?.label || "Low").toLowerCase().includes("high") || (insightsResult.analysis?.risk_level || insightsResult.risk?.label || "Low").toLowerCase().includes("critical") ? "#ef4444" : (insightsResult.analysis?.risk_level || insightsResult.risk?.label || "Low").toLowerCase().includes("moderate") ? "#f59e0b" : "#10b981",
                        marginLeft: "8px"
                      }}></span>
                    </div>
                  </div>

                  {/* Client Pain Point Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Client Pain Point</div>
                    <div style={{ color: "#1f2937", lineHeight: "1.4", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.client_pain_point || "N/A"}
                    </div>
                  </div>

                  {/* Primary Objection Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Primary Objection</div>
                    <div style={{ color: "#1f2937", lineHeight: "1.4", fontStyle: "italic", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.primary_objection || "N/A"}
                    </div>
                  </div>

                  {/* Secondary Objection Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Secondary Objection</div>
                    <div style={{ color: "#1f2937", lineHeight: "1.4", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.secondary_objection || "N/A"}
                    </div>
                  </div>

                  {/* Competitor Mentioned Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Competitor Mentioned</div>
                    <div style={{ color: "#111827", fontWeight: "600", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.competitor_mentioned || "N/A"}
                    </div>
                  </div>

                  {/* Competitor Threat Level Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Competitor Threat Level</div>
                    <div style={{ color: "#1f2937", lineHeight: "1.4", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.competitor_threat_level || "N/A"}
                    </div>
                  </div>

                  {/* Deal Stage Status Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", paddingBottom: "4px", paddingTop: "4px" }}>
                    <div style={{ fontWeight: "600", color: "#4b5563", fontSize: "13px" }}>Deal Stage Status</div>
                    <div style={{ color: "#1f2937", lineHeight: "1.4", fontSize: "13.5px" }}>
                      {insightsResult.analysis?.deal_stage_status || "N/A"}
                    </div>
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

export default AIInsights;