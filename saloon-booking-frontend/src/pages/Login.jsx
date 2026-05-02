import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate('/booking');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout single-view">
      <div className="card">

        <div className="text-center mb-4">
          <h2 style={{ marginBottom: '6px', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome Back
          </h2>
          <p className="info">Sign in to your account to continue</p>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button id="login-submit" type="submit" disabled={loading} className="btn-full" style={{ marginTop: '4px' }}>
            {loading ? <><span className="spinner"></span> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="flex-between mt-4 text-sm">
          <Link to="/forgot-password" className="link">Forgot Password?</Link>
          <Link to="/register" className="link">Create account →</Link>
        </div>

      </div>
    </div>
  );
}
