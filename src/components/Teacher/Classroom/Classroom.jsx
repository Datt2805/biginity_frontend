// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import {
  fetchClassrooms,
  initSocket,
  fetchUserDetail,
} from "../../../services/api";
import Loader from "../../Common/Loader";
import './Classroom.css';

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(""); // Holds the user's role
  const [socketActions, setSocketActions] = useState(null);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const data = await fetchClassrooms();
      setClassrooms(data); // Assume API response is an array of classrooms
    } catch (err) {
      setError(err.message || "Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const res = await fetchUserDetail();
      // console.log("Fetched user details:", res);

      const role = res?.data?.role?.trim().toLowerCase(); // Normalize role
      if (role === "teacher" || role === "student") {
        setUserRole(role);
        localStorage.setItem("role", role); // Save in localStorage
      } else {
        console.error("Invalid role received:", role);
      }
    } catch (err) {
      console.error("Failed to fetch user role", err);
      setError("Failed to fetch user role");
      
      // Fallback: Try getting role from localStorage
      const savedRole = localStorage.getItem("role");
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  };

  useEffect(() => {
    loadClassrooms();
    loadUserRole();

    // Initialize socket
    const actions = initSocket({
      newMessageCallback: (data) => console.log("New message received:", data),
      connectionCallback: () => console.log("Connected to socket"),
      successCallback: (data) => console.log("Connection successful:", data),
      errorCallback: (data) => console.error("Error in socket connection:", data),
      attendanceStartedCallback: (data) => console.log("Attendance started for:", data),
      punchInCallback: (data) => console.log("Punch-In received:", data),
      punchOutCallback: (data) => console.log("Punch-Out received:", data),
    });

    setSocketActions(actions);

    // Cleanup socket connection when component unmounts
    return () => {
      actions.socket.disconnect();
    };
  }, []);

  const handleStartAttendance = (classroomId) => {
    if (userRole !== "teacher") {
      alert("Only teachers can start attendance.");
      return;
    }
    console.log("Starting attendance for:", classroomId);
    socketActions.startAttendance(classroomId, 5);
    alert("Attendance started successfully.");
  };

  const handleStopAttendance = (classroomId) => {
    if (userRole !== "teacher") {
      alert("Only teachers can stop attendance.");
      return;
    }
    console.log("Stopping attendance for:", classroomId);
    socketActions.stopAttendance(classroomId);
    alert("Attendance stopped successfully.");
  };

  const handlePunchIn = (classroomId) => {
    if (userRole !== "student") {
      alert("Only students can punch in.");
      return;
    }
    console.log("Punching In for:", classroomId);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data = {
          classroom_id: classroomId,
          location: {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          },
        };
        socketActions.punchIn(data);
        alert("Punch-In successful.");
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Could not retrieve your location for Punch-In.");
      }
    );
  };

  const handlePunchOut = (classroomId) => {
    if (userRole !== "student") {
      alert("Only students can punch out.");
      return;
    }
    console.log("Punching Out for:", classroomId);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data = {
          classroom_id: classroomId,
          location: {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          },
        };
        socketActions.punchOut(data);
        alert("Punch-Out successful.");
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Could not retrieve your location for Punch-Out.");
      }
    );
  };

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="classrooms">
      <h2>Classrooms</h2>
      <ul>
        {classrooms.map((classroom) => (
          <li key={classroom._id} className="classroom-item">
            <h3>{classroom.name}</h3>
            <div className="classroom-buttons">
              {userRole === "teacher" && (
                <>
                  <button onClick={() => handleStartAttendance(classroom._id)}>
                    Start Attendance
                  </button>
                  <button onClick={() => handleStopAttendance(classroom._id)}>
                    Stop Attendance
                  </button>
                </>
              )}
              {userRole === "student" && (
                <>
                  <button onClick={() => handlePunchIn(classroom._id)}>Punch In</button>
                  <button onClick={() => handlePunchOut(classroom._id)}>Punch Out</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Classroom;
