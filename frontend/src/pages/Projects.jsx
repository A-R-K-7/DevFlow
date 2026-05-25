import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Plus, ExternalLink, Trash2, X } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const payload = await api.get('/projects?size=50');
      setProjects(payload.data.content);
    } catch (err) {
      console.error('Failed to load projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    setErrorMsg(null);

    try {
      await api.post('/projects', { projectName, description, repositoryUrl });
      fetchProjects();
      setIsOpen(false);
      setProjectName('');
      setDescription('');
      setRepositoryUrl('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register repository.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this repository and all associated logs?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative select-none">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border-glass pb-5">
        <div>
          <h3 className="font-branding text-sm font-bold text-white uppercase tracking-wider">Managed Repositories</h3>
          <p className="text-xs text-text-muted mt-1 font-semibold">Active code bases integrated into release tracks</p>
        </div>
        <CustomButton onClick={() => setIsOpen(true)}>
          <Plus size={15} />
          <span>Add Repository</span>
        </CustomButton>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[210px] w-full bg-white/[0.02] border border-border-glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <GlassCard key={p.id} className="relative flex flex-col justify-between h-[210px] group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-premium">
                    <FolderGit2 size={16} />
                  </div>
                  {/* Environment health pills */}
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-emerald" title="DEV Active" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-emerald" title="QA Active" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-emerald" title="STAGING Active" />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted" title="PRODUCTION Standby" />
                  </div>
                </div>

                <h3 className="font-branding text-base font-bold text-white tracking-wide">{p.projectName}</h3>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed mt-1.5 line-clamp-2 pr-4">{p.description}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-glass/40">
                <a 
                  href={p.repositoryUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-text-link hover:text-white transition-colors duration-200"
                >
                  <ExternalLink size={12} />
                  <span>Repository Link</span>
                </a>
                
                {/* Delete trigger */}
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  className="text-text-muted hover:text-accent-rose p-1.5 hover:bg-accent-rose/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Delete Repository"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-xs italic text-text-muted">
          // No repositories registered. Add one above to get started!
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md glass-panel bg-bg-card p-6 border border-white/[0.08]"
            >
              <div className="flex items-center justify-between border-b border-border-glass pb-4 mb-5">
                <h3 className="font-branding text-base font-bold text-white">Add Managed Project</h3>
                <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white p-1 hover:bg-white/[0.05] rounded-lg transition-all">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-3">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., core-checkout-api"
                    className="input-premium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the service codebase..."
                    className="input-premium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Git Repository URL</label>
                  <input
                    type="url"
                    required
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="e.g., https://github.com/org/repo.git"
                    className="input-premium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-glass">
                  <CustomButton variant="secondary" onClick={() => setIsOpen(false)}>Cancel</CustomButton>
                  <CustomButton type="submit" loading={btnLoading}>Create Repository</CustomButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
