// eslint-disable-next-line no-unused-vars
import React from "react";
import { Routes, Route } from "react-router-dom";
import UserForm from "./pages/UserForm";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateEvent from "../src/components/Teacher/CreateEvent/CreateEvent"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/TeacherDashboard/create-event" element={<CreateEvent />} />
      </Routes>
    </div>
  );
};

export default App;
