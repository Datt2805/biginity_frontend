
import { makeRequest, setItemWithExpiry } from "../services/api";
import { toast } from "react-toastify";

export const registerUser = async (event, navigate, speakerImageUrl) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  if (!data.role) {
    toast.error("Role is required.");
    return;
  }
  if (!data.email || !data.password) {
    toast.error("Email and password are required.");
    return;
  }
  if (!["Student", "Teacher", "Speaker"].includes(data.role)) {
    toast.error("Invalid role selected.");
    return;
  }
  if (data.role === "Student" && (!data.branch || !data.year || !data.enrollment_id)) {
    toast.error("Missing student-specific fields.");
    return;
  }
  if (data.role === "Speaker" && !speakerImageUrl) {
    toast.error("Please upload a speaker image before submitting.");
    return;
  }

  // Append image URL if available
  if (speakerImageUrl) {
    formData.append("image_url", speakerImageUrl);
  }

  try {
    const response = await makeRequest(
      "/api/auth/register",
      "POST",
      Object.fromEntries(formData.entries())
    );
    if (!response || !response.token) {
      throw new Error("Invalid response from server.");
    }

    setItemWithExpiry("token", response.token, 15 * 86400000);
    localStorage.setItem("role", data.role);
    toast.success("Registration successful! Redirecting...");
    navigate(data.role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");
  } catch (error) {
    toast.error(error?.message || "Registration failed. Try again.");
  }
};



export const logInUser = async (event, navigate) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  if (!data.email || !data.password) {
    toast.error("Email and password are required.");
    return;
  }
  if (!data.role || !["Student", "Teacher", "Speaker"].includes(data.role)) {
    toast.error("Invalid or missing role.");
    return;
  }

  try {
    const response = await makeRequest("/api/auth/login", "POST", data);
    if (!response || !response.token) {
      throw new Error("Invalid response from server.");
    }

    setItemWithExpiry("token", response.token, 15 * 86400000);
    localStorage.setItem("role", data.role);
    toast.success("Login successful! Redirecting...");
    navigate(data.role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");
  } catch (error) {
    toast.error("Invalid email, password, or role. Please try again."+ error);
  }
};

export const verifyEmail = async (email) => {
  if (!email) {
    toast.error("Email is required for verification.");
    return null;
  }
  try {
    const response = await makeRequest("/api/auth/otp", "POST", { email, purpose: "verification" });
    if (!response) {
      throw new Error("No response from server.");
    }
    toast.success("Verification email sent!");
    return response;
  } catch {
    toast.error("Verification failed. Please try again.");
    return null;
  }
};
