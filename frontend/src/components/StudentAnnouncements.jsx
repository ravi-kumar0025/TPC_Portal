import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Clock, ChevronDown, ChevronUp, Bell, Search, BookOpen, Briefcase, MonitorPlay, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_CONFIG = {
    announcement: { label: 'Announcement', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: Megaphone },
    internship: { label: 'Internship', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', icon: Briefcase },
    placement_drive: { label: 'Placement', color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-400', icon: Briefcase },
    workshop: { label: 'Workshop', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: MonitorPlay },
};

function getTypeConfig(type) {
    return TYPE_CONFIG[type] || { label: type || 'Announcement', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Bell };
}

export default function StudentAnnouncements() {
    const { token, user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [viewedIds, setViewedIds] = useState(new Set());
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        if (token && user) fetchAnnouncements();
    }, [token, user?.department]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const department = user?.department?.trim() || '';
            const program = user?.program?.trim() || '';

            const params = new URLSearchParams();
            if (department) params.append('branch', department);
            if (program) params.append('program', program);

            const { data } = await axios.get(
                `http://localhost:5000/api/student/announcements?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnnouncements(data.announcements);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            setError('Could not load announcements. Please try again.');
            setLoading(false);
        }
    };

    const handleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            setViewedIds(prev => new Set([...prev, id]));
        }
    };

    const filtered = announcements.filter(a => {
        const matchesSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || (a.content || a.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || (a.type || 'announcement') === filterType;
        return matchesSearch && matchesType;
    });

    const uniqueTypes = ['all', ...new Set(announcements.map(a => a.type || 'announcement'))];

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="animate-pulse space-y-4 w-full max-w-2xl">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-2">
            <AlertCircle size={36} />
            <p className="font-medium">{error}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                        <Megaphone className="text-amber-500 w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                        <p className="text-slate-500 text-sm">Filtered for your branch and program</p>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {uniqueTypes.map(type => {
                        const cfg = type === 'all' ? { label: 'All', color: 'bg-slate-100 text-slate-600 border-slate-200' } : getTypeConfig(type);
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === type ? 'ring-2 ring-offset-1 ring-blue-300 ' + cfg.color : cfg.color + ' opacity-60 hover:opacity-100'}`}
                            >
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Announcements List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <BookOpen size={40} className="mb-3 opacity-40" />
                    <p className="font-medium">No announcements found.</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(a => {
                        const id = a._id;
                        const isExpanded = expandedId === id;
                        const isViewed = viewedIds.has(id);
                        const cfg = getTypeConfig(a.type);
                        const Icon = cfg.icon;
                        const body = a.content || a.description || 'No details provided.';

                        return (
                            <div
                                key={id}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_2px_10px_-6px_rgba(0,0,0,0.08)] ${isExpanded ? 'border-blue-200 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]' : isViewed ? 'border-slate-100 opacity-70' : 'border-slate-100 hover:border-blue-100 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)]'}`}
                            >
                                {/* Card header — always visible */}
                                <button
                                    onClick={() => handleExpand(id)}
                                    className="w-full text-left p-5 flex items-start gap-4 group"
                                >
                                    <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color} border`}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                            {isViewed && !isExpanded && (
                                                <span className="text-xs text-slate-400 font-medium">• Viewed</span>
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors ${isViewed && !isExpanded ? 'text-slate-500' : ''}`}>
                                            {a.title}
                                        </h3>
                                        {!isExpanded && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{body}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                            <Clock size={11} />
                                            <span>{a.createdAt ? format(new Date(a.createdAt), 'dd MMM yyyy') : '—'}</span>
                                        </div>
                                        {isExpanded
                                            ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                            : <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        }
                                    </div>
                                </button>

                                {/* Expanded detail panel */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                                        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Details</h4>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{body}</p>
                                        </div>
                                        {a.targetBranches?.length > 0 && (
                                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-slate-400 font-semibold">Branches:</span>
                                                {a.targetBranches.map(b => (
                                                    <span key={b} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg font-medium">{b}</span>
                                                ))}
                                            </div>
                                        )}
                                        {a.targetAudience && a.targetAudience !== 'all' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs text-slate-400 font-semibold">Audience:</span>
                                                <span className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-lg font-medium capitalize">{a.targetAudience}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
