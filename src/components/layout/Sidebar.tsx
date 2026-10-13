import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlaySquare,
  History,
  FileText,
  Sliders,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-interview', label: 'Start Interview', icon: PlaySquare },
    { id: 'history', label: 'Interview History', icon: History },
    { id: 'resumes', label: 'Resume Profiles', icon: FileText },
    { id: 'settings', label: 'Settings & MySQL', icon: Sliders },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#141712] border-r border-[#282C24] flex flex-col justify-between p-4 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* Candidate Context Pill-less Header */}
        <div className="px-3 py-3 rounded-lg bg-[#1B1E19] border border-[#282C24]">
          <div className="text-xs uppercase tracking-wider text-[#74796F] font-medium">Candidate</div>
          <div className="text-sm font-bold text-[#F5F2E9] truncate mt-0.5">{user?.name || 'Alex Chen'}</div>
          <div className="text-xs text-[#A7B09C] truncate">{user?.targetRole || 'Full-Stack Developer'}</div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1B1E19] text-[#C6F36B] border border-[#C6F36B]/20 font-semibold shadow-sm'
                    : 'text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#1B1E19]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6F36B]' : 'text-[#74796F]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#282C24] space-y-3">
        {/* Live Studio Engine note */}
        <div className="p-3 rounded-lg bg-[#111310] border border-[#282C24] text-[11px] text-[#74796F]">
          <div className="flex items-center gap-1.5 text-[#A7B09C] font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C6F36B]" />
            <span>Rubric Engine</span>
          </div>
          <p className="leading-relaxed">
            Evaluations weighted by Relevance (40%), Technical Depth (30%), Clarity (20%), and Evidence (10%).
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#74796F] hover:text-[#F5F2E9] rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
