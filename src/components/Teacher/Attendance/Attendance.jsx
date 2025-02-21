// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './Attendance.css';
import { makeSecureRequest } from '../../../services/api';

const ITEMS_PER_PAGE = 5;

const ViewAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await makeSecureRequest(`/api/attendances`, "GET", {});
      console.log("Fetched Data:", response.data);  // Debugging line
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
              <th>Classroom ID</th>
              <th>Event ID</th>
              <th>Name</th>
              <th>Nickname</th>
              <th>Enrollment ID</th>
              <th>Branch</th>
              <th>Stream</th>
              <th>Gender</th>
              <th>Year</th>
              <th>Status</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record) => (
              <tr key={record._id}>
                <td>{record.classroom_id}</td>
                <td>{record.event_id || "N/A"}</td>
                <td>{record.name}</td>
                <td>{record.nickname}</td>
                <td>{record.enrollment_id}</td>
                <td>{record.branch}</td>
                <td>{record.stream}</td>
                <td>{record.gender}</td>
                <td>{record.year}</td>
                <td>{record.status}</td>
                <td>{record.punch_in_time ? new Date(record.punch_in_time).toLocaleString() : 'N/A'}</td>
                <td>{record.punch_out_time ? new Date(record.punch_out_time).toLocaleString() : 'N/A'}</td>
                <td>{record.locations?.length > 0 ? `${record.locations[0].lat}, ${record.locations[0].long}` : 'N/A'}</td>
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
