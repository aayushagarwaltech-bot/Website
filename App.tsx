import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import TenantHome from './pages/TenantHome';
import OwnerDashboard from './pages/OwnerDashboard';
import PropertyDetail from './pages/PropertyDetail';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Notifications from './pages/Notifications';

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Redirect root to dashboard or browse based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'OWNER') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/browse" replace />;
};

const AppContent: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/browse" element={<TenantHome />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/dashboard" element={<OwnerDashboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;