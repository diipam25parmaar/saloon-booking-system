import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message || 'Password reset link sent! Check your inbox.');
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to send reset link. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout single-view">
      <div className="card">

        <div className="text-center mb-4">
          <h2 style={{ marginBottom: '6px', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Forgot Password
          </h2>
          <p className="info">Enter your email and we'll send a reset link</p>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button id="forgot-submit" type="submit" disabled={loading} className="btn-full" style={{ marginTop: '4px' }}>
            {loading ? <><span className="spinner"></span> Sending…</> : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link to="/login" className="link">← Back to Login</Link>
        </div>

      </div>
    </div>
  );
}
