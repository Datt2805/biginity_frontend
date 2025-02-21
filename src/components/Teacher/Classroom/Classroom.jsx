// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import {
  fetchClassrooms,
  initSocket,
  fetchUserDetail,
} from "../../../services/api";
import Loader from "../../Common/Loader";
import { USER_ROLES } from "../../../types";
import './Classroom.css'
const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(""); // State to hold the user's role
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
      console.log("this is for roll base access con", res);
      // Fetch role from your API
      setUserRole(res.data.role); // Assume the role is returned as a string, e.g., "teacher" or "student"
    } catch (err) {
      console.error("Failed to fetch user role", err);
      setError("Failed to fetch user role");
    }
  };

  useEffect(() => {
    loadClassrooms();
    loadUserRole();

    // Initialize socket
    const actions = initSocket({
      newMessageCallback: (data) => {
        console.log("New message received:", data);
      },
      // eslint-disable-next-line no-unused-vars
      connectionCallback: (_data) => {
        console.log("Connected to socket");
      },
      successCallback: (data) => {
        console.log("Connection successful:", data);
      },
      errorCallback: (data) => {
        console.error("Error in socket connection:", data);
      },
      attendanceStartedCallback: (data) => {
        console.log("Attendance started for classroom:", data);
      },
      punchInCallback: (data) => {
        console.log("Punch-In received for classroom:", data);
      },
      punchOutCallback: (data) => {
        console.log("Punch-Out received for classroom:", data);
      },
    });

    setSocketActions(actions);

    // Cleanup socket connection when component unmounts
    return () => {
      actions.socket.disconnect();
    };
  }, []);

  const handleStartAttendance = (classroomId) => {
    console.log("Starting attendance for classroom:", classroomId);
    socketActions.startAttendance(classroomId, 5); // Assuming 5 is the timeout value
  };

  const handlePunchIn = (classroomId) => {
    console.log("Punching In for classroom:", classroomId);

    // Get user location using the Geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };

        const data = {
          classroom_id: classroomId,
          location: locationData,
        };

        socketActions.punchIn({ ...data }); // Trigger socket action for Punch-In
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Could not retrieve your location for Punch-In.");
      }
    );
  };

  const handlePunchOut = (classroomId) => {
    console.log("Punching Out for classroom:", classroomId);

    // Get user location using the Geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };

        const data = {
          classroom_id: classroomId,
          location: locationData,
        };

        socketActions.punchOut({ ...data }); // Trigger socket action for Punch-Out
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
              {/* Conditionally render the Start Attendance button */}
              {userRole === USER_ROLES.TEACHER && (
                <button onClick={() => handleStartAttendance(classroom._id)}>
                  Start Attendance
                </button>
              )}
              {userRole === USER_ROLES.STUDENT && (
              <>
                <button onClick={() => handlePunchIn(classroom._id)}>
                  Punch In
                </button>
                <button onClick={() => handlePunchOut(classroom._id)}>
                  Punch Out
                </button>
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
