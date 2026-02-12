import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import {
  Activity, MapPin, Zap, Clock, Navigation, Users, AlertTriangle,
  TrendingUp, Radio, CheckCircle2, MapPinned, Truck, UserCheck,
  Target, BarChart3
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCRM } from '../../context/CRMContext';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        font-size: 18px;
      ">
        ${icon}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Default demo data for map display
const defaultMapStaff = [
  { id: '1', name: 'Thomas Anderson', role: 'Admin', lat: 40.7128, lng: -74.0060, status: 'active' },
  { id: '2', name: 'Trinity Moss', role: 'Agent', lat: 40.7580, lng: -73.9855, status: 'active' },
  { id: '3', name: 'Neo Smith', role: 'Tech', lat: 40.7489, lng: -73.9680, status: 'active' },
  { id: '4', name: 'Morpheus Jones', role: 'Lead', lat: 40.7614, lng: -73.9776, status: 'active' },
];

const defaultMapJobs = [
  { id: '1', title: 'HVAC Repair - Downtown', lat: 40.7306, lng: -73.9352, status: 'active', priority: 'high' },
  { id: '2', title: 'Plumbing Service - Midtown', lat: 40.7549, lng: -73.9840, status: 'active', priority: 'normal' },
  { id: '3', title: 'Electrical Install - Upper West', lat: 40.7870, lng: -73.9754, status: 'active', priority: 'normal' },
];

const defaultMapAlerts = [
  { id: '1', title: 'Emergency Call - Brooklyn', lat: 40.6782, lng: -73.9442, type: 'emergency', severity: 'critical' },
];

