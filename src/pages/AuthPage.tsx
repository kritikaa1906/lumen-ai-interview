import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          name,
          targetRole,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('alex.dev@lumenstudio.ai', 'password123');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6 bg-[#111310]">
      <div className="w-full max-w-md bg-[#1B1E19] border border-[#282C24] rounded-xl p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#111310] border border-[#C6F36B]/40 text-[#C6F36B] mb-2">
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[#F5F2E9]">
            {mode === 'login' ? 'Candidate Sign In' : 'Create Candidate Profile'}
          </h2>
          <p className="text-xs text-[#A7B09C]">
            {mode === 'login'
              ? 'Access your mock interview cockpit and historical analytics'
              : 'Begin practicing with personalized AI evaluations and MySQL persistence'}
          </p>
        </div>

        {/* 1-Click Demo Profile Banner */}
        <div className="p-3.5 rounded-lg bg-[#111310] border border-[#282C24] flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-medium text-[#F5F2E9]">
              <Sparkles className="w-3.5 h-3.5 text-[#C6F36B]" />
              <span>Demo Candidate Ready</span>
            </div>
            <div className="text-[11px] text-[#74796F]">
              Pre-loaded with completed sessions & evaluations
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all whitespace-nowrap shrink-0"
          >
            Sign In as Alex
          </button>
        </div>

        {/* Mode Toggle (Segmented control button) */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-[#111310] border border-[#282C24]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'login' ? 'bg-[#1B1E19] text-[#C6F36B] shadow-sm' : 'text-[#74796F] hover:text-[#F5F2E9]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'register' ? 'bg-[#1B1E19] text-[#C6F36B] shadow-sm' : 'text-[#74796F] hover:text-[#F5F2E9]'
            }`}
          >
            Register Profile
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B09C]">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#74796F]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B09C]">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] focus:border-[#C6F36B] focus:outline-none"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="SQL Developer">SQL Developer</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A7B09C]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#74796F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A7B09C]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#74796F]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-xs bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Studio' : 'Create Studio Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
