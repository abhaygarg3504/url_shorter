import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useRouter } from '@tanstack/react-router';
import type { RootState } from '../store/store';
import {
  getUserAnalyticsData,
  getGeographicHeatmap,
  getDeviceAnalyticsData,
  getReferrerAnalyticsData,
  getUrlAnalyticsData
} from '../api/analytics_api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  Globe, 
  Monitor, 
  Users, 
  TrendingUp, 
  Link, 
  Calendar,
  MapPin,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: string;
}

interface TabButtonProps {
  id: 'overview' | 'geographic' | 'devices' | 'referrers' | 'urls';
  label: string;
  isActive: boolean;
  onClick: (id: 'overview' | 'geographic' | 'devices' | 'referrers' | 'urls') => void;
}

// Error component
const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-700">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-red-600 hover:text-red-800 flex items-center"
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        Retry
      </button>
    )}
  </div>
);

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'geographic' | 'devices' | 'referrers' | 'urls'>('overview');
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.navigate({ to: '/auth' });
    }
  }, [isAuthenticated, user, router]);

  // Queries with proper error handling
  const { 
    data: userAnalytics, 
    isLoading: userLoading, 
    error: userError,
    refetch: refetchUserAnalytics 
  } = useQuery({
    queryKey: ['userAnalytics', timeRange],
    queryFn: getUserAnalyticsData,
    enabled: !!user && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: geographicData, 
    isLoading: geoLoading, 
    error: geoError,
    refetch: refetchGeographicData 
  } = useQuery({
    queryKey: ['geographicData'],
    queryFn: getGeographicHeatmap,
    enabled: !!user && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: deviceData, 
    isLoading: deviceLoading, 
    error: deviceError,
    refetch: refetchDeviceData 
  } = useQuery({
    queryKey: ['deviceData'],
    queryFn: getDeviceAnalyticsData,
    enabled: !!user && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: referrerData, 
    isLoading: referrerLoading, 
    error: referrerError,
    refetch: refetchReferrerData 
  } = useQuery({
    queryKey: ['referrerData'],
    queryFn: getReferrerAnalyticsData,
    enabled: !!user && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: urlAnalytics, 
    isLoading: urlLoading, 
    error: urlError,
    refetch: refetchUrlAnalytics 
  } = useQuery({
    queryKey: ['urlAnalytics', selectedUrl],
    queryFn: () => getUrlAnalyticsData(selectedUrl),
    enabled: !!selectedUrl && !!user && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
    </div>
  );

  const TabButton: React.FC<TabButtonProps> = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  // Time range selector
  const TimeRangeSelector = () => (
    <div className="flex gap-2">
      {(['7d', '30d', '90d'] as const).map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-3 py-1 rounded text-sm ${
            timeRange === range
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
        </button>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Error handling */}
      {userError && (
        <ErrorMessage 
          message="Failed to load analytics data. Please try again." 
          onRetry={() => refetchUserAnalytics()}
        />
      )}

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Overview</h2>
        <TimeRangeSelector />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clicks"
          value={userAnalytics?.totalClicks?.toLocaleString() || '0'}
          icon={Users}
          trend="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Total URLs"
          value={userAnalytics?.totalUrls?.toString() || '0'}
          icon={Link}
          trend="+3 new this week"
          color="green"
        />
        <StatCard
          title="Avg Clicks/URL"
          value={userAnalytics?.totalUrls ? Math.round((userAnalytics?.totalClicks || 0) / userAnalytics.totalUrls).toString() : '0'}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Countries Reached"
          value={geographicData?.length?.toString() || '0'}
          icon={Globe}
          color="orange"
        />
      </div>

      {/* Click Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Click Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={userAnalytics?.clicksByDay || []}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorClicks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top URLs Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Top Performing URLs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Short URL</th>
                <th className="text-left py-2">Original URL</th>
                <th className="text-left py-2">Clicks</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {userAnalytics?.topUrls?.map((url, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-blue-600">{url.shortUrl}</td>
                  <td className="py-2">
                    <a href={url.fullUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center">
                      {url.fullUrl.length > 50 ? `${url.fullUrl.substring(0, 50)}...` : url.fullUrl}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </td>
                  <td className="py-2 font-semibold">{url.clicks}</td>
                  <td className="py-2">
                    <button
                      onClick={() => setSelectedUrl(url.shortUrl)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGeographic = () => (
    <div className="space-y-6">
      {geoError && (
        <ErrorMessage 
          message="Failed to load geographic data. Please try again." 
          onRetry={() => refetchGeographicData()}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Geographic Distribution
        </h3>
        {geoLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geographicData?.slice(0, 10) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Country List */}
            <div className="space-y-2">
              <h4 className="font-semibold">Top Countries</h4>
              <div className="max-h-64 overflow-y-auto">
                {geographicData?.map((country, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-blue-600 font-semibold">{country.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      {deviceError && (
        <ErrorMessage 
          message="Failed to load device data. Please try again." 
          onRetry={() => refetchDeviceData()}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Device & Browser Analytics
        </h3>
        {deviceLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Type Pie Chart */}
            <div>
              <h4 className="font-semibold mb-2">Device Types</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData?.reduce((acc: any[], device) => {
                      const existing = acc.find(d => d.deviceType === device.deviceType);
                      if (existing) {
                        existing.clicks += device.clicks;
                      } else {
                        acc.push({ deviceType: device.deviceType, clicks: device.clicks });
                      }
                      return acc;
                    }, []) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ deviceType, percent }) => `${deviceType} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {deviceData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Browser Distribution */}
            <div>
              <h4 className="font-semibold mb-2">Top Browsers</h4>
              <div className="space-y-2">
                {deviceData?.slice(0, 5).map((device, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{device.browser}</span>
                    <span className="text-blue-600 font-semibold">{device.clicks}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Systems */}
            <div>
              <h4 className="font-semibold mb-2">Operating Systems</h4>
              <div className="space-y-2">
                {deviceData?.slice(0, 5).map((device, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{device.os}</span>
                    <span className="text-blue-600 font-semibold">{device.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReferrers = () => (
    <div className="space-y-6">
      {referrerError && (
        <ErrorMessage 
          message="Failed to load referrer data. Please try again." 
          onRetry={() => refetchReferrerData()}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2" />
          Traffic Sources
        </h3>
        {referrerLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrer Type Distribution */}
            <div>
              <h4 className="font-semibold mb-2">Traffic Sources</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={referrerData?.reduce((acc: any[], ref) => {
                      const existing = acc.find(r => r.referrerType === ref.referrerType);
                      if (existing) {
                        existing.clicks += ref.clicks;
                      } else {
                        acc.push({ referrerType: ref.referrerType, clicks: ref.clicks });
                      }
                      return acc;
                    }, []) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ referrerType, percent }) => `${referrerType} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {referrerData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Referrer List */}
            <div>
              <h4 className="font-semibold mb-2">Top Referrers</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {referrerData?.map((ref, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ref.referrer || 'Direct'}</span>
                      <span className="text-blue-600 font-semibold">{ref.clicks}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Type: {ref.referrerType}
                      {ref.utmSource && (
                        <span className="ml-2">Source: {ref.utmSource}</span>
                      )}
                      {ref.utmMedium && (
                        <span className="ml-2">Medium: {ref.utmMedium}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUrlDetails = () => (
    <div className="space-y-6">
      {selectedUrl && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">URL Analytics: {selectedUrl}</h3>
            <button
              onClick={() => setSelectedUrl('')}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {urlError && (
            <ErrorMessage 
              message="Failed to load URL analytics. Please try again." 
              onRetry={() => refetchUrlAnalytics()}
            />
          )}
          
          {urlLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : urlAnalytics ? (
            <div className="space-y-6">
              {/* URL Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Total Clicks</h4>
                  <p className="text-2xl font-bold text-blue-600">{urlAnalytics.totalClicks}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Original URL</h4>
                  <p className="text-sm text-green-600 truncate">{urlAnalytics.fullUrl}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Created</h4>
                  <p className="text-sm text-purple-600">Recently</p>
                </div>
              </div>

              {/* Click Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Click Timeline</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={urlAnalytics.clicksByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Clicks */}
              <div>
                <h4 className="font-semibold mb-2">Recent Clicks</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Time</th>
                        <th className="text-left py-2">Location</th>
                        <th className="text-left py-2">Device</th>
                        <th className="text-left py-2">Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urlAnalytics.clicks?.slice(0, 10).map((click, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2">{new Date(click.timestamp).toLocaleString()}</td>
                          <td className="py-2">{click.country || 'Unknown'}</td>
                          <td className="py-2">{click.deviceType} - {click.browser}</td>
                          <td className="py-2">{click.referrerType || 'Direct'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available for this URL</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Deep insights into your URL performance</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton id="geographic" label="Geographic" isActive={activeTab === 'geographic'} onClick={setActiveTab} />
        <TabButton id="devices" label="Devices" isActive={activeTab === 'devices'} onClick={setActiveTab} />
        <TabButton id="referrers" label="Traffic Sources" isActive={activeTab === 'referrers'} onClick={setActiveTab} />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'geographic' && renderGeographic()}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'referrers' && renderReferrers()}
        {selectedUrl && renderUrlDetails()}
      </div>
    </div>
  );
};

export default Analytics;