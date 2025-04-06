// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { hostSocket, handleEnroll, getItemWithExpiry } from "../../../services/api";
import { USER_ROLES } from "../../../types";
import "./Events.css";
import defaultPlaceholder from "../../../public/image.png";

const handleEnrollClick = async (event, id) => {
    event.preventDefault();
    await handleEnroll(id);
};

// eslint-disable-next-line react/prop-types
const EventCard = ({ id, heading, date, location, img }) => {
    const { year, month } = date;

    // Get user info directly from localStorage
    const user = getItemWithExpiry("user-details");
    const token = getItemWithExpiry("token");
    const userRole = user?.role || "";

    return (
        <div className="card-wrapper">
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
                            onError={(e) => (e.target.src = defaultPlaceholder)}
                        />
                        {/* Enroll button (only if not teacher) */}
                    {userRole !== USER_ROLES.TEACHER && (
                        <button className="enroll-button" 
                            onClick={(e) => {
                                e.preventDefault();
                                if (!token) {
                                    alert("Please login or sign up first");
                                    return;
                                }
                                handleEnrollClick(e, id);
                            }}
                        >
                            Enroll
                        </button>
                    )}
                    </div>
                    
                </div>
            </Link>
        </div>
    );
};

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${hostSocket}/api/events`);

                if (Array.isArray(response.data)) {
                    setEvents(response.data);
                } else if (response.data && Array.isArray(response.data.events)) {
                    setEvents(response.data.events);
                } else {
                    console.error("Expected an array but got:", response.data);
                    setError("Failed to load events");
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setError("Error fetching events");
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="events-list">
            {Array.isArray(events) && events.length > 0 ? (
                events
                    .filter((event) => event && event._id && event.title)
                    .map((event) => {
                        const imageUrl = event?.image
                            ? `${hostSocket}${event.image}`
                            : defaultPlaceholder;

                        return (
                            <EventCard
                                key={event._id}
                                id={event._id}
                                heading={event.title}
                                date={{
                                    year: new Date(event.start_time)?.getFullYear() || "N/A",
                                    month: new Date(event.start_time)?.getMonth() + 1 || "N/A",
                                }}
                                location={event?.location?.address || "Unknown"}
                                img={imageUrl}
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
