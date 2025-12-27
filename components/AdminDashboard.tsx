
import React, { useMemo, useState } from 'react';
import { 
  ArrowUpRight, AlertTriangle, CheckCircle, Clock, 
  Filter, Download, Search, MoreVertical, Map as MapIcon, Copy,
  Zap, Loader2, FileText, ChevronUp, ChevronDown, Layers, LayoutGrid, List, Info
} from 'lucide-react';
import { IssueReport, Status, Severity, Language } from '../types';
import { ImpactMap } from './ImpactMap';
import { getStrategicUrbanPlan } from '../services/geminiService';
import { TRANSLATIONS, translateEnum, formatNumber } from '../translations';

interface AdminDashboardProps {
  issues: IssueReport[];
  onUpdateStatus: (id: string, status: Status) => void;
  language: Language;
}

type SortKey = 'severity' | 'priorityScore' | 'status';
type SortDirection = 'asc' | 'desc';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ issues, onUpdateStatus, language }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [duplicateOnly, setDuplicateOnly] = useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [strategicPlan, setStrategicPlan] = useState<string | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'priorityScore', 
    direction: 'desc' 
  });

  const t = TRANSLATIONS[language].admin;

  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter(i => i.status === Status.PENDING).length;
    const resolved = issues.filter(i => i.status === Status.RESOLVED).length;
    const critical = issues.filter(i => i.analysis?.severity === Severity.CRITICAL).length;
    return { total, pending, resolved, critical };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(i => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || i.analysis?.severity === severityFilter;
      const matchesDuplicate = !duplicateOnly || (!!i.analysis?.likelyDuplicateId || (i.analysis?.detectedDuplicatesCount || 0) > 0);
      return matchesStatus && matchesSeverity && matchesDuplicate;
    });
  }, [issues, statusFilter, severityFilter, duplicateOnly]);

  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues];
    const { key, direction } = sortConfig;
    const severityOrder = { [Severity.CRITICAL]: 4, [Severity.HIGH]: 3, [Severity.MEDIUM]: 2, [Severity.LOW]: 1 };
    const statusOrder = { [Status.PENDING]: 1, [Status.REVIEWING]: 2, [Status.IN_PROGRESS]: 3, [Status.RESOLVED]: 4 };

    sorted.sort((a, b) => {
      let valA: any, valB: any;
      if (key === 'severity') { valA = severityOrder[a.analysis?.severity || Severity.LOW]; valB = severityOrder[b.analysis?.severity || Severity.LOW]; }
      else if (key === 'priorityScore') { valA = a.analysis?.priorityScore || 0; valB = b.analysis?.priorityScore || 0; }
      else if (key === 'status') { valA = statusOrder[a.status]; valB = statusOrder[b.status]; }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredIssues, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleStrategicPlan = async () => {
    setIsPlanning(true);
    try {
      const plan = await getStrategicUrbanPlan(issues);
      setStrategicPlan(plan);
    } catch (error) { console.error(error); } 
    finally { setIsPlanning(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Incident Volume', value: formatNumber(stats.total, language), icon: List, color: 'text-zinc-900 dark:text-zinc-100', bg: 'bg-white dark:bg-zinc-900' },
          { label: 'Critical Alerts', value: formatNumber(stats.critical, language), icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-500', bg: 'bg-white dark:bg-zinc-900' },
          { label: 'Avg Latency', value: '1.4d', icon: Clock, color: 'text-zinc-900 dark:text-zinc-100', bg: 'bg-white dark:bg-zinc-900' },
          { label: 'Service Level', value: '92%', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-white dark:bg-zinc-900' },
        ].map((m, i) => (
          <div key={i} className={`p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 ${m.bg} shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{m.value}</h4>
          </div>
        ))}
      </div>

      {strategicPlan && (
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-xl p-8 relative border border-zinc-800 animate-in zoom-in duration-200 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <FileText className="text-blue-500" />
              Strategic Authority Insight
            </h3>
            <button onClick={() => setStrategicPlan(null)} className="text-zinc-500 hover:text-white transition-colors">✕</button>
          </div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm font-medium">{strategicPlan}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <MapIcon size={14} />
                Spatial Analysis
              </h3>
              <button 
                onClick={handleStrategicPlan}
                disabled={isPlanning}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all"
              >
                {isPlanning ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                Run Intelligence Analysis
              </button>
            </div>
            <ImpactMap issues={issues} onSelectIssue={setSelectedIssue} selectedIssueId={selectedIssue?.id} language={language} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t.queue}</h3>
              <div className="flex items-center gap-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[11px] font-bold focus:ring-1 focus:ring-blue-600 outline-none text-zinc-700 dark:text-zinc-200"
                >
                  <option value="all">Status: All</option>
                  {Object.values(Status).map(s => <option key={s} value={s}>{translateEnum(s, 'status', language)}</option>)}
                </select>
                <button
                  onClick={() => setDuplicateOnly(!duplicateOnly)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-all ${
                    duplicateOnly ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-500'
                  }`}
                >
                  Alert Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Incident Log</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors" onClick={() => handleSort('severity')}>Severity</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors" onClick={() => handleSort('priorityScore')}>Score</th>
                    <th className="px-6 py-4">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {sortedIssues.map(issue => (
                    <tr 
                      key={issue.id} 
                      onClick={() => setSelectedIssue(issue)}
                      className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                        selectedIssue?.id === issue.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{translateEnum(issue.analysis?.issueType || '', 'issueType', language)}</div>
                        <div className="text-zinc-500 dark:text-zinc-500 text-[10px] mt-0.5 font-mono">#{issue.id.toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          issue.analysis?.severity === Severity.CRITICAL ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {translateEnum(issue.analysis?.severity || '', 'severity', language)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{issue.analysis?.priorityScore || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-bold ${issue.status === Status.RESOLVED ? 'text-emerald-700 dark:text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${issue.status === Status.RESOLVED ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                          {translateEnum(issue.status, 'status', language)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {selectedIssue ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 animate-in slide-in-from-right-4 duration-300 shadow-xl transition-colors">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Case Documentation</h3>
                 <button onClick={() => setSelectedIssue(null)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">✕</button>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-2">Municipal Protocol</label>
                   <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {selectedIssue.analysis?.authorityAction}
                   </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50/30 dark:bg-zinc-950/30">
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Impact Index</div>
                      <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedIssue.analysis?.priorityScore}</div>
                   </div>
                   <div className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50/30 dark:bg-zinc-950/30">
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Geolocation</div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">VERIFIED</div>
                   </div>
                 </div>

                 <button className="w-full py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95">
                   Initiate Service Deployment
                   <ArrowUpRight size={14} />
                 </button>
               </div>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] transition-colors">
              <Info size={24} className="text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-relaxed max-w-[160px]">Select an incident record to initiate analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
