import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Plus, Trash2, Calendar, MapPin, Clock,
  ArrowUp, ArrowDown, Sparkles, BookOpen, AlertCircle, Eye
} from 'lucide-react';

interface PredefinedActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  cost: number;
  duration_minutes: number;
}

interface City {
  id: number;
  name: string;
  country: string;
  image_url: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  cost: number;
  start_time: string;
  duration_minutes: number;
  order_index: number;
}

interface Stop {
  id: number;
  city_id: number;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  city: City;
  activities: Activity[];
}

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  cover_photo: string;
  is_public: boolean;
  stops: Stop[];
}

export const ItineraryBuilder: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals / Drawers state
  const [showStopModal, setShowStopModal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const [showActModal, setShowActModal] = useState(false);
  const [targetStopId, setTargetStopId] = useState<number | null>(null);
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actCategory, setActCategory] = useState('Sightseeing');
  const [actCost, setActCost] = useState('0');
  const [actTime, setActTime] = useState('10:00');
  const [actDuration, setActDuration] = useState('60');

  // Predefined activities browsing
  const [browseStopId, setBrowseStopId] = useState<number | null>(null);
  const [predefActs, setPredefActs] = useState<PredefinedActivity[]>([]);
  const [loadingPredef, setLoadingPredef] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const tripData = await apiFetch(`/api/trips/${tripId}`);
      setTrip(tripData);

      const cityData = await apiFetch('/api/cities');
      setCities(cityData);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip builder data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  // Re-fetch only trip data after mutative actions to keep UI sync
  const refreshTrip = async () => {
    try {
      const tripData = await apiFetch(`/api/trips/${tripId}`);
      setTrip(tripData);
    } catch (e) {
      console.error("Failed to refresh trip details:", e);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId || !arrivalDate || !departureDate) return;

    try {
      setError('');
      await apiFetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({
          city_id: parseInt(selectedCityId),
          arrival_date: arrivalDate,
          departure_date: departureDate,
          order_index: trip?.stops ? trip.stops.length : 0
        })
      });
      setShowStopModal(false);
      setSelectedCityId('');
      setArrivalDate('');
      setDepartureDate('');
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to add stop.');
    }
  };

  const handleRemoveStop = async (stopId: number) => {
    if (!window.confirm("Are you sure you want to remove this stop and all its activities?")) return;
    try {
      await apiFetch(`/api/trips/${tripId}/stops/${stopId}`, { method: 'DELETE' });
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to remove stop.');
    }
  };

  const handleMoveStop = async (index: number, direction: 'up' | 'down') => {
    if (!trip?.stops) return;
    const nextStops = [...trip.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= nextStops.length) return;

    // Swap elements
    const temp = nextStops[index];
    nextStops[index] = nextStops[targetIndex];
    nextStops[targetIndex] = temp;

    try {
      await apiFetch(`/api/trips/${tripId}/stops/reorder`, {
        method: 'PUT',
        body: JSON.stringify({
          stop_ids: nextStops.map(s => s.id)
        })
      });
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder stops.');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStopId || !actTitle) return;

    try {
      await apiFetch(`/api/trips/${tripId}/stops/${targetStopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          title: actTitle,
          description: actDesc,
          category: actCategory,
          cost: parseFloat(actCost) || 0.0,
          start_time: actTime,
          duration_minutes: parseInt(actDuration) || 60
        })
      });
      setShowActModal(false);
      setActTitle('');
      setActDesc('');
      setActCategory('Sightseeing');
      setActCost('0');
      setActTime('10:00');
      setActDuration('60');
      setTargetStopId(null);
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to add activity.');
    }
  };

  const handleAddPredefinedActivity = async (stopId: number, act: PredefinedActivity) => {
    try {
      await apiFetch(`/api/trips/${tripId}/stops/${stopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          title: act.title,
          description: act.description,
          category: act.category,
          cost: act.cost,
          start_time: '10:00',
          duration_minutes: act.duration_minutes
        })
      });
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to add predefined activity.');
    }
  };

  const handleRemoveActivity = async (stopId: number, actId: number) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await apiFetch(`/api/trips/${tripId}/stops/${stopId}/activities/${actId}`, {
        method: 'DELETE'
      });
      await refreshTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to delete activity.');
    }
  };

  const loadPredefinedActivities = async (stopId: number, cityId: number) => {
    setBrowseStopId(stopId);
    setLoadingPredef(true);
    try {
      const data = await apiFetch(`/api/cities/${cityId}/activities`);
      setPredefActs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPredef(false);
    }
  };

  const calculateStopCost = (stop: Stop) => {
    return stop.activities.reduce((acc, act) => acc + act.cost, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-700 flex items-center space-x-2">
        <AlertCircle className="h-6 w-6" />
        <span>Trip not found or unauthorized access.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate('/trips')} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Itinerary Builder</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 line-clamp-1">{trip.name}</h1>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/trips/${tripId}`)}
            className="flex-1 sm:flex-none inline-flex justify-center items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm"
          >
            <Eye className="h-4.5 w-4.5" />
            <span>Full Preview</span>
          </button>
          <button
            onClick={() => setShowStopModal(true)}
            className="flex-1 sm:flex-none inline-flex justify-center items-center space-x-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add City Stop</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Builder Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Column: Stops and day-by-day plan */}
        <div className="lg:col-span-2 space-y-6">
          {trip.stops.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <MapPin className="h-14 w-14 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No stops scheduled</h3>
              <p className="text-sm max-w-sm mx-auto text-slate-500">
                A multi-city trip requires cities! Click **Add City Stop** to define where you are going and when you are arriving.
              </p>
              <button
                onClick={() => setShowStopModal(true)}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition shadow"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Add Stop</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {trip.stops.map((stop, index) => {
                const stopCost = calculateStopCost(stop);
                const isBrowsingThis = browseStopId === stop.id;

                return (
                  <div key={stop.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                    {/* Stop Header Banner */}
                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center space-x-3">
                        {/* Order controls */}
                        <div className="flex flex-col">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveStop(index, 'up')}
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-500"
                            title="Move Stop Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={index === trip.stops.length - 1}
                            onClick={() => handleMoveStop(index, 'down')}
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-500"
                            title="Move Stop Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-slate-400 text-sm">#{index + 1}</span>
                            <h3 className="font-bold text-slate-800 text-base">{stop.city.name}, {stop.city.country}</h3>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center mt-0.5">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            {new Date(stop.arrival_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(stop.departure_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded">
                          Stop Total: ${stopCost.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveStop(stop.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Remove Stop"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stop Activities List */}
                    <div className="p-5 space-y-4">
                      {stop.activities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No activities scheduled yet for this stop.</p>
                      ) : (
                        <div className="space-y-3">
                          {stop.activities.map((act) => (
                            <div key={act.id} className="flex justify-between items-start p-3 bg-slate-50/70 border border-slate-100 rounded-lg hover:border-slate-200 transition">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-primary-100 text-primary-700">
                                    {act.category}
                                  </span>
                                  <h4 className="font-bold text-sm text-slate-800">{act.title}</h4>
                                </div>
                                {act.description && <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>}
                                <div className="flex gap-4 text-[10px] text-slate-400 font-medium pt-1">
                                  <span className="flex items-center"><Clock className="h-3 w-3 mr-0.5" /> {act.start_time} ({act.duration_minutes}m)</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2.5">
                                <span className="font-bold text-xs text-slate-700">${act.cost}</span>
                                <button
                                  onClick={() => handleRemoveActivity(stop.id, act.id)}
                                  className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                                  title="Delete Activity"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Activity Buttons row */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            setTargetStopId(stop.id);
                            setShowActModal(true);
                          }}
                          className="flex-1 text-center py-2 border border-dashed border-slate-300 hover:border-primary-500 hover:bg-primary-50 text-slate-600 hover:text-primary-700 font-bold text-xs rounded-lg transition"
                        >
                          + Add Custom Activity
                        </button>
                        <button
                          onClick={() => loadPredefinedActivities(stop.id, stop.city_id)}
                          className={`flex-1 text-center py-2 border border-dashed hover:bg-amber-50 font-bold text-xs rounded-lg transition ${isBrowsingThis ? 'bg-amber-50 border-amber-400 text-amber-700' : 'border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700'}`}
                        >
                          ✨ Browse Local Suggestions
                        </button>
                      </div>

                      {/* Predefined Local Suggestions Drawer */}
                      {isBrowsingThis && (
                        <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3 animate-fade-in">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs text-amber-800 flex items-center space-x-1">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              <span>Things to do in {stop.city.name}</span>
                            </h4>
                            <button
                              onClick={() => setBrowseStopId(null)}
                              className="text-xs text-amber-700 font-bold hover:underline"
                            >
                              Close
                            </button>
                          </div>

                          {loadingPredef ? (
                            <div className="text-center py-2 text-xs text-amber-700">Loading recommendations...</div>
                          ) : predefActs.length === 0 ? (
                            <div className="text-center py-2 text-xs text-amber-600 italic">No recommendations seeded for this city.</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {predefActs.map(act => (
                                <div key={act.id} className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-start space-x-2">
                                  <div className="space-y-1">
                                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{act.title}</h5>
                                    <p className="text-[10px] text-slate-500 line-clamp-2">{act.description}</p>
                                    <div className="flex gap-2 pt-1 text-[9px] text-slate-400 font-bold">
                                      <span className="bg-slate-100 px-1 rounded">{act.category}</span>
                                      <span>${act.cost}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleAddPredefinedActivity(stop.id, act)}
                                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-sm flex-shrink-0"
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mini Info / Trip details summaries */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span>Itinerary Overview</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Trip Dates:</span>
                <span className="font-bold text-slate-700">
                  {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(trip.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Total Cities:</span>
                <span className="font-bold text-slate-700">{trip.stops.length} stopover(s)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Budget Limit:</span>
                <span className="font-bold text-slate-700">${trip.total_budget.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Total Expenses:</span>
                <span className={`font-bold ${trip.stops.reduce((sum, s) => sum + calculateStopCost(s), 0) > trip.total_budget ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${trip.stops.reduce((sum, s) => sum + calculateStopCost(s), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to={`/trips/${tripId}`}
                className="w-full text-center block py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
              >
                Show Shared Link & Calendar
              </Link>
              <button
                onClick={async () => {
                  const newPublic = !trip.is_public;
                  try {
                    await apiFetch(`/api/trips/${tripId}`, {
                      method: 'PUT',
                      body: JSON.stringify({ is_public: newPublic })
                    });
                    await refreshTrip();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition text-center ${trip.is_public ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                {trip.is_public ? '🔓 Set Private (Currently Public)' : '🔒 Set Public (Currently Private)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD STOP MODAL --- */}
      {showStopModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-1.5">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span>Add Stopover City</span>
            </h3>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Destination City</label>
                <select
                  required
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                >
                  <option value="">-- Search and Select City --</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStopModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY MODAL --- */}
      {showActModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-1.5">
              <Plus className="h-5 w-5 text-primary-600" />
              <span>Add Custom Activity</span>
            </h3>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Cruise, Museum Visit"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Details, booking reference numbers, meeting locations..."
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Transit">Transit</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 14:00"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={actDuration}
                    onChange={(e) => setActDuration(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowActModal(false);
                    setTargetStopId(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
