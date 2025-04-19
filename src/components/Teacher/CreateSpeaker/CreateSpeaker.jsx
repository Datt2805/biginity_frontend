import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, verifyEmail } from "../../../utils/formHandlers.js";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import ImageUploader from "../../Common/ImageUploader.jsx";
import "./CreateSpeaker.css";

const CreateSpeaker = () => {
    // State for    form inputs
    const [form, setForm] = useState({
        role: "Speaker", // Default role
        name: "",
        nickname: "",
        email: "",
        otp: "",
        password: "",
        gender: "Male", // Default gender
        about: "",
        organization: "",
    });

    const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
    const [speakerImageUrl, setSpeakerImageUrl] = useState(""); // Stores uploaded image URL
    const [loading, setLoading] = useState(false); // Submission loading state
    const [isEmailValid, setIsEmailValid] = useState(false); // Email validation state
    const [isVerifying, setIsVerifying] = useState(false); // Email verification loading state

    const navigate = useNavigate(); // Navigation hook

    // Function to validate email input
    const validateEmail = (emailValue) => emailValue.trim() !== "";

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "email") {
            setIsEmailValid(validateEmail(value)); // Update email validation state
        }
    };

    // Handle gender selection change
    const handleGenderChange = (e) => {
        setForm((prev) => ({
            ...prev,
            gender: e.target.value,
        }));
    };

    // Function to verify email and send OTP
    const handleVerifyEmail = async (event) => {
        event.preventDefault();
        if (!isEmailValid) return;

        setIsVerifying(true);
        const button = event.target;
        button.disabled = true;

        const response = await verifyEmail(form.email);
        if (response?.success) {
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
                setIsVerifying(false);
                clearInterval(interval);
            }
        }, 1000);
    };

    // Function to handle form submission
    const handleFormSubmit = async (event) => {
        event.preventDefault(); // Prevent default form behavior
        setLoading(true);
    
        // Form validation
        if (!form.name || form.name.length < 3) {
            toast.error("Name must be at least 3 characters long.");
            setLoading(false);
            return;
        }
    
        if (!form.nickname || form.nickname.length < 4) {
            toast.error("Nickname must be at least 4 characters long.");
            setLoading(false);
            return;
        }
    
        if (!form.password || form.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }
    
        if (!form.about || !form.organization) {
            toast.error("Please fill out 'About' and 'Organization' fields.");
            setLoading(false);
            return;
        }
    
        if (!speakerImageUrl) {
            toast.error("Please upload an image before submitting!");
            setLoading(false);
            return;
        }
    
        try {
            console.log("Submitting speaker data:", form);
            const response = await registerUser(form, speakerImageUrl);
    
            if (response?.success) {
                toast.success("Speaker registered successfully!");
                navigate("/dashboard/speaker"); // Navigate after successful registration
            } else {
                toast.error(response?.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error in form submission:", error);
            toast.error("An error occurred while submitting the form.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="user-form">
            <div className="form-container">
                <h2>Register a Speaker</h2>
                <ImageUploader onUploadSuccess={setSpeakerImageUrl} />
                <form onSubmit={handleFormSubmit}>
                    <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                    <input type="text" name="nickname" placeholder="Nickname" value={form.nickname} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    <button className="verify-email-btn" type="button" onClick={handleVerifyEmail} disabled={!isEmailValid}>
                        {isVerifying ? "Verifying..." : "Get OTP"}
                    </button>
                    <input type="number" name="otp" placeholder="OTP" value={form.otp} onChange={handleChange} required />
                    <select name="gender" value={form.gender} onChange={handleGenderChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <input type="hidden" name="role" value="Speaker" />
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                    <label htmlFor="about">About Speaker <span style={{ color: "red" }}>*</span></label>
                    <textarea id="about" name="about" value={form.about} onChange={handleChange} required></textarea>
                    <label htmlFor="organization">Organization <span style={{ color: "red" }}>*</span></label>
                    <input type="text" id="organization" name="organization" value={form.organization} onChange={handleChange} required />
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? "Submitting..." : "Register"}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );  
};

export default CreateSpeaker;