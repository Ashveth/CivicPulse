
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CitizenPortal } from './components/CitizenPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ImpactDashboard } from './components/ImpactDashboard';
import { CommunityFeed } from './components/CommunityFeed';
import { ChatAssistant } from './components/ChatAssistant';
import { AuthPortal } from './components/AuthPortal';
import { UserProfile } from './components/UserProfile';
import { IssueReport, Status, Severity, IssueType, Language, Comment, User } from './types';

const MOCK_ISSUES: IssueReport[] = [
  {
    id: '1',
    timestamp: Date.now() - 3600000 * 24,
    description: 'Major pothole on Main St causing traffic slowdowns.',
    status: Status.IN_PROGRESS,
    citizenId: 'user1',
    location: { lat: 40.7128, lng: -74.006, address: 'Main St & Broadway' },
    analysis: {
      issueType: IssueType.POTHOLE,
      severity: Severity.HIGH,
      priorityScore: 85,
      citizenSummary: 'A serious pothole reported on a high-traffic street.',
      authorityAction: 'Immediate asphalt repair required during off-peak hours.',
      detectedDuplicatesCount: 2
    },
    comments: [
      { id: 'c1', author: 'Neighbor Sam', text: 'I saw this yesterday, very dangerous!', timestamp: Date.now() - 3600000 * 5 }
    ],
    upvotes: 12,
    upvotedBy: []
  },
  {
    id: '2',
    timestamp: Date.now() - 3600000 * 48,
    description: 'Broken streetlight near the park entrance. It is pitch black at night.',
    status: Status.PENDING,
    citizenId: 'user2',
    location: { lat: 40.7306, lng: -73.9352, address: 'Central Park East Gate' },
    analysis: {
      issueType: IssueType.LIGHTING,
      severity: Severity.MEDIUM,
      priorityScore: 45,
      citizenSummary: 'Light out near park, visibility is poor.',
      authorityAction: 'Schedule bulb replacement within next maintenance cycle.',
      detectedDuplicatesCount: 0
    },
    comments: [],
    upvotes: 4,
    upvotedBy: []
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'citizen' | 'admin' | 'impact' | 'feed' | 'auth' | 'profile'>('citizen');
  const [issues, setIssues] = useState<IssueReport[]>(MOCK_ISSUES);
  const [language, setLanguage] = useState<Language>('English');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const addIssue = (newIssue: IssueReport) => {
    setIssues(prev => [newIssue, ...prev]);
  };

  const updateStatus = (id: string, newStatus: Status) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: newStatus } : issue
    ));
  };

  const addComment = (issueId: string, comment: Comment) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, comments: [...(issue.comments || []), comment] } 
        : issue
    ));
  };

  const handleUpvote = (issueId: string) => {
    if (!currentUser) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const upvotedBy = issue.upvotedBy || [];
        const isAlreadyUpvoted = upvotedBy.includes(currentUser.id);
        
        return {
          ...issue,
          upvotes: isAlreadyUpvoted ? (issue.upvotes || 1) - 1 : (issue.upvotes || 0) + 1,
          upvotedBy: isAlreadyUpvoted 
            ? upvotedBy.filter(id => id !== currentUser.id)
            : [...upvotedBy, currentUser.id]
        };
      }
      return issue;
    }));
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setView('citizen');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('citizen');
  };

  const toggleTheme = (newTheme?: 'light' | 'dark') => {
    if (newTheme) {
      setTheme(newTheme);
    } else {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <Layout 
      currentView={view as any} 
      onViewChange={setView as any} 
      language={language} 
      onLanguageChange={setLanguage}
      currentUser={currentUser}
      onLogout={handleLogout}
      theme={theme}
      onThemeToggle={toggleTheme}
    >
      {view === 'citizen' && (
        <CitizenPortal 
          onSubmit={addIssue} 
          recentReports={issues} 
          language={language} 
          currentUser={currentUser}
          onViewChange={setView as any}
        />
      )}
      {view === 'feed' && (
        <CommunityFeed 
          issues={issues} 
          onAddComment={addComment} 
          onUpvote={handleUpvote}
          language={language} 
          currentUser={currentUser}
        />
      )}
      {view === 'admin' && (
        <AdminDashboard issues={issues} onUpdateStatus={updateStatus} language={language} />
      )}
      {view === 'impact' && (
        <ImpactDashboard language={language} theme={theme} />
      )}
      {view === 'auth' && (
        <AuthPortal onAuth={handleAuth} language={language} />
      )}
      {view === 'profile' && currentUser && (
        <UserProfile user={currentUser} issues={issues} language={language} />
      )}
      <ChatAssistant />
    </Layout>
  );
};

export default App;
