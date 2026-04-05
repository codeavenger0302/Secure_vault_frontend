import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ShareAccessPage from './pages/ShareAccessPage';
import AiFeaturesPage from './pages/AiFeaturesPage';
import TrashPage from './pages/TrashPage';
import ActivityLogPage from './pages/ActivityLogPage';
import FoldersPage from './pages/FoldersPage';
import StorageDashboardPage from './pages/StorageDashboardPage';
import SharedWithMePage from './pages/SharedWithMePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/share" element={<ShareAccessPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai"
                element={
                  <ProtectedRoute>
                    <AiFeaturesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/folders"
                element={
                  <ProtectedRoute>
                    <FoldersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trash"
                element={
                  <ProtectedRoute>
                    <TrashPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <ActivityLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/storage"
                element={
                  <ProtectedRoute>
                    <StorageDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shared-with-me"
                element={
                  <ProtectedRoute>
                    <SharedWithMePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: { primary: '#818cf8', secondary: '#1f2937' },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
