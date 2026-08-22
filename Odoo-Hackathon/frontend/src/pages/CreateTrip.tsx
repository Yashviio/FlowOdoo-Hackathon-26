import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Map, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800", // Vintage Map
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800", // Boat on lake
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", // Sunny Beach
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", // Green Mountains
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800", // Sydney Harbour
  "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800"  // Tokyo Neon
];

export const CreateTrip: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(PRESET_COVERS[0]);
  const [customCover, setCustomCover] = useState('');
  const [totalBudget, setTotalBudget] = useState('1000');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [suggestedCities, setSuggestedCities] = useState<any[]>([]);
  
  React.useEffect(() => {
    apiFetch('/api/cities')
      .then(data => {
        setSuggestedCities(data.slice(0, 6));
      })
      .catch(e => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to the end date.');
      return;
    }

    setLoading(true);
    try {
      const finalCover = customCover.trim() !== '' ? customCover : coverPhoto;
      
      const res = await apiFetch('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          name,
          start_date: startDate,
          end_date: endDate,
          description,
          cover_photo: finalCover,
          total_budget: parseFloat(totalBudget) || 0.0
        })
      });
      // Redirect straight to itinerary builder to begin planning stopovers
      navigate(`/trips/${res.id}/build`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-3xl font-extrabold text-slate-800">Plan a New Adventure</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Trip Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Trip Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Map className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="e.g. Summer Tour of Japan, Backpacking Western Europe"
                />
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Total Budget limit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Overall Budget ($)</label>
              <input
                type="number"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="2000"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Trip Description (Optional)</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Notes about currency exchange, visa status, or overall goals..."
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Cover Photo</label>
              
              {/* Preset grids */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {PRESET_COVERS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCoverPhoto(preset);
                      setCustomCover('');
                    }}
                    className={`h-12 rounded-lg overflow-hidden border-2 relative transition ${coverPhoto === preset && customCover === '' ? 'border-primary-600 ring-2 ring-primary-400/50' : 'border-transparent hover:opacity-85'}`}
                  >
                    <img src={preset} alt={`Cover Preset ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Custom cover URL input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={customCover}
                  onChange={(e) => setCustomCover(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Or paste custom image URL..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-lg text-sm shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50"
            >
              {loading ? 'Creating Trip...' : 'Create Trip & Start Building'}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions section as shown in Mockup Screen 4 */}
      {suggestedCities.length > 0 && (
        <div className="space-y-4 pt-4 pb-12">
          <div className="border-t border-slate-200 my-6"></div>
          <div>
            <h3 className="text-md font-extrabold text-slate-800">Suggestions for Places to Visit / Activities to perform</h3>
            <p className="text-xs text-slate-500">Inspirational destinations loaded live from our catalog. Click to pre-fill!</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedCities.map((c) => (
              <div 
                key={c.id} 
                onClick={() => {
                  setName(`${c.name} Adventure`);
                  setDescription(`Exploring the sights and local food options in ${c.name}, ${c.country}.`);
                  setCoverPhoto(c.image_url);
                  setCustomCover('');
                }}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
              >
                <div className="h-28 bg-slate-100 relative">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div>
                      <span className="text-xs font-bold text-white block">{c.name}</span>
                      <span className="text-[10px] text-slate-200 block">{c.country}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-[10px] text-slate-500 line-clamp-2">
                  {c.description || "Browse famous landmarks and local excursions."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
