import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import { useBookingData } from './hooks/useBookingData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import BookingSection from './components/BookingSection';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded components for Code Splitting (Performance Optimization)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminSection = lazy(() => import('./components/AdminSection'));
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'));
const BookingsAdmin = lazy(() => import('./pages/admin/BookingsAdmin'));

function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        <h1>Saloon Booking Scheduler</h1>
      </NavLink>
      <div className="nav-links">
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "active-nav" : ""}>Admin Dashboard</NavLink>
        )}
        {!user ? (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? "active-nav" : ""}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? "active-nav" : ""}>Register</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/booking" className={({ isActive }) => isActive ? "active-nav" : ""}>Book</NavLink>
            <button onClick={handleLogout} className="btn-ghost">Logout ({user.name})</button>
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const {
    categories,
    services,
    slots,
    slotsLoading,
    slotsError,
    appointments,
    rules,
    rulesLoading,
    ruleMessage,
    setRuleMessage,
    ruleError,
    setRuleError,
    loadRules,
    fetchSlotsAndAppointments
  } = useBookingData();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingServiceId, setBookingServiceId] = useState("");

  const handleFetchSlots = () => {
    fetchSlotsAndAppointments(bookingDate, bookingServiceId);
  };

  return (
    <div className="app-container">
      <Navigation />
      <div className="data-layout">
        <Suspense fallback={
          <div className="layout" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
            <p className="loading-text"><span className="spinner primary"></span> Loading…</p>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/booking" replace />} />
            <Route
              path="/booking"
              element={
                <ProtectedRoute roleRequired="customer">
                  <div className="layout" style={{ animation: 'fadeUp 0.35s ease-out both' }}>
                    <BookingSection
                      categories={categories}
                      services={services}
                      slots={slots}
                      slotsLoading={slotsLoading}
                      slotsError={slotsError}
                      bookingDate={bookingDate}
                      setBookingDate={setBookingDate}
                      bookingServiceId={bookingServiceId}
                      setBookingServiceId={setBookingServiceId}
                      onFetchSlots={handleFetchSlots}
                      fetchSlotsAndAppointments={fetchSlotsAndAppointments}
                    />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <AdminSection
                    rules={rules}
                    rulesLoading={rulesLoading}
                    ruleMessage={ruleMessage}
                    setRuleMessage={setRuleMessage}
                    ruleError={ruleError}
                    setRuleError={setRuleError}
                    loadRules={loadRules}
                    appointments={appointments}
                    slots={slots}
                    bookingDate={bookingDate}
                    setBookingDate={setBookingDate}
                    fetchSlotsAndAppointments={fetchSlotsAndAppointments}
                    onRuleCreated={() => {
                      if (bookingDate) {
                        fetchSlotsAndAppointments(bookingDate, bookingServiceId);
                      }
                    }}
                  />
                }
              />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="bookings" element={<BookingsAdmin />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
