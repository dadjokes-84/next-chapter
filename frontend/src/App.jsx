<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import ProfileSetup from './components/Profile/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import EditProfile from './pages/EditProfile';
import Welcome from './pages/Welcome';

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
          path="/welcome"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <Discover />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:matchId"
          element={
            <ProtectedRoute isAuthenticated={!!token} loading={authLoading}>
              <Messages />
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
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import ProfileSetup from './components/Profile/ProfileSetup';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Preferences from './pages/Preferences';
import Messages from './pages/Messages';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useSupabase = () => supabase;

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public route component (redirects to discover if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/discover" /> : children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Protected routes */}
      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />

      <Route path="/discover" element={
        <ProtectedRoute>
          <Discover />
        </ProtectedRoute>
      } />

      <Route path="/matches" element={
        <ProtectedRoute>
          <Matches />
        </ProtectedRoute>
      } />

      <Route path="/preferences" element={
        <ProtectedRoute>
          <Preferences />
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/messages/:matchId" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />

      <Route path="/account" element={
        <ProtectedRoute>
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-600">Account page (coming soon)</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/discover" />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
  );
}

export default App;
