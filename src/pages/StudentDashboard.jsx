// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Classroom from "../components/Teacher/Classroom/Classroom";
import Events from "../components/Teacher/Events/Events";
import "./TeacherDashboard.css"; // Import your CSS file for styling

const tabs = [
  { name: "Classroom", component: <Classroom /> },
  { name: "Events", component: <Events /> },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("Classroom");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear authentication token
    console.log("User logged out");
    setTimeout(() => {
      navigate("/"); 
    }, 1000);
  };

  const renderContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active?.component || <Classroom />;
  };

  return (
    <div className="teacher-dashboard">
      <h1>Student Dashboard</h1>

      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={activeTab === tab.name ? "active" : ""}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </button>
        ))}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default TeacherDashboard;
