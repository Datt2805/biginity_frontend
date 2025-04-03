
import { makeRequest, setItemWithExpiry } from "../services/api";

export const registerUser = async (event, navigate) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  console.log("Form Data Submitted:", data);

  if (!data.role) {
    console.error("Role is required.");
    return;
  }

  if (!data.email || !data.password) {
    console.error("Email and password are required.");
    return;
  }

  if (data.role !== "Student" && data.role !== "Teacher") {
    console.error("Invalid role. Must be 'Student' or 'Teacher'.");
    return;
  }

  if (data.role === "Student") {
    if (!data.branch || !data.year || !data.enrollment_id) {
      console.error("Missing student-specific fields:", {
        branch: data.branch,
        year: data.year,
        enrollment_id: data.enrollment_id,
      });
      return;
    }
  }

  try {
    const response = await makeRequest("/api/auth/register", "POST", data);
    if (!response || !response.token) {
      throw new Error("Invalid response from server.");
    }

    console.log("Registration successful:", response.token);
    setItemWithExpiry("token", response.token, 15 * 86400000);
    localStorage.setItem("role", data.role);
    navigate(data.role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");
  } catch (error) {
    console.error("Registration failed:", error?.message || "Unknown error", error?.response || "No server response");
  }
};

export const logInUser = async (event, navigate) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  if (!data.email || !data.password) {
    console.error("Email and password are required.");
    return;
  }

  if (!data.role || (data.role !== "Student" && data.role !== "Teacher")) {
    console.error("Invalid or missing role.");
    return;
  }

  try {
    const response = await makeRequest("/api/auth/login", "POST", data);
    if (!response || !response.token) {
      throw new Error("Invalid response from server.");
    }

    setItemWithExpiry("token", response.token, 15 * 86400000);
    localStorage.setItem("role", data.role);
    navigate(data.role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");
  } catch (error) {
    console.error("Login failed:", error?.message || "Unknown error", error?.response || "No server response");
  }
};

export const verifyEmail = async (email) => {
  if (!email) {
    console.error("Email is required for verification.");
    return null;
  }

  try {
    const response = await makeRequest("/api/auth/otp", "POST", { email, purpose: "verification" });
    if (!response) {
      throw new Error("No response from server.");
    }
    return response;
  } catch (error) {
    console.error("Verification failed:", error?.message || "Unknown error", error?.response || "No server response");
    return null;
  }
};