const DispatchMatrix: React.FC = () => {
  const { jobs, crews, users, dispatchAlerts, upsertRecord } = useCRM();
  const [mapOverlays, setMapOverlays] = useState({
    clockedStaff: true,
    activeJobs: true,
    emergencyAlerts: true,
  });

  const [slaCompliance, setSlaCompliance] = useState(98);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use CRM data or fallback to defaults for map display
  const mapStaff = useMemo(() => {
    if (users.length > 0) {
      // Map users to map-compatible format with mock coordinates
      return users.slice(0, 4).map((u, i) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        lat: defaultMapStaff[i % defaultMapStaff.length].lat,
        lng: defaultMapStaff[i % defaultMapStaff.length].lng,
        status: 'active' as const
      }));
    }
    return defaultMapStaff;
  }, [users]);

  const mapJobs = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status === 'Scheduled' || j.status === 'InProgress');
    if (activeJobs.length > 0) {
      return activeJobs.slice(0, 5).map((j, i) => ({
        id: j.id,
        title: j.subject,
        lat: defaultMapJobs[i % defaultMapJobs.length].lat,
        lng: defaultMapJobs[i % defaultMapJobs.length].lng,
        status: 'active' as const,
        priority: j.priority === 'Urgent' || j.priority === 'High' ? 'high' : 'normal'
      }));
    }
    return defaultMapJobs;
  }, [jobs]);

  const mapAlerts = useMemo(() => {
    const activeAlerts = dispatchAlerts.filter(a => !a.isDismissed && !a.isAcknowledged);
    if (activeAlerts.length > 0) {
      return activeAlerts.slice(0, 3).map((a, i) => ({
        id: a.id,
        title: a.title,
        lat: defaultMapAlerts[i % defaultMapAlerts.length]?.lat || 40.6782,
        lng: defaultMapAlerts[i % defaultMapAlerts.length]?.lng || -73.9442,
        type: a.type === 'critical' ? 'emergency' : a.type,
        severity: a.type
      }));
    }
    return defaultMapAlerts;
  }, [dispatchAlerts]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate minor fluctuations
      setSlaCompliance(prev => Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate summary stats from real data
  const stats = useMemo(() => {
    const activeJobsCount = jobs.filter(j => j.status === 'Scheduled' || j.status === 'InProgress').length;
    const completedJobsCount = jobs.filter(j => j.status === 'Completed').length;
    const activeAlertsCount = dispatchAlerts.filter(a => !a.isDismissed && !a.isAcknowledged).length;

    return {
      activeJobs: activeJobsCount || mapJobs.length,
      techsInField: mapStaff.filter(s => s.status === 'active').length,
      slaCompliance,
      emergencyAlerts: activeAlertsCount || mapAlerts.length,
      avgResponseTime: 8,
      completionRate: 94,
      jobsCompleted: completedJobsCount || 127,
      totalDistance: 428,
    };
  }, [jobs, dispatchAlerts, mapStaff, mapJobs, mapAlerts, slaCompliance]);

  const toggleOverlay = (key: 'clockedStaff' | 'activeJobs' | 'emergencyAlerts') => {
    setMapOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const staffIcon = createCustomIcon('#10b981', '👷');
  const jobIcon = createCustomIcon('#3b82f6', '🔧');
  const alertIcon = createCustomIcon('#ef4444', '⚠️');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 rounded-full border border-blue-200">
              <Navigation size={12} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Logistics Node</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Fleet Control & Dispatch</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-Time Operations Command Center</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-[25px] font-bold active:scale-95 transition-all">
            Filters
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-[25px] font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            Dispatch Job
          </button>
        </div>
      </div>

      {/* Summary Cards - Flash UI 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Jobs */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Truck size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Active Jobs</h3>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.activeJobs}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            In progress across zones
          </p>
        </div>

        {/* Techs in Field */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Techs in Field</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats.techsInField}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Clocked-on and active
          </p>
        </div>

        {/* SLA Compliance */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-violet-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">SLA Compliance</h3>
          </div>
          <p className="text-3xl font-black text-violet-600">{stats.slaCompliance.toFixed(0)}%</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            <span className="inline-flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-600" />
              <span className="text-emerald-600">+2% vs last week</span>
            </span>
          </p>
        </div>

        {/* Emergency Alerts */}
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-rose-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Emergency Alerts</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">{stats.emergencyAlerts}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.emergencyAlerts > 0 ? (
              <span className="text-rose-600 font-black animate-pulse">Requires immediate attention</span>
            ) : (
              'No active emergencies'
            )}
          </p>
        </div>
      </div>

      {/* Performance Metrics - Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-[35px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-slate-500" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Response</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgResponseTime}min</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[35px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-slate-500" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completion Rate</h4>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.completionRate}%</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[35px]">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-slate-500" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jobs Completed</h4>
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.jobsCompleted}</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[35px]">
          <div className="flex items-center gap-2 mb-2">
            <MapPinned size={16} className="text-slate-500" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Distance</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalDistance}km</p>
        </div>
      </div>

      {/* Map Overlays Section - Flash UI */}
      <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[20px] flex items-center justify-center">
            <MapPin size={20} className="text-slate-600" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Map Overlays</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Clocked-On Staff Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[25px]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
              <div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide block">Clocked-On Staff</span>
                <span className="text-xs font-bold text-emerald-600">{stats.techsInField} active</span>
              </div>
            </div>
            <button
              onClick={() => toggleOverlay('clockedStaff')}
              className={`w-12 h-6 rounded-full transition-all shadow-md ${
                mapOverlays.clockedStaff ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                mapOverlays.clockedStaff ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          {/* Active Service Jobs Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-[25px]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
              <div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide block">Active Service Jobs</span>
                <span className="text-xs font-bold text-blue-600">{stats.activeJobs} jobs</span>
              </div>
            </div>
            <button
              onClick={() => toggleOverlay('activeJobs')}
              className={`w-12 h-6 rounded-full transition-all shadow-md ${
                mapOverlays.activeJobs ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                mapOverlays.activeJobs ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          {/* Emergency Alerts Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 rounded-[25px]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"></div>
              <div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide block">Emergency Alerts</span>
                <span className="text-xs font-bold text-rose-600">{mapAlerts.length} critical</span>
              </div>
            </div>
            <button
              onClick={() => toggleOverlay('emergencyAlerts')}
              className={`w-12 h-6 rounded-full transition-all shadow-md ${
                mapOverlays.emergencyAlerts ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                mapOverlays.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Live Map - Enhanced Flash UI */}
      <div className="bg-white border border-slate-200 rounded-[35px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-[20px] flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Live Operations Map</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  <Radio size={10} className="text-emerald-500 animate-pulse" />
                  Real-time tracking enabled
                </span>
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: '500px' }}>
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Staff Markers */}
            {mapOverlays.clockedStaff && mapStaff.map(staff => (
              <Marker key={staff.id} position={[staff.lat, staff.lng]} icon={staffIcon}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-900">{staff.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{staff.role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-emerald-600">Active</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Job Markers */}
            {mapOverlays.activeJobs && mapJobs.map(job => (
              <Marker key={job.id} position={[job.lat, job.lng]} icon={jobIcon}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-900">{job.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${job.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <span className="text-xs font-semibold capitalize">{job.priority} Priority</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Emergency Alerts */}
            {mapOverlays.emergencyAlerts && mapAlerts.map(alert => (
              <React.Fragment key={alert.id}>
                <Marker position={[alert.lat, alert.lng]} icon={alertIcon}>
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-rose-900">{alert.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-600" />
                        <span className="text-xs font-semibold text-rose-600 uppercase">{alert.severity}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[alert.lat, alert.lng]}
                  radius={500}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1 }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Execution Pulse - Enhanced Dark Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-[35px] shadow-2xl overflow-hidden border border-slate-700">
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-20">
          {mapStaff.map((staff, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-pulse"
              style={{
                top: `${20 + i * 15}%`,
                left: `${30 + i * 20}%`,
                animationDelay: `${i * 0.3}s`
              }}
            ></div>
          ))}
          {mapJobs.map((job, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full animate-pulse"
              style={{
                top: `${40 + i * 10}%`,
                right: `${25 + i * 15}%`,
                animationDelay: `${i * 0.4}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-[20px] flex items-center justify-center border border-yellow-500/30">
              <Zap size={24} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Execution Pulse</h3>
              <p className="text-xs text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Radio size={10} className="text-emerald-500 animate-pulse" />
                  Live • Updated {currentTime.toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-5xl font-black text-white mb-2">
              {stats.activeJobs} Active Job{stats.activeJobs !== 1 ? 's' : ''}
            </p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
              {stats.techsInField} Techs in Field • {slaCompliance.toFixed(0)}% SLA Compliance
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-[25px] border border-white/10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg Response</p>
              <p className="text-2xl font-black text-white">{stats.avgResponseTime}min</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-[25px] border border-white/10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Completion Rate</p>
              <p className="text-2xl font-black text-emerald-400">{stats.completionRate}%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-[25px] border border-white/10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Emergencies</p>
              <p className="text-2xl font-black text-rose-400">{mapAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Timeline - Enhanced Flash UI */}
      <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-[20px] flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Execution Timeline</h3>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-2 rounded-[20px] border border-slate-200">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Today</span>
            <span className="text-sm font-black text-slate-900">{currentTime.toLocaleDateString('en-US')}</span>
          </div>
        </div>

        {/* Time Markers */}
        <div className="flex gap-8 mb-6 border-b border-slate-100 pb-4 overflow-x-auto">
          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
            <div key={hour} className="flex flex-col items-center min-w-[60px]">
              <span className={`text-xs font-bold ${currentTime.getHours() === hour ? 'text-blue-600' : 'text-slate-400'}`}>
                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
              </span>
              {currentTime.getHours() === hour && (
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full mt-2 shadow-lg shadow-blue-500/50"></div>
              )}
            </div>
          ))}
        </div>

        {/* Team Members Schedule */}
        <div className="space-y-4">
          {mapStaff.map((staff, index) => {
            const colors = [
              { gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100' },
              { gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
              { gradient: 'from-orange-500 to-rose-500', bg: 'from-orange-50 to-rose-50', border: 'border-orange-100' },
              { gradient: 'from-violet-500 to-purple-500', bg: 'from-violet-50 to-purple-50', border: 'border-violet-100' }
            ];
            const colorSet = colors[index % colors.length];
            const initials = staff.name.split(' ').map(n => n[0]).join('');
            const scheduleWidth = `${30 + (index * 15)}%`;

            return (
              <div key={staff.id} className={`flex items-center gap-4 p-4 bg-gradient-to-br ${colorSet.bg} border ${colorSet.border} rounded-[25px] hover:shadow-md transition-all`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${colorSet.gradient} rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900">{staff.name}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{staff.role}</p>
                </div>
                <div className="flex-1 bg-white rounded-[20px] p-3 border border-slate-200 shadow-sm">
                  <div className={`h-2 bg-gradient-to-r ${colorSet.gradient} rounded-full transition-all shadow-sm`} style={{ width: scheduleWidth }}></div>
                  <p className="text-xs font-bold text-slate-500 mt-2">{mapJobs[index % mapJobs.length]?.title || 'Available'}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-xs font-bold text-emerald-600">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Alert Banner (if active) */}
      {stats.emergencyAlerts > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6 rounded-[35px] shadow-lg shadow-rose-500/20 border border-rose-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wide">Emergency Alert Active</h4>
                <p className="text-sm text-rose-100 font-semibold">{stats.emergencyAlerts} critical {stats.emergencyAlerts === 1 ? 'alert' : 'alerts'} requiring immediate dispatch</p>
              </div>
            </div>
            <button className="bg-white hover:bg-rose-50 text-rose-600 px-6 py-3 rounded-[20px] font-black uppercase tracking-wide shadow-lg active:scale-95 transition-all">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchMatrix;
