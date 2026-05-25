import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Cpu, ShieldCheck, Box, CloudLightning } from 'lucide-react';
import api from '../services/api';
import { subscribeToTopic, unsubscribeFromTopic } from '../services/websocket';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';

export default function Deployments() {
  const [projects, setProjects] = useState([]);
  const [activeDeploymentId, setActiveDeploymentId] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([
    '// CI/CD Engine standing by. Trigger a release to stream execution logs.'
  ]);
  const [activeNode, setActiveNode] = useState('IDLE'); // IDLE, PENDING, COMPILING, TESTING, PACKAGING, DEPLOYING, SUCCESS, FAILED
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('DEV');
  const [version, setVersion] = useState('');
  const [commit, setCommit] = useState('');

  useEffect(() => {
    // Load repositories list for dropdown
    api.get('/projects?size=50')
      .then(resp => setProjects(resp.data.content))
      .catch(e => console.error(e));

    // Listen to STOMP WebSocket deployment broadcasts
    subscribeToTopic('/topic/deployments', (message) => {
      handleIncomingPipelineUpdate(message);
    });

    return () => {
      try {
        unsubscribeFromTopic('/topic/deployments');
      } catch (e) {}
    };
  }, []);

  // Prep form with random version & commit values on dropdown changes
  const handleProjectChange = (e) => {
    const val = e.target.value;
    setSelectedProjectId(val);
    setVersion(`v1.0.${Math.floor(Math.random() * 100)}-build`);
    setCommit(`main [${Math.random().toString(16).substring(2, 9)}]`);
  };

  const handleIncomingPipelineUpdate = (update) => {
    // Check if the message matches our active running build
    if (activeDeploymentId && activeDeploymentId === update.deploymentId) {
      // 1. Add line to console logger
      const timestamp = new Date(update.timestamp).toLocaleTimeString();
      const consoleLine = `[${timestamp}] [${update.status}] ${update.message}`;
      setConsoleLogs(prev => [...prev, consoleLine]);

      // 2. Set node visual states
      setActiveNode(update.status);
    }
  };

  // Sync node ref update when activeDeploymentId changes (needed to bypass callback closures)
  const activeDepIdRef = React.useRef(activeDeploymentId);
  useEffect(() => {
    activeDepIdRef.current = activeDeploymentId;
  }, [activeDeploymentId]);

  // Overwrite the connection ingestion dynamically to resolve state closure hooks
  useEffect(() => {
    subscribeToTopic('/topic/deployments', (message) => {
      if (activeDepIdRef.current && activeDepIdRef.current === message.deploymentId) {
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        const consoleLine = `[${timestamp}] [${message.status}] ${message.message}`;
        setConsoleLogs(prev => {
          // Clear placeholder line on initial log append
          const cleanPrev = prev.length === 1 && prev[0].includes('standing by') ? [] : prev;
          return [...cleanPrev, consoleLine];
        });
        setActiveNode(message.status);
      }
    });
  }, []);

  const handleTriggerPipeline = async (e) => {
    e.preventDefault();
    setLoading(true);
    setConsoleLogs([]);
    setActiveNode('PENDING');

    const payload = {
      projectId: parseInt(selectedProjectId),
      deploymentName: `Release Simulator [${commit.split(' ')[0]}]`,
      deploymentVersion: version,
      environment: selectedEnv
    };

    try {
      const resp = await api.post('/deployments', payload);
      const dep = resp.data;
      
      // Save active deployment lock
      setActiveDeploymentId(dep.id);
      
      const timestamp = new Date().toLocaleTimeString();
      setConsoleLogs([`[${timestamp}] [PENDING] Initializing build simulation #${dep.id} on ${dep.environment}...`]);
    } catch (err) {
      alert(err.message || 'Trigger failed');
      setActiveNode('FAILED');
    } finally {
      setLoading(false);
    }
  };

  // Node glowing ring classes helper
  const getNodeClasses = (nodeName) => {
    const base = 'flex flex-col items-center gap-2.5 relative flex-1';
    let ringColor = 'border-text-muted text-text-muted bg-white/[0.01]';
    let labelColor = 'text-text-muted';
    let hasPulse = false;

    const pipelineSequence = ['PENDING', 'COMPILING', 'TESTING', 'PACKAGING', 'DEPLOYING', 'SUCCESS'];
    const activeIdx = pipelineSequence.indexOf(activeNode);
    const nodeIdx = pipelineSequence.indexOf(nodeName);

    if (activeNode === 'FAILED') {
      ringColor = 'border-accent-rose text-accent-rose bg-accent-rose/5 shadow-rose animate-pulse-ring';
      labelColor = 'text-accent-rose';
    } 
    else if (activeNode === 'SUCCESS') {
      ringColor = 'border-accent-emerald text-accent-emerald bg-accent-emerald/5 shadow-emerald';
      labelColor = 'text-accent-emerald';
    }
    else if (isActiveNodeRunning(nodeName)) {
      ringColor = 'border-white text-white bg-white/10 shadow-indigo animate-pulse-ring';
      labelColor = 'text-white';
      hasPulse = true;
    }
    else if (nodeIdx !== -1 && activeIdx !== -1 && nodeIdx < activeIdx) {
      ringColor = 'border-accent-emerald text-accent-emerald bg-accent-emerald/5';
      labelColor = 'text-accent-emerald';
    }

    return { base, ringColor, labelColor, hasPulse };
  };

  const isActiveNodeRunning = (nodeName) => {
    return activeNode === nodeName;
  };

  // Connector paths color checks
  const getConnectorClass = (connectorIdx) => {
    const pipelineSequence = ['PENDING', 'COMPILING', 'TESTING', 'PACKAGING', 'DEPLOYING', 'SUCCESS'];
    const activeIdx = pipelineSequence.indexOf(activeNode);

    let styles = 'h-[3px] flex-grow -mx-3 -mt-6 transition-all duration-300 opacity-20 bg-text-muted';

    if (activeNode === 'SUCCESS') {
      return `${styles} opacity-100 bg-accent-emerald shadow-emerald`;
    }
    if (activeNode === 'FAILED') {
      return `${styles} opacity-40 bg-accent-rose`;
    }

    if (activeIdx >= connectorIdx + 1) {
      return `${styles} opacity-100 bg-accent-emerald shadow-emerald`;
    }
    if (activeIdx === connectorIdx) {
      return `${styles} opacity-100 bg-white shadow-indigo animate-pulse`;
    }

    return styles;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none relative">
      
      {/* Left Form triggers */}
      <GlassCard className="h-fit flex flex-col gap-5 border border-white/[0.08]" hoverEffect={false}>
        <div className="border-b border-border-glass pb-4">
          <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider">Trigger Build Pipeline</h3>
        </div>

        <form onSubmit={handleTriggerPipeline} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Target Project</label>
            <select 
              value={selectedProjectId} 
              onChange={handleProjectChange}
              required
              className="input-premium"
            >
              <option value="" disabled>Select a codebase...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Target Environment</label>
            <select 
              value={selectedEnv} 
              onChange={(e) => setSelectedEnv(e.target.value)}
              required
              className="input-premium"
            >
              <option value="DEV">DEV (Local Dev Cluster)</option>
              <option value="QA">QA (Automated Tests)</option>
              <option value="STAGING">STAGING (Pre-Prod Staging)</option>
              <option value="PRODUCTION">PRODUCTION (Production Fleet)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Release Version</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.0.0-release"
              className="input-premium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Branch Commit Hash</label>
            <input
              type="text"
              required
              value={commit}
              onChange={(e) => setCommit(e.target.value)}
              placeholder="e.g. main [f2a36cd]"
              className="input-premium"
            />
          </div>

          <CustomButton type="submit" loading={loading} className="w-full mt-2">
            <PlayCircle size={16} />
            <span>Trigger CI/CD Pipeline</span>
          </CustomButton>
        </form>
      </GlassCard>

      {/* Right dynamic status nodes and CLI console terminal */}
      <GlassCard className="lg:col-span-2 flex flex-col gap-6" hoverEffect={false}>
        <div className="flex items-center justify-between border-b border-border-glass pb-4">
          <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider">Active Pipeline Flow</h3>
          {activeDeploymentId && (
            <span className="font-mono text-xs font-bold text-text-link bg-white/10 px-3 py-1 rounded-full border border-white/20 shadow-indigo">
              DEPLOYMENT #{activeDeploymentId}
            </span>
          )}
        </div>

        {/* Dynamic visual path nodes diagram */}
        <div className="flex items-center justify-between p-6 bg-black/30 rounded-2xl border border-white/[0.04]">
          
          {/* Queue pending node */}
          {(() => {
            const { base, ringColor, labelColor } = getNodeClasses('PENDING');
            return (
              <div className={base}>
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${ringColor}`}>
                  <Clock size={16} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>Queue</span>
              </div>
            );
          })()}
          <div className={getConnectorClass(1)} />

          {/* Compile Node */}
          {(() => {
            const { base, ringColor, labelColor } = getNodeClasses('COMPILING');
            return (
              <div className={base}>
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${ringColor}`}>
                  <Cpu size={16} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>Compile</span>
              </div>
            );
          })()}
          <div className={getConnectorClass(2)} />

          {/* Test Node */}
          {(() => {
            const { base, ringColor, labelColor } = getNodeClasses('TESTING');
            return (
              <div className={base}>
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${ringColor}`}>
                  <ShieldCheck size={16} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>Tests</span>
              </div>
            );
          })()}
          <div className={getConnectorClass(3)} />

          {/* Package Node */}
          {(() => {
            const { base, ringColor, labelColor } = getNodeClasses('PACKAGING');
            return (
              <div className={base}>
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${ringColor}`}>
                  <Box size={16} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>Package</span>
              </div>
            );
          })()}
          <div className={getConnectorClass(4)} />

          {/* Deploy Node */}
          {(() => {
            const { base, ringColor, labelColor } = getNodeClasses('DEPLOYING');
            return (
              <div className={base}>
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${ringColor}`}>
                  <CloudLightning size={16} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>Deploy</span>
              </div>
            );
          })()}
          
        </div>

        {/* Warp CLI console logger */}
        <div className="flex-grow flex flex-col bg-black border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl min-h-[220px]">
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#080808] border-b border-white/[0.04]">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-rose/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald/70" />
            <span className="font-mono text-[10px] text-text-muted mx-auto">devflow-pipelines-console.log</span>
          </div>
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-1 max-h-[220px] select-text">
            {consoleLogs.map((line, idx) => {
              let color = 'text-slate-300';
              if (line.includes('[SUCCESS]')) color = 'text-accent-emerald font-bold';
              else if (line.includes('[FAILED]')) color = 'text-accent-rose font-bold';
              else if (line.includes('[PENDING]')) color = 'text-text-muted';
              else if (line.includes('[RUNNING]') || line.includes('[COMPILING]') || line.includes('[TESTING]') || line.includes('[PACKAGING]') || line.includes('[DEPLOYING]')) color = 'text-accent-cyan';

              return (
                <div key={idx} className={`font-mono text-[10px] leading-relaxed ${color}`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>

      </GlassCard>
    </div>
  );
}
