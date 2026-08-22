import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Copy, PlaneTakeoff, AlertCircle, CheckCircle } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  cost: number;
  start_time: string;
  duration_minutes: number;
}

interface Stop {
  id: number;
  arrival_date: string;
  departure_date: string;
  city: {
    name: string;
    country: string;
  };
  activities: Activity[];
}

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  cover_photo: string;
  description: string;
  stops: Stop[];
}

export const SharedItinerary: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { token, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiFetch(`/api/trips/share/${shareToken}`);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared trip. It may be private or deleted.');
      } finally {
        setLoading(false);
      }
    };
    if (shareToken) {
      fetchSharedTrip();
    }
  }, [shareToken]);

  const handleCopyTrip = async () => {
    if (!token) {
      alert("Please log in or sign up first to copy this itinerary to your profile.");
      navigate('/login');
      return;
    }

    try {
      setCopying(true);
      setError('');
      const res = await apiFetch(`/api/trips/share/${shareToken}/copy`, {
        method: 'POST'
      });
      setCopySuccess(true);
      setTimeout(() => {
        navigate(`/trips/${res.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to copy trip to your account.');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6 border border-slate-100 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Cannot load shared trip</h3>
        <p className="text-xs text-slate-500">{error || 'This trip is private, expired, or has an invalid token.'}</p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition shadow"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={trip.cover_photo}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded shadow-sm">
            🌍 Shared Public Trip
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
          <p className="text-xs sm:text-sm text-slate-200 flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-slate-300" />
            {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})} - {new Date(trip.end_date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}
          </p>
        </div>
      </div>

      {/* Intro and Copy Action */}
      <div className="bg-white rounded-xl shadow p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Like this itinerary?</h2>
          <p className="text-xs text-slate-500">Duplicate this entire multi-city plan and custom activity items to your own profile to edit.</p>
        </div>
        <button
          onClick={handleCopyTrip}
          disabled={copying || copySuccess}
          className={`w-full md:w-auto inline-flex justify-center items-center space-x-1.5 px-5 py-3 rounded-lg text-sm font-bold shadow-md transition duration-150 ${copySuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50'}`}
        >
          {copySuccess ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Copied successfully! Redirecting...</span>
            </>
          ) : (
            <>
              <Copy className="h-4.5 w-4.5" />
              <span>{copying ? 'Copying plan...' : 'Copy Trip to My Profile'}</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      {trip.description && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-sm text-slate-700 mb-1">Notes about this itinerary</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{trip.description}</p>
        </div>
      )}

      {/* Stop list (Read only) */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
          <PlaneTakeoff className="h-5 w-5 text-primary-600 transform -rotate-12" />
          <span>Stopovers & Scheduled Activities</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 ml-3">
          {trip.stops.map((stop, sIdx) => (
            <div key={stop.id} className="relative">
              <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-primary-600 border-4 border-white shadow"></div>
              
              <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Stop #{sIdx+1}: {stop.city.name}, {stop.city.country}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      📅 {new Date(stop.arrival_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(stop.departure_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded">
                    Stop Total: ${stop.activities.reduce((sum, act) => sum + act.cost, 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {stop.activities.length === 0 ? (
                    <p className="text-xs italic text-slate-400 py-2">No activities planned for this stop.</p>
                  ) : (
                    stop.activities.map(act => (
                      <div key={act.id} className="flex justify-between items-start py-2.5 px-3 bg-slate-50/50 rounded-lg text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-white bg-primary-500">
                              {act.category}
                            </span>
                            <span className="font-bold text-slate-800">{act.title}</span>
                          </div>
                          {act.description && <p className="text-[10px] text-slate-500 mt-0.5">{act.description}</p>}
                          <span className="text-[9px] text-slate-400 block mt-1 flex items-center"><Clock className="h-3 w-3 mr-0.5" /> {act.start_time} ({act.duration_minutes}m)</span>
                        </div>
                        <span className="font-bold text-slate-700">${act.cost}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
