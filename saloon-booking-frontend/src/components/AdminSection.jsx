import React, { useState } from 'react';
import api from '../api';

export default function AdminSection({
  rules,
  rulesLoading,
  ruleMessage,
  setRuleMessage,
  ruleError,
  setRuleError,
  loadRules,
  appointments,
  slots,
  bookingDate,
  setBookingDate,
  fetchSlotsAndAppointments,
  onRuleCreated
}) {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLocal = (isoString) => {
    if (!isoString) return '—';
    return isoString.replace('T', ' ').substring(0, 16);
  };

  React.useEffect(() => {
    loadRules();
  }, [loadRules]);

  const createRule = async () => {
    setRuleMessage('');
    setRuleError('');

    if (!startTime || !endTime) {
      setRuleError('Start and end time are required.');
      return;
    }
    if (startTime >= endTime) {
      setRuleError('Start time must be before end time.');
      return;
    }
    if (!dayOfWeek && !specificDate) {
      setRuleError('Provide either a day of week or a specific date.');
      return;
    }
    if (dayOfWeek) {
      const day = parseInt(dayOfWeek, 10);
      if (day < 1 || day > 7) {
        setRuleError('Day of week must be between 1 (Mon) and 7 (Sun).');
        return;
      }
    }

    const isOverlapping = rules.some(r => {
      const matchesDay = r.day_of_week && r.day_of_week === parseInt(dayOfWeek, 10);
      const matchesDate = r.date && r.date === specificDate;
      if (matchesDay || matchesDate) {
        if (
          (startTime >= r.start_time && startTime < r.end_time) ||
          (endTime > r.start_time && endTime <= r.end_time) ||
          (startTime <= r.start_time && endTime >= r.end_time)
        ) return true;
      }
      return false;
    });

    if (isOverlapping) {
      setRuleError('This rule overlaps with an existing rule.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        day_of_week: dayOfWeek ? parseInt(dayOfWeek, 10) : null,
        date: specificDate || null,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      };
      await api.post('/working-time-rules', payload);
      setRuleMessage('Rule created successfully.');
      await loadRules();
      setDayOfWeek('');
      setSpecificDate('');
      setStartTime('');
      setEndTime('');
      setIsActive(true);
      onRuleCreated();
    } catch (error) {
      if (error.response?.data?.errors) {
        setRuleError(Object.values(error.response.data.errors).flat().join(' '));
      } else {
        setRuleError(error.response?.data?.message || 'Network error. Failed to create rule.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/working-time-rules/${ruleId}`);
      await loadRules();
      if (bookingDate) onRuleCreated();
    } catch (error) {
      alert('Failed to delete rule: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${appointmentId}`);
      if (bookingDate) onRuleCreated();
    } catch (error) {
      alert('Failed to cancel: ' + (error.response?.data?.message || error.message));
    }
  };

  const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <section>
      {/* ── Working Time Rules Form ── */}
      <div className="card">
        <h2 style={{ marginBottom: '4px' }}>Working Time Rules</h2>
        <p className="info">Set weekly schedules or specific date overrides for slot generation.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label htmlFor="rule-dow">Day of Week (1=Mon … 7=Sun)</label>
            <input
              id="rule-dow"
              type="number"
              min="1"
              max="7"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              placeholder="Leave blank if using specific date"
            />
          </div>
          <div className="form-group">
            <label htmlFor="rule-date">Specific Date (optional override)</label>
            <input
              id="rule-date"
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rule-start">Start Time</label>
            <input
              id="rule-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rule-end">End Time</label>
            <input
              id="rule-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="checkbox-row" style={{ marginBottom: '16px' }}>
          <input
            id="rule-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="rule-active">Rule is active</label>
        </div>

        <button onClick={createRule} disabled={isSubmitting}>
          {isSubmitting ? <><span className="spinner"></span> Adding…</> : 'Add Rule'}
        </button>

        {ruleMessage && <p className="success" style={{ marginTop: '12px' }}>{ruleMessage}</p>}
        {ruleError   && <p className="error"   style={{ marginTop: '12px' }}>{ruleError}</p>}
      </div>

      {/* ── Existing Rules ── */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Existing Rules</h3>
        {rulesLoading ? (
          <p className="loading-text">
            <span className="spinner primary"></span> Loading rules…
          </p>
        ) : rules.length === 0 ? (
          <p className="empty-state">No rules yet. Add one above.</p>
        ) : (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id}>
                    <td>
                      <strong>
                        {rule.date ? rule.date : DAY_NAMES[rule.day_of_week] ?? `Day ${rule.day_of_week}`}
                      </strong>
                    </td>
                    <td>{rule.start_time} – {rule.end_time}</td>
                    <td>
                      <span className={`badge ${rule.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => deleteRule(rule.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slot Overview ── */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Slots & Bookings by Date</h3>
        <div className="form-group" style={{ maxWidth: '240px', marginBottom: '20px' }}>
          <label htmlFor="admin-date">Select Date</label>
          <input
            id="admin-date"
            type="date"
            value={bookingDate}
            onChange={(e) => {
              setBookingDate(e.target.value);
              fetchSlotsAndAppointments(e.target.value, null);
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Appointments Table */}
        <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Booked Appointments
        </h4>
        {appointments.length > 0 ? (
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, idx) => (
                  <tr key={a.id}>
                    <td>{idx + 1}</td>
                    <td>{a.service?.name ?? a.service_id}</td>
                    <td>{a.client_name ?? '—'}</td>
                    <td>{a.client_phone ?? '—'}</td>
                    <td>{a.client_email}</td>
                    <td>{formatLocal(a.start_at)}</td>
                    <td>{formatLocal(a.end_at)}</td>
                    <td>
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => deleteAppointment(a.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state" style={{ marginBottom: '24px' }}>No appointments for selected date.</p>
        )}

        {/* Slots Table */}
        <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          All Candidate Slots
        </h4>
        {slots.length > 0 ? (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Slot</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s, idx) => (
                  <tr key={s.slot_key}>
                    <td>{idx + 1}</td>
                    <td>{s.label}</td>
                    <td>
                      <span className={`badge ${s.available ? 'badge-green' : 'badge-red'}`}>
                        {s.available ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No slots to show. Select a date above.</p>
        )}
      </div>
    </section>
  );
}
