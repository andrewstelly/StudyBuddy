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
    e.preventDefault()
    console.log("Form submitted!")
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        // Only on 2xx:
        Cookies.set("auth", "true", { expires: 7 })
        navigate("/home")
      } else {
        // Stay on this page for 4xx/5xx
        alert(data.error || `Login failed (${response.status})`)
      }
    } catch (error) {
      console.error("Error during sign-in:", error)
      alert("Network error – please try again.")
    }
  };
  

  return (
    <div className="sign-in-page"> {/* Wrapper for the background image */}
      <div className="center-container">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-center">
            <img
              src='../Images/StudyBuddyLogo.png'
              alt="Logo"
              className="h-auto w-[375px] p-4"
              width="275" 
              height="275"
            />
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>

          {/* Grouped container for email, password, and buttons */}
          <div className="form-container mt-6 flex flex-col items-center space-y-6">
            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address:
                </label>
                <div className="flex justify-end w-3/4">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-3/4 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password:
                </label>
                <div className="flex justify-end w-3/4">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-3/4 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Buttons grouped inside the container */}
              <div className="button-container flex flex-col w-full">
                <div className="flex justify-between w-full">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none"
                    style={{
                      padding: '10px 2px', // Explicit padding for larger size
                      fontSize: '15px', // Larger font size
                      width: '41%', // Adjust width to fit the layout
                      position: 'relative', // Enable positioning
                      top: '-6px', // Move up by 10px
                      right: '-8px', // Move to the right by 10px
                    }}
                  >
                    Sign in
                  </button>
                  <Link to="/register">
                    <button
                      className="bg-blue-500 text-white rounded-md"
                      style={{
                        padding: '1.3px 2px', // Explicit padding for larger size
                        fontSize: '15px', // Larger font size
                        width: '48%', // Adjust width to fit the layout
                        position: 'relative', // Enable positioning
                        top: '2.5px', // Move up by 10px
                        right: '-12px', // Move to the right by 10px
                      }}
                    >
                      New User? Register Here!
                    </button>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Watermark */}
      <div className="watermark">
        © 2025 StudyBuddy, Inc.
      </div>
    </div>
  );
}