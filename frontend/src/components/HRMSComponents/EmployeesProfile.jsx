import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { userService } from "../../services/userService";
import profileImg from "../../assets/profileimg.png";
import { FaEdit } from "react-icons/fa";
import {  FaTrash } from "react-icons/fa";
const EmployeeProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const id = user?.id;
  const navigate = useNavigate();

  // State management
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editSection, setEditSection] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showDocumentModal, setShowDocumentModal] = useState(false);

const [documentData, setDocumentData] = useState({
  documentType: "",
  file: null,
});

const [uploadedDocuments, setUploadedDocuments] = useState([]);
 
 const { basicInfo, attendanceSummary, payrollInfo } = profileData || {};
useEffect(() => {
  if (basicInfo?.documents) {
    setUploadedDocuments(basicInfo.documents);
  }
}, [basicInfo]);
  // Fetch employee profile on component mount
  useEffect(() => {
    fetchEmployeeProfile();
  }, [id]);


  const handleFileChange = (e) => {
  setDocumentData({
    ...documentData,
    file: e.target.files[0],
  });
};
const handleDocumentUpload = async () => {
  console.log("Selected file:", documentData.file);
  console.log("Document type:", documentData.documentType);

  if (!documentData.documentType || !documentData.file) {
    return alert("Please select document type and file");
  }

  const formPayload = new FormData();
  formPayload.append("documentType", documentData.documentType);
  formPayload.append("file", documentData.file);

  // check formdata values
  for (let pair of formPayload.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const res = await userService.uploadDocument(id, formPayload);

    if (res.success) {
      alert("Document uploaded successfully");
      setUploadedDocuments(res.documents);

      setDocumentData({
        documentType: "",
        file: null,
      });

      setShowDocumentModal(false);
    }
  } catch (error) {
    console.log("Upload error:", error);
    alert("Upload failed");
  }
};
const handleDeleteDocument = async (index) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this document?"
  );

  if (!confirmDelete) return;

  try {
    const updatedDocs = uploadedDocuments.filter(
      (_, i) => i !== index
    );

    setUploadedDocuments(updatedDocs);

    // backend API later laga sakti ho if file bhi server se remove karni ho
    alert("Document deleted successfully");
  } catch (error) {
    console.log(error);
    alert("Failed to delete document");
  }
};

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getProfile(id);

      if (response.success) {
        setProfileData(response.profile);
      } else {
        setError(response.message || "Failed to fetch employee profile");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      setError("Failed to fetch employee profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEditSubmit = async () => {
    try {
      setLoading(true);

      console.log("Sending Data:", formData);

      const res = await userService.updateProfile(id, formData);

      console.log("Response:", res);
if (res.success) {
  await fetchEmployeeProfile();   // latest data fetch karega
  setEditSection(null);
  alert("Profile updated successfully!");
} else {
        alert(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateProfile = async (updatedData) => {
  //   try {
  //     setLoading(true);
  //     const response = await userService.updateProfile(id, updatedData);

  //     if (res.success) {
  //       setProfileData({
  //         ...profileData,
  //         basicInfo: res.profile || res.data,
  //       });
  //       setShowEditModal(false);
  //     } else {
  //       alert(response.message || "Failed to update profile");
  //     }
  //   } catch (error) {
  //     console.error("Update profile error:", error);
  //     alert("Failed to update profile. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDeleteEmployee = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this employee? This action cannot be undone.",
      )
    ) {
      try {
        const response = await userService.delete(id);

        if (response.success) {
          alert("Employee deleted successfully!");
          navigate("/hrm/employees"); // Redirect to employees list
        } else {
          alert(response.message || "Failed to delete employee");
        }
      } catch (error) {
        console.error("Delete employee error:", error);
        alert("Failed to delete employee. Please try again.");
      }
    }
  };
  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      return alert("Please fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      console.log("Sending password:", newPassword);

      const response = await userService.resetPassword(id, { newPassword });

      console.log("API RESPONSE:", response); // 👈 IMPORTANT

      if (response && response.success) {
        alert("Password updated successfully!");
        setShowResetModal(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        alert(response?.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Something went wrong");
    }
  };
  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div
          style={{ padding: "20px", background: "#f4f6f9", minHeight: "100vh" }}
        >
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #00bcd4",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ marginTop: "10px", color: "#666" }}>
              Loading employee profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div
          style={{ padding: "20px", background: "#f4f6f9", minHeight: "100vh" }}
        >
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ color: "#e74c3c", marginBottom: "10px" }}>
              {error}
            </div>
            <button
              onClick={fetchEmployeeProfile}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#00bcd4",
                color: "white",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Extract data from profile response
  // const { basicInfo, attendanceSummary, payrollInfo } = profileData || {};

  return (
    <DashboardLayout>
      <div
        style={{ padding: "20px", background: "#f4f6f9", minHeight: "100vh" }}
      >
        {/* Page Heading */}
        <h2 style={{ marginBottom: "20px" }}>HRMS / Employee Profile</h2>

        {/* Profile Header Card */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              
              <img
                src={basicInfo?.profileImage || profileImg}
                alt="profile"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <h3 style={{ margin: 0 }}>{basicInfo?.name || "N/A"}</h3>
                <p style={{ margin: "4px 0", color: "#777" }}>
                  EID : {basicInfo?._id?.slice(-6).toUpperCase() || "N/A"}{" "}
                  &nbsp; | &nbsp; {basicInfo?.role || "N/A"}
                </p>
                <span style={basicInfo?.isActive ? activeBadge : inactiveBadge}>
                  {basicInfo?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFormData({ ...basicInfo }); // important change
                setShowEditModal(true);
              }}
              style={primaryBtn}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Grid Section */}
        <div style={gridContainer}>
          {/* Basic Information */}
          <div style={card}>
            <div style={cardHeader}>
  <h4 style={sectionTitle}>Basic Information</h4>

  <FaEdit
    style={editIconStyle}
    onClick={() => {
      setFormData({
        name: basicInfo?.name,
        email: basicInfo?.email,
        phone: basicInfo?.phone,
        department: basicInfo?.department,
      });
      setEditSection("basic");
    }}
  />
</div>
            {/* <h4 style={sectionTitle}>Basic Information</h4> */}
            <InfoRow label="Full Name" value={basicInfo?.name || "N/A"} />
            <InfoRow label="Email" value={basicInfo?.email || "N/A"} />
            <InfoRow label="Phone" value={basicInfo?.phone || "N/A"} />
            <InfoRow
              label="Department"
              value={basicInfo?.department || "N/A"}
            />
            <InfoRow
              label="Joining Date"
              value={
                basicInfo?.createdAt
                  ? new Date(basicInfo.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>

          {/* Job Details */}
          <div style={card}>
            <div style={cardHeader}>
  <h4 style={sectionTitle}>Job & Organization Details</h4>

  <FaEdit
    style={editIconStyle}
    onClick={() => {
      setFormData({
        role: basicInfo?.role,
        department: basicInfo?.department,
        projectManager: basicInfo?.projectManager,
      });
      setEditSection("job");
    }}
  />
</div>
            {/* <h4 style={sectionTitle}>Job & Organization Details</h4> */}
            <InfoRow
              label="Employee ID"
              value={basicInfo?._id?.slice(-6).toUpperCase() || "N/A"}
            />
            <InfoRow label="Role" value={basicInfo?.role || "N/A"} />
            <InfoRow
              label="Department"
              value={basicInfo?.department || "N/A"}
            />
            <InfoRow
              label="Project Manager"
              value={basicInfo?.projectManager || "N/A"}
            />
            <InfoRow
              label="Status"
              value={basicInfo?.isActive ? "Active" : "Inactive"}
            />
            <InfoRow
              label="Created"
              value={
                basicInfo?.createdAt
                  ? new Date(basicInfo.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>

          {/* Attendance Summary */}
          {/* Personal Details */}

{/* Personal Details */}
<div style={card}>
  <div style={cardHeader}>
    <h4 style={sectionTitle}>Personal Details</h4>
        <FaEdit
  style={editIconStyle}
  onClick={() => {
    setFormData({
      dateOfBirth: basicInfo?.dateOfBirth || "",
      gender: basicInfo?.gender || "",
      maritalStatus: basicInfo?.maritalStatus || "",
      bloodGroup: basicInfo?.bloodGroup || "",
      currentAddress: basicInfo?.currentAddress || "",
      permanentAddress: basicInfo?.permanentAddress || "",
      emergencyContact: basicInfo?.emergencyContact || "",
    });

    setEditSection("personal");
  }}
/>
    {/* <FaEdit
      style={editIconStyle}
      onClick={() => {
        setFormData({
          dateOfBirth: basicInfo?.dateOfBirth,
          gender: basicInfo?.gender,
          maritalStatus: basicInfo?.maritalStatus,
          bloodGroup: basicInfo?.bloodGroup,
          currentAddress: basicInfo?.currentAddress,
          permanentAddress: basicInfo?.permanentAddress,
          emergencyContact: basicInfo?.emergencyContact,
        });

        setEditSection("personal");
      }}
    /> */}
  </div>

  <InfoRow
    label="Date of Birth"
    value={
      basicInfo?.dateOfBirth
        ? new Date(basicInfo.dateOfBirth).toLocaleDateString()
        : "N/A"
    }
  />

  <InfoRow
    label="Gender"
    value={basicInfo?.gender || "N/A"}
  />

  <InfoRow
    label="Marital Status"
    value={basicInfo?.maritalStatus || "N/A"}
  />

  <InfoRow
    label="Blood Group"
    value={basicInfo?.bloodGroup || "N/A"}
  />

  <InfoRow
    label="Current Address"
    value={basicInfo?.currentAddress || "N/A"}
  />

  <InfoRow
    label="Permanent Address"
    value={basicInfo?.permanentAddress || "N/A"}
  />

  <InfoRow
    label="Emergency Contact"
    value={basicInfo?.emergencyContact || "N/A"}
  />
</div>
              
     {/*Bank & PF Details  */}
     
        <div style={card}>
  <div style={cardHeader}>
    <h4 style={sectionTitle}>Bank & PF Details</h4>

    <FaEdit
      style={editIconStyle}
      onClick={() => {
        setFormData({
          universalAccountNumber: basicInfo?.universalAccountNumber || "",
          pfMemberId: basicInfo?.pfMemberId || "",
          panNumber: basicInfo?.panNumber || "",
          aadharNumber: basicInfo?.aadharNumber || "",
          esicNumber: basicInfo?.esicNumber || "",
          accountHolderName: basicInfo?.accountHolderName || "",
          accountNumber: basicInfo?.accountNumber || "",
          ifscCode: basicInfo?.ifscCode || "",
          bankName: basicInfo?.bankName || "",
          branchName: basicInfo?.branchName || "",
        });

        setEditSection("bank");
      }}
    />
  </div>

  <InfoRow
    label="UAN Number"
    value={basicInfo?.universalAccountNumber || "N/A"}
  />

  <InfoRow
    label="PF Member ID"
    value={basicInfo?.pfMemberId || "N/A"}
  />

  <InfoRow
    label="PAN Number"
    value={basicInfo?.panNumber || "N/A"}
  />

  <InfoRow
    label="Aadhar Number"
    value={basicInfo?.aadharNumber || "N/A"}
  />

  <InfoRow
    label="ESIC Number"
    value={basicInfo?.esicNumber || "N/A"}
  />

  <InfoRow
    label="Account Holder"
    value={basicInfo?.accountHolderName || "N/A"}
  />

  <InfoRow
    label="Account Number"
    value={basicInfo?.accountNumber || "N/A"}
  />

  <InfoRow
    label="IFSC Code"
    value={basicInfo?.ifscCode || "N/A"}
  />

  <InfoRow
    label="Bank Name"
    value={basicInfo?.bankName || "N/A"}
  />

  <InfoRow
    label="Branch Name"
    value={basicInfo?.branchName || "N/A"}
  />
</div>
          {/* Account */}
          {/* Documents Card */}
<div style={card}>
  <div style={cardHeader}>
    <h4 style={sectionTitle}>Documents</h4>

    <button
      style={primaryBtn}
      onClick={() => setShowDocumentModal(true)}
    >
      Upload
    </button>
  </div>

  {uploadedDocuments?.length > 0 ? (
    uploadedDocuments.map((doc, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid #eee",
          paddingBottom: "8px",
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: "500" }}>
            {doc.documentType}
          </p>
          <small style={{ color: "#777" }}>
            Uploaded
          </small>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* View */}
          <a
            href={`http://localhost:5000${doc.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#00bcd4",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            View
          </a>

          {/* Delete */}
          <FaTrash
            style={{
              color: "grey",
              cursor: "pointer",
              fontSize: "16px"
            }}
            onClick={() => handleDeleteDocument(index)}
          />
        </div>
      </div>
    ))
  ) : (
    <p style={{ color: "#777" }}>
      No documents uploaded yet.
    </p>
  )}
</div>
        </div>

        {/* Bottom Buttons */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => setShowResetModal(true)} style={secondaryBtn}>
            Reset Password
          </button>
          <button onClick={handleDeleteEmployee} style={dangerBtn}>
            Delete Employee
          </button>
        </div>
      </div>
      {editSection && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        width: "500px",
        maxWidth: "90%",
      }}
    >
     <h3 style={{ marginBottom: "15px" }}>
  Edit{" "}
  {editSection === "basic"
    ? "Basic Information"
    : editSection === "job"
    ? "Job Details"
    : editSection === "personal"
    ? "Personal Details"
    : editSection === "bank"
    ? "Bank & PF Details"
    : "Account Details"}
</h3>

      {/* Basic Info Fields */}
      {editSection === "basic" && (
        <>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Full Name"
            style={inputStyle}
          />

          <input
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email"
            style={inputStyle}
          />

          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            style={inputStyle}
          />

          <input
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            placeholder="Department"
            style={inputStyle}
          />
        </>
      )}

      {/* Job Details Fields */}
      {editSection === "job" && (
        <>
          <input
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            placeholder="Role"
            style={inputStyle}
          />

          <input
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            placeholder="Department"
            style={inputStyle}
          />

          <input
            name="projectManager"
            value={formData.projectManager || ""}
            onChange={handleChange}
            placeholder="Project Manager"
            style={inputStyle}
          />
        </>
      )}
      {editSection === "personal" && (
  <>
    <input
      name="dateOfBirth"
      type="date"
      value={formData.dateOfBirth || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="gender"
      value={formData.gender || ""}
      onChange={handleChange}
      placeholder="Gender"
      style={inputStyle}
    />

    <input
      name="maritalStatus"
      value={formData.maritalStatus || ""}
      onChange={handleChange}
      placeholder="Marital Status"
      style={inputStyle}
    />

    <input
      name="bloodGroup"
      value={formData.bloodGroup || ""}
      onChange={handleChange}
      placeholder="Blood Group"
      style={inputStyle}
    />

    <input
      name="currentAddress"
      value={formData.currentAddress || ""}
      onChange={handleChange}
      placeholder="Current Address"
      style={inputStyle}
    />

    <input
      name="permanentAddress"
      value={formData.permanentAddress || ""}
      onChange={handleChange}
      placeholder="Permanent Address"
      style={inputStyle}
    />

    <input
      name="emergencyContact"
      value={formData.emergencyContact || ""}
      onChange={handleChange}
      placeholder="Emergency Contact"
      style={inputStyle}
    />
  </>
)}
     {editSection === "bank" && (
  <>
    <input
      name="universalAccountNumber"
      placeholder="UAN Number"
      value={formData.universalAccountNumber || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="pfMemberId"
      placeholder="PF Member ID"
      value={formData.pfMemberId || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="panNumber"
      placeholder="PAN Number"
      value={formData.panNumber || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="aadharNumber"
      placeholder="Aadhar Number"
      value={formData.aadharNumber || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="esicNumber"
      placeholder="ESIC Number"
      value={formData.esicNumber || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="accountHolderName"
      placeholder="Account Holder Name"
      value={formData.accountHolderName || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="accountNumber"
      placeholder="Account Number"
      value={formData.accountNumber || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="ifscCode"
      placeholder="IFSC Code"
      value={formData.ifscCode || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="bankName"
      placeholder="Bank Name"
      value={formData.bankName || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="branchName"
      placeholder="Branch Name"
      value={formData.branchName || ""}
      onChange={handleChange}
      style={inputStyle}
    />

    {/* Instructions Box */}
    <div
      style={{
        marginTop: "15px",
        padding: "12px",
        background: "#fff8e1",
        borderRadius: "8px",
        fontSize: "13px",
        color: "#555",
        border: "1px solid #facc15"
      }}
    >
      <strong>Instructions:</strong>
      <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
        <li>Please double check your Account Number and IFSC code.</li>
        <li>Incorrect details may lead to delay in salary processing.</li>
        <li>
          Upload a Cancelled Cheque or Passbook copy in the Documents tab for verification.
        </li>
      </ul>
    </div>
  </>
)}
      {/* Account Fields */}
      {editSection === "account" && (
        <>
          <input
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email"
            style={inputStyle}
          />
        </>
      )}

      {/* Buttons */}
      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleEditSubmit}
          style={primaryBtn}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => setEditSection(null)}
          style={secondaryBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    {showDocumentModal && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <h3>Upload Document</h3>

      <select
        value={documentData.documentType}
        onChange={(e) =>
          setDocumentData({
            ...documentData,
            documentType: e.target.value,
          })
        }
        style={inputStyle}
      >
        <option value="">Select Type</option>
        <option value="Aadhar Card">Aadhar Card</option>
        <option value="PAN Card">PAN Card</option>
        <option value="Appointment Letter">Appointment Letter</option>
        <option value="Previous Experience Letter">
          Previous Experience Letter
        </option>
        <option value="Increment Letter">Increment Letter</option>
        <option value="Relieving Letter">Relieving Letter</option>
        <option value="Educational Certificate">
          Educational Certificate
        </option>
        <option value="Passport">Passport</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="file"
        onChange={handleFileChange}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleDocumentUpload}
          style={primaryBtn}
        >
          Upload
        </button>

        <button
          onClick={() => setShowDocumentModal(false)}
          style={secondaryBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {showResetModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Reset Password</h3>

            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleResetPassword} style={primaryBtn}>
                Reset
              </button>

              <button
                onClick={() => setShowResetModal(false)}
                style={secondaryBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

/* Reusable Components */

const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    }}
  >
    <span style={{ color: "#666", fontSize: "14px" }}>{label}</span>
    <span style={{ fontSize: "14px", fontWeight: "500" }}>{value}</span>
  </div>
);

const DocumentRow = ({ name }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    }}
  >
    <span>{name}</span>
    <div>
      <span
        style={{ color: "#00bcd4", cursor: "pointer", marginRight: "10px" }}
      >
        View
      </span>
      <span style={{ color: "#00bcd4", cursor: "pointer" }}>Download</span>
    </div>
  </div>
);

/* Styles */

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const sectionTitle = {
  marginBottom: "15px",
};

const activeBadge = {
  background: "#e8f5e9",
  color: "green",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
};

const inactiveBadge = {
  background: "#ffebee",
  color: "red",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
};

const primaryBtn = {
  padding: "8px 16px",
  background: "#00bcd4",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 18px",
  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
  border: "none",
  color: "#fff",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 10px rgba(14, 165, 233, 0.3)",
};

const dangerBtn = {
  padding: "8px 16px",
  background: "#fff",
  border: "1px solid red",
  color: "red",
  borderRadius: "6px",
  cursor: "pointer",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "400px",
  maxWidth: "90%",
};
const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const editIconStyle = {
  cursor: "pointer",
  color: "#00bcd4",
  fontSize: "16px",
};
export default EmployeeProfile;
