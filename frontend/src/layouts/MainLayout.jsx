import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Terminal, 
  BarChart3, 
  LogOut, 
  Layers, 
  Menu, 
  ChevronLeft, 
  Bell, 
  Search, 
  Compass 
} from 'lucide-react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [user, setUser] = useState({ email: 'developer@company.com', role: 'DEVELOPER', fullName: 'Developer' });

  // Load user details from localStorage
  useEffect(() => {
    const cachedUser = localStorage.getItem('df_user');
    const cachedToken = localStorage.getItem('df_token');
    
    try {
      const parsedUser = JSON.parse(cachedUser);
      if (!parsedUser) throw new Error("Invalid user");
      setUser(parsedUser);
    } catch (e) {
      localStorage.removeItem('df_token');
      localStorage.removeItem('df_user');
      navigate('/login');
      return;
    }

    // Connect real-time STOMP WebSockets
    connectWebSocket(
      () => setWsConnected(true),
      () => setWsConnected(false)
    );

    return () => {
      disconnectWebSocket();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('df_token');
    localStorage.removeItem('df_user');
    disconnectWebSocket();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Pipelines', path: '/deployments', icon: Terminal },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const currentPath = location.pathname;
  const currentTitle = navItems.find(item => item.path === currentPath)?.name || 'Dashboard';

  return (
    <div className="flex h-screen bg-bg-space overflow-hidden font-sans select-none relative z-10">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-white/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-white/10 blur-[130px] pointer-events-none -z-10" />

      {/* COLLAPSIBLE SIDEBAR */}
      <motion.aside 
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="h-full bg-bg-card/75 border-r border-border-glass backdrop-blur-xl flex flex-col p-5 z-20"
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center gap-3 mb-10 overflow-hidden px-1.5">
          <div className="relative flex-shrink-0 w-9 h-9 bg-gradient-to-br bg-white text-black rounded-lg flex items-center justify-center shadow-premium">
            <div className="absolute inset-0 bg-inherit filter blur-sm opacity-50 -z-10 animate-pulse-slow" />
            <Layers className="text-white" size={18} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-branding text-xl font-bold tracking-tight text-white whitespace-nowrap"
              >
                Dev<span className="bg-gradient-to-r bg-white text-black bg-clip-text text-transparent">Flow</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-grow flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/[0.08] text-white border border-white/20 shadow-premium' 
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : ''} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-xs font-semibold whitespace-nowrap tracking-wide"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Badge */}
        <div className="border-t border-border-glass pt-5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br bg-white text-black flex items-center justify-center text-white text-sm font-bold font-branding flex-shrink-0 shadow-premium">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col overflow-hidden max-w-[120px]"
              >
                <span className="text-xs font-bold text-white truncate">{user?.fullName || 'User'}</span>
                <span className="text-[9px] font-semibold text-text-muted tracking-wider uppercase mt-0.5">{user?.role || 'GUEST'}</span>
              </motion.div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="text-text-muted hover:text-accent-rose p-2 hover:bg-accent-rose/10 rounded-lg transition-all duration-300"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </motion.aside>

      {/* CONTENT SHELL AREA */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border-glass bg-bg-space/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="text-text-secondary hover:text-white p-1.5 hover:bg-white/[0.04] rounded-lg transition-all duration-300"
            >
              <Menu size={16} />
            </button>
            <h1 className="font-branding text-xl font-bold tracking-tight text-white">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Websocket pulses */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-border-glass rounded-full text-[10px] font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-accent-emerald animate-pulse shadow-emerald' : 'bg-accent-rose shadow-rose'}`} />
              <span className="text-text-secondary uppercase tracking-wider">{wsConnected ? 'Websocket Live' : 'Feed Stalled'}</span>
            </div>

            {/* Notification alert bells */}
            <button className="text-text-secondary hover:text-white p-2 hover:bg-white/[0.04] rounded-lg transition-all duration-300">
              <Bell size={16} />
            </button>

            {/* Workspace Select */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.04] border border-border-glass rounded-xl text-xs font-semibold text-white">
              <Compass size={14} className="text-white" />
              <span>Corp_Workspace</span>
            </div>
          </div>
        </header>

        {/* Dynamic page context frame */}
        <section className="flex-grow p-8 overflow-y-auto bg-bg-space/10 scroll-smooth">
          {children}
        </section>
      </main>
    </div>
  );
}
