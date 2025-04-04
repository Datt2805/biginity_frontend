// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "./CreateEvent.css";
import { createEvent } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUploader from "../../Common/ImageUploader";

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    
    if (uploadedImageUrl) {
      formData.append("image_url", uploadedImageUrl);
    }

    try {
      await createEvent(
        e, (data) => {
          toast.success("Event created successfully!");
          console.log("Event Data:", data);
        },
        (error) => {
          toast.error("Failed to create event: " + error.message);
        }
      );
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <h2>Create Event</h2>
      <form id="createEvent" onSubmit={handleSubmit}>
        <label>
          <input type="checkbox" name="mandatory" defaultChecked /> Mandatory
        </label>

        <div>
          <label htmlFor="title">
            Title <span style={{ color: "red" }}>*</span>
          </label>
          <input type="text" id="title" name="title" required />
        </div>

        <fieldset>
          <legend>Description</legend>
          <div>
            <label htmlFor="objectives">
              Objectives <span style={{ color: "red" }}>*</span>
            </label>
            <textarea id="objectives" name="objectives" required></textarea>
          </div>
          <div>
            <label htmlFor="learning_outcomes">
              Learning Outcomes <span style={{ color: "red" }}>*</span>
            </label>
            <textarea id="learning_outcomes" name="learning_outcomes" required></textarea>
          </div>
        </fieldset>

        <div>
          <label htmlFor="start_time">Start Time *</label>
          <input type="datetime-local" id="start_time" name="start_time" required />
        </div>

        <div>
          <label htmlFor="end_time">End Time *</label>
          <input type="datetime-local" id="end_time" name="end_time" required />
        </div>

        <fieldset>
          <legend>Location</legend>
          <div>
            <label htmlFor="address">Address *</label>
            <input type="text" id="address" name="address" required />
          </div>
          <div>
            <label htmlFor="lat">Latitude</label>
            <input type="number" id="lat" name="lat" step="any" />
          </div>
          <div>
            <label htmlFor="long">Longitude</label>
            <input type="number" id="long" name="long" step="any" />
          </div>
        </fieldset>

        <ImageUploader onUploadSuccess={setUploadedImageUrl} />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Event"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateEvent;
