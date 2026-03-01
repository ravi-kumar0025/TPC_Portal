import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, XCircle, CheckCircle, Building2 } from 'lucide-react';

export default function CompanyVerificationQueue() {
    const { token, user } = useAuth();
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.adminType === 'super_admin') {
            fetchPendingCompanies();
        }
    }, [user]);

    const fetchPendingCompanies = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/companies/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingCompanies(data.companies);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verifyCompany = async (companyId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/companies/${companyId}/verify`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPendingCompanies();
        } catch (err) {
            console.error(err);
        }
    };

    if (user?.adminType !== 'super_admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Super Admin access required.</div>;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="text-blue-500" /> Pending Verifications
                </h2>
                <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs box-content border border-amber-200">{pendingCompanies.length} queue</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-slate-400 font-medium animate-pulse">Scanning database...</div>
                ) : pendingCompanies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                        <ShieldCheck size={48} className="text-emerald-400 mb-4 opacity-50" />
                        <p className="font-semibold text-slate-700">All caught up!</p>
                        <p className="text-sm mt-1">No pending company verifications.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 p-1">
                        {pendingCompanies.map(company => (
                            <div key={company._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                <div className="flex justify-between items-start mb-3 pl-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{company.companyName}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-1">{company.email}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                                        {company.industry}
                                    </span>
                                </div>

                                <div className="flex gap-2 mt-4 pl-2 font-semibold">
                                    <button
                                        onClick={() => verifyCompany(company._id, 'verified')}
                                        className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 py-2 rounded-lg flex items-center justify-center gap-2 transition-all group/btn"
                                    >
                                        <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" /> Approve
                                    </button>
                                    <button
                                        onClick={() => verifyCompany(company._id, 'rejected')}
                                        className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 py-2 rounded-lg flex items-center justify-center gap-2 transition-all group/btn"
                                    >
                                        <XCircle size={16} className="group-hover/btn:scale-110 transition-transform" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
