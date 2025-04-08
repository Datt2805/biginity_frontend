/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Outlet, useNavigate } from "react-router-dom";
import Classroom from "../components/Teacher/Classroom/Classroom";
import Events from "../components/Teacher/Events/Events";
import Attendance from "../components/Teacher/Attendance/Attendance";
import CreateEvent from "../components/Teacher/CreateEvent/CreateEvent";
import { toast } from "react-toastify"; // Importing toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Importing CSS for toast notifications
import CreateSpeaker from "../components/Teacher/CreateSpeaker/CreateSpeaker";
import { fetchUserDetail } from "../services/api"; 
import "./TeacherDashboard.css";

// Define tabs to be used for navigation
const tabs = [
  { name: "Classroom", component: <Classroom /> },
  { name: "Events", component: <Events /> },
  { name: "Attendance", component: <Attendance /> },
  { name: "CreateEvent", component: <CreateEvent /> },
  { name: "CreateSpeaker", component: <CreateSpeaker /> }
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("Classroom");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate(); // Hook to handle navigation

  useEffect(() => {
    const getUserName = async () => {
      const user = await fetchUserDetail();
      // console.log(user.data.nickname);
      setUserName(user.data.nickname || "Teacher");
    };
  
    getUserName();
  }, []);
  

  // Function to handle logout
  const handleLogout = () => {
    // Clear user session (if using localStorage/sessionStorage)
    localStorage.removeItem("token");  
    sessionStorage.removeItem("user-details");  

    // Redirect to login page (UserForm)
    navigate("/");
  };

  const renderContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active?.component || <Classroom />;
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
      <h1>Welcome, {userName}</h1>
        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

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
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={renderContent()} /> {/* Render active tab */}
        </Routes>

        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherDashboard;
