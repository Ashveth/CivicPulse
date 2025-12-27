
import React, { useMemo, useState, useEffect } from 'react';
import { IssueReport, Severity, Language } from '../types';
import { MapPin, X, ZoomIn, Maximize, RotateCcw, Layers, ChevronRight, List } from 'lucide-react';
import { TRANSLATIONS, translateEnum, formatNumber, formatDate } from '../translations';

interface ImpactMapProps {
  issues: IssueReport[];
  onSelectIssue: (issue: IssueReport | null) => void;
  selectedIssueId?: string;
  language: Language;
}

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface Cluster {
  id: string;
  x: number;
  y: number;
  issues: IssueReport[];
  isHighPriority: boolean;
}

const CLUSTER_THRESHOLD = 8;

export const ImpactMap: React.FC<ImpactMapProps> = ({ issues, onSelectIssue, selectedIssueId, language }) => {
  const t = TRANSLATIONS[language].admin;
  
  const globalBounds = useMemo(() => {
    if (issues.length === 0) return { minLat: 40.7, maxLat: 40.8, minLng: -74.1, maxLng: -73.9 };
    const lats = issues.map(i => i.location.lat);
    const lngs = issues.map(i => i.location.lng);
    const padding = 0.02;
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    };
  }, [issues]);

  const [currentBounds, setCurrentBounds] = useState<Bounds>(globalBounds);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeCluster, setActiveCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    if (!isZoomed) setCurrentBounds(globalBounds);
  }, [globalBounds, isZoomed]);

  const project = (lat: number, lng: number) => {
    const x = ((lng - currentBounds.minLng) / (currentBounds.maxLng - currentBounds.minLng)) * 100;
    const y = 100 - (((lat - currentBounds.minLat) / (currentBounds.maxLat - currentBounds.minLat)) * 100);
    return { x, y };
  };

  const visibleIssues = useMemo(() => {
    return issues.filter(i => 
      i.location.lat >= currentBounds.minLat &&
      i.location.lat <= currentBounds.maxLat &&
      i.location.lng >= currentBounds.minLng &&
      i.location.lng <= currentBounds.maxLng
    );
  }, [issues, currentBounds]);

  const clusters = useMemo(() => {
    const results: Cluster[] = [];
    visibleIssues.forEach(issue => {
      const pos = project(issue.location.lat, issue.location.lng);
      const existingCluster = results.find(c => {
        const dx = c.x - pos.x;
        const dy = c.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < CLUSTER_THRESHOLD;
      });

      if (existingCluster) {
        existingCluster.issues.push(issue);
        existingCluster.x = (existingCluster.x * (existingCluster.issues.length - 1) + pos.x) / existingCluster.issues.length;
        existingCluster.y = (existingCluster.y * (existingCluster.issues.length - 1) + pos.y) / existingCluster.issues.length;
        if (issue.analysis?.severity === Severity.CRITICAL) existingCluster.isHighPriority = true;
      } else {
        results.push({
          id: issue.id,
          x: pos.x,
          y: pos.y,
          issues: [issue],
          isHighPriority: issue.analysis?.severity === Severity.CRITICAL
        });
      }
    });
    return results;
  }, [visibleIssues, currentBounds]);

  const handleClusterClick = (cluster: Cluster) => {
    if (cluster.issues.length > 1) {
      setActiveCluster(cluster);
      onSelectIssue(null);
    } else {
      onSelectIssue(cluster.issues[0]);
      setActiveCluster(null);
    }
  };

  const zoomToCluster = (cluster: Cluster) => {
    const lats = cluster.issues.map(i => i.location.lat);
    const lngs = cluster.issues.map(i => i.location.lng);
    const padding = 0.005;
    setCurrentBounds({
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    });
    setIsZoomed(true);
    setActiveCluster(null);
  };

  const resetView = () => {
    setCurrentBounds(globalBounds);
    setIsZoomed(false);
    setActiveCluster(null);
  };

  return (
    <div className="relative w-full aspect-video bg-zinc-950 dark:bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-inner group transition-colors duration-300">
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="gridLarge" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#gridLarge)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><filter id="blurHeat"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" /></filter></defs>
        <g filter="url(#blurHeat)">
          {clusters.map(c => (
            <circle
              key={`heat-${c.id}`}
              cx={c.x}
              cy={c.y}
              r={c.issues.length > 1 ? 6 + c.issues.length : 5}
              fill={c.isHighPriority ? '#ef4444' : '#3b82f6'}
              fillOpacity="0.2"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </g>
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {clusters.map(cluster => {
          const isSelected = cluster.issues.length === 1 && selectedIssueId === cluster.issues[0].id;
          const isMulti = cluster.issues.length > 1;
          if (cluster.x < -5 || cluster.x > 105 || cluster.y < -5 || cluster.y > 105) return null;

          return (
            <div
              key={cluster.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 pointer-events-auto ${
                isSelected ? 'z-50' : 'z-10 hover:scale-110'
              }`}
              style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
              onClick={(e) => { e.stopPropagation(); handleClusterClick(cluster); }}
            >
              <div className="relative">
                {cluster.isHighPriority && (
                  <div className={`absolute inset-0 animate-ping rounded-full opacity-40 ${isMulti ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                )}
                
                <div className={`flex items-center justify-center rounded-full shadow-2xl border-2 transition-all ${
                  isSelected ? 'bg-blue-600 border-white scale-125 w-10 h-10' : 
                  isMulti ? 'bg-zinc-800 border-zinc-600 w-9 h-9' : 
                  cluster.isHighPriority ? 'bg-rose-600 border-rose-300 w-7 h-7' : 
                  'bg-zinc-700 border-zinc-500 w-7 h-7'
                }`}>
                  {isMulti ? (
                    <span className="text-[10px] font-black text-white">{cluster.issues.length}</span>
                  ) : (
                    <MapPin size={isSelected ? 18 : 14} className="text-white" />
                  )}
                </div>

                {isSelected && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-[100] animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {t.reportDetails}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectIssue(null); }}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      {translateEnum(cluster.issues[0].analysis?.issueType || '', 'issueType', language)}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3 italic">
                      "{cluster.issues[0].description}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                        cluster.issues[0].analysis?.severity === Severity.CRITICAL ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {translateEnum(cluster.issues[0].analysis?.severity || '', 'severity', language)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {isZoomed && (
          <button 
            onClick={resetView}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg animate-in slide-in-from-left duration-300 hover:bg-blue-700 uppercase tracking-wider"
          >
            <RotateCcw size={12} />
            RESET BOUNDS
          </button>
        )}
        <div className="p-3 bg-zinc-900/90 dark:bg-black/80 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Layers size={10} />
            LEGEND
          </h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[8px] text-white font-bold">#</div>
              <span className="text-[10px] text-zinc-400">Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-rose-600 border border-rose-300 flex items-center justify-center">
                <MapPin size={8} className="text-white" />
              </div>
              <span className="text-[10px] text-zinc-400">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
