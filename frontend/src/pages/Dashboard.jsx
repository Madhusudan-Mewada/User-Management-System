import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const accessToken = localStorage.getItem('accessToken');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page, limit: 10, search, role, status }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, status]);

  const handleUpdate = async (id, updates) => {
    try {
      await axios.put(`${import.meta.env.VITE_BE_URL}/api/users/${id}`, updates, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deactivate user?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchUsers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl min-h-screen">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-500">Manage your platform's users, roles, and statuses easily.</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 outline-none"
          />
        </div>
        <div className="sm:w-48">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 outline-none">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </select>
        </div>
        <div className="sm:w-48">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.status === 'active' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full"></span> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      <span className="w-2 h-2 mr-1.5 bg-gray-400 rounded-full"></span> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleUpdate(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} className="text-sm font-medium text-amber-600 hover:text-amber-800 transition">
                    Toggle Status
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-sm font-medium text-red-600 hover:text-red-800 transition">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (hidden on desktop) */}
      <div className="md:hidden space-y-4 mb-6">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">No users found.</div>
        ) : users.map((u) => (
          <div key={u.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{u.name}</h3>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <div className="ml-2 mt-1">
                {u.status === 'active' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Inactive</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{u.role}</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-50">
              <button onClick={() => handleUpdate(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium py-2 rounded-lg transition-colors">
                Toggle Status
              </button>
              <button onClick={() => handleDelete(u.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg transition-colors">
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Previous
        </button>
        <span className="text-sm font-medium text-gray-500">
          Page <span className="text-gray-900 font-bold">{totalPages > 0 ? page : 0}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
        </span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages || totalPages === 0} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;