import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Edit3 } from 'lucide-react';

export default function WriteExperience() {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [eligibleEvents, setEligibleEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedEventId, setSelectedEventId] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [generalAdvice, setGeneralAdvice] = useState('');
    const [segments, setSegments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchEligibleEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/blogs/eligible', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setEligibleEvents(data.eligibleEvents);
                } else {
                    setError(data.message || 'Failed to load eligible events');
                }
            } catch (err) {
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchEligibleEvents();
    }, [token]);

    const handleEventSelect = (e) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);
        
        const selectedApp = eligibleEvents.find(app => app.event._id === eventId);
        if (selectedApp) {
            // Number of segments = currentRoundIndex + 1
            const numSegments = selectedApp.currentRoundIndex + 1;
            const newSegments = [];
            for (let i = 0; i < numSegments; i++) {
                const roundTitle = selectedApp.event.rounds && selectedApp.event.rounds[i] 
                    ? selectedApp.event.rounds[i].title 
                    : `Round ${i + 1}`;
                newSegments.push({ roundTitle, content: '' });
            }
            setSegments(newSegments);
        } else {
            setSegments([]);
        }
    };

    const handleSegmentChange = (index, value) => {
        const newSegments = [...segments];
        newSegments[index].content = value;
        setSegments(newSegments);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    generalAdvice,
                    segments,
                    isAnonymous
                })
            });

            const data = await response.json();
            if (response.ok) {
                navigate('/dashboard/student/experiences');
            } else {
                setError(data.message || 'Failed to submit experience');
            }
        } catch (err) {
            setError('Failed to submit experience');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pt-24 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pt-24">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard/student/experiences" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-6 dark:text-blue-400 w-fit">
                    <ArrowLeft size={16} /> Back to Blogs
                </Link>
                
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <Edit3 className="text-blue-600" /> Write Interview Blog
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Share your interview journey to help junior students prepare better.</p>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-100 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
                            <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
                            <p>{error}</p>
                        </div>
                    )}

                    {eligibleEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-600 dark:text-slate-400">You don't have any eligible events to write a blog for right now.</p>
                            <p className="text-sm text-slate-500 mt-2">You become eligible after completing the recruitment process for an event.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Event</label>
                                <select 
                                    value={selectedEventId} 
                                    onChange={handleEventSelect}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                >
                                    <option value="" disabled>-- Select Event --</option>
                                    {eligibleEvents.map(app => (
                                        <option key={app.event._id} value={app.event._id}>
                                            {app.event.title} ({app.status === 'accepted' ? 'Selected' : 'Rejected'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedEventId && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">General Advice & Preparation</label>
                                        <textarea
                                            value={generalAdvice}
                                            onChange={(e) => setGeneralAdvice(e.target.value)}
                                            required
                                            rows={4}
                                            placeholder="What resources did you use? What should students focus on?"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Round-wise Experience</h3>
                                        {segments.map((segment, index) => (
                                            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Round {index + 1}: {segment.roundTitle}
                                                </label>
                                                <textarea
                                                    value={segment.content}
                                                    onChange={(e) => handleSegmentChange(index, e.target.value)}
                                                    required
                                                    rows={3}
                                                    placeholder="Questions asked, topics covered, difficulty level..."
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">Publish Anonymously</span>
                                        </label>
                                        <p className="text-sm text-slate-500 mt-1 ml-8">Your name will be hidden, but your branch and program will still be visible.</p>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Publishing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Send size={18} /> Publish Blog
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
