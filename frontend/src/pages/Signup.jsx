import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Shield, Layers, ArrowRight } from 'lucide-react';
import api from '../services/api';
import CustomButton from '../components/CustomButton';

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Submit Registration
      await api.post('/auth/register', { fullName, email, password, role });

      // 2. Perform Automatic Log In immediately
      const payload = await api.post('/auth/login', { email, password });
      const authData = payload.data;

      // 3. Store Session
      localStorage.setItem('df_token', authData.accessToken);
      localStorage.setItem('df_user', JSON.stringify({
        email: authData.email,
        role: authData.role,
        fullName: authData.fullName || fullName
      }));

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. User may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-screen w-full flex items-center justify-center bg-bg-space relative overflow-hidden px-4 select-none" style={{ minHeight: '100vh' }}>
      {/* Glow Backdrops */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr bg-white/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[430px] glass-panel bg-bg-card/60 p-8 border border-white/[0.08]"
      >
        <div className="absolute inset-0 bg-gradient-to-br bg-white text-black rounded-2xl -z-10 opacity-[0.03] blur-xl" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 bg-gradient-to-br bg-white text-black rounded-xl flex items-center justify-center shadow-premium mb-4">
            <Layers className="text-white animate-pulse-slow" size={22} />
          </div>
          <h2 className="font-branding text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-xs text-text-secondary mt-1.5">Join your team's release coordination workspaces</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-3.5 font-medium leading-relaxed"
            >
              {errorMsg}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary">Full Member Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-text-muted" size={16} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary">Corporate Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-text-muted" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary">Secret Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-text-muted" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary">Operational Role</label>
            <div className="relative flex items-center">
              <Shield className="absolute left-4 text-text-muted" size={16} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-premium pl-12 pr-4 appearance-none"
              >
                <option value="DEVELOPER">DEVELOPER (Triggers pipelines)</option>
                <option value="RELEASE_MANAGER">RELEASE_MANAGER (Approves staging)</option>
                <option value="ADMIN">ADMIN (Full system control)</option>
              </select>
            </div>
          </div>

          <CustomButton type="submit" loading={loading} className="w-full mt-2">
            <span>Register & Log In</span>
            <ArrowRight size={15} />
          </CustomButton>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-text-link font-semibold hover:text-white transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
