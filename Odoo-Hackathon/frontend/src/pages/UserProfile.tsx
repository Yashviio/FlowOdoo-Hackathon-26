import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Settings, Heart, Globe, Trash2, ShieldCheck, CheckCircle } from 'lucide-react';

interface SavedDestination {
  id: number;
  city: {
    id: number;
    name: string;
    country: string;
    image_url: string;
    description: string;
  };
}

export const UserProfile: React.FC = () => {
  const { user, apiFetch, updateUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [password, setPassword] = useState('');
  
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSaved = async () => {
    try {
      setLoadingSaved(true);
      const data = await apiFetch('/api/cities/saved/list');
      setSavedDestinations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload: any = { name, profile_picture: profilePic, language };
      if (password.trim() !== '') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        payload.password = password;
      }

      const updated = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      updateUser(updated);
      setSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleRemoveSaved = async (cityId: number) => {
    try {
      await apiFetch('/api/cities/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ city_id: cityId })
      });
      setSavedDestinations(savedDestinations.filter(d => d.city.id !== cityId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-12">
      {/* Left Column: Editable settings Form */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow p-6 border border-slate-100 space-y-6 self-start">
        <div className="flex items-center space-x-2">
          <Settings className="h-5.5 w-5.5 text-primary-600" />
          <h2 className="font-extrabold text-slate-800 text-lg">Account Settings</h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-xs text-emerald-700 flex items-center space-x-1">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center py-2">
            <img
              src={profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow"
            />
            {user?.is_admin && (
              <span className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center">
                <ShieldCheck className="h-3 w-3 mr-0.5" /> Administrator
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address (Non-Editable)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Language Preference</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="de">Deutsch (DE)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Profile Photo Link (URL)</label>
            <input
              type="url"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              placeholder="Paste custom image URL..."
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-600 mb-1">Change Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full text-center py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition shadow"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Right Column: Bookmarked/Saved Destinations List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-5.5 w-5.5 text-rose-500" fill="currentColor" />
          <h2 className="font-extrabold text-slate-800 text-lg">My Saved Destinations</h2>
        </div>

        {loadingSaved ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : savedDestinations.length === 0 ? (
          <div className="bg-white p-10 text-center text-slate-400 border border-slate-100 rounded-xl shadow-sm">
            <Heart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <span>You haven't saved any destinations yet. Check out the explore page to bookmark ideas.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedDestinations.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex space-x-3 hover:shadow-md transition">
                <div className="w-24 h-24 bg-slate-100 flex-shrink-0">
                  <img src={item.city.image_url} alt={item.city.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 line-clamp-1">{item.city.name}</h3>
                    <p className="text-[10px] text-slate-500">{item.city.country}</p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">{item.city.description}</p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleRemoveSaved(item.city.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
