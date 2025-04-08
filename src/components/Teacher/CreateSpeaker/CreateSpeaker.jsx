import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, verifyEmail } from "../../../utils/formHandlers.js";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import ImageUploader from "../../Common/ImageUploader.jsx";
import "./CreateSpeaker.css";

const CreateSpeaker = () => {
    const [formData, setFormData] = useState({
        name: "",
        nickname: "",
        email: "",
        otp: "",
        password: "",
        about: "",
        organization: "",
        role: "Speaker",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [speakerImageUrl, setSpeakerImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();

    const validateEmail = (emailValue) => emailValue.trim() !== "";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedFormData = { ...prev, [name]: value };
            console.log("Updated formData:", updatedFormData);
            return updatedFormData;
        });

        if (name === "email") {
            setIsEmailValid(validateEmail(value));
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (!isEmailValid) return;

        setIsVerifying(true);
        const button = e.target;
        button.disabled = true;

        const response = await verifyEmail(formData.email);
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log("Form Data before submission:", formData);

        const { name, nickname, password } = formData;

        if (!name || name.length < 3) {
            toast.error("Name must be at least 3 characters long.");
            setLoading(false);
            return;
        }

        if (!nickname || nickname.length < 4) {
            toast.error("Nickname must be at least 4 characters long.");
            setLoading(false);
            return;
        }

        if (!password || password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        if (!speakerImageUrl) {
            toast.error("Please upload an image before submitting!");
            setLoading(false);
            return;
        }

        const submissionData = { ...formData, speakerImageUrl };

        if (!submissionData || Object.keys(submissionData).length === 0) {
            toast.error("Form data is missing. Please check your inputs.");
            setLoading(false);
            return;
        }

        try {
            console.log("Submitting data:", submissionData);
            const response = await registerUser(submissionData, navigate);

            if (response?.success) {
                toast.success("Speaker registered successfully!");
                navigate("/dashboard/speaker");
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
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                    <input type="text" name="nickname" placeholder="Nickname" value={formData.nickname} onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                    <button className="verify-email-btn" type="button" onClick={handleVerifyEmail} disabled={!isEmailValid}>
                        {isVerifying ? "Verifying..." : "Get OTP"}
                    </button>
                    <input type="number" name="otp" placeholder="OTP" value={formData.otp} onChange={handleChange} />
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                    <label htmlFor="about">
                        About Speaker <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea id="about" name="about" value={formData.about} onChange={handleChange} required></textarea>
                    <label htmlFor="organization">
                        Organization <span style={{ color: "red" }}>*</span>
                    </label>
                    <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} required />
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
