// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { hostSocket, handleEnroll, fetchUserDetail } from '../../../services/api';
import { USER_ROLES } from "../../../types";
import "./Events.css";

const handleEnrollClick = async (event, id) => {
    event.preventDefault();
    await handleEnroll(id);
};

// eslint-disable-next-line react/prop-types
const EventCard = ({ id, heading, date, location, img, userRole }) => {
    // eslint-disable-next-line react/prop-types
    const { year, month } = date;
    return (
        <Link to={`/events/${id}`} className="card-link">
            <div className="card">
                <div className="card-content">
                    <h3>{heading}</h3>
                    <p>
                        <span>Year: {year}</span>
                        <span>Month: {month}</span>
                    </p>
                    <p>{location}</p>
                </div>
                <div className="card-img-wrapper">
                    <img
                        src={img}
                        alt={heading}
                        onError={(e) => (e.target.src = "/default-placeholder.jpg")} // Fallback image
                    />
                </div>

                {userRole === USER_ROLES.STUDENT && (
                    <button onClick={(e) => handleEnrollClick(e, id)}>Enroll</button>
                )}
            </div>
        </Link>
    );
};

const EventsList = () => {
    const [events, setEvents] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState("");

    const loadUserRole = async () => {
        try {
            const res = await fetchUserDetail();
            console.log("User Role:", res.data.role);
            setUserRole(res.data.role);
        } catch (err) {
            console.error("Failed to fetch user role", err);
            setError("Failed to fetch user role");
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${hostSocket}/api/events`);
                console.log("API Response:", response.data);
                if (Array.isArray(response.data.events)) {
                    setEvents(response.data.events);
                } else {
                    console.error("Expected an array but got:", response.data.events);
                    setError("Failed to load events");
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setError("Error fetching events");
            }
        };

        loadUserRole();
        fetchEvents();
    }, []);

    return (
        <div className="events-list">
            {Array.isArray(events) && events.length > 0 ? (
                events.map((event) => {
                    const startTime = new Date(event.start_time);
                    return (
                        <EventCard
                            key={event._id}
                            id={event._id}
                            heading={event.title}
                            date={{
                                year: startTime.getFullYear(),
                                month: startTime.getMonth() + 1,
                            }}
                            location={event.location.address}
                            img={event.image ? `${hostSocket}${event.image}` : "/default-placeholder.jpg"} // Ensuring full URL
                            userRole={userRole}
                        />

                    );
                })
            ) : (
                <div>No events available</div>
            )}
        </div>
    );
};

export default EventsList;