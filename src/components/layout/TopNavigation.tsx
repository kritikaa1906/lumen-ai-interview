import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Plus, LogOut, User as UserIcon } from 'lucide-react';

interface TopNavigationProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#282C24] bg-[#111310]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
        >
          <div className="w-7 h-7 rounded bg-[#1B1E19] border border-[#C6F36B]/40 flex items-center justify-center text-[#C6F36B] group-hover:border-[#C6F36B] transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-[#F5F2E9] group-hover:text-white transition-colors">
            LUMEN
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A7B09C]">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'dashboard' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('new-interview')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'new-interview' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Mock Studio
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'history' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Session History
              </button>
              <button
                onClick={() => onNavigate('resumes')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'resumes' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Resume Profiles
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'settings' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Diagnostics & SQL
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9] ${
                  currentTab === 'landing' ? 'text-[#C6F36B] font-semibold' : ''
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9]"
              >
                Rubric Methodology
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9]"
              >
                Role Question Sets
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#F5F2E9]"
              >
                Candidate Sign In
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Exactly 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('new-interview')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded text-[#74796F] hover:text-[#F5F2E9] hover:bg-[#1B1E19] border border-transparent hover:border-[#282C24] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all whitespace-nowrap shrink-0"
            >
              Start Free Mock Session
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
