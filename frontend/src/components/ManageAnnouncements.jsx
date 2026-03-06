import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Send, Trash2, Pencil, X, Clock } from 'lucide-react';

const BRANCHES = ['CSE', 'EE', 'ME', 'MME'];

const EMPTY_FORM = { title: '', content: '', targetAudience: 'all', targetBranches: [] };

function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}

// Reusable checkbox group for branches
function BranchCheckboxes({ value, onChange }) {
    const allChecked = value.length === 0; // empty = all branches

    const toggle = (branch) => {
        if (branch === 'ALL') {
            onChange([]); // empty = broadcast to all
        } else {
            const next = value.includes(branch)
                ? value.filter(b => b !== branch)
                : [...value, branch];
            onChange(next);
        }
    };

    const checkboxCls = (active) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all
        ${active
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-500'}`;

    return (
        <div className="flex flex-wrap gap-2">
            {/* All */}
            <label className={checkboxCls(allChecked)}>
                <input type="checkbox" className="hidden" checked={allChecked} onChange={() => toggle('ALL')} />
                All
            </label>
            {BRANCHES.map(b => {
                const active = value.includes(b);
                return (
                    <label key={b} className={checkboxCls(active)}>
                        <input type="checkbox" className="hidden" checked={active} onChange={() => toggle(b)} />
                        {b}
                    </label>
                );
            })}
        </div>
    );
}

export default function ManageAnnouncements() {
    const { token, user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [message, setMessage] = useState('');

    // Edit state
    const [editingAnn, setEditingAnn] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editMessage, setEditMessage] = useState('');
    const [editLoading, setEditLoading] = useState(false);

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
            const payload = {
                title: formData.title,
                content: formData.content,
                targetAudience: formData.targetAudience,
                targetBranches: formData.targetBranches, // already an array
            };
            await axios.post('http://localhost:5000/api/admin/announcements', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Announcement posted successfully!');
            setFormData(EMPTY_FORM);
            fetchAnnouncements();
        } catch {
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

    // ── Edit handlers ──────────────────────────────────────────────
    const openEdit = (ann) => {
        setEditingAnn(ann);
        setEditForm({
            title: ann.title,
            content: ann.content,
            targetAudience: ann.targetAudience || 'all',
            targetBranches: ann.targetBranches || [],
        });
        setEditMessage('');
    };

    const closeEdit = () => {
        setEditingAnn(null);
        setEditForm(EMPTY_FORM);
        setEditMessage('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const payload = {
                title: editForm.title,
                content: editForm.content,
                targetAudience: editForm.targetAudience,
                targetBranches: editForm.targetBranches, // already an array
            };
            await axios.put(`http://localhost:5000/api/admin/announcements/${editingAnn._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditMessage('Announcement updated!');
            setTimeout(() => {
                closeEdit();
                fetchAnnouncements();
            }, 800);
        } catch {
            setEditMessage('Error updating announcement');
        } finally {
            setEditLoading(false);
        }
    };

    if (user?.adminType !== 'super_admin' && user?.adminType !== 'announcement_admin') {
        return <div className="p-8 text-center text-red-500 font-bold dark:text-red-300">Unauthorized. Announcement Admin access required.</div>;
    }

    return (
        <div className="space-y-8 animate-[fade-in-up_0.5s_ease-out]">

            {/* ── Edit Modal ── */}
            {editingAnn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Modal header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Pencil size={15} className="text-blue-500" /> Edit Announcement
                            </h3>
                            <button
                                onClick={closeEdit}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Title</label>
                                    <input
                                        type="text" required
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Target Audience</label>
                                    <select
                                        value={editForm.targetAudience}
                                        onChange={e => setEditForm({ ...editForm, targetAudience: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100"
                                    >
                                        <option value="all">All Students</option>
                                        <option value="btech">B.Tech</option>
                                        <option value="mtech">M.Tech</option>
                                        <option value="msc">M.Sc</option>
                                        <option value="phd">PhD</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-200">Target Branches</label>
                                <BranchCheckboxes
                                    value={editForm.targetBranches}
                                    onChange={v => setEditForm({ ...editForm, targetBranches: v })}
                                />
                                <p className="text-xs text-slate-400 mt-1.5 dark:text-slate-500">
                                    Select <span className="font-semibold">All</span> to broadcast to every branch.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Content</label>
                                <textarea
                                    required
                                    value={editForm.content}
                                    onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl h-28 border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100"
                                />
                            </div>

                            {editMessage && (
                                <div className={`text-sm font-bold p-2 rounded border ${editMessage.includes('Error')
                                    ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-800'
                                    : 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'}`}>
                                    {editMessage}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    type="button" onClick={closeEdit}
                                    className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={editLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    <Send size={14} /> {editLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Create Form ── */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:text-slate-100 dark:border-slate-700">
                    <Bell className="text-blue-500 dark:text-blue-400" /> Post New Announcement
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Title</label>
                            <input
                                type="text" required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Google Placement Drive"
                                className="w-full px-4 py-2 border rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Target Audience</label>
                            <select
                                value={formData.targetAudience}
                                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100"
                            >
                                <option value="all">All Students</option>
                                <option value="btech">B.Tech</option>
                                <option value="mtech">M.Tech</option>
                                <option value="msc">M.Sc</option>
                                <option value="phd">PhD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-200">Target Branches</label>
                        <BranchCheckboxes
                            value={formData.targetBranches}
                            onChange={v => setFormData({ ...formData, targetBranches: v })}
                        />
                        <p className="text-xs text-slate-400 mt-1.5 dark:text-slate-500">
                            Select <span className="font-semibold">All</span> to broadcast to every branch.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-200">Content</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your announcement here…"
                            className="w-full px-4 py-2 border rounded-xl h-32 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus:outline-none transition-all dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {message && (
                        <div className={`text-sm font-bold p-2 rounded border ${message.toLowerCase().includes('error')
                            ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-800'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                        <Send size={16} /> Broadcast Announcement
                    </button>
                </form>
            </div>

            {/* ── Announcements List ── */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                <h3 className="text-lg font-bold text-slate-800 mb-4 dark:text-slate-100">Recent Announcements</h3>
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group dark:bg-slate-800/80 dark:border-slate-700">

                            {/* Action buttons */}
                            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(ann)}
                                    title="Edit"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => handleDelete(ann._id)}
                                    title="Delete"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            {/* Title row */}
                            <div className="flex items-center gap-2 mb-1 pr-16">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">{ann.title}</h4>
                                {ann.isEdited && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60">
                                        Edited
                                    </span>
                                )}
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    To: <span className="font-semibold">{ann.targetAudience.toUpperCase()}</span>
                                    {ann.targetBranches.length > 0
                                        ? ` (${ann.targetBranches.join(', ')})`
                                        : ' (All branches)'}
                                    {' · '}By {ann.createdBy?.fullName || 'Admin'}
                                </p>
                                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                    <Clock size={11} />
                                    {formatDateTime(ann.createdAt)}
                                    {ann.isEdited && ann.editedAt && (
                                        <span className="ml-1 text-amber-500 dark:text-amber-400">
                                            · edited {formatDateTime(ann.editedAt)}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <p className="text-slate-700 text-sm whitespace-pre-wrap dark:text-slate-300">{ann.content}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <p className="text-slate-500 text-center py-4 dark:text-slate-400">No announcements posted yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
