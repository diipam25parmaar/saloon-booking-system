import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or expired password reset link.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await resetPassword({ token, email, password, password_confirmation: passwordConfirmation });
      setMessage(res.data.message || 'Password reset successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Try again.');
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
            Reset Password
          </h2>
          <p className="info">Enter your new password below</p>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!searchParams.get('email')}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              required
              minLength="8"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reset-confirm">Confirm Password</label>
            <input
              id="reset-confirm"
              type="password"
              required
              minLength="8"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repeat your new password"
            />
          </div>

          <button id="reset-submit" type="submit" disabled={loading} className="btn-full" style={{ marginTop: '4px' }}>
            {loading ? <><span className="spinner"></span> Resetting…</> : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link to="/login" className="link">← Back to Login</Link>
        </div>

      </div>
    </div>
  );
}
