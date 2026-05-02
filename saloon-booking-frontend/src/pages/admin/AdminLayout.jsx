import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{ width: '100%', animation: 'fadeUp 0.35s ease-out both' }}>
      <nav className="admin-tabs">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => isActive ? 'active-nav' : ''}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) => isActive ? 'active-nav' : ''}
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/services"
          className={({ isActive }) => isActive ? 'active-nav' : ''}
        >
          Services
        </NavLink>
        <NavLink
          to="/admin/bookings"
          className={({ isActive }) => isActive ? 'active-nav' : ''}
        >
          Bookings
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
