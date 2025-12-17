import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import CreateEvent from './pages/CreateEvent.jsx';

// Context
export const AppContext = React.createContext();

export default function App() {
  const [user, setUser] = useState(null);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => logout());
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <NavBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/events/new" element={<CreateEvent />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}

// Navbar
const NavBar = () => {
  const { user, logout } = React.useContext(AppContext);

  return (
    <nav className="bg-indigo-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl flex items-center">
          <span className="mr-2">🎉</span> Evently
        </Link>
        <div>
          {user ? (
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
