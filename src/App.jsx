import { Routes, Route } from "react-router-dom"; // Removed Router
import Header from "./components/Common/Header";
import UserForm from "./pages/UserForm";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateEvent from "../src/components/Teacher/CreateEvent/CreateEvent";
import EventsList from "../src/components/Teacher/Events/Events";
import EventDetails from "../src/components/Teacher/EventDetails/EventDetails";
import CreateSpeaker from "./components/Teacher/CreateSpeaker/CreateSpeaker";
import SpeakerDashboard from "./pages/SpeakerDashboard" 

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/UserForm" element={<UserForm />} />
        <Route path="/TeacherDashboard/*" element={<TeacherDashboard />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/SpeakerDashboard" element={<SpeakerDashboard />} />
        <Route path="/TeacherDashboard/create-event" element={<CreateEvent />} />
        <Route path="/TeacherDashboard/create-Speaker" element={<CreateSpeaker />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Routes>
    </div>
  );
};

export default App;
