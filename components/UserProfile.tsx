
import React, { useMemo } from 'react';
import { User, IssueReport, Language, Status } from '../types';
import { TRANSLATIONS, formatDate, translateEnum } from '../translations';
import { User as UserIcon, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface UserProfileProps {
  user: User;
  issues: IssueReport[];
  language: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, issues, language }) => {
  const t = TRANSLATIONS[language].profile;
  const userReports = useMemo(() => issues.filter(i => i.citizenId === user.id), [issues, user.id]);
  
  const stats = useMemo(() => {
    return {
      total: userReports.length,
      resolved: userReports.filter(i => i.status === Status.RESOLVED).length,
      pending: userReports.filter(i => i.status === Status.PENDING || i.status === Status.REVIEWING).length
    };
  }, [userReports]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-colors duration-300">
        <div className="w-24 h-24 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100 dark:shadow-none">
          {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-xl" /> : user.name.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{user.name}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <Calendar size={14} className="text-blue-400" />
                {t.joined} {formatDate(user.joinedDate, language)}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t.reportsSubmitted, value: stats.total, icon: AlertCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: t.resolvedCount, value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Active Reports', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-xl border border-white/50 dark:border-zinc-800 flex items-center justify-between`}>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
             </div>
             <stat.icon size={32} className={stat.color} />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-zinc-50 dark:border-zinc-800">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">{t.myReports}</h3>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {userReports.length > 0 ? userReports.map(report => (
            <div key={report.id} className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-6">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                {report.image ? (
                  <img src={report.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                     <AlertCircle size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-200 truncate">
                      {translateEnum(report.analysis?.issueType || '', 'issueType', language)}
                   </h4>
                   <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                     report.status === Status.RESOLVED ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                   }`}>
                      {translateEnum(report.status, 'status', language)}
                   </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{report.description}</p>
              </div>
              <div className="text-right shrink-0">
                 <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{formatDate(report.timestamp, language)}</p>
                 <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">{report.analysis?.priorityScore || 0}% Priority</p>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center">
               <AlertCircle size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
               <p className="text-zinc-400 dark:text-zinc-700 font-bold uppercase tracking-widest text-xs">No reports submitted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
