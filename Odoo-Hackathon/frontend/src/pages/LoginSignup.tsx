import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlaneTakeoff, Lock, Mail, ShieldAlert } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePicture, setProfilePicture] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, apiFetch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        await login(response.access_token);
        navigate('/');
      } else {
        // Signup Flow
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ 
            email, 
            password, 
            first_name: firstName, 
            last_name: lastName,
            phone_number: phoneNumber,
            city,
            country,
            additional_info: additionalInfo,
            profile_picture: profilePicture
          }),
        });
        // Auto-login after register
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        await login(response.access_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-sky-400 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

      <div className={`${isLogin ? 'max-w-md' : 'max-w-xl'} w-full space-y-6 bg-white p-8 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 animate-fade-in`}>
        {/* Mockup circular Photo display */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              const avatars = [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
              ];
              const idx = avatars.indexOf(profilePicture);
              setProfilePicture(avatars[(idx + 1) % avatars.length]);
            }}
            className="h-16 w-16 bg-slate-100 border border-slate-200 hover:border-primary-500 rounded-full flex items-center justify-center relative overflow-hidden group shadow-md transition duration-300 cursor-pointer"
            title="Click to cycle profile avatars"
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-400">Photo</span>
            )}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-bold transition">
              Cycle
            </div>
          </button>
        </div>

        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-2">
              <PlaneTakeoff className="h-8 w-8 transform -rotate-12" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">GlobeTrotter</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {isLogin ? 'Welcome back! Let\'s plan your next adventure.' : 'Begin creating your personalized multi-city trips.'}
          </p>
        </div>

        {/* Demo Accounts Callout */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 space-y-1">
          <p className="font-semibold">💡 Hackathon Demo Accounts:</p>
          <div className="flex justify-between">
            <span>👤 Regular: traveler@globetrotter.com / traveler123</span>
            <button 
              type="button" 
              onClick={() => {
                setEmail('traveler@globetrotter.com');
                setPassword('traveler123');
                setIsLogin(true);
              }}
              className="text-primary-600 hover:underline font-medium"
            >
              Fill
            </button>
          </div>
          <div className="flex justify-between">
            <span>🛡️ Admin: admin@globetrotter.com / admin123</span>
            <button 
              type="button" 
              onClick={() => {
                setEmail('admin@globetrotter.com');
                setPassword('admin123');
                setIsLogin(true);
              }}
              className="text-primary-600 hover:underline font-medium"
            >
              Fill
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex items-start space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {isLogin ? (
            /* LOGIN FIELDS (Screen 1) */
            <div className="rounded-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* SIGNUP MOCK FIELDS (Screen 2 Grid) */
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Information</label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  placeholder="Additional Information..."
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register Users'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
