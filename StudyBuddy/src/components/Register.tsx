import { useState } from 'react';
import './Styling/Register.css';
import { Link } from 'react-router-dom';

const Register = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error signing up');
    }
  };

  return (
    <div className="register-page">
      <div className="center-container">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-center">
            <img
              src="../Images/StudyBuddyLogo.png"
              alt="Logo"
              className="h-auto w-[375px] p-4"
              width="275"
              height="275"
            />
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:outline-none"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition"
              >
                Sign Up
              </button>
            </div>

            <div className="text-center">
              <Link to="/">
                <button type="button" className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                  Have an account? Login here!
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
