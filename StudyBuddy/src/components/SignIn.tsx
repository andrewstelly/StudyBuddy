import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import '../components/Styling/SignIn.css';
import { Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for session management
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("auth", "true", { expires: 7 });
        navigate("/home");
      } else {
        alert(data.error || `Login failed (${response.status})`);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("Network error – please try again.");
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <img src="../Images/StudyBuddyLogo.png" alt="StudyBuddy Logo" />
        <h2>Login</h2>

        <form onSubmit={handleSubmit} className="signin-form">
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">Sign In</button>

          <div className="signin-link">
            <Link to="/register">
              <button type="button" className="settings-button">
                New user? Register here!
              </button>
            </Link>
          </div>
        </form>
      </div>

      <div className="signin-watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
}
