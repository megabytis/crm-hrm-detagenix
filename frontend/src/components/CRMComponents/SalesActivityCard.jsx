import {
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

const SalesActivityCard = ({
  title,
  value,
  change,
  changeType,
  icon,
}) => {

  // single CRM theme color
  const themeColor = "#38bdf8"; // light blue

  const getIcon = () => {
    switch (icon) {
      case "phone":
        return <HiOutlinePhone size={20} color={themeColor} />;

      case "email":
        return <HiOutlineEnvelope size={20} color={themeColor} />;

      case "whatsapp":
        return (
          <HiOutlineChatBubbleLeftRight
            size={20}
            color={themeColor}
          />
        );

      case "calendar":
        return <HiOutlineCalendarDays size={20} color={themeColor} />;

      default:
        return <HiOutlinePhone size={20} color={themeColor} />;
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "500",
            color: "#6b7280",
          }}
        >
          {title}
        </h3>

        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "#e0f2fe", // light blue bg
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getIcon()}
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: changeType === "positive" ? "#059669" : "#dc2626",
          fontWeight: "500",
        }}
      >
        {change}
      </p>
    </div>
  );
};

export default SalesActivityCard;