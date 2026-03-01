import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';

// Fix: Import named functions directly from 'date-fns'
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
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
        let backgroundColor = '#3b82f6';
        if (event.type === 'internship') backgroundColor = '#10b981';
        if (event.type === 'placement_drive') backgroundColor = '#8b5cf6';
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                padding: '2px 5px'
            }
        };
    };

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Welcome back, {user?.name || user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Here is your timeline for upcoming opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calendar Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <CalendarIcon className="text-blue-500" /> Event Calendar
                    </h2>
                    <div className="flex-1 min-h-[500px] calendar-wrapper">
                        <style>{`
                            .rbc-calendar { font-family: 'Inter', sans-serif; }
                            .rbc-header { padding: 10px; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                            .rbc-today { background-color: #f8fafc; }
                            .rbc-event { box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 0.8rem; font-weight: 500;}
                        `}</style>
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
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Megaphone className="text-amber-500" /> Recent Announcements
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-medium text-sm">No new announcements for your branch.</div>
                        ) : (
                            announcements.map((a) => (
                                <div key={a._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white border shadow-sm group-hover:border-blue-200">
                                            {a.type?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Clock size={12} />{new Date(a.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">{a.title}</h3>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{a.description}</p>
                                </div>
                            ))
                        )}

                        {/* Static Demo Card */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-100 rounded-bl-full -mr-2 -mt-2 -z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-100 border border-purple-200 text-purple-700 shadow-sm">
                                        Featured
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Clock size={12} />Today</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                                    <Briefcase size={14} className="text-purple-600" /> TPC Prep Sessions
                                </h3>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
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