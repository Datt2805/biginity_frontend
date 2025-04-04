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
  const [userRole, setUserRole] = useState("");
  const [socketActions, setSocketActions] = useState(null);
  const [attendanceTimers, setAttendanceTimers] = useState(() => {
    const savedTimers = JSON.parse(localStorage.getItem("attendanceTimers")) || {};
    return savedTimers;
  });
  
  useEffect(() => {
    window.addEventListener("beforeunload", (event) => {
      if (Object.keys(attendanceTimers).length > 0) {
        event.preventDefault();
        event.returnValue = "Attendance is still running. Are you sure you want to leave?";
      }
    });
  }, [attendanceTimers]);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const data = await fetchClassrooms();
      setClassrooms(data);
    } catch (err) {
      setError(err.message || "Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const res = await fetchUserDetail();
      const role = res?.data?.role?.trim().toLowerCase();
      if (role === "teacher" || role === "student") {
        setUserRole(role);
        localStorage.setItem("role", role);
      } else {
        console.error("Invalid role received:", role);
      }
    } catch (err) {
      console.error("Failed to fetch user role", err);
      setError("Failed to fetch user role");
      const savedRole = localStorage.getItem("role");
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  };

  useEffect(() => {
    loadClassrooms();
    loadUserRole();

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

    const endTime = Date.now() + 5 * 60 * 1000;
    const updatedTimers = { ...attendanceTimers, [classroomId]: endTime };
    setAttendanceTimers(updatedTimers);
    localStorage.setItem("attendanceTimers", JSON.stringify(updatedTimers));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAttendanceTimers((prev) => {
        const updatedTimers = { ...prev };
        Object.keys(updatedTimers).forEach((classroomId) => {
          if (updatedTimers[classroomId] <= Date.now()) {
            delete updatedTimers[classroomId];
          }
        });
        localStorage.setItem("attendanceTimers", JSON.stringify(updatedTimers));
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
                  {attendanceTimers[classroom._id] !== undefined && (
                    <p>Time left: {Math.max(0, Math.floor((attendanceTimers[classroom._id] - Date.now()) / 1000))}s</p>
                  )}
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