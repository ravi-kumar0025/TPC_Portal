import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';

export default function StudentCalendarUpdate() {
    const { user } = useAuth();

    if (user?.adminType !== 'super_admin' && user?.adminType !== 'student_admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Student Admin access required.</div>;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 text-center py-16">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Calendar Management</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
                The complex calendar integration is scheduled for the next development phase. For now, you can mock-create events.
            </p>

            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition-colors">
                <PlusCircle size={20} /> Add Placeholder Event
            </button>
        </div>
    );
}
