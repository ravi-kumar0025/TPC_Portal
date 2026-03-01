import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Send, Trash2 } from 'lucide-react';

export default function ManageAnnouncements() {
    const { token, user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '', targetAudience: 'all', targetBranches: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(data.announcements);
        } catch (err) {
            console.error('Failed to fetch announcements', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, targetBranches: formData.targetBranches.split(',').map(b => b.trim()).filter(b => b) };
            await axios.post('http://localhost:5000/api/admin/announcements', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Announcement posted successfully!');
            setFormData({ title: '', content: '', targetAudience: 'all', targetBranches: '' });
            fetchAnnouncements();
        } catch (err) {
            setMessage('Error posting announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAnnouncements();
        } catch (err) {
            console.error('Error deleting announcement', err);
        }
    };

    if (user?.adminType !== 'super_admin' && user?.adminType !== 'announcement_admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Announcement Admin access required.</div>;
    }

    return (
        <div className="space-y-8 animate-[fade-in-up_0.5s_ease-out]">
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Bell className="text-blue-500" /> Post New Announcement
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. Google Placement Drive" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                            <select value={formData.targetAudience} onChange={e => setFormData({ ...formData, targetAudience: e.target.value })} className="w-full px-4 py-2 border rounded-xl">
                                <option value="all">All Students</option>
                                <option value="btech">B.Tech</option>
                                <option value="mtech">M.Tech</option>
                                <option value="msc">M.Sc</option>
                                <option value="phd">PhD</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Target Branches (comma separated, optional)</label>
                        <input type="text" value={formData.targetBranches} onChange={e => setFormData({ ...formData, targetBranches: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="CSE, EE, ME" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                        <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 border rounded-xl h-32" placeholder="Write your announcement here..."></textarea>
                    </div>
                    {message && <div className="text-sm font-bold text-emerald-600 bg-emerald-50 p-2 rounded">{message}</div>}
                    <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2">
                        <Send size={16} /> Broadcast Announcement
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Announcements</h3>
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                            <button onClick={() => handleDelete(ann._id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                            </button>
                            <h4 className="font-bold text-slate-900">{ann.title}</h4>
                            <p className="text-xs text-slate-500 mb-2">To: {ann.targetAudience.toUpperCase()} {ann.targetBranches.length > 0 && `(${ann.targetBranches.join(', ')})`} - By {(ann.createdBy && ann.createdBy.fullName) ? ann.createdBy.fullName : 'Admin'}</p>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && <p className="text-slate-500 text-center py-4">No announcements posted yet.</p>}
                </div>
            </div>
        </div>
    );
}
