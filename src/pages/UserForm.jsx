// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logInUser, registerUser, verifyEmail } from "../utils/formHandlers.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUploader from "../components/Common/ImageUploader.jsx"
import "./UserForm.css";

const UserForm = () => {
  const [formType, setFormType] = useState("register");
  const [role, setRole] = useState("Student");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const navigate = useNavigate();
  
  const [speakerImageUrl, setSpeakerImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      navigate(role === "Teacher" ? "/TeacherDashboard" : "/StudentDashboard");
    }
  }, [navigate]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      if (formType === "register") {
        if (!validateNickname(nickname)) {
          toast.error("Nickname must be at least 4 characters long.");
          setLoading(false);
          return;
        }
  
        if (!validatePassword(password)) {
          toast.error(
            "Password must be at least 8 characters and include a letter, a number, and a special character."
          );
          setLoading(false);
          return;
        }
  
        if (role === "Speaker" && !speakerImageUrl) {
          toast.error("Please upload an image before submitting!");
          setLoading(false);
          return;
        }
  
        const response = await registerUser(event, navigate, speakerImageUrl);
        if (response?.success) {
          toast.success("Registration successful! Please log in.");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        const response = await logInUser(event, navigate);
        if (!response?.success) {
          toast.error("Invalid email or password.");
        } else {
          toast.success("Login successful!");
        }
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };
  

  const validateEmail = (emailValue = email) => emailValue.trim() !== "";

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  }

  const handleVerifyEmail = async (event) => {
    event.preventDefault();
    if (!isEmailValid) return;
    const button = event.target;
    button.disabled = true;
    const response = await verifyEmail(email);
    if (response && response.success) {
      toast.success("Verification email sent!");
    } else {
      toast.error("Email verification failed. Please try again.");
    }
    let countdown = 15;
    const interval = setInterval(() => {
      button.innerText = `Try again after ${countdown}s`;
      countdown--;
      if (countdown <= 0) {
        button.innerText = "Get OTP";
        button.disabled = false;
        clearInterval(interval);
      }
    }, 1000);
  };

  const validateNickname = (nickname) => nickname.length >= 4;
  const validatePassword = (password) => password.length >= 8;
  // /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  return (
    <div className="user-form">
      <div className="form-container">
        <div className="toggle-buttons">
          <button
            onClick={() => setFormType("register")}
            className={formType === "register" ? "active" : ""}
          >
            Register
          </button>
          <button
            onClick={() => setFormType("login")}
            className={formType === "login" ? "active" : ""}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          {formType === "register" && (
            <>
              <input type="text" name="name" placeholder="Name" />
              <input
                type="text"
                name="nickname"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={!isEmailValid}
              >
                Get OTP
              </button>
              <input type="number" name="otp" placeholder="OTP" />
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <select name="role" value={role} onChange={handleRoleChange}>
                <option value="Teacher">Teacher</option>
                <option value="Speaker">Speaker</option>
                <option value="Student">Student</option>
              </select>

              <select name="gender" value={gender} onChange={handleGenderChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>


              {role === "Student" && (
                <>
                  <input name="branch" placeholder="Branch" />
                  <input
                    name="year"
                    type="number"
                    min="2022"
                    max="2050"
                    placeholder="Year"
                  />
                  <input name="stream" placeholder="Stream" />
                  <input name="enrollment_id" placeholder="Enrollment ID" />
                </>
              )}
              {role === "Teacher" && (
                <select name="title" id="register-title" placeholder="Title">
                  <option value="Program Coordinator">Program Coordinator</option>
                  <option value="Head Of Department">Head Of Department</option>
                  <option value="Dean">Dean</option>
                  <option value="Provost">Provost</option>
                  <option value="President">President</option>
                </select>
              )}{role === "Speaker" && (
  <div>
    {/* Upload Speaker Image */}
    <label>
      Upload Speaker Image <span style={{ color: "red" }}>*</span>
    </label>
    <ImageUploader onUploadSuccess={setSpeakerImageUrl} />

    {/* Show uploaded preview */}
    {speakerImageUrl && (
      <div className="image-preview">
        <img src={speakerImageUrl} alt="Speaker" width={200} />
      </div>
    )}

    <label htmlFor="objectives">
      About Speaker <span style={{ color: "red" }}>*</span>
    </label>
    <textarea id="about" name="about" required></textarea>

    <label htmlFor="organization">
      Organization <span style={{ color: "red" }}>*</span>
    </label>
    <input type="text" id="organization" name="organization" required />
  </div>
)}

            </>
          )}

          {formType === "login" && (
            <>
              <input
                type="text"
                name="nickname"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
              <select name="role" value={role} onChange={handleRoleChange}>
                <option value="Teacher">Teacher</option>
                <option value="Speaker">Speaker</option>
                <option value="Student">Student</option>
              </select>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          )}

          <button type="submit">
            {formType === "register" ? "Register" : "Login"}
          </button>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default UserForm;



