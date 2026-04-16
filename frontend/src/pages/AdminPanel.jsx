import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    status: ''
  });

  // New User State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    status: 'active'
  });

  const accessToken = localStorage.getItem('accessToken');

  // Fetch Users with Search and Filter
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users?search=${search}&role=${filterRole}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole]);

  // Create New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', newUser, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("User Created Successfully");
      setNewUser({ name: '', email: '', password: '', role: 'User', status: 'active' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  // Delete User Permanently
  const handleDeleteUser = async (id, userName) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`);
    if (!confirmed) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  // Open Edit Modal
  const handleEditClick = (user) => {
    setEditingUser(user._id);
    setEditFormData({
      name: user.name,
      role: user.role,
      status: user.status
    });
  };

  // Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser}`, editFormData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating user");
    }
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditFormData({ name: '', role: '', status: '' });
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Admin User Management</h2>

      {/* Role Permissions Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Role Permissions</h3>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-200">
              <th className="border border-gray-300 px-4 py-2">Permission</th>
              <th className="border border-gray-300 px-4 py-2">Admin</th>
              <th className="border border-gray-300 px-4 py-2">Manager</th>
              <th className="border border-gray-300 px-4 py-2">User</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Create Users</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">View All Users</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Update Users</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅ (Non-Admin)</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Delete Users (Permanent)</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Assign Roles</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
              <td className="border border-gray-300 px-4 py-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">View Own Profile</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Update Own Profile</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
              <td className="border border-gray-300 px-4 py-2 text-center">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create User Section */}
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleCreateUser} className="grid gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600">Create User</button>
        </form>
      </div>

      {/* Filter & Search Section */}
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* User List Table */}
      {loading ? <p>Loading users...</p> : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Created By</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={u.status === 'inactive' ? 'opacity-60' : ''}>
                <td className="border border-gray-300 px-4 py-2">{u.name}</td>
                <td className="border border-gray-300 px-4 py-2">{u.email}</td>
                <td className="border border-gray-300 px-4 py-2 font-bold">{u.role}</td>
                <td className={`border border-gray-300 px-4 py-2 ${u.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{u.status}</td>
                <td className="border border-gray-300 px-4 py-2">{u.createdBy?.name || 'System'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button onClick={() => handleEditClick(u)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteUser(u._id, u.name)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
                  Save Changes
                </button>
                <button type="button" onClick={handleCloseEdit} className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;