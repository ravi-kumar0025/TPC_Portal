import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';

// Fix: Import named functions directly from 'date-fns'
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './StudentDashboard.css';
import { Calendar as CalendarIcon, Megaphone, Clock, Briefcase } from 'lucide-react';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function StudentDashboard() {
    const { token, user } = useAuth();
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (token) {
            fetchEvents();
            fetchAnnouncements();
        }
    }, [token]);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/student/events', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const formattedEvents = data.events.map(e => ({
                title: e.title,
                start: new Date(e.date),
                end: new Date(new Date(e.date).getTime() + 60 * 60 * 1000),
                type: e.type,
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const branch = user?.branch || 'CSE';
            const { data } = await axios.get(`http://localhost:5000/api/student/announcements?branch=${branch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(data.announcements);
        } catch (err) {
            console.error("Error fetching announcements:", err);
        }
    };

    const eventStyleGetter = (event) => {
        let typeClass = 'tpc-calendar-event-default';
        if (event.type === 'internship') typeClass = 'tpc-calendar-event-internship';
        if (event.type === 'placement_drive') typeClass = 'tpc-calendar-event-placement';

        return {
            className: `tpc-calendar-event ${typeClass}`,
        };
    };

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex justify-between items-center bg-white/95 p-6 rounded-2xl shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] border border-slate-100 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_14px_32px_-18px_rgba(2,6,23,0.8)]">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                        Welcome back, {user?.name || user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 dark:text-slate-300">Here is your timeline for upcoming opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calendar Area */}
                <div className="lg:col-span-2 bg-white/95 p-6 rounded-2xl shadow-[0_12px_32px_-20px_rgba(15,23,42,0.5)] border border-slate-100 flex flex-col backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:text-slate-100 dark:border-slate-700/70">
                        <CalendarIcon className="text-blue-500 dark:text-blue-400" /> Event Calendar
                    </h2>
                    <div className="flex-1 min-h-[500px] calendar-wrapper tpc-calendar-skin">
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            eventPropGetter={eventStyleGetter}
                            views={['month', 'week', 'day']}
                        />
                    </div>
                </div>

                {/* Announcements Sidebar */}
                <div className="bg-white/95 p-6 rounded-2xl shadow-[0_12px_32px_-20px_rgba(15,23,42,0.5)] border border-slate-100 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:text-slate-100 dark:border-slate-700/70">
                        <Megaphone className="text-amber-500 dark:text-amber-400" /> Recent Announcements
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-medium text-sm dark:text-slate-500">No new announcements for your branch.</div>
                        ) : (
                            announcements.map((a) => (
                                <div key={a._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer dark:bg-slate-800/70 dark:border-slate-700/80 dark:hover:bg-slate-800 dark:hover:border-blue-500/40">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white border shadow-sm group-hover:border-blue-200 dark:bg-slate-900/80 dark:border-slate-600 dark:text-slate-200">
                                            {a.type?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 dark:text-slate-500"><Clock size={12} />{new Date(a.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors dark:text-slate-100 dark:group-hover:text-blue-300">{a.title}</h3>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed dark:text-slate-300">{a.description}</p>
                                </div>
                            ))
                        )}

                        {/* Static Demo Card */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer relative overflow-hidden dark:bg-slate-800/70 dark:border-slate-700/80 dark:hover:bg-slate-800 dark:hover:border-blue-500/40">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-100 rounded-bl-full -mr-2 -mt-2 -z-0 dark:bg-cyan-500/20"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-cyan-100 border border-cyan-200 text-cyan-700 shadow-sm dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300">
                                        Featured
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 dark:text-slate-500"><Clock size={12} />Today</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors flex items-center gap-2 dark:text-slate-100 dark:group-hover:text-blue-300">
                                    <Briefcase size={14} className="text-cyan-600 dark:text-cyan-300" /> TPC Prep Sessions
                                </h3>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed dark:text-slate-300">
                                    Join the upcoming Google interview prep sessions organized by GDG IIT Patna.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
