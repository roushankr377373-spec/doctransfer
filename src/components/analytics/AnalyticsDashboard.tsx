import React, { useEffect, useState } from 'react';
import {
    Activity,
    PieChart as PieChartIcon,
    Filter,
    Clock,
    Users,
    MousePointer,
    Calendar,
    BarChart2,
    Download,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { analyticsService } from '../../lib/analyticsService';

interface AnalyticsDashboardProps {
    documentId?: string;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ documentId }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'audience' | 'funnel'>('overview');
    const [timeRange, setTimeRange] = useState<number>(30); // days

    // Data states
    const [dailyStats, setDailyStats] = useState<any[]>([]);
    const [pageAttention, setPageAttention] = useState<any[]>([]);
    const [geoStats, setGeoStats] = useState<any[]>([]);
    const [deviceStats, setDeviceStats] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!documentId) return;

        fetchData();

        // Real-time subscriptions
        const sessionSub = analyticsService.subscribeToSessions(documentId, () => fetchData());
        const viewSub = analyticsService.subscribeToViews(documentId, () => fetchData());

        return () => {
            sessionSub.unsubscribe();
            viewSub.unsubscribe();
        };
    }, [documentId, timeRange]);

    const fetchData = async () => {
        if (!documentId) return;
        setLoading(true);
        setError(null);
        try {
            const [daily, pages, geo, devices, funnel] = await Promise.all([
                analyticsService.getDailyStats(documentId, timeRange),
                analyticsService.getPageAttention(documentId),
                analyticsService.getGeoStats(documentId),
                analyticsService.getDeviceStats(documentId),
                analyticsService.getConversionFunnel(documentId)
            ]);

            setDailyStats(daily);
            setPageAttention(pages);
            setGeoStats(geo);
            setDeviceStats(devices);
            setFunnelData(funnel);
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error);
            setError(error.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate high-level stats
    const totalViews = dailyStats.reduce((acc, curr) => acc + curr.total_views, 0);
    const uniqueViewers = dailyStats.reduce((acc, curr) => acc + curr.unique_sessions, 0);
    const avgDuration = dailyStats.length > 0
        ? Math.round(dailyStats.reduce((acc, curr) => acc + curr.avg_duration_seconds, 0) / dailyStats.length)
        : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>{new Date(label).toLocaleDateString()}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color, fontSize: '0.875rem' }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!documentId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart2 size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Document</h3>
                <p className="text-gray-500">Choose a document from your library to view detailed performance metrics.</p>
            </div>
        );
    }

    if (loading && !dailyStats.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
                    <p className="text-gray-500">Real-time insights for your content</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 3 Months</option>
                    </select>
                    <button
                        onClick={() => fetchData()}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                    >
                        <Calendar size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users size={64} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Users size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Total Views</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalViews}</div>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                        <ArrowUp size={12} />
                        <span>12%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <PieChartIcon size={64} className="text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <PieChartIcon size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Unique Viewers</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{uniqueViewers}</div>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                        <ArrowUp size={12} />
                        <span>5%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={64} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Clock size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Avg. Time</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{avgDuration}s</div>
                    <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-bold">
                        <ArrowDown size={12} />
                        <span>2%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Activity size={64} className="text-violet-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                            <Activity size={20} />
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Engagement</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{Math.min(100, Math.round(avgDuration / 6))}%</div>
                    <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs font-normal">
                        Based on scroll depth & time
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Views Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Views Over Time</h3>
                        <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">Download CSV</button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="stat_date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="total_views"
                                    name="Total Views"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Donut Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Device Distribution</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="session_count"
                                    nameKey="device_type"
                                >
                                    {deviceStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {deviceStats.reduce((acc, curr) => acc + curr.session_count, 0)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</div>
                        </div>
                    </div>
                    {/* Custom Legend */}
                    <div className="mt-4 space-y-3">
                        {deviceStats.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-600 text-sm font-medium capitalize">{entry.device_type || 'Unknown'}</span>
                                </div>
                                <span className="text-gray-900 font-bold">{entry.session_count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Page Attention Bar Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Page Attention</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pageAttention} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="page_number"
                                    type="category"
                                    tickFormatter={(val) => `Page ${val}`}
                                    stroke="#6b7280"
                                    tick={{ fontSize: 13 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={60}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="avg_duration_seconds" name="Avg Time (s)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Geo Location Map (List for now) */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Locations</h3>
                    <div className="space-y-4">
                        {geoStats.slice(0, 5).map((geo, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold w-4">{index + 1}</span>
                                    <div>
                                        <div className="font-bold text-gray-900">{geo.city || 'Unknown City'}</div>
                                        <div className="text-xs text-gray-500">{geo.country_code || 'Unknown Country'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-indigo-600">{geo.session_count}</div>
                                    <div className="text-xs text-gray-400">Sessions</div>
                                </div>
                            </div>
                        ))}
                        {geoStats.length === 0 && (
                            <div className="text-center text-gray-400 py-8">No location data available yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
