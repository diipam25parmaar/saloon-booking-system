import React, { useState, useEffect } from 'react';
import api from '../../api';
import DataTable from '../../components/DataTable';

export default function BookingsAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.data ?? data);
    } catch (e) {
      console.error(e);
      showMessage('Failed to load bookings.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Cancel booking for ${appointment.client_name}?`)) return;
    try {
      await api.delete(`/appointments/${appointment.id}`);
      showMessage('Booking cancelled successfully.');
      fetchAppointments();
    } catch (e) {
      showMessage(e.response?.data?.message || 'Error cancelling booking.', true);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'client_name', label: 'Client' },
    { key: 'client_email', label: 'Email' },
    { key: 'client_phone', label: 'Phone' },
    {
      key: 'service',
      label: 'Service',
      render: (row) => row.service?.name ?? <span className="text-muted">N/A</span>,
    },
    {
      key: 'start_at',
      label: 'Start Time',
      render: (row) => formatDateTime(row.start_at),
    },
    {
      key: 'end_at',
      label: 'End Time',
      render: (row) => formatDateTime(row.end_at),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = row.status ?? 'confirmed';
        const cls = s === 'confirmed' ? 'badge-green'
          : s === 'cancelled' ? 'badge-red'
          : 'badge-gray';
        return <span className={`badge ${cls}`}>{s}</span>;
      },
    },
  ];

  return (
    <div>
      <h2 className="page-title">Bookings</h2>
      <p className="page-subtitle">View and manage all customer appointments</p>

      {message && (
        <div className={isError ? 'error' : 'success'} style={{ marginBottom: '16px' }}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="loading-text">
          <span className="spinner primary"></span> Loading bookings…
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
