
import { makeRequest, setItemWithExpiry } from "../services/api";
import { toast } from "react-toastify";

export const registerUser = async (event, navigate, speakerImageUrl) => {
  event.preventDefault();

  const form = event.target;

  const data = {
    name: form.name?.value,
    nickname: form.nickname?.value,
    email: form.email?.value,
    otp: form.otp?.value,
    password: form.password?.value,
    role: form.role?.value,
    gender: form.gender?.value,
  };

  if (!data.role) return toast.error("Role is required.");
  if (!data.email || !data.password) return toast.error("Email and password are required.");
  if (!data.nickname) return toast.error("Nickname is required.");
  if (!["Student", "Teacher", "Speaker"].includes(data.role)) return toast.error("Invalid role selected.");

  // Student-specific fields
  if (data.role === "Student") {
    data.branch = form.branch?.value;
    data.year = form.year?.value;
    data.stream = form.stream?.value;
    data.enrollment_id = form.enrollment_id?.value;

    if (!data.branch || !data.year || !data.enrollment_id || !data.stream) {
      return toast.error("Please fill all student fields.");
    }
  }

  // Teacher-specific field
  if (data.role === "Teacher") {
    data.title = form.title?.value;
    if (!data.title) return toast.error("Please select a title.");
  }

  // Speaker-specific fields
  if (data.role === "Speaker") {
    if (!speakerImageUrl) return toast.error("Speaker image is required.");
    data.image = speakerImageUrl;
    data.about = form.about?.value;
    data.organization = form.organization?.value;

    if (!data.about || !data.organization) {
      return toast.error("Please fill out 'About' and 'Organization' fields.");
    }
  }

  try {
    console.log("Submitting speaker data:", data);
    const response = await makeRequest("/api/auth/register", "POST", data);

    if (!response || !response.token) {
      throw new Error("Registration failed.");
    }

    setItemWithExpiry("token", response.token, 15 * 86400000);
    localStorage.setItem("role", data.role);

    toast.success("Registration successful!");
    navigate(data.role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");

    return { success: true };
  } catch (err) {
    toast.error(err.message || "Something went wrong.");
    return { success: false };
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
