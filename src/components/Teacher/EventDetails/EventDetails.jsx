import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEventById, hostSocket, fetchSpeakersByIds } from "../../../services/api";
import "./EventDetails.css";
import defaultPlaceholder from "../../../public/image.png";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const eventDetails = await fetchEventById(id);
                const eventObj = eventDetails.events[0];

                if (eventObj?.speaker_ids?.length && !eventObj?.speakers?.length) {
                    const speakerData = await fetchSpeakersByIds(eventObj.speaker_ids);
                    eventObj.speakers = speakerData;
                }

                setEvent(eventObj);
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

    const imageUrl = event?.image?.startsWith("http") ? event.image : `${hostSocket}${event.image}`;

    return (
        <div className="event-details">
            <h1 className="event-title">{event?.title}</h1>

            <div className="event-image-wrapper">
                <img
                    src={imageUrl || defaultPlaceholder}
                    alt={event?.title}
                    onError={(e) => (e.target.src = defaultPlaceholder)}
                    className="event-main-image"
                />
            </div>

            <div className="event-meta">
                <p><strong>Mandatory:</strong> {event?.mandatory ? "Yes" : "No"}</p>
                <p><strong>Start Time:</strong> {new Date(event?.start_time).toLocaleString()}</p>
                <p><strong>End Time:</strong> {new Date(event?.end_time).toLocaleString()}</p>
                <p><strong>Location:</strong> {event?.location?.address || "Unknown"}</p>
            </div>

            <div className="event-section">
                <h2>Description</h2>
                <h3>Objectives</h3>
                <ul>
                    {event?.description?.objectives?.map((obj, index) => (
                        <li key={index}>{obj}</li>
                    ))}
                </ul>
                <h3>Learning Outcomes</h3>
                <ul>
                    {event?.description?.learning_outcomes?.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                    ))}
                </ul>
            </div>

            <div className="event-section">
                <h2>Speakers</h2>
                {event?.speakers?.length > 0 ? (
                    <div className="speakers-grid">
                        {event.speakers.map((speaker, index) => (
                            <div key={index} className="speaker-card">
                                <img
                                    src={speaker.image?.startsWith("http") ? speaker.image : `${hostSocket}${speaker.image}`}
                                    alt={speaker.name}
                                    onError={(e) => (e.target.src = defaultPlaceholder)}
                                    className="speaker-image"
                                />
                                <div className="speaker-info">
                                    <strong>{speaker.name}</strong><br />
                                    <small>{speaker.organization}</small>
                                    <p>{speaker.about}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No speakers available.</p>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
