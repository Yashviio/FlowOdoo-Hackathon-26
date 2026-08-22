import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Heart, Compass, CheckCircle } from 'lucide-react';

interface City {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity: number;
  description: string;
  image_url: string;
}

export const CitySearch: React.FC = () => {
  const { apiFetch } = useAuth();
  
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [costFilter, setCostFilter] = useState('');
  const [popularityFilter, setPopularityFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [savedCityIds, setSavedCityIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const fetchCities = async () => {
    try {
      setLoading(true);
      let query = `/api/cities?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (region) query += `region=${encodeURIComponent(region)}&`;
      if (costFilter) query += `cost_index=${costFilter}&`;
      if (popularityFilter) query += `popularity=${popularityFilter}&`;

      const data = await apiFetch(query);
      setCities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedDestinations = async () => {
    try {
      const data = await apiFetch('/api/cities/saved/list');
      setSavedCityIds(data.map((item: any) => item.city.id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search, region, costFilter, popularityFilter]);

  useEffect(() => {
    loadSavedDestinations();
  }, []);

  const handleToggleSave = async (cityId: number, cityName: string) => {
    try {
      const res = await apiFetch('/api/cities/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ city_id: cityId })
      });
      if (res.saved) {
        setSavedCityIds([...savedCityIds, cityId]);
        triggerToast(`Added ${cityName} to saved destinations!`);
      } else {
        setSavedCityIds(savedCityIds.filter(id => id !== cityId));
        triggerToast(`Removed ${cityName} from saved destinations.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Explore Destinations</h1>
        <p className="text-slate-500 text-sm mt-1">Discover global cities, check their popularity levels, and save them for future trip planning.</p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl shadow p-5 border border-slate-100 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            placeholder="Search by city name or country (e.g. Paris, Japan)..."
          />
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="">All Regions</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Cost Index</label>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="">All Budgets</option>
              <option value="2">💵 Budget (2 or less)</option>
              <option value="3">💵💵 Moderate (3)</option>
              <option value="4">💵💵💵 Premium (4)</option>
              <option value="5">💵💵💵💵 Luxury (5)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Popularity</label>
            <select
              value={popularityFilter}
              onChange={(e) => setPopularityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="">All Popularity Levels</option>
              <option value="4">⭐ Highly Popular (4+)</option>
              <option value="5">⭐⭐ Absolute Favorite (5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-100 text-center text-slate-400">
          <Compass className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <span>No cities found matching your search. Try adjusting the filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => {
            const isSaved = savedCityIds.includes(city.id);
            return (
              <div key={city.id} className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden relative flex flex-col hover:shadow-md transition">
                <div className="h-44 bg-slate-100 relative">
                  <img 
                    src={city.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300'} 
                    alt={city.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300';
                    }}
                  />
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleSave(city.id, city.name)}
                    className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-sm shadow transition duration-150 ${isSaved ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-black/45 text-white hover:bg-black/60'}`}
                  >
                    <Heart className="h-4.5 w-4.5" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-800">{city.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-0.5" />
                          {city.country} • {city.region}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{city.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Cost Index: {'💵'.repeat(city.cost_index)}</span>
                    <span>Popularity: {'⭐'.repeat(city.popularity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-2xl flex items-center space-x-2 z-50 animate-fade-in border border-slate-800">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
