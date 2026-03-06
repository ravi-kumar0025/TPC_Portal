import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Menu, X, Home, Briefcase, Code, BarChart2, Phone, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/logo.png';



// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

const MotionDiv = motion.div;

export default function PastRecruiters() {
    const { user, token, logout } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [recruiters, setRecruiters] = useState([]);

    // Admin Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecruiter, setCurrentRecruiter] = useState({ name: '', industry: '', tier: 'Tier 1' });
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const response = await axios.get('/api/past-recruiters');
                setRecruiters(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch recruiters:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecruiters();
    }, []);

    const handleAdd = () => {
        setCurrentRecruiter({ name: '', industry: '', tier: 'Tier 1' });
        setEditIndex(null);
        setIsModalOpen(true);
    };

    const handleEdit = (recruiter) => {
        setCurrentRecruiter({ name: recruiter.name, industry: recruiter.industry, tier: recruiter.tier });
        // Find index in the original recruiters list
        const index = recruiters.findIndex(r => r._id === recruiter._id);
        setEditIndex(index);
        setEditId(recruiter._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (indexToDelete) => {
        if (window.confirm('Are you sure you want to remove this recruiter?')) {
            const recruiterToDelete = recruiters[indexToDelete];
            try {
                await axios.delete(`/api/past-recruiters/${recruiterToDelete._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newRecruiters = recruiters.filter((_, idx) => idx !== indexToDelete);
                setRecruiters(newRecruiters);
            } catch (err) {
                console.error("Failed to delete recruiter:", err);
                alert("Failed to delete. Make sure you are an admin.");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            if (editIndex !== null && editIndex !== -1 && editId) {
                // Update existing
                const response = await axios.put(`/api/past-recruiters/${editId}`, currentRecruiter, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newRecruiters = [...recruiters];
                newRecruiters[editIndex] = response.data.data;
                setRecruiters(newRecruiters);
            } else {
                // Add new
                const response = await axios.post('/api/past-recruiters', currentRecruiter, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecruiters([response.data.data, ...recruiters]);
            }
            setIsModalOpen(false);
            setEditId(null);
        } catch (err) {
            console.error("Failed to save recruiter:", err);
            alert("Failed to save. Make sure you are an admin.");
        }
    };

    const safeSearch = (searchTerm || '').toLowerCase().trim();
    const filteredRecruiters = recruiters.filter(recruiter => {
        if (!safeSearch) return true;
        const name = recruiter?.name || '';
        const industry = recruiter?.industry || '';
        return name.toLowerCase().includes(safeSearch) ||
            industry.toLowerCase().includes(safeSearch);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center dark:bg-slate-950">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans pb-32 overflow-hidden relative dark:bg-slate-950">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 dark:bg-slate-950/85 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">
                                <img src={logo} alt="IIT Patna logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 hidden lg:block whitespace-nowrap">Training & Placement</span>
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 lg:hidden">TPC</span>
                                <span className="text-xs font-medium text-blue-600">IIT Patna</span>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            <Link to="/" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Home">
                                <Home className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Home</span>
                            </Link>
                            <Link to="/past-recruiters" className="flex items-center gap-1.5 text-blue-600 font-medium transition-colors group" title="Past Recruiters">
                                <Briefcase className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Past Recruiters</span>
                            </Link>
                            <Link to="/developers" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Developers">
                                <Code className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Developers</span>
                            </Link>
                            <a href="/#stats" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Statistics">
                                <BarChart2 className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Statistics</span>
                            </a>
                            <a href="/#contact" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Contact">
                                <Phone className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Contact</span>
                            </a>
                            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>
                            <ThemeToggle />
                            {token ? (
                                <div className="flex items-center space-x-2 lg:space-x-4">
                                    <Link to="/dashboard" className="bg-blue-600 text-white px-4 lg:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5" title="Dashboard">
                                        <LayoutDashboard className="w-4 h-4 lg:hidden" />
                                        <span className="hidden lg:block">Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-red-500 font-semibold hover:text-red-600 transition-colors p-2 lg:p-0 flex items-center gap-1.5"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5 lg:hidden" />
                                        <span className="hidden lg:block">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 lg:space-x-4">
                                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors px-2 lg:px-0 text-sm lg:text-base">Log in</Link>
                                    <Link to="/login" className="bg-blue-600 text-white px-4 lg:px-6 py-2 rounded-lg font-medium text-sm lg:text-base hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                        Portal Access
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="md:hidden flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-600 hover:text-blue-600 focus:outline-none dark:text-slate-300"
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-xl dark:bg-slate-950 dark:border-slate-800">
                        <div className="px-4 pt-4 pb-6 space-y-4">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Home</Link>
                            <Link to="/past-recruiters" onClick={() => setIsMobileMenuOpen(false)} className="block text-blue-600 font-medium">Past Recruiters</Link>
                            <Link to="/developers" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Developers</Link>
                            <a href="/#stats" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Statistics</a>
                            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Contact</a>
                            <div className="w-full h-px bg-gray-200 dark:bg-slate-800 my-4"></div>
                            {token ? (
                                <>
                                    <Link to="/dashboard" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                        Go to Dashboard
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-center text-red-500 font-semibold hover:bg-red-50 px-6 py-3 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-blue-600 font-semibold mb-4 text-center">Log in</Link>
                                    <Link to="/login" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                        Portal Access
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Setup */}
                <MotionDiv
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold tracking-widest uppercase text-xs mb-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        Our Partners
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 tracking-tight mb-6 dark:text-slate-100">
                        Past Recruiters
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed dark:text-slate-400">
                        A proud network of globally renowned organizations that consistently recruit and trust the exceptional talent from IIT Patna.
                    </p>
                    {isAdmin && (
                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isEditMode
                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Settings size={20} className={isEditMode ? 'animate-spin' : ''} />
                                {isEditMode ? 'Exit Edit Mode' : 'Edit Page'}
                            </button>
                            {isEditMode && (
                                <button
                                    onClick={handleAdd}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    <Plus size={20} /> Add New Recruiter
                                </button>
                            )}
                        </div>
                    )}
                </MotionDiv>

                {/* Search / Filter Section */}
                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="max-w-xl mx-auto mb-16 relative"
                >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by company name or industry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 shadow-sm transition-all text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-blue-400"
                    />
                </MotionDiv>

                {/* Grid of Recruiters */}
                <MotionDiv
                    key={searchTerm} // Triggers stagger animation again when search changes
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
                >
                    {filteredRecruiters.map((recruiter) => (
                        <MotionDiv
                            key={recruiter._id || recruiter.name}
                            variants={itemVariants}
                            className="relative bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group dark:bg-slate-900 dark:border-slate-800 dark:hover:border-cyan-900 dark:shadow-none dark:hover:shadow-[0_8px_24px_-10px_rgba(34,211,238,0.2)] flex flex-col justify-center min-h-[140px]"
                        >
                            {isAdmin && isEditMode && (
                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleEdit(recruiter); }}
                                        className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700"
                                        title="Edit Recruiter"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleDelete(recruiters.findIndex(r => r._id === recruiter._id)); }}
                                        className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-slate-700"
                                        title="Delete Recruiter"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors mb-2 pt-2 dark:text-slate-200 dark:group-hover:text-cyan-400">
                                {recruiter.name}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest dark:text-slate-500">
                                {recruiter.industry}
                            </span>
                        </MotionDiv>
                    ))}

                    {filteredRecruiters.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-slate-400">
                            No matching recruiters found.
                        </div>
                    )}
                </MotionDiv>
            </div>

            {/* Admin Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border dark:border-slate-800"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                                {editIndex !== null ? 'Edit Recruiter' : 'Add New Recruiter'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentRecruiter.name}
                                    onChange={(e) => setCurrentRecruiter({ ...currentRecruiter, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Industry</label>
                                <input
                                    type="text"
                                    required
                                    value={currentRecruiter.industry}
                                    onChange={(e) => setCurrentRecruiter({ ...currentRecruiter, industry: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                                    placeholder="e.g. Software/Technology"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tier Level</label>
                                <select
                                    value={currentRecruiter.tier}
                                    onChange={(e) => setCurrentRecruiter({ ...currentRecruiter, tier: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                                >
                                    <option value="Tier 1">Tier 1</option>
                                    <option value="Tier 2">Tier 2</option>
                                    <option value="Tier 3">Tier 3</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    {editIndex !== null ? 'Save Changes' : 'Add Recruiter'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
