import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {user && <Link to="/profile" className="hover:underline">My Profile</Link>}
          {user && (user.role === 'Admin' || user.role === 'Manager') && (
            <Link to="/dashboard" className="hover:underline">User Management</Link>
          )}
          {user && user.role === 'Admin' && (
            <Link to="/admin" className="hover:underline">Admin Panel</Link>
          )}
        </div>
        <div>
          {user ? (
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</button>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;