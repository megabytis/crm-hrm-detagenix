import { useState } from "react";
import {
  FaChartLine,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaDollarSign,
  FaUser,
} from "react-icons/fa";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const SalesPipeline = () => {
  const [deals] = useState([
    {
      id: 1,
      name: "Enterprise Deal",
      customer: "Tech Corp",
      value: "$250,000",
      stage: "Qualification",
      probability: "25%",
      expectedClose: "2025-03-15",
      owner: "Sarah Johnson",
      created: "2025-02-01",
    },
    {
      id: 2,
      name: "SaaS Contract",
      customer: "Marketing Inc",
      value: "$120,000",
      stage: "Proposal",
      probability: "60%",
      expectedClose: "2025-02-28",
      owner: "Mike Wilson",
      created: "2025-01-15",
    },
    {
      id: 3,
      name: "Hardware Sale",
      customer: "Sales Pro",
      value: "$85,000",
      stage: "Negotiation",
      probability: "80%",
      expectedClose: "2025-02-20",
      owner: "Emily Davis",
      created: "2025-01-20",
    },
    {
      id: 4,
      name: "Consulting Project",
      customer: "Consulting Ltd",
      value: "$150,000",
      stage: "Closed Won",
      probability: "100%",
      expectedClose: "2025-02-10",
      owner: "Chris Lee",
      created: "2025-01-10",
    },
    {
      id: 5,
      name: "Software License",
      customer: "Global Tech",
      value: "$75,000",
      stage: "Prospecting",
      probability: "10%",
      expectedClose: "2025-04-01",
      owner: "Lisa Anderson",
      created: "2025-02-05",
    },
    {
      id: 6,
      name: "Service Contract",
      customer: "Service Co",
      value: "$200,000",
      stage: "Closed Lost",
      probability: "0%",
      expectedClose: "2025-02-08",
      owner: "Tom Brown",
      created: "2025-01-25",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = !stageFilter || deal.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage) => {
    switch (stage) {
      case "Prospecting":
        return "#6b7280";
      case "Qualification":
        return "#3b82f6";
      case "Proposal":
        return "#f59e0b";
      case "Negotiation":
        return "#8b5cf6";
      case "Closed Won":
        return "#10b981";
      case "Closed Lost":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getProbabilityColor = (probability) => {
    const prob = parseInt(probability);
    if (prob >= 80) return "#10b981";
    if (prob >= 60) return "#f59e0b";
    if (prob >= 40) return "#3b82f6";
    if (prob >= 20) return "#8b5cf6";
    return "#ef4444";
  };

  const totalValue = filteredDeals.reduce((sum, deal) => {
    if (deal.stage === "Closed Won") {
      return sum + parseInt(deal.value.replace(/[$,]/g, ""));
    }
    return sum;
  }, 0);

  const projectedValue = filteredDeals.reduce((sum, deal) => {
    if (deal.stage !== "Closed Lost") {
      const prob = parseInt(deal.probability) / 100;
      return sum + parseInt(deal.value.replace(/[$,]/g, "")) * prob;
    }
    return sum;
  }, 0);

  return (
    <DashboardLayout>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }
        
        .layout {
          display: flex;
          height: 100vh;
        }

        .sidebar {
          width: 270px;
          background: #000000;
          color: white;
          padding: 20px;
        }

        .main {
          flex: 1;
          background: #f1f5f9;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .content {
          padding: 20px;
          overflow-y: auto;
        }
      `}</style>
      <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
        CRM / Leads Management
      </h2>
    </DashboardLayout>
  );
};

export default SalesPipeline;
