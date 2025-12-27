
import React from 'react';
import { 
  Leaf, Shield, Zap, TrendingUp, Award 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

const IMPACT_DATA = [
  { month: 'Jan', resolved: 45, impact: 65 },
  { month: 'Feb', resolved: 52, impact: 70 },
  { month: 'Mar', resolved: 78, impact: 82 },
  { month: 'Apr', resolved: 95, impact: 91 },
  { month: 'May', resolved: 120, impact: 95 },
];

const CATEGORY_DATA = [
  { name: 'Infrastructure', value: 400, color: '#2563eb' },
  { name: 'Environment', value: 300, color: '#059669' },
  { name: 'Utility', value: 300, color: '#d97706' },
  { name: 'Safety', value: 200, color: '#e11d48' },
];

interface ImpactDashboardProps {
  language: Language;
  theme: 'light' | 'dark';
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ language, theme }) => {
  const t = TRANSLATIONS[language].impact;
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-colors duration-300">
           <div className="relative z-10">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t.title}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">{t.subtitle}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                   { label: t.co2, value: '2.4 Tons', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                   { label: t.safety, value: '+18%', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                   { label: t.power, value: '420 hrs', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                 ].map((stat, i) => (
                   <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white/10 dark:border-zinc-800`}>
                      <stat.icon size={20} className={stat.color} />
                      <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</div>
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">{stat.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-blue-600 dark:bg-blue-700 p-8 rounded-xl text-white shadow-xl flex flex-col justify-between transition-colors duration-300">
           <div>
              <Award className="mb-4 text-blue-200" size={48} />
              <h3 className="text-xl font-bold mb-1">{t.heroTitle}</h3>
              <p className="text-blue-100 text-sm">Citizen @alex_vance just hit a 50-report streak!</p>
           </div>
           <div className="mt-6 flex items-center gap-3 bg-white/10 dark:bg-black/20 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center font-bold">AV</div>
              <div>
                 <div className="text-sm font-bold">Alex Vance</div>
                 <div className="text-[10px] text-blue-200 uppercase font-bold tracking-tighter">{t.heroLevel}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
              {t.velocityTitle}
           </h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={IMPACT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#f1f5f9"} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: isDark ? '#52525b' : '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: isDark ? '#52525b' : '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="impact" stroke="#2563eb" strokeWidth={3} fillOpacity={0.1} fill="#2563eb" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
           <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-zinc-100">{t.categoryTitle}</h3>
           <div className="h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                       {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px' }} />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">84%</div>
                 <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">{t.targetHit}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-emerald-900 dark:bg-emerald-950 rounded-xl p-8 text-white relative overflow-hidden shadow-xl transition-colors duration-300">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
               <h3 className="text-4xl font-black mb-4 leading-tight">{t.initiativeTitle}</h3>
               <p className="text-emerald-100 max-w-lg mb-6">{t.initiativeDesc}</p>
               <button className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all active:scale-95">{t.joinBtn}</button>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-4">
               {[
                 { label: t.volunteers, val: '240' },
                 { label: t.trash, val: '1.2T' }
               ].map(stat => (
                 <div key={stat.label} className="bg-white/10 dark:bg-black/20 p-6 rounded-xl text-center border border-white/10 dark:border-zinc-800">
                    <div className="text-3xl font-black">{stat.val}</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">{stat.label}</div>
                 </div>
               ))}
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      </div>
    </div>
  );
};
