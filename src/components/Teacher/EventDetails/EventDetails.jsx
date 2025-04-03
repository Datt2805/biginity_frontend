// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEventById } from "../../../services/api";
import "./EventDetails.css";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                console.log("Fetching event details for ID:", id);
                const eventDetails = await fetchEventById(id);
                setEvent(eventDetails.events[0]);
                console.log("Event details fetched:", eventDetails);
            } catch (err) {
                setError(err.message || "Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="event-details">
            <h1>{event.title}</h1>
            <div className="event-img-wrapper">
                <img
                    src={event.image ? event.image : "/default-placeholder.jpg"}
                    alt={event.title}
                    onError={(e) => (e.target.src = "/default-placeholder.jpg")}
                />
            </div>
            <p><strong>Mandatory:</strong> {event.mandatory ? "Yes" : "No"}</p>
            <h2>Description</h2>
            <h3>Objectives:</h3>
            <ul>
                {event.description.objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                ))}
            </ul>
            <h3>Learning Outcomes:</h3>
            <ul>
                {event.description.learning_outcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                ))}
            </ul>
            <p><strong>Start Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
            <p><strong>End Time:</strong> {new Date(event.end_time).toLocaleString()}</p>
            <p><strong>Location:</strong> {event.location.address}</p>
            <h2>Speakers</h2>
            <ul>
                {event.speaker_ids.map((speaker, index) => (
                    <li key={index}>Speaker ID: {speaker}</li>
                ))}
            </ul>
        </div>
    );
};

export default EventDetails;
