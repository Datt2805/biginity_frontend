// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './Attendance.css';
import { makeSecureRequest, hostSocket } from '../../../services/api';

const ITEMS_PER_PAGE = 5;

const ViewAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEventData();
    fetchAttendanceData();
  }, []);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`${hostSocket}/api/events`);
      const data = await response.json();
      if (!data || !data.events) {
        throw new Error("Invalid data format");
      }
      setEventData(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await makeSecureRequest(`/api/attendances`, "GET", {});
      const sortedData = (response.data || []).sort(
        (a, b) => new Date(b.punch_in_time) - new Date(a.punch_in_time)
      );
      setAttendanceData(sortedData);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

  const getEventName = (eventId) => {
    const event = eventData.find(e => e._id === eventId);
    return event ? event.title : "N/A";
  };

  const filteredData = attendanceData.filter((record) => (
    (!filterStatus || record.status === filterStatus) &&
    (!filterBranch || record.branch.toLowerCase().includes(filterBranch.toLowerCase())) &&
    (!filterStream || record.stream.toLowerCase().includes(filterStream.toLowerCase())) &&
    (!filterYear || record.year.toString().includes(filterYear))
  ));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Distance calculation using Haversine formula
  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };



  const exportToCSV = (data) => {
    const headers = [
      "Event Name", "Name", "Nickname", "Enrollment ID", "Branch",
      "Stream", "Year", "Status", "Punch In", "Punch Out", "Punch In Location", "Within 15m"
    ];
  
    const rows = data.map((record) => {
      const locations = record.locations || [];
      const punchIn = record.punch_in_time ? new Date(record.punch_in_time).toLocaleString() : "N/A";
      const punchOut = record.punch_out_time ? new Date(record.punch_out_time).toLocaleString() : "N/A";
      const locationText = locations.length > 0 ? `${locations[0].lat}, ${locations[0].long}` : "N/A";
  
      let isWithin15 = "N/A";
      if (record.punch_out_time && locations.length >= 2) {
        const start = locations[0];
        const end = locations[locations.length - 1];
        const distance = getDistanceInMeters(start.lat, start.long, end.lat, end.long);
        isWithin15 = distance <= 15 ? "IN" : "OUT";
      }
  
      return [
        getEventName(record.event_id), record.name, record.nickname,
        record.enrollment_id, record.branch, record.stream, record.year,
        record.status, punchIn, punchOut, locationText, isWithin15
      ];
    });
  
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-page">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Attendance Management</h2> {/* CSV Export Button */}
      <button className="csv-button" onClick={() => exportToCSV(paginatedData)}>
        📥 Download CSV
      </button>
    </div>

      {/* Filters */}
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
              <th>Location</th>
              <th>Within 15m?</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record) => {
              const locations = record.locations || [];
              let isWithin15Meters = false;

              if (locations.length >= 2) {
                const start = locations[0];
                const end = locations[locations.length - 1];
                const distance = getDistanceInMeters(start.lat, start.long, end.lat, end.long);
                isWithin15Meters = distance <= 15;
              }

              return (
                <tr key={record._id}>
                  <td>{getEventName(record.event_id)}</td>
                  <td>{record.name}</td>
                  <td>{record.nickname}</td>
                  <td>{record.enrollment_id}</td>
                  <td>{record.branch}</td>
                  <td>{record.stream}</td>
                  <td>{record.year}</td>
                  <td>{record.status}</td>
                  <td>{record.punch_in_time ? new Date(record.punch_in_time).toLocaleString() : 'N/A'}</td>
                  <td>{record.punch_out_time ? new Date(record.punch_out_time).toLocaleString() : 'N/A'}</td>
                  <td>
                    {locations.length > 0
                      ? `${locations[0].lat}, ${locations[0].long}`
                      : 'N/A'}
                  </td>
                  <td>
                    {record.punch_out_time ? (
                      <span
                        style={{
                          color: isWithin15Meters ? 'green' : 'red',
                          fontSize: '1.5rem',
                        }}
                        title={isWithin15Meters ? 'Punched out within 15m' : 'Punched out outside 15m'}
                      >
                        ●
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No attendance records found.</p>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => handlePageChange(-1)}>Previous</button>
        <span>Page {currentPage}</span>
        <button disabled={startIndex + ITEMS_PER_PAGE >= filteredData.length} onClick={() => handlePageChange(1)}>Next</button>
      </div>
    </div>
  );
};

export default ViewAttendancePage;
