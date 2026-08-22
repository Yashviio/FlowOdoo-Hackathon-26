import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Compass, MapPin, Activity, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PopularCity {
  city_name: string;
  country: string;
  trip_count: number;
}

interface AnalyticsData {
  total_users: number;
  total_trips: number;
  total_stops: number;
  total_activities: number;
  popular_cities: PopularCity[];
  trips_over_time: { date: string; count: number }[];
}

export const AdminDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const analytics = await apiFetch('/api/admin/analytics');
        setData(analytics);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6 border border-slate-100 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-xs text-slate-500">{error || 'Only administrators can access this workspace.'}</p>
      </div>
    );
  }

  // Format popular cities data for BarChart
  const barChartData = data.popular_cities.map(item => ({
    City: item.city_name,
    Stops: item.trip_count
  }));

  // Format trips over time for LineChart
  const lineChartData = data.trips_over_time.map(item => ({
    Date: new Date(item.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
    Trips: item.count
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="h-7 w-7 text-amber-600" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Admin & Analytics Console</h1>
          <p className="text-slate-500 text-sm mt-0.5">Analyze user registration trends, stopover counts, and popular destinations.</p>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.total_users}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trips Planned</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.total_trips}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stops</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.total_stops}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-pink-50 text-pink-600 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activities Created</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.total_activities}</h3>
          </div>
        </div>
      </div>

      {/* Main Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart for Trip Registration trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-800">Trip Starts Distribution</h3>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="Date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Legend fontSize={10} />
                <Line type="monotone" dataKey="Trips" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart for popular stops */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-800">Popular Stopover Destinations</h3>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="City" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Stops" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User distribution analytics table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800">Top Booked Destinations Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">City Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Global Stops Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.popular_cities.map((city, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-400">#{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{city.city_name}</td>
                  <td className="px-4 py-3">{city.country}</td>
                  <td className="px-4 py-3">
                    <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-bold">
                      {city.trip_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
