import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, User, Calendar, Briefcase, PlusCircle, ArrowLeft, X } from 'lucide-react';

export default function ExperiencesList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/blogs', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setBlogs(data.blogs);
                } else {
                    setError(data.message || 'Failed to fetch experiences');
                }
            } catch (err) {
                setError('Failed to fetch experiences');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [token]);

    return (
        <>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pt-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link to="/dashboard/student" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2 dark:text-blue-400">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interview Blogs</h1>
                        <p className="text-slate-500 mt-1 dark:text-slate-400">Learn from the interview blogs of your peers</p>
                    </div>
                    <Link to="/dashboard/student/experiences/write" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <PlusCircle size={18} />
                        <span>Share Yours</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-slate-500">Loading blogs...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center dark:bg-red-900/20 dark:text-red-400">{error}</div>
                ) : blogs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Blogs Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to share your interview blog!</p>
                        <Link to="/dashboard/student/experiences/write" className="bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                            Write Blog
                        </Link>
                    </div>
                ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map(blog => (
                                <div key={blog._id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden hover:shadow-md transition-shadow h-[260px]">
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                            {blog.studentId.profilePicture ? (
                                                <img src={blog.studentId.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold dark:bg-blue-900 dark:text-blue-300">
                                                    {blog.studentId.fullName ? blog.studentId.fullName.charAt(0) : 'A'}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{blog.studentId.fullName}</h3>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Calendar size={12} />
                                                    {new Date(blog.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 line-clamp-2">
                                                    <Briefcase size={16} className="text-blue-500 flex-shrink-0" />
                                                    <span title={blog.eventId.title}>{blog.eventId.title}</span>
                                                </h2>
                                                <span className="flex-shrink-0 bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase dark:bg-blue-900/30 dark:text-blue-300">
                                                    {blog.eventId.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            
                                            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mt-3">
                                                {blog.generalAdvice}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {blog.segments.length} Rounds Detailed
                                            </span>
                                            <button onClick={() => setSelectedBlog(blog)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
                                                Read Blog <ArrowLeft size={14} className="rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                )}
            </div>
        </div>

            {/* Modal */}
            {selectedBlog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm sm:p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                            <div className="flex items-center gap-4">
                                {selectedBlog.studentId.profilePicture ? (
                                    <img src={selectedBlog.studentId.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg dark:bg-blue-900 dark:text-blue-300">
                                        {selectedBlog.studentId.fullName ? selectedBlog.studentId.fullName.charAt(0) : 'A'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedBlog.studentId.fullName}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedBlog.studentId.department} • {selectedBlog.studentId.program}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedBlog(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    <Calendar size={14} />
                                    Posted on {new Date(selectedBlog.createdAt).toLocaleDateString()}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <Briefcase className="text-blue-500" />
                                    {selectedBlog.eventId.title}
                                </h2>
                                <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-300">
                                    {selectedBlog.eventId.type.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                    General Advice
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedBlog.generalAdvice}</p>
                            </div>
                            
                            <div className="space-y-6">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                                    Round-wise Experience
                                </h4>
                                {selectedBlog.segments.map((segment, index) => (
                                    <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50">
                                        <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                                            <span className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-slate-200 dark:border-slate-600 shadow-sm">
                                                {index + 1}
                                            </span>
                                            {segment.roundTitle}
                                        </h5>
                                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap ml-11 leading-relaxed">{segment.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
