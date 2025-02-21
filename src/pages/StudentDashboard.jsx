/* eslint-disable no-unused-vars */
// // eslint-disable-next-line no-unused-vars
// import React, { useState } from "react";
// import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
// import Classroom from "../components/Teacher/Classroom/Classroom";
// import Events from "../components/Teacher/Events/Events";
// import Attendance from "../components/Teacher/Attendance/Attendance";
// import "./TeacherDashboard.css";

// // Define tabs to be used for navigation
// const tabs = [
//   { name: "Classroom", component: <Classroom /> },
//   { name: "Events", component: <Events /> },
//   { name: "Attendance", component: <Attendance /> },
// ];

// const TeacherDashboard = () => {
//   const [activeTab, setActiveTab] = useState("Classroom");
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // Perform logout logic (e.g., clearing authentication tokens)
//     localStorage.removeItem("authToken"); // Clear authentication token
//     console.log("User logged out");
//     navigate("/"); // Redirect to login page
//   };

//   const renderContent = () => {
//     const active = tabs.find((tab) => tab.name === activeTab);
//     return active?.component || <Classroom />;
//   };

//   return (
//     <div className="teacher-dashboard">
//       <h1>Teacher Dashboard</h1>

//       {/* Navigation Bar */}
//       <nav className="dashboard-nav">
//         {tabs.map((tab) => (
//           <button
//             key={tab.name}
//             className={activeTab === tab.name ? "active" : ""}
//             onClick={() => setActiveTab(tab.name)}
//           >
//             {tab.name}
//           </button>
//         ))}
//         <button className="logout-button" onClick={handleLogout}>Logout</button>
//       </nav>

//       {/* Main Content Area */}
//       <div className="dashboard-content">
//         <Routes>
//           <Route path="/" element={renderContent()} /> {/* Render active tab */}
//         </Routes>

//         {/* Outlet for nested routes */}
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default TeacherDashboard;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Classroom from "../components/Teacher/Classroom/Classroom";
import Events from "../components/Teacher/Events/Events";
import Attendance from "../components/Teacher/Attendance/Attendance";
import "./TeacherDashboard.css";

const tabs = [
  { name: "Classroom", component: <Classroom /> },
  { name: "Events", component: <Events /> },
  { name: "Attendance", component: <Attendance /> },
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
      <h1>Teacher Dashboard</h1>

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
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default TeacherDashboard;
