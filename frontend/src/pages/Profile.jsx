import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BE_URL}/api`;

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  const refreshToken = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('refreshToken')}` }
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      return null;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('accessToken');
    try {
      const res = await axios.put(`${API_BASE_URL}/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditing(false);
      alert('Profile updated');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            const res = await axios.put(`${API_BASE_URL}/users/me`, formData, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setEditing(false);
            alert('Profile updated');
          }
        } catch (refreshErr) {
          alert('Session expired, please login again');
        }
      } else {
        alert('Update failed');
      }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-4xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-500">View and manage your personal account details.</p>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        {!editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">{user.role}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Account Status</p>
                {user.status === 'active' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">Inactive</span>
                )}
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <button onClick={() => setEditing(true)} className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm">Edit Profile</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="submit" className="bg-green-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;