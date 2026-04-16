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
    setEditingUser(user.id);
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
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Admin Control Panel</h2>
        <p className="text-gray-500">Manage overarching system settings, users, and roles.</p>
      </div>

      {/* Role Permissions Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Role Permissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Permission</th>
                <th className="px-6 py-4 font-semibold text-center">Admin</th>
                <th className="px-6 py-4 font-semibold text-center">Manager</th>
                <th className="px-6 py-4 font-semibold text-center">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">Create Users</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">View All Users</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">Update Users</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center text-sm text-gray-500">✅ <br className="md:hidden"/>(Non-Admin)</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">Delete Users</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
                <td className="px-6 py-4 text-center text-gray-300">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New User</h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm">
              Create User
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select onChange={(e) => setFilterRole(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* User List Data */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors group ${u.status === 'inactive' ? 'opacity-60' : ''}`}>
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
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.createdBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEditClick(u)} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-sm font-medium text-red-600 hover:text-red-800 transition">
                        Delete
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
              <div key={u.id} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 ${u.status === 'inactive' ? 'opacity-60' : ''}`}>
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
                <div className="mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{u.role}</span>
                  <span className="ml-2 text-xs text-gray-400">by {u.createdBy?.name || 'System'}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-50 mt-3">
                  <button onClick={() => handleEditClick(u)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteUser(u.id, u.name)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User Details</h3>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md">
                  Save Changes
                </button>
                <button type="button" onClick={handleCloseEdit} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">
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