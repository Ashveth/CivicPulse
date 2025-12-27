
import React, { useState, useMemo } from 'react';
import { Camera, MapPin, Send, Loader2, CheckCircle2, Heart, Sparkles, Trash2, LogIn, Users, Clock, ArrowRight, ShieldCheck, Zap, Image as ImageIcon, Info } from 'lucide-react';
import { analyzeIssue, generateIssueIllustration } from '../services/geminiService';
import { IssueReport, Status, Language, User } from '../types';
import { TRANSLATIONS, formatDate, translateEnum } from '../translations';

interface CitizenPortalProps {
  onSubmit: (issue: IssueReport) => void;
  recentReports: IssueReport[];
  language: Language;
  currentUser: User | null;
  onViewChange: (view: 'citizen' | 'admin' | 'impact' | 'feed' | 'profile' | 'auth') => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ onSubmit, recentReports, language, currentUser, onViewChange }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const t = TRANSLATIONS[language].citizen;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!description) {
      alert("Please describe the issue first.");
      return;
    }
    setGeneratingImage(true);
    try {
      const generated = await generateIssueIllustration(description);
      setImage(generated);
    } catch (error) {
      console.error("Image gen error", error);
      alert("Failed to generate illustration.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, (err) => {
      console.error("Location error", err);
      alert("Location services are required for incident reporting.");
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { onViewChange('auth'); return; }
    if (!description || !location) { alert("Required: Description and GPS location."); return; }

    setLoading(true);
    try {
      const analysis = await analyzeIssue(description, location, recentReports, image || undefined);
      const newReport: IssueReport = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        description,
        image: image || undefined,
        location: { ...location, address: "Verified Street Location" },
        status: Status.PENDING,
        citizenId: currentUser.id,
        analysis
      };
      onSubmit(newReport);
      setSuccess(true);
      setDescription('');
      setImage(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert("Analysis engine busy. Please retry in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-8 md:p-12 shadow-sm relative transition-all duration-500 overflow-hidden">
          {!currentUser && (
            <div className="mb-10 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-amber-600 dark:text-amber-500" />
                <p className="text-xs font-bold text-amber-700 dark:text-amber-200">Sign in to track progress and earn impact points.</p>
              </div>
              <button onClick={() => onViewChange('auth')} className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest hover:underline">Sign In</button>
            </div>
          )}

          <div className="mb-10 border-b border-stone-100 dark:border-zinc-800 pb-8">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-stone-100 mb-2 tracking-tight">{t.title}</h2>
            <p className="text-sm text-stone-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 tracking-[0.2em] block">{t.labelDescription}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.placeholderDescription}
                className="w-full min-h-[160px] p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all resize-none text-base font-medium text-zinc-700 dark:text-zinc-200 placeholder:text-stone-300 dark:placeholder:text-zinc-700 bg-stone-50/30 dark:bg-black/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 tracking-[0.2em] block">{t.labelPhoto}</label>
                <div className="relative border-2 border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl p-6 h-52 bg-stone-50/50 dark:bg-black/30 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700">
                  {generatingImage ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-black uppercase tracking-widest">AI Visualization...</span>
                    </div>
                  ) : image ? (
                    <>
                      <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                      <button type="button" onClick={() => setImage(null)} className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-lg hover:bg-black transition-colors shadow-xl backdrop-blur-md">
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <ImageIcon className="w-10 h-10 text-stone-300 dark:text-zinc-700 mb-4" />
                      <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-4 text-center">Drag image or click to browse</span>
                      <div className="h-px w-20 bg-stone-200 dark:bg-zinc-800" />
                      <button type="button" onClick={handleGenerateImage} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-[10px] font-black text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all shadow-sm z-20 uppercase tracking-widest">
                        <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                        AI Helper
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 tracking-[0.2em] block">{t.labelLocation}</label>
                <button
                  type="button"
                  onClick={fetchLocation}
                  className={`w-full h-52 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all shadow-inner ${
                    location ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400' : 'bg-stone-50/50 dark:bg-black/30 border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-500 hover:border-blue-300 dark:hover:border-blue-900'
                  }`}
                >
                  <MapPin className={`${location ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-300 dark:text-zinc-700'} group-hover:scale-110 transition-transform`} size={28} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                    {location ? t.locationCaptured : t.locationTap}
                  </span>
                  {location && <span className="text-[10px] font-mono font-bold opacity-60 bg-white/50 dark:bg-black/40 px-2 py-1 rounded-md">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || generatingImage}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 transition-all ${
                loading ? 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600 cursor-not-allowed' : 
                'bg-zinc-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 shadow-xl shadow-blue-500/10 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />ANALYZING INCIDENT...</>
              ) : (
                <><Send className="w-5 h-5" />{t.submitBtn}</>
              )}
            </button>
          </form>

          {success && (
            <div className="mt-10 p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-400 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
               <div className="p-2 bg-emerald-600 text-white rounded-full"><CheckCircle2 size={20} /></div>
               <div className="text-sm">
                 <p className="font-black uppercase tracking-widest mb-0.5">Report Lodged Successfully</p>
                 <p className="opacity-80 font-medium">Incident registered in the community ledger.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-8 shadow-sm transition-all duration-500">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-stone-100 mb-8 pb-3 border-b border-stone-100 dark:border-zinc-800 flex items-center gap-2">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
            LIVE FEED
          </h3>
          <div className="space-y-6">
            {recentReports.length > 0 ? recentReports.slice(0, 5).map(issue => (
              <div key={issue.id} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">{formatDate(issue.timestamp, language)}</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                     issue.status === Status.RESOLVED 
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400'
                   }`}>
                     {translateEnum(issue.status, 'status', language)}
                   </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-stone-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {translateEnum(issue.analysis?.issueType || '', 'issueType', language)}
                </h4>
                <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-1 mt-1 font-medium">{issue.description}</p>
              </div>
            )) : (
              <div className="text-center py-12 text-stone-300 dark:text-zinc-800 text-[10px] font-black uppercase tracking-widest">Awaiting Reports</div>
            )}
          </div>
          
          <button onClick={() => onViewChange('feed')} className="w-full mt-10 py-3.5 text-[10px] font-black text-stone-500 dark:text-zinc-400 uppercase tracking-[0.2em] border border-stone-200 dark:border-zinc-800 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
            Open Registry
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Heart size={14} className="text-rose-500" fill="currentColor" />
              Community Impact
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-3xl font-black tracking-tighter">142</div>
                <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mt-1">Validated Solutions</div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-3xl font-black tracking-tighter">12.4h</div>
                <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mt-1">Average Response</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 text-white/5 dark:text-white/10 pointer-events-none transform rotate-12 scale-150">
            <ShieldCheck size={200} />
          </div>
        </div>
      </div>
    </div>
  );
};
