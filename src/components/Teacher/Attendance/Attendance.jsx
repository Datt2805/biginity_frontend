// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './Attendance.css';
import { makeSecureRequest } from '../../../services/api';

const ITEMS_PER_PAGE = 5;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters

  const toRadians = (deg) => deg * (Math.PI / 180);

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}



const ViewAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventData, setEventData] = useState([]); // Store event details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEventData().then(()=>{
      fetchAttendanceData();
    });
  }, []);

  // Fetch Event Data
  const fetchEventData = async () => {
    try {
      const response = await makeSecureRequest(`/api/events`, "GET", {});
      
      if (!response ) {
        throw new Error("Invalid event data format");
      }
  
      console.log("Fetched Events:", response.events); // Debugging
      setEventData(response.events);
    } catch (err) {
      console.error("Error fetching events:", err.message || err);
      setEventData([]); // Set empty array to prevent undefined issues
    }
  };
  

  // Fetch Attendance Data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await makeSecureRequest(`/api/attendances`, "GET", {});
      console.log("Fetched Attendance:", response.data); // Debugging
      setAttendanceData(response.data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

  // Function to get event name from event ID
  const getEventName = (eventId) => {
    // console.log(eventId, eventData)
    const event = eventData.find(e => e._id === eventId);
    // console.log(event)
    return event ? event.title : "N/A"; // Return event name or "N/A" if not found
  };

  // Function to calculate distance between location of event and the position of attendee;
  const calcDistance=(record)=>{
    const event = eventData.find(e => e._id === record.event_id);
    if(record.status === "to be taken") return "N\/A"
    if(event?.location?.lat && event?.location?.lat && record.locations[0]?.lat && record.locations[0]?.long) 
      return haversineDistance(event.location.lat, event.location.long,record.locations[0].lat,record.locations[0].long ).toFixed(2)+"m"

    return "-"
  }

  // Apply Filters
  const filteredData = attendanceData.filter((record) => (
    (!filterStatus || record.status === filterStatus) &&
    (!filterBranch || record.branch.toLowerCase().includes(filterBranch.toLowerCase())) &&
    (!filterStream || record.stream.toLowerCase().includes(filterStream.toLowerCase())) &&
    (!filterYear || record.year.toString().includes(filterYear))
  ));

  // Pagination Logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-page">
      <h2>Attendance Management</h2>

      {/* Filters Section */}
      <div className="filter-section">
        <label>Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          <option value="present">Present</option>
          <option value="on leave">On Leave</option>
          <option value="absent">Absent</option>
          <option value="pending evaluation">Pending Evaluation</option>
          <option value="to be taken">To Be Taken</option>
        </select>

        <label>Branch:</label>
        <input type="text" placeholder="Enter Branch" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} />

        <label>Stream:</label>
        <input type="text" placeholder="Enter Stream" value={filterStream} onChange={(e) => setFilterStream(e.target.value)} />

        <label>Year:</label>
        <input type="text" placeholder="Enter Year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} />
      </div>

      {/* Attendance Table */}
      <h3>Attendance Records</h3>
      {paginatedData.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Name</th>
              <th>Nickname</th>
              <th>Enrollment ID</th>
              <th>Branch</th>
              <th>Stream</th>
              <th>Year</th>
              <th>Status</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Distance from event location</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record) => (
              <tr key={record._id}>
                <td>{getEventName(record.event_id)}</td> {/* Get Event Name */}
                <td>{record.name}</td>
                <td>{record.nickname}</td>
                <td>{record.enrollment_id}</td>
                <td>{record.branch}</td>
                <td>{record.stream}</td>
                <td>{record.year}</td>
                <td>{record.status}</td>
                <td>{record.punch_in_time ? new Date(record.punch_in_time).toLocaleString() : 'N/A'}</td>
                <td>{record.punch_out_time ? new Date(record.punch_out_time).toLocaleString() : 'N/A'}</td>
                <td>{calcDistance(record)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No attendance records found.</p>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => handlePageChange(-1)}>Previous</button>
        <span>Page {currentPage}</span>
        <button disabled={startIndex + ITEMS_PER_PAGE >= filteredData.length} onClick={() => handlePageChange(1)}>Next</button>
      </div>
    </div>
  );
};

export default ViewAttendancePage;
