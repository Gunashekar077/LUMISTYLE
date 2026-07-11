import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEye, 
  FaEyeSlash, 
  FaCheck, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaArrowLeft,
  FaSun,
  FaMoon
} from "react-icons/fa6";
import { authService } from "../services/api";
import "./SignIn.css";

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  
  // Toggle between login and register
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Error and UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Theme Sync inside Sign In
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  // Mouse Parallax Offset
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devCodeMessage, setDevCodeMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sync theme
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Track Mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 40;
      const y = (e.clientY - window.innerHeight / 2) / 40;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };
  const strengthScore = getPasswordStrength(password);
  const getStrengthLabel = (score) => {
    if (score === 0) return { label: "", color: "transparent" };
    if (score === 1) return { label: "Weak", color: "#ef4444" };
    if (score === 2) return { label: "Fair", color: "#eab308" };
    if (score === 3) return { label: "Good", color: "#3b82f6" };
    return { label: "Strong", color: "#10b981" };
  };
  const strengthDetails = getStrengthLabel(strengthScore);

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (isRegistering && !name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    
    // Clear errors
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setApiError(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      let data;
      if (isRegistering) {
        data = await authService.register(name, email, password);
      } else {
        data = await authService.login(email, password);
      }
      
      setIsLoading(false);
      setIsSuccess(true);
      
      localStorage.setItem("isAuthenticated", "true");
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || `Failed to ${isRegistering ? 'register' : 'sign in'}. Please check your credentials.`;
      setApiError(message);
      console.error('Authentication Error:', err);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setErrors({});

    try {
      const data = await authService.forgotPassword(email);
      setIsLoading(false);
      setResetEmail(email);
      setResetStep(2);
      if (data.devCode) {
        setDevCodeMessage(`Development Mode: Your verification code is ${data.devCode}`);
      }
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || "Failed to generate verification code. Please check the email address.";
      setApiError(message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!verificationCode.trim()) {
      newErrors.code = "Verification code is required";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setErrors({});

    try {
      await authService.resetPassword(resetEmail, verificationCode, newPassword);
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setIsForgotPassword(false);
        setResetStep(1);
        setVerificationCode("");
        setNewPassword("");
        setDevCodeMessage("");
        setEmail("");
        setPassword("");
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || "Failed to reset password. Please check the verification code.";
      setApiError(message);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setApiError(null);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setResetStep(1);
    setResetEmail("");
    setVerificationCode("");
    setNewPassword("");
    setDevCodeMessage("");
    setErrors({});
    setApiError(null);
    setEmail("");
  };

  return (
    <div className="signin-container">
      {/* Premium Luxury Background elements */}
      <div className="signin-background">
        <div className="bg-mesh" style={{ transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)` }}></div>
        <div className="bg-blob blob-1" style={{ transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)` }}></div>
        <div className="bg-blob blob-2" style={{ transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px, 0)` }}></div>
        <div className="bg-blob blob-3" style={{ transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)` }}></div>
        
        {/* Transparent Geometric Shapes */}
        <div className="bg-shapes" style={{ transform: `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0)` }}>
          <div className="bg-shape shape-circle"></div>
          <div className="bg-shape shape-square"></div>
          <div className="bg-shape shape-triangle"></div>
        </div>

        {/* Low-Opacity SVGs for Luxury Fashion Items */}
        <div className="bg-illustrations" style={{ transform: `translate3d(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px, 0)` }}>
          <svg className="f-ill ill-hanger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3zm0 3v2M2 17h20L12 7 2 17zM12 17v4" />
          </svg>
          <svg className="f-ill ill-bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
          <svg className="f-ill ill-sneaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 12h3l3-4h4l3 4h5M3 12v6h18v-6" />
          </svg>
          <svg className="f-ill ill-perfume" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M8 8h8v12H8zM10 8V5h4v3M12 5h.01" />
          </svg>
        </div>

        {/* Animated Particles */}
        <div className="bg-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`bg-particle particle-${i+1}`} style={{ transform: `translate3d(${mousePos.x * (i % 2 === 0 ? 0.3 : -0.3)}px, ${mousePos.y * (i % 2 === 0 ? -0.3 : 0.3)}px, 0)` }}></div>
          ))}
        </div>
      </div>


      {/* Frost glass sign in card */}
      <div 
        className="signin-card" 
        style={{ 
          transform: `translate3d(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px, 0) rotateX(${-mousePos.y * 0.08}deg) rotateY(${mousePos.x * 0.08}deg)` 
        }}
      >
        {isSuccess ? (
          <div className="success-checkmark">
            <div className="checkmark-circle">
              <FaCheck />
            </div>
            <h3>
              {isForgotPassword 
                ? "Password Reset Successful!" 
                : isRegistering 
                  ? "Registered Successfully!" 
                  : "Signed In Successfully!"}
            </h3>
            <p>
              {isForgotPassword 
                ? "Returning you to the sign in page..." 
                : "Redirecting you to the home page..."}
            </p>
          </div>
        ) : isForgotPassword ? (
          <>
            <div className="signin-header">
              <span className="brand-subtitle">THE ART OF COUTURE</span>
              <h2>{resetStep === 1 ? "Reset Password" : "New Credentials"}</h2>
              <p>
                {resetStep === 1 
                  ? "Enter your email to receive a password reset code" 
                  : "Enter the code and your new password"}
              </p>
            </div>

            {apiError && <div className="error-alert">{apiError}</div>}
            {devCodeMessage && <div className="dev-alert">{devCodeMessage}</div>}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestCode} className="signin-form" noValidate>
                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="reset-email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "input-error" : ""}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <button type="submit" className="signin-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Sending code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="signin-form" noValidate>
                <div className="form-group">
                  <label htmlFor="reset-code">Verification Code</label>
                  <div className="input-wrapper">
                    <FaCheck className="input-icon" />
                    <input
                      type="text"
                      id="reset-code"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (errors.code) setErrors(prev => { const n = {...prev}; delete n.code; return n; });
                        setApiError(null);
                      }}
                      className={errors.code ? "input-error" : ""}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.code && <span className="error-text">{errors.code}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors(prev => { const n = {...prev}; delete n.newPassword; return n; });
                        setApiError(null);
                      }}
                      className={errors.newPassword ? "input-error" : ""}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      title={showNewPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                </div>

                <button type="submit" className="signin-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            <div className="signup-prompt">
              <button onClick={toggleForgotPassword} className="prompt-action-btn">
                <FaArrowLeft style={{ marginRight: '6px', fontSize: '0.8rem' }} /> Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="signin-header">
              <span className="brand-subtitle">THE ART OF COUTURE</span>
              <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
              <p>{isRegistering ? "Join the inner fashion circle today" : "Sign in to access your luxury wardrobe"}</p>
            </div>

            {apiError && <div className="error-alert">{apiError}</div>}

            <form onSubmit={handleSubmit} className="signin-form" noValidate>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "input-error" : ""}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "input-error" : ""}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "input-error" : ""}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}

                {/* Password Strength Indicator (Sign Up Only) */}
                {isRegistering && password && (
                  <div className="strength-indicator-wrapper">
                    <div className="strength-bars">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i} 
                          className="strength-bar" 
                          style={{ 
                            backgroundColor: i < strengthScore ? strengthDetails.color : "rgba(255,255,255,0.08)"
                          }}
                        ></div>
                      ))}
                    </div>
                    {strengthDetails.label && (
                      <span className="strength-label" style={{ color: strengthDetails.color }}>
                        {strengthDetails.label}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!isRegistering && (
                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#forgot"
                    className="forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleForgotPassword();
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
              )}

              <button type="submit" className="signin-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    {isRegistering ? "Creating Account..." : "Signing in..."}
                  </>
                ) : (
                  isRegistering ? "Create Account" : "Sign In"
                )}
              </button>
            </form>



            <div className="signup-prompt">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={toggleMode} className="prompt-action-btn font-semibold">
                {isRegistering ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;
