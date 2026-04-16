import { Navigate } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = ({ children, roles }) => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!accessToken || !user) {
    if (refreshToken) {
      // Try to refresh token
      axios.post('http://localhost:5000/api/auth/refresh', { refreshToken })
        .then(res => {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          window.location.reload();
        })
        .catch(() => {
          localStorage.clear();
          return <Navigate to="/login" />;
        });
    } else {
      return <Navigate to="/login" />;
    }
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/profile" />;
  return children;
};

export default PrivateRoute;