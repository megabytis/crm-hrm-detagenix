import React, { useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService"; // Import CRM API services

/*
 * Updated by Pairing AI: CRM AI Chatbot Module
 * Integrates the Natural Language Gemini CRM Assistant with the backend router.
 * Added support for dynamic message log, typing indicators, tool-routing execution contexts,
 * session memory preservation, and detailed code documentation for your CTO.
 */
const CRMChatbot = () => {
  // Input message state
  const [message, setMessage] = useState("");

  // Chat conversation bubbles log state
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "CRM Assistant is ready. Ask me to fetch leads, add a lead, analyze conversations, enrich company data, or get stats."
    }
  ]);

  // Loading state for AI responses
  const [loading, setLoading] = useState(false);

  // Warning or error banner message
  const [error, setError] = useState(null);

  // Stores conversation filters and query context to support session history
  const [conversationMemory, setConversationMemory] = useState({});

  const quickPrompts = [
    "Show high probability leads from last 30 days",
    "Add a new lead named Priya Sharma with email priya@acme.com and role position Data Analyst",
    "Analyze this meeting note: Customer is blocked by integration timeline and budget approval pending",
    "Enrich company Acme Corp using website https://acme.com",
    "Get CRM stats",
  ];

  // Function to dispatch user message to the Gemini chatbot service
  const handleSendMessage = async (textToSend) => {
    const input = textToSend || message;
    if (!input.trim()) return;

    // Append user's bubble immediately
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);
    setError(null);

    try {
      // Calls POST /api/crm/chatbot/chat
      const response = await crmService.chatbot.chat(input, {
        conversation_memory: conversationMemory
      });

      if (response && response.success) {
        // The friendly formatted Gemini reply is stored in response.message or response.reply
        const botReply = response.message || response.reply || "Request processed successfully.";
        
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: botReply,
            tool: response.tool,
            data: response.data
          }
        ]);

        // Capture session filters returned by backend context
        if (response.data && response.data.conversation_memory) {
          setConversationMemory(response.data.conversation_memory);
        } else if (response.conversation_memory) {
          setConversationMemory(response.conversation_memory);
        }
      } else {
        throw new Error(response.message || "Failed to process request.");
      }
    } catch (err) {
      console.error("Chatbot send error:", err);
      // Output a user-friendly error bubble in the stream
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Apologies, I am currently unable to reach the CRM AI Router. Please check if backend services are running.",
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Resets local memory and session details
  const handleClearMemory = () => {
    setMessages([
      {
        sender: "bot",
        text: "CRM Assistant memory has been cleared. How can I assist you today?"
      }
    ]);
    setConversationMemory({});
    setError(null);
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
            {/* Chat Box with Dynamic History Mapping */}
            <div
              style={{
                height: "620px",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                padding: "16px",
                background: "#f3f4f6",
                marginBottom: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user" ? "#2563eb" : msg.isError ? "#fee2e2" : "#ffffff",
                    color: msg.sender === "user" ? "#ffffff" : msg.isError ? "#991b1b" : "#374151",
                    border: "1px solid " + (msg.sender === "user" ? "#2563eb" : msg.isError ? "#fecaca" : "#e5e7eb"),
                    padding: "14px 16px",
                    borderRadius: msg.sender === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                    maxWidth: "75%",
                    fontSize: "15px",
                    lineHeight: "24px",
                    whiteSpace: "pre-wrap",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 2px",
                    color: "#9ca3af",
                    fontSize: "14px",
                    fontStyle: "italic",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  Assistant is typing...
                </div>
              )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #2563eb";
                  e.target.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.08)";
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
                disabled={loading}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !message.trim()}
                onMouseEnter={(e) => {
                  if (!loading && message.trim()) {
                    e.target.style.background = "#1d4ed8";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && message.trim()) {
                    e.target.style.background = "#2563eb";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
                style={{
                  padding: "0 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading || !message.trim() ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "..." : "Send"}
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
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f3f4f6";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f9fafb";
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                >
                  {prompt}
                </button>
              ))}

              {/* Clear Memory Button */}
              <button
                onClick={handleClearMemory}
                onMouseEnter={(e) => {
                  e.target.style.background = "#d1d5db";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#e5e7eb";
                  e.target.style.transform = "translateY(0)";add
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