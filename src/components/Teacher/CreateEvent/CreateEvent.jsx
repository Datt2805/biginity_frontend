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

    try {
      const formData = new FormData(e.target);
      if (uploadedImageUrl) {
        formData.append("image", uploadedImageUrl);
      }

      await createEvent(formData);
      toast.success("Event created successfully!");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <h2>Create Event</h2>
      <form id="createEvent" onSubmit={handleSubmit}>
        {/* Mandatory Field */}
        <label>
          <input type="checkbox" name="mandatory" /> Mandatory
        </label>

        {/* Title */}
        <div>
          <label htmlFor="title">
            Title <span style={{ color: "red" }}>*</span>
          </label>
          <input type="text" id="title" name="title" required />
        </div>

        {/* Description */}
        <fieldset>
          <legend>Description</legend>

          {/* Objectives */}
          <div>
            <label htmlFor="objectives">
              Objectives <span style={{ color: "red" }}>*</span>
            </label>
            <textarea id="objectives" name="objectives" required></textarea>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label htmlFor="learning_outcomes">
              Learning Outcomes <span style={{ color: "red" }}>*</span>
            </label>
            <textarea id="learning_outcomes" name="learning_outcomes" required></textarea>
          </div>
        </fieldset>

        {/* Start Time */}
        <div>
          <label htmlFor="start_time">
            Start Time <span style={{ color: "red" }}>*</span>
          </label>
          <input type="datetime-local" id="start_time" name="start_time" required />
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="end_time">
            End Time <span style={{ color: "red" }}>*</span>
          </label>
          <input type="datetime-local" id="end_time" name="end_time" required />
        </div>

        {/* Location */}
        <fieldset>
          <legend>Location</legend>

          {/* Address */}
          <div>
            <label htmlFor="address">
              Address <span style={{ color: "red" }}>*</span>
            </label>
            <input type="text" id="address" name="address" required />
          </div>

          {/* Latitude */}
          <div>
            <label htmlFor="lat">Latitude</label>
            <input type="number" id="lat" name="lat" />
          </div>

          {/* Longitude */}
          <div>
            <label htmlFor="long">Longitude</label>
            <input type="number" id="long" name="long" />
          </div>
        </fieldset>

        {/* Image Upload Component */}
        <ImageUploader onUploadSuccess={setUploadedImageUrl} />

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Event"}
        </button>
      </form>

      {/* Toast container to display messages */}
      <ToastContainer />
    </div>
  );
};

export default CreateEvent;
