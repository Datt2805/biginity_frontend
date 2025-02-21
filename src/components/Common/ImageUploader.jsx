// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadFile, hostSocket } from "../../services/api"; // Import uploadFile from api.js

// eslint-disable-next-line react/prop-types
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

  const handleSubmit = async (event) => {
    event.preventDefault(); // 🛑 Prevent form refresh (Fix redirect issue)

    if (!selectedFile) {
      toast.error("Please select a file before submitting.");
      return;
    }

    // Manually create FormData to pass to uploadFile
    const formData = new FormData();
    formData.append("file", selectedFile);

    await uploadFile(
      { target: { elements: { file: { files: [selectedFile] } } }, preventDefault: () => {} },
      (data) => {
        setUploadedImageUrl(data.url);
        onUploadSuccess(data.url);
        toast.success("Image uploaded successfully!");
        console.log(data.url);
      },
      (error) => {
        toast.error("Image upload failed: " + error.message);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="eventImage">
        Upload Event Image <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="file"
        id="eventImage"
        name="file"
        accept="image/*"
        onChange={handleFileChange} // Fix: Handle file selection properly
        required
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
            }}
          >
            Remove Image
          </button>
          <img src={`${hostSocket}/uploads/${uploadedImageUrl}`} alt="Event Preview" />
        </div>
      )}

      <button type="submit">Upload</button>

      {/* Hidden Input for Form Submission */}
      {uploadedImageUrl && <input type="hidden" name="image_url" value={uploadedImageUrl} />}
    </form>
  );
};

export default ImageUploader;
