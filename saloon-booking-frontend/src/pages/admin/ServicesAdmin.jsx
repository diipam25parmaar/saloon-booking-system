import React, { useState, useEffect } from 'react';
import api from '../../api';
import DataTable from '../../components/DataTable';

const defaultForm = { id: null, name: '', duration_minutes: 60, price: 0, category_id: '', is_active: true };

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, catRes] = await Promise.all([
        api.get('/services'),
        api.get('/categories'),
      ]);
      setServices(svcRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, category_id: formData.category_id || null };
    try {
      if (formData.id) {
        await api.put(`/services/${formData.id}`, payload);
        showMessage('Service updated successfully!');
      } else {
        await api.post('/services', payload);
        showMessage('Service created successfully!');
      }
      setFormData(defaultForm);
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error saving service.', true);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      id: service.id,
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price,
      category_id: service.category_id || '',
      is_active: service.is_active,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;
    try {
      await api.delete(`/services/${service.id}`);
      showMessage('Service deleted.');
      fetchData();
    } catch (e) {
      showMessage(e.response?.data?.message || 'Error deleting service.', true);
    }
  };

  const handleCancel = () => {
    setFormData(defaultForm);
    setMessage('');
  };

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    {
      key: 'category_id',
      label: 'Category',
      render: (row) => row.category?.name ?? <span className="text-muted">—</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => `$${parseFloat(row.price).toFixed(2)}`,
    },
    { key: 'duration_minutes', label: 'Duration (min)' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.is_active ? 'badge-green' : 'badge-gray'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">Services</h2>
      <p className="page-subtitle">Manage your salon services and pricing</p>

      {message && (
        <div className={isError ? 'error' : 'success'} style={{ marginBottom: '16px' }}>
          {message}
        </div>
      )}

      {/* Form Card */}
      <div className="card">
        <h3>{formData.id ? '✏️ Edit Service' : '➕ Add Service'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Row 1: Name + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="svc-name">Service Name</label>
              <input
                id="svc-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Haircut & Style"
              />
            </div>
            <div className="form-group">
              <label htmlFor="svc-category">Category</label>
              <select
                id="svc-category"
                value={formData.category_id}
                onChange={(e) => set('category_id', e.target.value)}
              >
                <option value="">— None —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Duration + Price + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="svc-duration">Duration (mins)</label>
              <input
                id="svc-duration"
                type="number"
                min="1"
                required
                value={formData.duration_minutes}
                onChange={(e) => set('duration_minutes', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="svc-price">Price ($)</label>
              <input
                id="svc-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="svc-status">Status</label>
              <select
                id="svc-status"
                value={formData.is_active}
                onChange={(e) => set('is_active', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-row" style={{ marginTop: '4px' }}>
            <button id="svc-submit" type="submit">
              {formData.id ? 'Update Service' : 'Add Service'}
            </button>
            {formData.id && (
              <button type="button" className="btn-outline" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p className="loading-text">
          <span className="spinner primary"></span> Loading services…
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
