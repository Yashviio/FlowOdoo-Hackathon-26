import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Trash2, Edit3, Compass, Plus, AlertTriangle, ArrowRight } from 'lucide-react';

interface Stop {
  id: number;
  city_id: number;
  arrival_date: string;
  departure_date: string;
  activities: any[];
}

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  cover_photo: string;
  description: string;
  total_budget: number;
  is_public: boolean;
  stops: Stop[];
}

export const MyTrips: React.FC = () => {
  const { apiFetch } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget'>('date');
  const [openSections, setOpenSections] = useState<{ongoing: boolean, upcoming: boolean, completed: boolean}>({
    ongoing: true,
    upcoming: true,
    completed: false
  });
  
  const navigate = useNavigate();

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/trips');
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load itineraries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (tripId: number) => {
    try {
      await apiFetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      setTrips(trips.filter(t => t.id !== tripId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip.');
    }
  };

  const calculateActualCost = (trip: Trip) => {
    let cost = 0;
    if (trip.stops) {
      trip.stops.forEach(stop => {
        if (stop.activities) {
          stop.activities.forEach(act => {
            cost += act.cost;
          });
        }
      });
    }
    return cost;
  };

  const filteredTrips = trips
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => {
      if (filterType === 'public') return t.is_public;
      if (filterType === 'private') return !t.is_public;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') return b.total_budget - a.total_budget;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const ongoingTrips = filteredTrips.filter(t => {
    const s = new Date(t.start_date);
    const e = new Date(t.end_date);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return now >= s && now <= e;
  });

  const upcomingTrips = filteredTrips.filter(t => {
    const s = new Date(t.start_date);
    s.setHours(0, 0, 0, 0);
    return s > now;
  });

  const completedTrips = filteredTrips.filter(t => {
    const e = new Date(t.end_date);
    e.setHours(0, 0, 0, 0);
    return e < now;
  });

  const renderTripCard = (trip: Trip) => {
    const actualCost = calculateActualCost(trip);
    const isOverBudget = actualCost > trip.total_budget && trip.total_budget > 0;
    const stopCount = trip.stops ? trip.stops.length : 0;

    return (
      <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition duration-300 relative">
        {/* Cover photo */}
        <div className="h-36 bg-slate-100 relative">
          <img
            src={trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300'}
            alt={trip.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300';
            }}
          />
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded shadow text-slate-800">
            {trip.is_public ? '🔓 Public' : '🔒 Private'}
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{trip.name}</h3>
            <p className="text-[10px] text-slate-500 flex items-center mt-0.5">
              <Calendar className="h-3 w-3 mr-1 text-slate-400" />
              {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(trip.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
            </p>
            <p className="text-[10px] text-slate-500 line-clamp-2 mt-2 min-h-[1.5rem]">
              {trip.description || "No description provided."}
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                📍 {stopCount} stop{stopCount !== 1 ? 's' : ''}
              </span>
              <span className="text-[9px] font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                💰 Budget: ${trip.total_budget.toLocaleString()}
              </span>
            </div>

            {/* Budget meter */}
            {trip.total_budget > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[9px] font-semibold">
                  <span className="text-slate-500">Spent: ${actualCost.toLocaleString()}</span>
                  <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-slate-600'}>
                    {Math.round((actualCost / trip.total_budget) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((actualCost / trip.total_budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Grid */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigate(`/trips/${trip.id}/build`)}
                title="Edit Itinerary Builder"
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded transition"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setConfirmDeleteId(trip.id)}
                title="Delete Trip"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="inline-flex items-center space-x-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded transition"
            >
              <span>View Plan</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Delete confirmation modal overlay */}
        {confirmDeleteId === trip.id && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col justify-center items-center p-3 text-center text-white z-10 animate-fade-in">
            <AlertTriangle className="h-8 w-8 text-amber-400 mb-1" />
            <p className="font-bold text-xs">Delete "{trip.name}"?</p>
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(trip.id)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 rounded text-[10px] font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Itineraries</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage, edit, and audit your planned travel itineraries.</p>
        </div>
        <Link
          to="/create-trip"
          className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md hover:shadow-lg transition duration-150"
        >
          <Plus className="h-4 w-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search & Actions Bar (Mockup Screen 6) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a trip..."
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-slate-50/50"
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="flex items-center space-x-1 flex-1 sm:flex-none">
            <span className="text-[9px] uppercase font-bold text-slate-400">Filter:</span>
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 focus:outline-none"
            >
              <option value="all">All Trips</option>
              <option value="public">🔓 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 flex-1 sm:flex-none">
            <span className="text-[9px] uppercase font-bold text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 focus:outline-none"
            >
              <option value="date">📅 Date</option>
              <option value="budget">💰 Budget</option>
            </select>
          </div>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-500 max-w-xl mx-auto">
          <Compass className="h-12 w-12 mx-auto text-slate-350 mb-3" />
          <p className="font-bold text-md text-slate-800">No trips planned yet</p>
          <p className="text-xs mt-1 mb-6 text-slate-500">Your trips will appear here once you formulate an itinerary.</p>
          <Link
            to="/create-trip"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-xs font-bold shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Trip</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {/* 1. ONGOING SECTION */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenSections({ ...openSections, ongoing: !openSections.ongoing })}
              className="w-full flex justify-between items-center bg-slate-50/70 px-4 py-3 border-b border-slate-100 hover:bg-slate-100/50 transition cursor-pointer"
            >
              <span className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                🟢 Ongoing Trips <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{ongoingTrips.length}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{openSections.ongoing ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {openSections.ongoing && (
              <div className="p-4">
                {ongoingTrips.length === 0 ? (
                  <p className="text-[10px] text-slate-450 italic text-center py-4">No ongoing trips right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingTrips.map(renderTripCard)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. UP-COMING SECTION */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenSections({ ...openSections, upcoming: !openSections.upcoming })}
              className="w-full flex justify-between items-center bg-slate-50/70 px-4 py-3 border-b border-slate-100 hover:bg-slate-100/50 transition cursor-pointer"
            >
              <span className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                📅 Upcoming Trips <span className="bg-primary-100 text-primary-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{upcomingTrips.length}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{openSections.upcoming ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {openSections.upcoming && (
              <div className="p-4">
                {upcomingTrips.length === 0 ? (
                  <p className="text-[10px] text-slate-450 italic text-center py-4">No upcoming trips planned.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map(renderTripCard)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. COMPLETED SECTION */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenSections({ ...openSections, completed: !openSections.completed })}
              className="w-full flex justify-between items-center bg-slate-50/70 px-4 py-3 border-b border-slate-100 hover:bg-slate-100/50 transition cursor-pointer"
            >
              <span className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                ✅ Completed Trips <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{completedTrips.length}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{openSections.completed ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {openSections.completed && (
              <div className="p-4">
                {completedTrips.length === 0 ? (
                  <p className="text-[10px] text-slate-450 italic text-center py-4">No completed trips in archives.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedTrips.map(renderTripCard)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
