import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, AlertTriangle, Download, ChevronRight, GraduationCap } from 'lucide-react';

export default function CompanyDashboard() {
    const { user, token } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [cgpa, setCgpa] = useState('');
    const [branch, setBranch] = useState([]);
    const [program, setProgram] = useState([]);

    const branchOptions = ['CSE', 'EE', 'ME', 'CE', 'CBE'];
    const programOptions = ['B.Tech', 'M.Tech', 'M.Sc'];

    useEffect(() => {
        if (user?.verificationStatus === 'verified') {
            fetchStudents();
        }
    }, [cgpa, branch, program]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/company/students', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    cgpa,
                    branch: branch.join(','),
                    program: program.join(',')
                }
            });
            setStudents(data.students);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (setter, state, value) => {
        if (state.includes(value)) {
            setter(state.filter(item => item !== value));
        } else {
            setter([...state, value]);
        }
    };

    if (user?.verificationStatus === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-yellow-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900">
                    <AlertTriangle size={36} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-100">Account Under Review</h2>
                <p className="text-slate-500 mb-8 leading-relaxed dark:text-slate-300">
                    Your company profile is currently being verified by the IIT Patna TPC Administration.
                    Access to the student database will be granted once verified. (Process usually takes 48 hours).
                </p>
                <button className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
                    Contact Support <ChevronRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                        <GraduationCap className="text-blue-600 dark:text-blue-300" size={28} />
                        Student Database
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 dark:text-slate-300">Discover and recruit top talent from IIT Patna</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-400">
                    <Download size={18} /> Export Current View
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 h-fit lg:sticky lg:top-24 dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:text-slate-100 dark:border-slate-700">
                        <Filter size={20} className="text-blue-500 dark:text-blue-300" /> Advanced Filters
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider dark:text-slate-300">Minimum CGPA: {cgpa || 'Any'}</label>
                            <input
                                type="range"
                                min="0" max="10" step="0.5"
                                value={cgpa}
                                onChange={(e) => setCgpa(e.target.value)}
                                className="w-full accent-blue-600 bg-slate-200 rounded-lg appearance-none cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium dark:text-slate-500">
                                <span>0</span><span>5</span><span>10</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider dark:text-slate-300">Program</label>
                            <div className="space-y-2">
                                {programOptions.map(prog => (
                                    <label key={prog} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                                            checked={program.includes(prog)}
                                            onChange={() => toggleFilter(setProgram, program, prog)}
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:group-hover:text-slate-100">{prog}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider dark:text-slate-300">Branch</label>
                            <div className="space-y-2">
                                {branchOptions.map(b => (
                                    <label key={b} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                                            checked={branch.includes(b)}
                                            onChange={() => toggleFilter(setBranch, branch, b)}
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:group-hover:text-slate-100">{b}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {(cgpa || branch.length > 0 || program.length > 0) && (
                            <button
                                onClick={() => { setCgpa(''); setBranch([]); setProgram([]); }}
                                className="w-full py-2 text-sm text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-medium animate-pulse dark:text-slate-500">Loading talent database...</div>
                    ) : students.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center dark:text-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 dark:bg-slate-800">
                                <Search size={28} className="text-slate-300 dark:text-slate-500" />
                            </div>
                            <p className="text-lg font-medium text-slate-700 mb-1 dark:text-slate-100">No students found matching your criteria.</p>
                            <p className="text-sm">Try adjusting your filters on the left.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/70">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Name</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Roll No</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Program / Branch</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">CGPA</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900/90 dark:divide-slate-800">
                                    {students.map((student) => (
                                        <tr key={student._id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer dark:hover:bg-slate-800/70">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors dark:text-slate-100 dark:group-hover:text-blue-300">{student.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono tracking-wide dark:text-slate-400">
                                                {student.rollNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800 mr-2 border border-blue-200 shadow-sm dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
                                                    {student.program}
                                                </span>
                                                <span className="text-sm text-slate-600 font-medium dark:text-slate-300">{student.department || student.branch || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-bold ${student.cgpa >= 8.5 ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold dark:text-blue-300">
                                                <button className="hover:text-blue-900 group-hover:underline dark:hover:text-blue-200">View Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
