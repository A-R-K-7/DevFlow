import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Layers, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../services/api';
import CustomButton from '../components/CustomButton';

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Send secure login request using Axios api service
      const payload = await api.post('/auth/login', { email, password });
      
      // Unpack responseData data block
      const authData = payload.data;
      
      // Store in localStorage
      localStorage.setItem('df_token', authData.accessToken);
      localStorage.setItem('df_user', JSON.stringify({
        email: authData.email,
        role: authData.role,
        fullName: authData.fullName || authData.email.split('@')[0]
      }));

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-screen w-full flex items-center justify-center bg-bg-space relative overflow-hidden px-4 select-none" style={{ minHeight: '100vh' }}>
      {/* Dynamic Radial Glow Background */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr bg-white/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Auth centered Glass Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[430px] glass-panel bg-bg-card/60 p-8 border border-white/[0.08] relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br bg-white text-black rounded-2xl -z-10 opacity-[0.03] blur-xl" />

        {/* Head Logo branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 bg-gradient-to-br bg-white text-black rounded-xl flex items-center justify-center shadow-premium mb-4">
            <Layers className="text-white animate-pulse-slow" size={22} />
          </div>
          <h2 className="font-branding text-2xl font-bold tracking-tight text-white">Welcome back to Dev<span className="text-accent">Flow</span></h2>
          <p className="text-xs text-text-secondary mt-1.5">Sign in to your enterprise DevOps workspace</p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-3.5 font-medium leading-relaxed"
            >
              {errorMsg}
            </motion.div>
          )}

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-secondary">Secret Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-text-muted" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-premium pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-text-muted hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <CustomButton type="submit" loading={loading} className="w-full mt-2">
            <span>Sign In to Workspace</span>
            <ArrowRight size={15} />
          </CustomButton>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          New to DevFlow?{' '}
          <Link to="/signup" className="text-text-link font-semibold hover:text-white transition-colors duration-200">
            Create workspace account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
