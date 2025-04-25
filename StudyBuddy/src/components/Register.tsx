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
      <div className="register-container">
        <img src="../Images/StudyBuddyLogo.png" alt="StudyBuddy Logo" />
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Sign Up
          </button>

          <div className="text-center">
            <Link to="/">
              <button type="button" className="settings-button">
                Have an account? Login here!
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
