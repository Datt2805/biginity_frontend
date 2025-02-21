import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserForm from "../src/pages/UserForm";
import TeacherDashboard from "../src/pages/TeacherDashboard";
import StudentDashboard from "../src/pages/StudentDashboard";
import EventsList from "../src/components/Teacher/Events/Events";
import EventDetails from "../src/components/Teacher/EventDetails/EventDetails";

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<UserForm />} />
            <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
            <Route path="/StudentDashboard" element={<StudentDashboard />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetails />} />
        </Routes>
        </Router>
    );
}

export default App;
