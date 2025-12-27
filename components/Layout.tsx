
import React, { useState } from 'react';
import { LayoutDashboard, ShieldCheck, Globe, BarChart3, ChevronDown, Users, User as UserIcon, Menu, X, UsersRound, TrendingUp, Info, Sun, Moon } from 'lucide-react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'citizen' | 'admin' | 'impact' | 'feed' | 'profile' | 'auth';
  onViewChange: (view: 'citizen' | 'admin' | 'impact' | 'feed' | 'profile' | 'auth') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: (newTheme?: 'light' | 'dark') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange, 
  language, 
  onLanguageChange,
  currentUser,
  onLogout,
  theme,
  onThemeToggle
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const availableLanguages: { name: Language, label: string }[] = [
    { name: 'English', label: 'English' },
    { name: 'Español', label: 'Español' },
    { name: 'Hindi', label: 'हिन्दी (Hindi)' },
    { name: 'Tamil', label: 'தமிழ் (Tamil)' }
  ];

  const navItems = [
    { id: 'citizen', label: t.nav.report, icon: ShieldCheck },
    { id: 'feed', label: t.nav.feed, icon: Users },
    { id: 'impact', label: t.nav.impact, icon: BarChart3 },
    { id: 'admin', label: t.nav.admin, icon: LayoutDashboard }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onViewChange('citizen')}
            >
              <div className="w-9 h-9 bg-zinc-900 dark:bg-stone-100 rounded-xl flex items-center justify-center text-white dark:text-zinc-900 transition-all group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:scale-105">
                <ShieldCheck size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-stone-100 leading-none tracking-tight">CivicPulse</h1>
                <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">Community Portal</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center ml-8 border-l border-stone-200 dark:border-zinc-800 pl-4 h-8 gap-1">
              {navItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === tab.id 
                      ? 'bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-stone-100 shadow-sm ring-1 ring-stone-200 dark:ring-zinc-700' 
                      : 'text-stone-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle - Explicit Choice */}
            <div className="p-1 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center shadow-inner border border-stone-200 dark:border-zinc-700">
              <button 
                onClick={() => onThemeToggle('light')}
                className={`p-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  theme === 'light' 
                    ? 'bg-white text-orange-500 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                aria-label="Day Mode"
              >
                <Sun size={14} fill={theme === 'light' ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={() => onThemeToggle('dark')}
                className={`p-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-zinc-900 text-blue-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
                aria-label="Dark Mode"
              >
                <Moon size={14} fill={theme === 'dark' ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800 rounded-lg">
               <UsersRound size={14} className="text-stone-400 dark:text-zinc-500" />
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-stone-100">1,248,312</span>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={10} />
                      42
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tighter leading-none">City Population</span>
               </div>
            </div>

            <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>

            <div className="relative hidden sm:block">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-stone-100 transition-all"
              >
                <Globe size={14} />
                <span>{language}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 overflow-hidden ring-1 ring-black/5">
                  {availableLanguages.map(l => (
                    <button 
                      key={l.name}
                      onClick={() => { onLanguageChange(l.name); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-stone-50 dark:hover:bg-zinc-800/50 ${language === l.name ? 'text-blue-600 dark:text-blue-400 bg-stone-50/50 dark:bg-zinc-800/30' : 'text-stone-600 dark:text-zinc-400'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              {currentUser ? (
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-zinc-600 transition-all shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-zinc-900 text-[10px] font-bold shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden ring-1 ring-black/5">
                      <div className="px-4 py-3 border-b border-stone-100 dark:border-zinc-800 mb-1">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentUser.email}</p>
                      </div>
                      <button onClick={() => { onViewChange('profile'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                        <UserIcon size={14} className="text-stone-400" /> Profile
                      </button>
                      <button onClick={() => { onLogout(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-stone-50 dark:border-zinc-800 flex items-center gap-2">
                        <X size={14} /> Sign out
                      </button>
                    </div>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => onViewChange('auth')}
                  className="bg-blue-600 dark:bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 rounded-lg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800 animate-in slide-in-from-top duration-300">
            <div className="p-4 space-y-1">
              {navItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { onViewChange(tab.id as any); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold ${
                    currentView === tab.id 
                      ? 'bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-stone-100' 
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:py-12">
        {children}
      </main>

      <footer className="bg-stone-100 dark:bg-black py-16 border-t border-stone-200 dark:border-zinc-900 text-stone-500 dark:text-zinc-500 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                <ShieldCheck className="text-blue-600 dark:text-blue-500" />
                <span className="text-2xl font-black tracking-tighter">CivicPulse</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-stone-600 dark:text-zinc-400 font-medium text-pretty">Empowering contemporary cities with intelligent reporting and high-fidelity data analysis. Built on the Gemini AI ecosystem.</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase text-zinc-900 dark:text-white tracking-[0.2em] mb-8">Service Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Incident Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Data Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">System API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase text-zinc-900 dark:text-white tracking-[0.2em] mb-8">Municipal Office</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Agency Support</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Transparency Portal</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Registry</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-stone-200 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
            <div className="text-stone-400 dark:text-zinc-600">© 2025 CivicPulse Municipal Services. Secure Platform.</div>
            <div className="flex gap-8">
               <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">System Status</a>
               <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Security Controls</a>
               <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Legal Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
