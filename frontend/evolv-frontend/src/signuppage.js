import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './elogo.png';
import './signuppage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    profession: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  const professions = ['Developer', 'Designer', 'Lawyer', 'Student','Doctor'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (
      formData.firstname &&
      formData.lastname &&
      formData.username &&
      formData.profession &&
      formData.dob
    ) {
      setStep(2);
    } else {
      alert('Please fill all fields before proceeding.');
    }
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.text();
      if (data === 'signup successful') {
        navigate('/home');
      } else {
        alert('Signup failed');
      }
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} className="auth-logo" alt="Evolv Logo" />
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Join the EVOLV community</p>
        </div>

        {step === 1 && (
          <div className="auth-form">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input
                type="text"
                name="firstname"
                className="input-field"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input
                type="text"
                name="lastname"
                className="input-field"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                name="username"
                className="input-field"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Profession</label>
              <select
                name="profession"
                className="input-field"
                value={formData.profession}
                onChange={handleChange}
                required
              >
                <option value="">Select Profession</option>
                {professions.map((prof) => (
                  <option key={prof} value={prof.toLowerCase()}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Date of Birth</label>
              <input
                type="date"
                name="dob"
                className="input-field"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="submit-btn"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="auth-form">
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="back-btn"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="submit-btn"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignupPage;