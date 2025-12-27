
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Github, Chrome, Twitter, Apple } from 'lucide-react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface AuthPortalProps {
  onAuth: (user: User) => void;
  language: Language;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onAuth, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const t = TRANSLATIONS[language].auth;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: 'user_auth_' + Math.random().toString(36).substr(2, 5),
        name: formData.name || (formData.email ? formData.email.split('@')[0] : 'Citizen Hero'),
        email: formData.email,
        joinedDate: Date.now()
      };
      onAuth(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 flex flex-col lg:flex-row items-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Branding Section */}
      <div className="flex-1 space-y-8 text-center lg:text-left">
        <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-100 dark:shadow-none mx-auto lg:mx-0">
          <ShieldCheck size={32} />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
            Join the <span className="text-blue-600 dark:text-blue-400">Smart City</span> Movement.
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto lg:mx-0">
            Report issues, track community impact, and connect with local authorities through the power of Gemini AI.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
             <p className="text-2xl font-black text-blue-600 dark:text-blue-400">5k+</p>
             <p className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Active Neighbors</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
             <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92%</p>
             <p className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Resolution Rate</p>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-colors">
          <div className="p-8 pb-4">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-1">{isLogin ? t.loginTitle : t.signupTitle}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Please enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest ml-1">{t.nameLabel}</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest ml-1">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">{t.passwordLabel}</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-xl shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t.loginBtn : t.signupBtn)}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400 dark:text-zinc-500">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Chrome, color: 'hover:text-amber-500' },
                { icon: Apple, color: 'hover:text-black dark:hover:text-white' },
                { icon: Github, color: 'hover:text-zinc-900 dark:hover:text-zinc-100' }
              ].map((Social, idx) => (
                <button 
                  key={idx}
                  type="button" 
                  className={`py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700 ${Social.color}`}
                >
                  <Social.icon size={20} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors pt-4"
            >
              {isLogin ? t.switchSignup : t.switchLogin}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
