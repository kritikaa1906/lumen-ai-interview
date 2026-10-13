import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onNavigate,
  children,
}) => {
  const { user } = useAuth();
  const isCockpit = currentTab === 'cockpit';
  const isLandingOrAuth = currentTab === 'landing' || currentTab === 'auth';
  const showSidebar = user && !isCockpit && !isLandingOrAuth;

  return (
    <div className="min-h-screen bg-[#111310] text-[#F5F2E9] flex flex-col font-sans selection:bg-[#C6F36B] selection:text-[#111310]">
      {/* Top Bar Contract (hidden inside cockpit for maximum focus) */}
      {!isCockpit && (
        <TopNavigation currentTab={currentTab} onNavigate={onNavigate} />
      )}

      {/* Main Content Arena */}
      <div className="flex-1 flex w-full">
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar currentTab={currentTab} onNavigate={onNavigate} />
          </div>
        )}
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
};
