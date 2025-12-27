
import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, MapPin, Calendar, Clock, User as UserIcon, Send, 
  ChevronDown, ChevronUp, Share2, X, Copy, Check, Twitter, 
  Facebook, MessageSquare, ThumbsUp, LogIn, Sparkles 
} from 'lucide-react';
import { IssueReport, Comment, Language, User } from '../types';
import { TRANSLATIONS, formatDate, translateEnum, formatNumber } from '../translations';

interface CommunityFeedProps {
  issues: IssueReport[];
  onAddComment: (issueId: string, comment: Comment) => void;
  onUpvote: (issueId: string) => void;
  language: Language;
  currentUser: User | null;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
  issues, 
  onAddComment, 
  onUpvote,
  language, 
  currentUser 
}) => {
  const t = TRANSLATIONS[language].citizen;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});
  const [sharingIssue, setSharingIssue] = useState<IssueReport | null>(null);
  const [copied, setCopied] = useState(false);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => b.timestamp - a.timestamp);
  }, [issues]);

  const handlePostComment = (issueId: string) => {
    if (!currentUser) return;
    const text = commentText[issueId];
    if (!text?.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.name,
      text,
      timestamp: Date.now()
    };

    onAddComment(issueId, newComment);
    setCommentText(prev => ({ ...prev, [issueId]: '' }));
  };

  const copyToClipboard = () => {
    if (!sharingIssue) return;
    const shareText = `CivicPulse AI Report: ${sharingIssue.analysis?.issueType} at ${sharingIssue.location.address || 'Detected Location'}. ${sharingIssue.description}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSocial = (platform: string) => {
    if (!sharingIssue) return;
    const text = encodeURIComponent(`CivicPulse AI Alert: ${sharingIssue.analysis?.issueType} reported! #SmartCity #CivicPulse`);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    switch(platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles size={12} /> Live Registry
        </div>
        <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">{t.communityFeed}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Citizen reports verified by Gemini AI, shaped by your community feedback.</p>
      </div>

      {sortedIssues.map(issue => {
        const hasUpvoted = currentUser && issue.upvotedBy?.includes(currentUser.id);
        
        return (
          <div key={issue.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-lg dark:hover:shadow-zinc-950 transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-700">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Neighborhood Guardian</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                      <Calendar size={10} className="text-blue-500 dark:text-blue-400" />
                      {formatDate(issue.timestamp, language)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    issue.status === 'Resolved' ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : 'bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-zinc-100'
                  }`}>
                    {translateEnum(issue.status, 'status', language)}
                  </span>
                  {issue.analysis?.severity === 'Critical' && (
                    <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-tighter animate-pulse flex items-center gap-1">
                      <Clock size={8} /> Rapid Response Priority
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2 leading-tight">
                  {translateEnum(issue.analysis?.issueType || '', 'issueType', language)}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">{issue.description}</p>
              </div>

              {issue.image && (
                <div className="mb-6 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-lg group relative">
                  <img src={issue.image} alt="Issue" className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 shadow-lg border border-white/50 dark:border-zinc-800 flex items-center gap-2">
                    <Sparkles size={12} /> AI Visual Verification
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-zinc-400 py-4 border-y border-zinc-50 dark:border-zinc-800 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500 dark:text-blue-400" />
                  <span className="text-zinc-600 dark:text-zinc-400">{issue.location.address || 'Detected Location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-rose-500 dark:text-rose-400" />
                  <span className={`uppercase tracking-widest ${
                    issue.analysis?.severity === 'Critical' ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {translateEnum(issue.analysis?.severity || '', 'severity', language)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={() => onUpvote(issue.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      hasUpvoted 
                        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/30' 
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp size={18} className={hasUpvoted ? 'fill-current' : ''} />
                    {issue.upvotes || 0}
                  </button>

                  <button 
                    onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <MessageCircle size={18} />
                    {issue.comments?.length || 0}
                  </button>
                  
                  <button 
                    onClick={() => setSharingIssue(issue)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                
                <div className="hidden sm:flex flex-col items-end">
                   <div className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] mb-1">Impact Factor</div>
                   <div className="text-lg font-black text-blue-900 dark:text-blue-400 leading-none">{formatNumber(issue.analysis?.priorityScore || 0, language)}</div>
                </div>
              </div>
            </div>

            {expandedId === issue.id && (
              <div className="bg-zinc-50/50 dark:bg-black/30 p-8 border-t border-zinc-50 dark:border-zinc-800 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {issue.comments && issue.comments.length > 0 ? issue.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm uppercase">
                        {comment.author.substring(0, 1)}
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-zinc-900 dark:text-zinc-200 tracking-tight">{comment.author}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider">{formatDate(comment.timestamp, language)}</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-50">
                       <MessageCircle size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-800" />
                       <p className="text-xs text-zinc-400 dark:text-zinc-700 italic font-bold uppercase tracking-widest">{t.noComments}</p>
                    </div>
                  )}
                </div>

                {currentUser ? (
                  <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <input 
                      type="text" 
                      value={commentText[issue.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [issue.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment(issue.id)}
                      placeholder={t.commentPlaceholder}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none shadow-sm text-zinc-900 dark:text-zinc-100"
                    />
                    <button 
                      onClick={() => handlePostComment(issue.id)}
                      className="bg-blue-600 dark:bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 flex items-center gap-2">
                      <LogIn size={16} /> {t.loginToInteract}
                    </p>
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('nav-auth'))}
                      className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {sharingIssue && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-zinc-200 dark:border-zinc-800">
            <div className="p-8 border-b dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <Share2 size={20} className="text-blue-600 dark:text-blue-400" />
                {t.shareTitle}
              </h3>
              <button onClick={() => setSharingIssue(null)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-2">
                  {translateEnum(sharingIssue.analysis?.issueType || '', 'issueType', language)}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">{sharingIssue.description}</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { id: 'twitter', icon: Twitter, color: 'bg-[#1DA1F2]' },
                  { id: 'facebook', icon: Facebook, color: 'bg-[#1877F2]' },
                  { id: 'whatsapp', icon: MessageSquare, color: 'bg-[#25D366]' },
                  { id: 'copy', icon: copied ? Check : Copy, color: copied ? 'bg-emerald-600' : 'bg-zinc-800 dark:bg-zinc-700' }
                ].map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => platform.id === 'copy' ? copyToClipboard() : shareSocial(platform.id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-14 h-14 rounded-xl ${platform.color} text-white flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-all duration-300`}>
                      <platform.icon size={24} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
