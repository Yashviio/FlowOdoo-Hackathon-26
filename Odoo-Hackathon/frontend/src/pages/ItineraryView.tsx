import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Calendar as CalIcon, Edit3, 
  Clock, ShieldAlert, Award, FileText, CheckCircle, Copy, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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
  city: {
    id: number;
    name: string;
    country: string;
    image_url: string;
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
  is_public: boolean;
  share_token: string;
  stops: Stop[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Sightseeing: '#0ea5e9', // primary sky
  Food: '#f59e0b', // amber
  Adventure: '#10b981', // emerald
  Transit: '#6366f1', // indigo
  Accommodation: '#ec4899', // pink
  Shopping: '#8b5cf6' // purple
};

interface PackingItem {
  id: number;
  text: string;
  packed: boolean;
}

const PackingList: React.FC<{ tripId: string }> = ({ tripId }) => {
  const [items, setItems] = React.useState<PackingItem[]>(() => {
    const saved = localStorage.getItem(`packing_${tripId}`);
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Passport, Visa & Passport Photos", packed: false },
      { id: 2, text: "Universal Power Plug Adapter", packed: false },
      { id: 3, text: "Offline Google Maps downloaded", packed: false },
      { id: 4, text: "Emergency contacts & travel insurance printout", packed: false },
      { id: 5, text: "Prescription medication & basic first-aid", packed: false },
      { id: 6, text: "Local currency cash (exchange early)", packed: false }
    ];
  });
  const [newItem, setNewItem] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem(`packing_${tripId}`, JSON.stringify(items));
  }, [items, tripId]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() === '') return;
    const item: PackingItem = {
      id: Date.now(),
      text: newItem.trim(),
      packed: false
    };
    setItems([...items, item]);
    setNewItem('');
  };

  const handleToggle = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const percent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-slate-100 space-y-6 max-w-xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Trip Packing Checklist</h3>
          <p className="text-slate-500 text-xs mt-0.5">Check off essential travel gear before your departure.</p>
        </div>
        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded">
          {packedCount} / {totalCount} Packed
        </span>
      </div>

      {/* Animated progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>Completion Rate</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500 ease-out shadow-inner"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Add Custom Item */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add custom gear (e.g. Hiking boots, swim wear)..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md transition"
        >
          Add
        </button>
      </form>

      {/* Items list */}
      {items.length === 0 ? (
        <p className="text-xs italic text-slate-400 text-center py-4">No packing items left. Add some above!</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex justify-between items-center p-3 rounded-lg border transition cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-sm ${item.packed ? 'bg-slate-50/70 border-slate-200 text-slate-400' : 'bg-white border-slate-100 text-slate-700'}`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => {}} // handled by click container
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 pointer-events-none h-4 w-4"
                />
                <span className={`text-xs font-medium transition duration-300 ${item.packed ? 'line-through text-slate-400' : ''}`}>
                  {item.text}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="p-1 text-slate-400 hover:text-red-500 rounded transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ItineraryView: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'budget' | 'packing' | 'share'>('timeline');
  const [copied, setCopied] = useState(false);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/trips/${tripId}`);
      setTrip(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trip details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-700 flex items-center space-x-2">
        <ShieldAlert className="h-6 w-6" />
        <span>{error || 'Trip not found or unauthorized access.'}</span>
      </div>
    );
  }

  // --- Calculations for Budget and Calendar ---
  
  // 1. Gather all activities
  const allActivities: { activity: Activity; stop: Stop }[] = [];
  let totalCost = 0;
  const categoryTotals: { [key: string]: number } = {
    Sightseeing: 0, Food: 0, Adventure: 0, Transit: 0, Accommodation: 0, Shopping: 0
  };

  trip.stops.forEach(stop => {
    stop.activities.forEach(act => {
      allActivities.push({ activity: act, stop });
      totalCost += act.cost;
      const cat = act.category || 'Sightseeing';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + act.cost;
    });
  });

  const isOverBudget = totalCost > trip.total_budget && trip.total_budget > 0;
  const isBudgetWarning = totalCost >= trip.total_budget * 0.9 && trip.total_budget > 0;

  // 2. Format Pie Chart Data
  const pieData = Object.keys(categoryTotals)
    .map(name => ({ name, value: categoryTotals[name] }))
    .filter(item => item.value > 0);

  // 3. Format Bar Chart Data (stops vs cost)
  const barData = trip.stops.map((stop, i) => ({
    name: `#${i+1} ${stop.city.name}`,
    Cost: stop.activities.reduce((sum, a) => sum + a.cost, 0)
  }));

  // 4. Generate Calendar Days array (between start_date and end_date)
  const getDatesRange = (startStr: string, endStr: string) => {
    const dates: Date[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    const curr = new Date(start);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };
  const tripDays = getDatesRange(trip.start_date, trip.end_date);

  // 5. Calculate average cost per day
  const averageDailyCost = tripDays.length > 0 ? (totalCost / tripDays.length) : 0;

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/#/share/${trip.share_token}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleShare = async () => {
    try {
      const updated = await apiFetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_public: !trip.is_public })
      });
      setTrip(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back button and breadcrumb */}
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate('/trips')} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Itinerary Details</span>
      </div>

      {/* Main Cover Banner */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={trip.cover_photo}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        {/* Banner text overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-semibold bg-primary-600/90 text-white px-2.5 py-1 rounded">
              📍 {trip.stops.length} stopover{trip.stops.length !== 1 ? 's' : ''}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${trip.is_public ? 'bg-emerald-600/95 text-white' : 'bg-slate-700/95 text-slate-200'}`}>
              {trip.is_public ? '🔓 Shared Publicly' : '🔒 Private'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
            <p className="text-xs sm:text-sm text-slate-200 flex items-center">
              <CalIcon className="h-4 w-4 mr-1 text-slate-300" />
              {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})} - {new Date(trip.end_date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}
            </p>

            <Link
              to={`/trips/${tripId}/build`}
              className="inline-flex items-center justify-center space-x-1.5 bg-white text-slate-900 hover:bg-sky-50 px-4 py-2 rounded-lg text-xs font-extrabold shadow self-start sm:self-auto"
            >
              <Edit3 className="h-4 w-4" />
              <span>Modify stops / activities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 px-1 border-b-2 transition whitespace-nowrap ${activeTab === 'timeline' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Timeline List
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-1 border-b-2 transition whitespace-nowrap ${activeTab === 'calendar' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Visual Calendar
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`pb-3 px-1 border-b-2 transition whitespace-nowrap ${activeTab === 'budget' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Cost & Budget
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={`pb-3 px-1 border-b-2 transition whitespace-nowrap ${activeTab === 'packing' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Packing Checklist
        </button>
        <button
          onClick={() => setActiveTab('share')}
          className={`pb-3 px-1 border-b-2 transition whitespace-nowrap ${activeTab === 'share' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Sharing Controls
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* 1. TIMELINE LIST TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {trip.description && (
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-1 flex items-center"><FileText className="h-4 w-4 mr-1 text-slate-400" /> About this trip</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{trip.description}</p>
              </div>
            )}

            {trip.stops.length === 0 ? (
              <div className="bg-white p-8 text-center text-slate-500 border rounded-xl">
                No stops added yet. Click <Link to={`/trips/${tripId}/build`} className="text-primary-600 underline">here</Link> to build stops.
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 ml-3">
                {trip.stops.map((stop, sIdx) => (
                  <div key={stop.id} className="relative">
                    {/* Circle icon on the line */}
                    <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-primary-600 border-4 border-white shadow flex items-center justify-center"></div>
                    
                    <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">
                            Stop #{sIdx+1}: {stop.city.name}, {stop.city.country}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            📅 {new Date(stop.arrival_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(stop.departure_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
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
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-white" style={{backgroundColor: CATEGORY_COLORS[act.category] || '#94a3b8'}}>
                                    {act.category}
                                  </span>
                                  <span className="font-bold text-slate-800">{act.title}</span>
                                </div>
                                {act.description && <p className="text-[10px] text-slate-500 mt-0.5">{act.description}</p>}
                                <span className="text-[9px] text-slate-400 block mt-1 flex items-center"><Clock className="h-3 w-3 mr-0.5" /> Start Time: {act.start_time} ({act.duration_minutes}m)</span>
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
            )}
          </div>
        )}

        {/* 2. VISUAL CALENDAR TAB (Mockup Screen 9 Flowchart) */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow p-5 border border-slate-100 space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Itinerary for a selected place</h3>
              <p className="text-slate-500 text-xs mt-0.5">Chronological day-by-day activity flowchart and budget breakdown.</p>
            </div>

            <div className="space-y-6">
              {tripDays.map((dayDate, dIdx) => {
                // Find stop corresponding to this date
                const stopForDay = trip.stops.find(s => {
                  const arr = new Date(s.arrival_date);
                  const dep = new Date(s.departure_date);
                  arr.setHours(0,0,0,0);
                  dep.setHours(0,0,0,0);
                  const curr = new Date(dayDate);
                  curr.setHours(0,0,0,0);
                  return curr >= arr && curr <= dep;
                });

                const activitiesForDay = stopForDay ? stopForDay.activities : [];

                return (
                  <div key={dIdx} className="grid grid-cols-12 gap-4 items-stretch p-4 bg-slate-50/40 rounded-2xl border border-slate-100 hover:bg-slate-50 transition duration-300">
                    
                    {/* Left Column: Day details */}
                    <div className="col-span-3 sm:col-span-2 flex flex-col justify-center border-r border-slate-200/80 pr-2">
                      <span className="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider block">Day {dIdx + 1}</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {dayDate.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                      </span>
                      {stopForDay && (
                        <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-2 w-max truncate max-w-full">
                          📍 {stopForDay.city.name}
                        </span>
                      )}
                    </div>

                    {/* Middle Column: Flowchart blocks */}
                    <div className="col-span-6 sm:col-span-8 flex flex-col justify-center space-y-2 py-1">
                      {activitiesForDay.length === 0 ? (
                        <div className="py-4 border border-dashed border-slate-200 rounded-xl text-center text-[10px] text-slate-400 italic bg-white">
                          Rest day / Open schedule
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {activitiesForDay.map((act, actIdx) => (
                            <React.Fragment key={act.id}>
                              {actIdx > 0 && (
                                <div className="flex justify-center">
                                  <svg className="w-3.5 h-3.5 text-slate-350 my-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                </div>
                              )}
                              <div className="bg-white px-3 py-2 border border-slate-100 rounded-lg shadow-sm flex items-center justify-between hover:shadow transition">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: CATEGORY_COLORS[act.category] || '#94a3b8'}}></span>
                                  <div>
                                    <span className="font-extrabold text-xs text-slate-800 block leading-tight">{act.title}</span>
                                    <span className="text-[9px] text-slate-400">{act.category} • {act.start_time} ({act.duration_minutes}m)</span>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Expense block */}
                    <div className="col-span-3 sm:col-span-2 flex flex-col justify-center space-y-2 py-1 text-right pl-2 border-l border-slate-200/80">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Expense</span>
                      {activitiesForDay.length === 0 ? (
                        <div className="py-4 text-xs font-bold text-slate-400 text-center">-</div>
                      ) : (
                        <div className="space-y-1">
                          {activitiesForDay.map((act, actIdx) => (
                            <React.Fragment key={act.id}>
                              {actIdx > 0 && <div className="h-[18px]"></div> /* arrow spacing offset */}
                              <div className="h-8.5 flex items-center justify-end">
                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shadow-sm border border-emerald-100">
                                  ${act.cost}
                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. COST & BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="space-y-6 animate-fade-in">
            {/* Warning banners */}
            {isOverBudget && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-800 flex items-start space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Over Budget Alert!</p>
                  <p className="text-xs text-red-700 mt-0.5">Your actual expenses (${totalCost.toLocaleString()}) have exceeded your target budget limit (${trip.total_budget.toLocaleString()}). Try trimming down accommodation or shopping activities.</p>
                </div>
              </div>
            )}

            {!isOverBudget && isBudgetWarning && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-sm text-amber-800 flex items-start space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Approaching Budget Limit</p>
                  <p className="text-xs text-amber-700 mt-0.5">You have utilized {Math.round((totalCost / trip.total_budget) * 100)}% of your budget limit. Watch out for miscellaneous day expenses.</p>
                </div>
              </div>
            )}

            {/* Overall financial KPI summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-5 border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Estimated Total Cost</span>
                <span className="text-3xl font-extrabold text-slate-800 mt-2 block">${totalCost.toLocaleString()}</span>
                <span className="text-xs text-slate-400 mt-1 block">for {tripDays.length} total travel days</span>
              </div>

              <div className="bg-white rounded-xl shadow p-5 border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Average Spend / Day</span>
                <span className="text-3xl font-extrabold text-slate-800 mt-2 block">${Math.round(averageDailyCost).toLocaleString()}</span>
                <span className="text-xs text-slate-400 mt-1 block">estimated daily rate</span>
              </div>

              <div className="bg-white rounded-xl shadow p-5 border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Remaining Balance</span>
                <span className={`text-3xl font-extrabold mt-2 block ${trip.total_budget - totalCost < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${(trip.total_budget - totalCost).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">from limit of ${trip.total_budget.toLocaleString()}</span>
              </div>
            </div>

            {/* Charts section */}
            {allActivities.length === 0 ? (
              <div className="bg-white p-8 text-center text-slate-400 italic rounded-xl border border-slate-100">
                No expense items registered yet. Budget charts will render once you add activities with a cost.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Category Pie Chart */}
                <div className="bg-white rounded-xl shadow p-5 border border-slate-100 flex flex-col items-center">
                  <h4 className="font-extrabold text-sm text-slate-800 mb-4 self-start">Expense Breakdown by Category</h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Stop Cost Bar Chart */}
                <div className="bg-white rounded-xl shadow p-5 border border-slate-100 flex flex-col">
                  <h4 className="font-extrabold text-sm text-slate-800 mb-4">Expenses by City Stopover</h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                        <Bar dataKey="Cost" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PACKING CHECKLIST TAB */}
        {activeTab === 'packing' && (
          <PackingList tripId={tripId!} />
        )}

        {/* 5. SHARING CONTROLS TAB */}
        {activeTab === 'share' && (
          <div className="bg-white rounded-xl shadow p-6 border border-slate-100 space-y-6 max-w-xl mx-auto">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Itinerary Visibility & Sharing</h3>
              <p className="text-slate-500 text-xs mt-0.5">Control how others can discover or view your trip itinerary.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Public Link Sharing</span>
                  <span className="text-[11px] text-slate-500">Allow anyone with the link to see this itinerary in read-only mode.</span>
                </div>
                <button
                  onClick={handleToggleShare}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${trip.is_public ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${trip.is_public ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              {trip.is_public && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Public Share URL</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/#/share/${trip.share_token}`}
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 focus:outline-none text-xs truncate select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 rounded-lg text-xs flex items-center space-x-1.5 shadow"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-dashed border-slate-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-500">
              <Award className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Trip Cloning Enabled</span>
                <span>When your trip is public, other users who visit your shared page will be able to duplicate it into their own profile with one click using the **Copy Trip** action. Helpful for planning group trips!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
