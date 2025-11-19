import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Button } from '../../components/Button';

// Simple login form that posts to `/api/login`.
// Adjust the endpoint path if your backend uses a different one (e.g. `/api/auth/login`).
export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // This will send POST to /api/login because axiosInstance.baseURL = '/api'
      const resp = await axiosInstance.post('/login', {
        username,
        password,
      });

      // Example response handling: backend returns { token, user }
      const data = resp.data;

      // If using token-based auth, save token to store/localStorage here.
      // For example: authStore.setAuth(data.token, data.user)

      // Navigate to root which the routes will forward according to role
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <Button type="submit" variant="primary" isLoading={loading} className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
