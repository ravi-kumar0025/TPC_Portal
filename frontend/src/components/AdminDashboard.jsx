import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCog } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCog className="text-blue-600" size={28} />
                        Administrator Console
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">Role</span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">{user?.adminType?.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Outlet />
            </div>
        </div>
    );
}
