import { useState, useEffect } from "react";
import "./Header.css";
import UserForm from "../../pages/UserForm";
import Events from "../Teacher/Events/Events";
import imge from "../../public/image.png"; // Adjust the path as necessary

export default function Header() {
  const [activePage, setActivePage] = useState("event");
  const [formType, setFormType] = useState("login"); // Control login/signup

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <header className="header">
      <h1>F<img src={imge} alt="Logo" className="logo" />UNDATION</h1>
        <nav>
          <ul>
            <li onClick={() => setActivePage("event")} className={activePage === "event" ? "active" : ""}>Event</li>
            <li onClick={() => { setActivePage("form"); setFormType("login"); }} className={activePage === "form" && formType === "login" ? "active" : ""}>Login/Signup</li>
          </ul>
        </nav>
      </header>
      
      {/* Content Section */}
      <main className="content fade-in">
        {activePage === "event" && <Events />}
        {activePage === "form" && <UserForm />}
      </main>
    </div>
  );
}
