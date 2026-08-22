import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginSignup } from './pages/LoginSignup';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { MyTrips } from './pages/MyTrips';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { ItineraryView } from './pages/ItineraryView';
import { SharedItinerary } from './pages/SharedItinerary';
import { CitySearch } from './pages/CitySearch';
import { ActivitySearch } from './pages/ActivitySearch';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AICopilot } from './components/AICopilot';
import { 
  PlaneTakeoff, LogOut, Compass, Map, User as UserIcon, Shield, 
  Layers, PlusCircle 
} from 'lucide-react';

// PrivateRoute to protect authenticated screens
const PrivateRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { user, token, logout, currency, setCurrency } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700';
  };

  // If viewing a public shared itinerary, hide the main nav shell for a standalone feel
  const isPublicShare = location.pathname.startsWith('/share/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header - rendered if logged in and not public view */}
      {token && !isPublicShare && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 text-primary-600">
                  <PlaneTakeoff className="h-6.5 w-6.5 transform -rotate-12" />
                  <span className="font-extrabold text-lg text-slate-800 tracking-tight">GlobeTrotter</span>
                </Link>

                {/* Nav Links - Desktop */}
                <nav className="hidden md:flex space-x-6 text-xs font-semibold uppercase tracking-wider">
                  <Link to="/" className={`${isActive('/')} transition`}>Dashboard</Link>
                  <Link to="/explore" className={`${isActive('/explore')} transition`}>Explore Cities</Link>
                  <Link to="/activities" className={`${isActive('/activities')} transition`}>Explore Activities</Link>
                  <Link to="/trips" className={`${isActive('/trips')} transition`}>My Trips</Link>
                  <Link to="/profile" className={`${isActive('/profile')} transition`}>Profile & Saved</Link>
                  {user?.is_admin && (
                    <Link to="/admin" className={`${isActive('/admin')} transition flex items-center space-x-1 text-amber-600 hover:text-amber-700`}>
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Profile details & logout */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-700">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">{user?.email}</span>
                </div>
                
                <Link to="/profile">
                  <img
                    src={user?.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"}
                    alt="Profile Avatar"
                    className="h-9 w-9 rounded-full object-cover border-2 border-slate-100 hover:border-primary-500 transition shadow"
                  />
                </Link>

                {/* Currency Switcher */}
                <button
                  onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-700 hover:bg-slate-100 hover:border-slate-350 transition flex items-center space-x-1 cursor-pointer"
                  title="Toggle Display Currency (USD / INR)"
                >
                  <span>{currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Tabbed Bottom Bar for responsiveness */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around py-2.5 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <Link to="/" className="flex flex-col items-center text-slate-400 hover:text-primary-600">
              <Layers className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-0.5">Home</span>
            </Link>
            <Link to="/explore" className="flex flex-col items-center text-slate-400 hover:text-primary-600">
              <Compass className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-0.5">Explore</span>
            </Link>
            <Link to="/create-trip" className="flex flex-col items-center text-slate-400 hover:text-primary-600">
              <PlusCircle className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-0.5">Plan</span>
            </Link>
            <Link to="/trips" className="flex flex-col items-center text-slate-400 hover:text-primary-600">
              <Map className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-0.5">Trips</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-primary-600">
              <UserIcon className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-0.5">Settings</span>
            </Link>
          </div>
        </header>
      )}

      {/* Main Body Grid */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${token && !isPublicShare ? 'py-8 pb-20 md:pb-8' : ''}`}>
        <Routes>
          {/* Public Authentication Screen */}
          <Route path="/login" element={<LoginSignup />} />

          {/* Public Itinerary Sharing View */}
          <Route path="/share/:shareToken" element={<SharedItinerary />} />

          {/* Protected Main App Screens */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-trip" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
          <Route path="/trips" element={<PrivateRoute><MyTrips /></PrivateRoute>} />
          <Route path="/trips/:tripId/build" element={<PrivateRoute><ItineraryBuilder /></PrivateRoute>} />
          <Route path="/trips/:tripId" element={<PrivateRoute><ItineraryView /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><CitySearch /></PrivateRoute>} />
          <Route path="/activities" element={<PrivateRoute><ActivitySearch /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          
          {/* Protected Admin Console */}
          <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {token && !isPublicShare && <AICopilot />}
    </div>
  );
};
