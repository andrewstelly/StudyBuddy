import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import './SignIn.css'; // Import the CSS file

export default function SignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted!");
    // Set a cookie to indicate the user is logged in
    Cookies.set("auth", "true", { expires: 7 }); // Cookie expires in 7 days
    // Redirect to home page after successful sign-in
    navigate("/home");
  };

  return (
    <div className="center-container">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <div className="flex justify-center">
          <img
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            alt="Logo"
            className="h-20 w-auto -mt-1"
            width="175" 
            height="175"
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
              required
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none mt-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}