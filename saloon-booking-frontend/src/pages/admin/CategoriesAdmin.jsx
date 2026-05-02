import React, { useState, useEffect } from 'react';
import api from '../../api';
import DataTable from '../../components/DataTable';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, name: '', is_active: true });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/categories/${formData.id}`, formData);
        showMessage('Category updated successfully!');
      } else {
        await api.post('/categories', formData);
        showMessage('Category created successfully!');
      }
      setFormData({ id: null, name: '', is_active: true });
      fetchCategories();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error saving category.', true);
    }
  };

  const handleEdit = (category) => {
    setFormData({ id: category.id, name: category.name, is_active: category.is_active });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      showMessage('Category deleted.');
      fetchCategories();
    } catch (e) {
      showMessage(e.response?.data?.message || 'Error deleting category.', true);
    }
  };

  const handleCancel = () => {
    setFormData({ id: null, name: '', is_active: true });
    setMessage('');
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.is_active ? 'badge-green' : 'badge-gray'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <div>
      <h2 className="page-title">Categories</h2>
      <p className="page-subtitle">Manage your salon service categories</p>

      {message && (
        <div className={isError ? 'error' : 'success'} style={{ marginBottom: '16px' }}>
          {message}
        </div>
      )}

      {/* Form Card */}
      <div className="card">
        <h3>{formData.id ? '✏️ Edit Category' : '➕ Add Category'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="cat-name">Category Name</label>
              <input
                id="cat-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Hair Care"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="cat-status">Status</label>
              <select
                id="cat-status"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '0' }}>
              <button id="cat-submit" type="submit">
                {formData.id ? 'Update' : 'Add'}
              </button>
              {formData.id && (
                <button type="button" className="btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p className="loading-text">
          <span className="spinner primary"></span> Loading categories…
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
