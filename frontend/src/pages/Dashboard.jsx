import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  PackageOpen, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';
import { subscribeToTopic, unsubscribeFromTopic } from '../services/websocket';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDeployments: 0,
    successRate: 0,
    failureRate: 0,
    deploymentsByStatus: {},
    deploymentsByEnvironment: {}
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to live websocket channel to instantly refresh metrics/rows
    subscribeToTopic('/topic/deployments', (message) => {
      // Refresh dashboard on completeSUCCESS or FAILED pipeline transitions
      if (message.status === 'SUCCESS' || message.status === 'FAILED') {
        fetchDashboardData();
      } else {
        // Manually prepend to live activities feed
        setActivities(prev => {
          const exists = prev.find(item => item.id === message.deploymentId);
          if (exists) {
            return prev.map(item => item.id === message.deploymentId ? { ...item, deploymentStatus: message.status } : item);
          }
          const tr = {
            id: message.deploymentId,
            deploymentName: `Release Simulator [WS]`,
            deploymentVersion: 'v1.0.0-sim',
            environment: message.environment,
            deploymentStatus: message.status,
            startedAt: message.timestamp
          };
          return [tr, ...prev].slice(0, 10);
        });
      }
    });

    return () => {
      // Clean up subscriptions
      try {
        unsubscribeFromTopic('/topic/deployments');
      } catch (e) {}
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get Stats
      const statsPayload = await api.get('/dashboard/stats');
      setStats(statsPayload.data);

      // Get activities feed
      const activityPayload = await api.get('/dashboard/activity');
      setActivities(activityPayload.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert status mappings for Recharts
  const getStatusData = () => {
    const defaultData = [
      { name: 'PENDING', value: stats.deploymentsByStatus?.PENDING || 0 },
      { name: 'RUNNING', value: stats.deploymentsByStatus?.RUNNING || 0 },
      { name: 'SUCCESS', value: stats.deploymentsByStatus?.SUCCESS || 0 },
      { name: 'FAILED', value: stats.deploymentsByStatus?.FAILED || 0 }
    ];
    return defaultData;
  };

  // Convert environment mappings for Recharts
  const getEnvironmentData = () => {
    return [
      { name: 'DEV', value: stats.deploymentsByEnvironment?.DEV || 0, color: '#e58a8a' },
      { name: 'QA', value: stats.deploymentsByEnvironment?.QA || 0, color: '#d4b245' },
      { name: 'STAGING', value: stats.deploymentsByEnvironment?.STAGING || 0, color: '#6cb5a3' },
      { name: 'PRODUCTION', value: stats.deploymentsByEnvironment?.PRODUCTION || 0, color: '#8ab8c7' }
    ];
  };

  const statusColors = {
    PENDING: 'rgba(212, 178, 69, 0.8)', // Yellow
    RUNNING: 'rgba(108, 181, 163, 0.8)', // Teal
    SUCCESS: 'rgba(138, 184, 199, 0.8)', // Lightblue
    FAILED: 'rgba(229, 138, 138, 0.8)'   // Coral
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. STATS KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Repositories</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Briefcase size={16} />
            </div>
          </div>
          <h2 className="font-branding text-3xl font-extrabold text-white mt-4">{stats.totalProjects}</h2>
          <p className="text-[10px] text-text-muted font-semibold mt-1">Tracked codebases</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Deployments Today</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <PackageOpen size={16} />
            </div>
          </div>
          <h2 className="font-branding text-3xl font-extrabold text-white mt-4">{stats.totalDeployments}</h2>
          <p className="text-[10px] text-text-muted font-semibold mt-1">Across environments</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="font-branding text-3xl font-extrabold text-accent-emerald mt-4">
            {Math.round(stats.successRate)}%
          </h2>
          <p className="text-[10px] text-text-muted font-semibold mt-1">Simulation pipelines</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pipeline Health</span>
            <div className="w-8 h-8 rounded-lg bg-accent-rose/10 flex items-center justify-center text-accent-rose">
              <AlertOctagon size={16} />
            </div>
          </div>
          <h2 className="font-branding text-3xl font-extrabold text-accent-rose mt-4">
            {Math.round(stats.failureRate)}%
          </h2>
          <p className="text-[10px] text-text-muted font-semibold mt-1">Unresolved build errors</p>
        </GlassCard>
      </div>

      {/* 2. RECHARTS GRAPHICAL CHARTS PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Release Activity Bar Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col h-[350px]" hoverEffect={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider">Release Activity</h3>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-full"><TrendingUp size={11}/> KPI Status</span>
          </div>
          <div className="flex-grow w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getStatusData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {getStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Environment Mix Doughnut */}
        <GlassCard className="flex flex-col h-[350px]" hoverEffect={false}>
          <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider mb-6">Environment Mix</h3>
          <div className="flex-grow w-full h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getEnvironmentData()}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getEnvironmentData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Overlay center label */}
            <div className="absolute top-[37%] flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Target</span>
              <span className="font-branding text-xl font-bold text-white mt-0.5">Envs</span>
            </div>
          </div>
          {/* Custom legends */}
          <div className="grid grid-cols-4 gap-2 text-center mt-2 border-t border-border-glass pt-4">
            {getEnvironmentData().map((entry, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: entry.color }} />
                <span className="text-[9px] font-bold text-text-secondary">{entry.name}</span>
                <span className="text-xs font-bold text-white mt-0.5">{entry.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 3. RECENT ACTIVITY LIST TABLE */}
      <GlassCard className="flex flex-col" hoverEffect={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider">Live Pipeline Feed</h3>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-full"><Clock size={11}/> Dynamic Stream</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-glass text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <th className="pb-3 pl-2">ID</th>
                <th className="pb-3">Deployment Name</th>
                <th className="pb-3">Version</th>
                <th className="pb-3">Environment</th>
                <th className="pb-3">Triggered Date</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((item, idx) => {
                  const date = new Date(item.startedAt || Date.now());
                  return (
                    <tr key={idx} className="border-b border-border-glass/40 text-xs text-text-secondary hover:text-white hover:bg-white/[0.01] transition-colors duration-200">
                      <td className="py-4 pl-2 font-mono font-bold text-text-muted">#{item.id}</td>
                      <td className="py-4 font-bold">{item.deploymentName}</td>
                      <td className="py-4 font-mono font-medium text-text-muted">{item.deploymentVersion}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-white/[0.04] border border-border-glass rounded text-[10px] font-bold tracking-wide uppercase">{item.environment}</span>
                      </td>
                      <td className="py-4 text-text-muted font-medium">{date.toLocaleDateString()} {date.toLocaleTimeString()}</td>
                      <td className="py-4 text-right pr-2">
                        <StatusBadge status={item.deploymentStatus} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs italic text-text-muted">// No recent build pipelines tracked. Click Pipelines to trigger one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
