import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Lock, Calendar, FileText, Bell } from 'lucide-react';

const EmployeeDashboard = () => {
    // Get the logged-in user's data from the Redux store
    const user = useSelector((state) => state.userSlice.user);
    const navigate = useNavigate();

    // A helper component for the main action cards
    const ActionCard = ({ icon: Icon, title, description, path, color }) => (
        <div
            onClick={() => navigate(path)}
            className={`group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-${color}-500/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer flex flex-col justify-between`}
        >
            <div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${color}-500/20 to-transparent border border-${color}-500/30 flex items-center justify-center mb-4`}>
                    <Icon className={`text-${color}-400`} size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
            <div className="mt-6 flex items-center justify-end text-sm font-semibold text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Go <ArrowRight size={16} className="ml-2" />
            </div>
        </div>
    );

    // Dummy data for the "Quick Look" section - replace with real data from an API
    const quickLookData = {
        nextShift: "Monday, Sep 1, 2025 at 9:00 AM",
        pendingTasks: 3,
        announcements: 1,
    };

    return (
        <div className="container mx-auto p-4 md:p-6 text-white">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    Welcome back, <span className="text-yellow-400">{user?.name || 'Employee'}</span>!
                </h1>
                <p className="text-lg text-gray-400">Here's your personal dashboard. What would you like to do today?</p>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Actions */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActionCard
                        icon={User}
                        title="My Profile"
                        description="View and manage your personal and contact information."
                        path="/employee/profile/details"
                        color="yellow"
                    />
                    <ActionCard
                        icon={Lock}
                        title="Change Password"
                        description="Update your password to keep your account secure."
                        path="/employee/profile/update-password"
                        color="yellow"
                    />
                    <ActionCard
                        icon={Calendar}
                        title="My Schedule"
                        description="Check your upcoming shifts and request time off."
                        path="/employee/schedule"
                        color="yellow"
                    />
                    <ActionCard
                        icon={FileText}
                        title="Pay Stubs"
                        description="Access and download your recent payment records."
                        path="/employee/payroll"
                        color="yellow"
                    />
                </div>

                {/* Right Column: Quick Look / At a Glance */}
                <div className="bg-gradient-to-br from-gray-900 to-black/50 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">At a Glance</h2>
                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex-shrink-0 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Next Shift</p>
                                <p className="font-semibold text-white">{quickLookData.nextShift}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex-shrink-0 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Pending Tasks</p>
                                <p className="font-semibold text-white">{quickLookData.pendingTasks} tasks waiting</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex-shrink-0 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Bell size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">New Announcements</p>
                                <p className="font-semibold text-white">{quickLookData.announcements} unread</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
