import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!editing ? (
          <>
            <p className="mb-2"><strong>Name:</strong> {user.name}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>Role:</strong> {user.role}</p>
            <p className="mb-4"><strong>Account Status:</strong> {user.status}</p>
            <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;