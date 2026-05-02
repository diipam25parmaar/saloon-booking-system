import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="layout" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
        <p className="loading-text">
          <span className="spinner primary"></span> Verifying session…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/booking" replace />;
    }
  }

  return children;
}
