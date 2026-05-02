import React, { useState, useMemo, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function BookingSection({
  categories = [],
  services = [],
  slots,
  slotsLoading,
  slotsError,
  bookingDate,
  setBookingDate,
  bookingServiceId,
  setBookingServiceId,
  onFetchSlots,
  fetchSlotsAndAppointments
}) {
  const { user } = useAuth();

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [clientName, setClientName] = useState(() => localStorage.getItem('clientName') || '');
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('clientPhone') || '');
  const [clientEmail, setClientEmail] = useState(() => localStorage.getItem('clientEmail') || '');
  const [startTime, setStartTime] = useState('');
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  const handleNameChange  = (e) => { setClientName(e.target.value);  localStorage.setItem('clientName', e.target.value); };
  const handlePhoneChange = (e) => { setClientPhone(e.target.value); localStorage.setItem('clientPhone', e.target.value); };
  const handleEmailChange = (e) => { setClientEmail(e.target.value); localStorage.setItem('clientEmail', e.target.value); };

  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
    }
  }, [user]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\+?[0-9\s\-()]{7,20}$/.test(phone);

  const canSubmitBooking = useMemo(() => (
    bookingServiceId && bookingDate && startTime &&
    clientName && isValidEmail(clientEmail) && isValidPhone(clientPhone)
  ), [bookingServiceId, bookingDate, startTime, clientEmail, clientName, clientPhone]);

  const today = new Date().toISOString().split('T')[0];

  const onCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
    setBookingServiceId('');
    setBookingDate('');
    setSelectedSlotKey(null);
    setStartTime('');
    setBookingMessage('');
    setBookingError('');
  };

  const onServiceOrDateChange = (type, value) => {
    if (type === 'service') setBookingServiceId(value);
    if (type === 'date')    setBookingDate(value);
    setSelectedSlotKey(null);
    setStartTime('');
    setBookingMessage('');
    setBookingError('');
    const newServiceId = type === 'service' ? value : bookingServiceId;
    const newDate      = type === 'date'    ? value : bookingDate;
    fetchSlotsAndAppointments(newDate, newServiceId);
  };

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return [];
    return services.filter(s => s.category_id === parseInt(selectedCategoryId) && s.is_active !== false);
  }, [services, selectedCategoryId]);

  const selectSlot = (slot) => {
    setSelectedSlotKey(slot.slot_key);
    setStartTime(slot.start_at.slice(11, 16));
  };

  const submitBooking = async () => {
    setBookingMessage('');
    setBookingError('');
    if (!canSubmitBooking || isSubmitting) {
      setBookingError('Please fill all required fields correctly.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        date: bookingDate,
        start_time: startTime,
        service_id: bookingServiceId,
        client_email: clientEmail,
        client_name: clientName,
        client_phone: clientPhone,
      };
      const { data } = await api.post('/appointments', payload);
      setBookingMessage(data.message || 'Appointment booked successfully!');
      await fetchSlotsAndAppointments(bookingDate, bookingServiceId);
      setSelectedSlotKey(null);
      setStartTime('');
      setClientEmail('');
      setClientName('');
      setClientPhone('');
      localStorage.removeItem('clientEmail');
      localStorage.removeItem('clientName');
      localStorage.removeItem('clientPhone');
    } catch (error) {
      if (error.response?.data?.errors) {
        setBookingError(Object.values(error.response.data.errors).flat().join(' '));
      } else {
        setBookingError(error.response?.data?.message || 'Network error. Please try again.');
      }
      await fetchSlotsAndAppointments(bookingDate, bookingServiceId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === parseInt(bookingServiceId));

  return (
    <div className="booking-container">

      {/* ── Step 1: Service Selection ── */}
      <div className="card">
        <h2 style={{ marginBottom: '4px', fontSize: '1.4rem', fontWeight: 800 }}>Book an Appointment</h2>
        <p className="info">Select your service and preferred date to get started.</p>

        <div className="form-group">
          <label htmlFor="bk-category">Category</label>
          <select id="bk-category" value={selectedCategoryId} onChange={onCategoryChange}>
            <option value="">— Select a Category —</option>
            {categories.filter(c => c.is_active !== false).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bk-service">Service</label>
          <select
            id="bk-service"
            value={bookingServiceId}
            onChange={(e) => onServiceOrDateChange('service', e.target.value)}
            disabled={!selectedCategoryId}
          >
            <option value="">— Select a Service —</option>
            {filteredServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min — ${parseFloat(service.price).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="info-box">
            <strong>{selectedService.name}</strong> · {selectedService.duration_minutes} mins · ${parseFloat(selectedService.price).toFixed(2)}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="bk-date">Appointment Date</label>
          <input
            id="bk-date"
            type="date"
            min={today}
            value={bookingDate}
            onChange={(e) => onServiceOrDateChange('date', e.target.value)}
            disabled={!bookingServiceId}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* ── Step 2: Slot Selection ── */}
      <div className="card">
        <h3 style={{ marginBottom: '4px' }}>Available Slots</h3>
        <p className="info" style={{ marginBottom: '12px' }}>
          {selectedSlotKey
            ? `✅ Slot selected at ${startTime}`
            : 'Choose an available time slot below.'}
        </p>

        {slotsLoading ? (
          <p className="loading-text">
            <span className="spinner primary"></span> Loading available slots…
          </p>
        ) : slotsError ? (
          <p className="error">{slotsError}</p>
        ) : slots.length === 0 ? (
          <p className="empty-state">
            {bookingDate && bookingServiceId
              ? 'No slots available for the selected date.'
              : 'Select a service and date to see available slots.'}
          </p>
        ) : (
          <div className="slots-grid">
            {slots.map(slot => (
              <button
                key={slot.slot_key}
                className={`slot-btn ${selectedSlotKey === slot.slot_key ? 'selected' : ''}`}
                disabled={!slot.available}
                onClick={() => selectSlot(slot)}
                title={slot.available ? `Book at ${slot.label}` : 'Already booked'}
              >
                <span>{slot.label}</span>
                {!slot.available && <small>Booked</small>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Step 3: Your Details ── */}
      <div className="card">
        <h3 style={{ marginBottom: '4px' }}>Your Details</h3>
        <p className="info" style={{ marginBottom: '16px' }}>We'll use this to confirm your appointment.</p>

        <div className="form-group">
          <label htmlFor="bk-name">Full Name</label>
          <input
            id="bk-name"
            type="text"
            value={clientName}
            onChange={handleNameChange}
            placeholder="Jane Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bk-phone">Phone Number</label>
          <input
            id="bk-phone"
            type="text"
            value={clientPhone}
            onChange={handlePhoneChange}
            placeholder="+91 99999 99999"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bk-email">Email Address</label>
          <input
            id="bk-email"
            type="email"
            value={clientEmail}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            readOnly={!!user}
          />
        </div>

        <button
          id="bk-submit"
          onClick={submitBooking}
          disabled={!canSubmitBooking || isSubmitting || slotsLoading}
          className="btn-full"
        >
          {isSubmitting ? <><span className="spinner"></span> Booking…</> : 'Confirm Appointment'}
        </button>

        {bookingMessage && <p className="success" style={{ marginTop: '12px' }}>{bookingMessage}</p>}
        {bookingError   && <p className="error"   style={{ marginTop: '12px' }}>{bookingError}</p>}
      </div>

    </div>
  );
}
