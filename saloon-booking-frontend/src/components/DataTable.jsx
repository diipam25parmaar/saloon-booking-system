import React, { useState, useMemo } from 'react';

export default function DataTable({ columns, data, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const hasActions = onEdit || onDelete;

  return (
    <div>
      {/* Search */}
      <div className="table-search">
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="simple-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  title={`Sort by ${col.label}`}
                >
                  {col.label}{' '}
                  {sortConfig.key === col.key
                    ? (sortConfig.direction === 'asc' ? '▲' : '▼')
                    : <span style={{ opacity: 0.3 }}>⇅</span>}
                </th>
              ))}
              {hasActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                  {hasActions && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <button
                            className="btn-sm btn-outline"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <div className="empty-state">No records found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-outline btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              ← Previous
            </button>
            <span>Page {currentPage} of {totalPages} &nbsp;·&nbsp; {sortedData.length} records</span>
            <button
              className="btn-outline btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
