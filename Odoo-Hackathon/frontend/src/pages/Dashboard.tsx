import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Compass, Calendar, Wallet, MapPin, Heart, ChevronRight, Sparkles } from 'lucide-react';

interface City {
  id: number;
  name: string;
  country: string;
  region: string;
  image_url: string;
  cost_index: number;
  popularity: number;
}

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  cover_photo: string;
  total_budget: number;
  stops: any[];
}

export const Dashboard: React.FC = () => {
  const { user, apiFetch, formatPrice } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [savedCityIds, setSavedCityIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load trips
        const tripData = await apiFetch('/api/trips');
        setTrips(tripData);

        // Load recommended cities
        const cityData = await apiFetch('/api/cities?popularity=5');
        setPopularCities(cityData.slice(0, 5));

        // Load saved destinations
        const savedData = await apiFetch('/api/cities/saved/list');
        setSavedCityIds(savedData.map((item: any) => item.city.id));
      } catch (e) {
        console.error("Error loading dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleToggleSaveCity = async (cityId: number) => {
    try {
      const res = await apiFetch('/api/cities/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ city_id: cityId })
      });
      if (res.saved) {
        setSavedCityIds([...savedCityIds, cityId]);
      } else {
        setSavedCityIds(savedCityIds.filter(id => id !== cityId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDaysLeft = (startDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(startDateStr);
    const diff = start.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Calculate budget stats
  const totalSpend = trips.reduce((acc, trip) => acc + trip.total_budget, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome banner (Mockup Banner Image) */}
      <div 
        className="rounded-2xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(3, 105, 161, 0.75), rgba(7, 89, 133, 0.75)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200')" }}
      >
        <div className="space-y-4 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-4.5 w-4.5 text-amber-300" />
            <span>Empowering Your Journeys</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hi, {user?.name || 'Traveler'}!
          </h1>
          <p className="text-sky-100 max-w-md text-sm sm:text-base">
            Where is your wanderlust taking you next? Create or customize a multi-city itinerary, manage your expenses, and share your adventures.
          </p>
          <div className="pt-2">
            <Link
              to="/create-trip"
              className="inline-flex items-center space-x-2 bg-white text-primary-700 hover:bg-sky-50 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition duration-150"
            >
              <Plus className="h-5 w-5" />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>
        <div className="mt-6 md:mt-0 z-10 w-full md:w-auto">
          {/* Dashboard Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-sky-200" />
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-xs text-sky-100">Trips Planned</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
              <Wallet className="h-6 w-6 mx-auto mb-2 text-sky-200" />
              <div className="text-2xl font-bold">{formatPrice(totalSpend)}</div>
              <div className="text-xs text-sky-100">Tracked Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent trips and inspiration */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Compass className="h-6 w-6 text-primary-600" />
              <span>Recent & Upcoming Itineraries</span>
            </h2>
            <Link to="/trips" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center">
              <span>View All</span>
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
              <Compass className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <p className="font-semibold text-lg">No itineraries found</p>
              <p className="text-sm mt-1 mb-4">Start by planning your first multi-city trip.</p>
              <Link
                to="/create-trip"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Create Itinerary</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.slice(0, 2).map((trip) => {
                const daysLeft = getDaysLeft(trip.start_date);
                return (
                  <div key={trip.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col hover:shadow-lg transition duration-200">
                    <div className="h-40 relative bg-slate-100">
                      <img
                        src={trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300'}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-slate-800 shadow">
                        {daysLeft > 0 ? `${daysLeft} days to go ✈️` : daysLeft === 0 ? 'Starts today! 🎉' : 'Completed 📷'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{trip.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(trip.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            📍 {trip.stops ? trip.stops.length : 0} stops
                          </span>
                          <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md">
                            💰 ${trip.total_budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => navigate(`/trips/${trip.id}/build`)}
                          className="w-full text-center py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-lg text-xs transition duration-150"
                        >
                          Itinerary Builder
                        </button>
                        <button
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          className="w-full text-center py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow-md transition duration-150"
                        >
                          View Plan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Regional Selections */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-800">Top Regional Selections</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {popularCities.map((city) => {
                const isSaved = savedCityIds.includes(city.id);
                return (
                  <div key={city.id} className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden relative group hover:-translate-y-1 hover:shadow-md transition duration-300">
                    <div className="h-28 bg-slate-100 relative">
                      <img
                        src={city.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300'}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300';
                        }}
                      />
                      <button
                        onClick={() => handleToggleSaveCity(city.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow transition duration-150 ${isSaved ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-black/45 text-white hover:bg-black/60'}`}
                      >
                        <Heart className="h-3 w-3" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{city.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center mt-0.5">
                        <MapPin className="h-2.5 w-2.5 mr-0.5 text-slate-400" />
                        {city.country}
                      </p>
                      <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-50 text-[9px] text-slate-500 font-semibold">
                        <span>Cost: {'⭐'.repeat(city.cost_index)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Budget Highlights & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary-600" />
              <span>Budget Quick Highlights</span>
            </h3>

            {trips.length === 0 ? (
              <p className="text-sm text-slate-500">Your total expenses and daily limits will be calculated here once you create a trip.</p>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Travel Budget</span>
                    <span className="text-xl font-extrabold text-slate-800">${totalSpend.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    Active
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">Your Current Trips</span>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {trips.slice(0, 3).map(t => (
                      <div key={t.id} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">{t.name}</span>
                        <span className="text-slate-500">${t.total_budget.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to="/trips"
                    className="w-full text-center block py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm transition duration-150 shadow"
                  >
                    Manage Budgets
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-primary-50 rounded-2xl p-6 border border-primary-100/50 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-sm">
              <span>✈️ Smart Travel Tip</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Splitting your itinerary into day-wise segments with travel transition activities (like train tickets and flights) booked early can save you up to 30% of your total budget. Use our **Itinerary Builder** to track transit costs.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) "+ Plan a trip" as shown in Mockup Screen 3 */}
      <Link
        to="/create-trip"
        className="fixed bottom-6 right-20 bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-5 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition duration-300 hover:-translate-y-1 hover:scale-105 z-40 text-xs uppercase tracking-wider"
      >
        <Plus className="h-4 w-4" />
        <span>Plan a trip</span>
      </Link>
    </div>
  );
};
