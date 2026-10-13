/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewInterviewPage } from './pages/NewInterviewPage';
import { InterviewRoomPage } from './pages/InterviewRoomPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ResumesPage } from './pages/ResumesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(null);

  // Sync with initial auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (currentTab === 'landing' || currentTab === 'auth') {
          setCurrentTab('dashboard');
        }
      } else {
        if (currentTab !== 'landing' && currentTab !== 'auth') {
          setCurrentTab('landing');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111310] flex flex-col items-center justify-center p-8 text-[#A7B09C] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6F36B]" />
        <span className="text-xs font-mono">Initializing Lumen Interview Studio...</span>
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    if (!user && tab !== 'landing' && tab !== 'auth') {
      setCurrentTab('auth');
      return;
    }
    setCurrentTab(tab);
  };

  const handleStartInterview = () => {
    if (!user) {
      setCurrentTab('auth');
    } else {
      setCurrentTab('new-interview');
    }
  };

  const handleInterviewCreated = (id: number) => {
    setActiveInterviewId(id);
    setCurrentTab('cockpit');
  };

  const handleFinishInterview = (id: number) => {
    setActiveInterviewId(id);
    setCurrentTab('results');
  };

  const handleViewResults = (id: number) => {
    setActiveInterviewId(id);
    setCurrentTab('results');
  };

  const handleResumeInterview = (id: number) => {
    setActiveInterviewId(id);
    setCurrentTab('cockpit');
  };

  return (
    <AppLayout currentTab={currentTab} onNavigate={handleNavigate}>
      {currentTab === 'landing' && (
        <LandingPage
          onStart={handleStartInterview}
          onLogin={() => setCurrentTab('auth')}
        />
      )}

      {currentTab === 'auth' && (
        <AuthPage onSuccess={() => setCurrentTab('dashboard')} />
      )}

      {currentTab === 'dashboard' && (
        <DashboardPage
          onStartInterview={() => setCurrentTab('new-interview')}
          onViewResults={handleViewResults}
          onResumeInterview={handleResumeInterview}
          onNavigateTab={handleNavigate}
        />
      )}

      {currentTab === 'new-interview' && (
        <NewInterviewPage
          onInterviewCreated={handleInterviewCreated}
          onNavigateTab={handleNavigate}
        />
      )}

      {currentTab === 'cockpit' && activeInterviewId && (
        <InterviewRoomPage
          interviewId={activeInterviewId}
          onFinish={handleFinishInterview}
          onExit={() => setCurrentTab('dashboard')}
        />
      )}

      {currentTab === 'results' && activeInterviewId && (
        <ResultsPage
          interviewId={activeInterviewId}
          onPracticeAgain={() => setCurrentTab('new-interview')}
          onReturnDashboard={() => setCurrentTab('dashboard')}
        />
      )}

      {currentTab === 'history' && (
        <HistoryPage
          onViewResults={handleViewResults}
          onResumeInterview={handleResumeInterview}
          onNewInterview={() => setCurrentTab('new-interview')}
        />
      )}

      {currentTab === 'resumes' && <ResumesPage />}

      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
