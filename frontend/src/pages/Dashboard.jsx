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
      const res = await axios.get('http://localhost:5000/api/users', {
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
      await axios.put(`http://localhost:5000/api/users/${id}`, updates, {
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
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchUsers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border border-gray-300 px-4 py-2">{u.name}</td>
              <td className="border border-gray-300 px-4 py-2">{u.email}</td>
              <td className="border border-gray-300 px-4 py-2">{u.role}</td>
              <td className="border border-gray-300 px-4 py-2">{u.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button onClick={() => handleUpdate(u._id, { status: u.status === 'active' ? 'inactive' : 'active' })} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Toggle Status</button>
                <button onClick={() => handleDelete(u._id)} className="bg-red-500 text-white px-2 py-1 rounded">Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default Dashboard;