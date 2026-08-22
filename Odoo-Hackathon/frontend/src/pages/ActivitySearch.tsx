import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, CheckCircle, Plus } from 'lucide-react';

interface City {
  id: number;
  name: string;
  country: string;
}

interface PredefinedActivity {
  id: number;
  city_id: number;
  title: string;
  description: string;
  category: string;
  cost: number;
  duration_minutes: number;
  image_url: string;
  city: City;
}

interface UserTrip {
  id: number;
  name: string;
  stops: {
    id: number;
    city_id: number;
    arrival_date: string;
    city: {
      name: string;
    };
  }[];
}

export const ActivitySearch: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState<PredefinedActivity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<UserTrip[]>([]);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  
  // Adding activity to trip state
  const [selectedAct, setSelectedAct] = useState<PredefinedActivity | null>(null);
  const [targetTripId, setTargetTripId] = useState('');
  const [targetStopId, setTargetStopId] = useState('');

  const loadFilterData = async () => {
    try {
      const cityData = await apiFetch('/api/cities');
      setCities(cityData);
      
      const tripData = await apiFetch('/api/trips');
      setTrips(tripData);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Fetch all cities first to resolve names, or load activities
      const allActs: PredefinedActivity[] = [];
      
      // Fetch activities for all cities concurrently
      await Promise.all(
        cities.map(async (c) => {
          try {
            const data = await apiFetch(`/api/cities/${c.id}/activities`);
            const resolved = data.map((act: any) => ({
              ...act,
              city: c
            }));
            allActs.push(...resolved);
          } catch (e) {
            // ignore failure for individual cities
          }
        })
      );

      // Perform local filtering (since they are in memory and it's a fast hackathon dataset)
      let filtered = allActs;
      if (search) {
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(search.toLowerCase()) || 
          a.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (cityId) {
        filtered = filtered.filter(a => a.city_id === parseInt(cityId));
      }
      if (category) {
        filtered = filtered.filter(a => a.category === category);
      }
      if (maxCost) {
        filtered = filtered.filter(a => a.cost <= parseFloat(maxCost));
      }

      setActivities(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      fetchActivities();
    }
  }, [cities, search, cityId, category, maxCost]);

  const handleAddActToStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAct || !targetStopId) return;

    try {
      await apiFetch(`/api/trips/${targetTripId}/stops/${targetStopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          title: selectedAct.title,
          description: selectedAct.description,
          category: selectedAct.category,
          cost: selectedAct.cost,
          start_time: '10:00',
          duration_minutes: selectedAct.duration_minutes
        })
      });
      triggerToast(`Successfully added "${selectedAct.title}" to your itinerary!`);
      setSelectedAct(null);
      setTargetTripId('');
      setTargetStopId('');
    } catch (err: any) {
      alert(err.message || 'Failed to add activity.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Find stops for the selected trip
  const activeTrip = trips.find(t => t.id === parseInt(targetTripId));
  const availableStops = activeTrip ? activeTrip.stops : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Discover Activities</h1>
        <p className="text-slate-500 text-sm mt-1">Browse things to do globally, filter by category and pricing, and add them directly to your planned stops.</p>
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
            placeholder="Search activities (e.g. food tour, museum, summit)..."
          />
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter by Destination</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="">All Destinations</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="">All Categories</option>
              <option value="Sightseeing">Sightseeing</option>
              <option value="Food">Food</option>
              <option value="Adventure">Adventure</option>
              <option value="Transit">Transit</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maximum Cost ($)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-100 text-center text-slate-400">
          <Clock className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <span>No activities found matching your filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden relative flex flex-col hover:shadow-lg transition">
              <div className="h-40 bg-slate-100 relative">
                <img 
                  src={act.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300'} 
                  alt={act.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300';
                  }}
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded shadow-sm">
                  {act.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">{act.title}</h3>
                  <p className="text-[10px] text-slate-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-0.5" />
                    {act.city.name}, {act.city.country}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{act.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex gap-3 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 text-slate-400" />{act.cost}</span>
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 text-slate-400" />{act.duration_minutes}m</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedAct(act)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD ACTIVITY TO TRIP MODAL --- */}
      {selectedAct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-800 mb-2">Add Activity to Itinerary</h3>
            <p className="text-xs text-slate-500 mb-4">Add "{selectedAct.title}" to one of your planned stopovers.</p>

            {trips.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">You don't have any trips created yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/create-trip')}
                  className="px-4 py-2 bg-primary-600 text-white rounded text-xs font-bold"
                >
                  Create a Trip
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddActToStop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Select Trip</label>
                  <select
                    required
                    value={targetTripId}
                    onChange={(e) => {
                      setTargetTripId(e.target.value);
                      setTargetStopId('');
                    }}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  >
                    <option value="">-- Choose Trip --</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {targetTripId && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Select Destination Stop</label>
                    <select
                      required
                      value={targetStopId}
                      onChange={(e) => setTargetStopId(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    >
                      <option value="">-- Choose Stopover Date/City --</option>
                      {availableStops.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.city.name} (Arrives {new Date(s.arrival_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAct(null);
                      setTargetTripId('');
                      setTargetStopId('');
                    }}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!targetStopId}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow disabled:opacity-50"
                  >
                    Confirm Add
                  </button>
                </div>
              </form>
            )}
          </div>
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
