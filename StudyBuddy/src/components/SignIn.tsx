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
        console.log("Form submitted!");
    // Set a cookie to indicate the user is logged in
    Cookies.set("auth", "true", { expires: 7 }); // Cookie expires in 7 days
    // Redirect to home page after successful sign-in
    navigate("/home");
    
    // Send a POST request to the backend for authentication
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // If authentication is successful, set a cookie and navigate to the home page
        Cookies.set("auth", "true", { expires: 7 });
        navigate("/home");
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      alert('Error signing in');
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

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-4 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none mt-2"
              >
                Sign in
              </button>
            </div>
            <div>
              <Link to="/register">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  New User? Register Here!
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
