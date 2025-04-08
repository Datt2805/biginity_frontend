// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { uploadFile } from "../../services/api"; // Import uploadFile from api.js

const ImageUploader = ({ onUploadSuccess }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file)); // Show preview
  };

  const successCallback = (data) => {
    setUploadedImageUrl(data.url); // Set the uploaded image URL
    onUploadSuccess(data.url); // Call the success callback with the data
    toast.success("Image uploaded successfully!");
  } 
  const errorCallback = (error) => {
    toast.error("Image upload failed: " + error.message);
    console.error("Error uploading image:", error); // wah !
  } 

  return (
    <form onSubmit={uploadFile.handler(successCallback, errorCallback)}>
      <label htmlFor="eventImage">
        Upload Event Image <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="file"
        id="eventImage"
        name="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Image Preview */}
      {imagePreview && (
        <div className="image-preview">
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(imagePreview);
              setImagePreview(null);
              setSelectedFile(null);
              setUploadedImageUrl("");
              onUploadSuccess(""); 
            }}
          >
            Remove Image
          </button>
          <img src={imagePreview} alt="Event Preview" />
        </div>
      )}

      <button type="submit">Upload</button>

      {/* Hidden Input for Form Submission */}
      {uploadedImageUrl && <input type="hidden" name="image_url" value={uploadedImageUrl} />}
    </form>
  );
};
ImageUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

export default ImageUploader;

