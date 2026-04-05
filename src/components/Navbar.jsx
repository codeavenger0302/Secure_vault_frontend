import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Upload,
  Share2,
  LogOut,
  Sparkles,
  FolderOpen,
  Menu,
  X,
  Trash2,
  Activity,
  HardDrive,
  Sun,
  Moon,
  Folder,
  Inbox,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'My Files', icon: FolderOpen },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/folders', label: 'Folders', icon: Folder },
    { to: '/share', label: 'Share', icon: Share2 },
    { to: '/shared-with-me', label: 'Inbox', icon: Inbox },
    { to: '/ai', label: 'AI', icon: Sparkles },
    { to: '/trash', label: 'Trash', icon: Trash2 },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/storage', label: 'Storage', icon: HardDrive },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SecureVault
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive(to)
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                  style={isActive(to) ? {} : { color: 'var(--text-secondary)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-800/50"
              style={{ color: 'var(--text-secondary)' }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email || user?.username}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t mt-2 pt-4" style={{ borderColor: 'var(--border-color)' }}>
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(to)
                        ? 'bg-indigo-600/20 text-indigo-300'
                        : ''
                    }`}
                    style={isActive(to) ? {} : { color: 'var(--text-secondary)' }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
