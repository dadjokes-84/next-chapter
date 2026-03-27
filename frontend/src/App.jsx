import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// TODO: Import components
// import SignUp from './components/Auth/SignUp';
// import Login from './components/Auth/Login';
// import Dashboard from './pages/Dashboard';
// import Discover from './pages/Discover';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Initialize Supabase and check auth state
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {!user && (
          <>
            {/* <Route path="/signup" element={<SignUp />} /> */}
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/" element={<div>Welcome to Next-Chapter</div>} />
          </>
        )}

        {/* Protected routes */}
        {user && (
          <>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* <Route path="/discover" element={<Discover />} /> */}
            <Route path="/" element={<div>Dashboard (coming soon)</div>} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
