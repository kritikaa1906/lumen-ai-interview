import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DatabaseHealth } from '../types';
import {
  User,
  Database,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; hasGeminiKey: boolean; service: string } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const fetchDiagnostics = async () => {
    setLoadingHealth(true);
    try {
      const [dbRes, apiRes] = await Promise.all([api.getDbHealth(), api.getHealth()]);
      if (dbRes.success && dbRes.health) {
        setDbHealth(dbRes.health);
      }
      setApiHealth(apiRes);
    } catch (err: any) {
      console.error('Failed to load diagnostics:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await api.updateProfile({ name, title, targetRole });
      if (res.success) {
        setSuccess('Profile updated successfully.');
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[#282C24]">
        <div className="text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
          Configuration & Diagnostics
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9] mt-1">
          Profile & System Architecture
        </h1>
        <p className="text-xs text-[#A7B09C] mt-1">
          Manage candidate preferences, review MySQL schema health, and inspect runtime integrations.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Candidate Profile Settings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#282C24]">
              <User className="w-4 h-4 text-[#C6F36B]" />
              <h3 className="text-sm font-bold text-[#F5F2E9]">Candidate Profile Details</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#A7B09C] font-medium">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] focus:border-[#C6F36B] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A7B09C] font-medium">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Candidate"
                  className="w-full p-2.5 rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] focus:border-[#C6F36B] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A7B09C] font-medium">Target Engineering Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] focus:border-[#C6F36B] focus:outline-none"
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

              <div className="space-y-1.5">
                <label className="text-[#74796F] font-medium">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full p-2.5 rounded-lg bg-[#111310]/50 border border-[#282C24] text-[#74796F] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#74796F]">Email is immutable once registered</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-lg font-semibold bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Database Health & Architecture Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#282C24]">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#C6F36B]" />
                <h3 className="text-sm font-bold text-[#F5F2E9]">Database Health & Schema</h3>
              </div>
              <button
                onClick={fetchDiagnostics}
                className="p-1.5 rounded text-[#74796F] hover:text-[#F5F2E9] hover:bg-[#111310] transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingHealth ? (
              <div className="p-4 text-xs text-[#74796F] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Querying schema...
              </div>
            ) : dbHealth ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded bg-[#111310] border border-[#282C24] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#74796F]">Active Storage Dialect:</span>
                    <span className="font-mono text-[#C6F36B] font-semibold">
                      {dbHealth.dialect}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#74796F]">MySQL 8 Native Pool:</span>
                    <span className={`font-mono ${dbHealth.isMysqlConnected ? 'text-[#22C55E]' : 'text-[#A7B09C]'}`}>
                      {dbHealth.isMysqlConnected ? 'CONNECTED' : 'STANDALONE READY'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#74796F]">Google Gemini AI Key:</span>
                    <span className={`font-mono ${apiHealth?.hasGeminiKey ? 'text-[#22C55E]' : 'text-[#EAB308]'}`}>
                      {apiHealth?.hasGeminiKey ? 'CONFIGURED' : 'CURATED POOL FALLBACK'}
                    </span>
                  </div>
                </div>

                {/* Table row counts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#A7B09C]">
                    Relational Tables & Live Record Counts
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">users:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.usersCount}</span>
                    </div>
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">interviews:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.interviewsCount}</span>
                    </div>
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">questions:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.questionsCount}</span>
                    </div>
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">answers:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.answersCount}</span>
                    </div>
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">results:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.resultsCount}</span>
                    </div>
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] flex justify-between">
                      <span className="text-[#74796F]">resume_profiles:</span>
                      <span className="text-[#F5F2E9] tabular-nums">{dbHealth.stats.resumesCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#74796F]">
                  Schema DDL is version-controlled at <code className="text-[#A7B09C]">database/schema.sql</code> and seeds at <code className="text-[#A7B09C]">database/seed.sql</code>.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
