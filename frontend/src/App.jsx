import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import ProfileSetup from './components/Profile/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

// Protected route wrapper
function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const { user, token, loading: authLoading, getCurrentUser } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (token) {
      getCurrentUser().finally(() => setAppReady(true));
    } else {
      setAppReady(true);
    }
  }, [token]);

  if (!appReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <SignUp />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />

        {/* Protected routes */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
