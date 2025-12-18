import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Send, Users, User, Radio, Megaphone } from 'lucide-react';
import { useAdminService } from '../../../services/adminService';

const AdminNotifications = () => {
    const adminService = useAdminService();
    const [activeTab, setActiveTab] = useState('private'); // 'private', 'owners', 'global'
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        title: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error("Title and Message are required");
            return;
        }
        if (activeTab === 'private' && !formData.email) {
            toast.error("User Email is required for private messages");
            return;
        }

        setLoading(true);
        try {
            if (activeTab === 'private') {
                await adminService.sendPrivateNotification(formData.email, formData.title, formData.message);
                toast.success(`Sent to ${formData.email}`);
            } else if (activeTab === 'owners') {
                await adminService.sendOwnerAnnouncement(formData.title, formData.message);
                toast.success("Sent to All Owners");
            } else if (activeTab === 'global') {
                await adminService.sendGlobalBroadcast(formData.title, formData.message);
                toast.success("Broadcasted to Everyone");
            }
            
            // Clear form
            setFormData({ email: '', title: '', message: '' });
        } catch (error) {
            toast.error("Failed to send notification");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toaster position="top-right" />
            
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="text-indigo-600" /> Notification Center
                    </h1>
                    <p className="text-gray-500 mt-1">Send real-time alerts to users and owners.</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <TabButton 
                        id="private" 
                        label="Single User" 
                        icon={<User size={18} />} 
                        active={activeTab} 
                        onClick={setActiveTab} 
                    />
                    <TabButton 
                        id="owners" 
                        label="All Owners" 
                        icon={<Users size={18} />} 
                        active={activeTab} 
                        onClick={setActiveTab} 
                    />
                    <TabButton 
                        id="global" 
                        label="Global Broadcast" 
                        icon={<Radio size={18} />} 
                        active={activeTab} 
                        onClick={setActiveTab} 
                    />
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">
                        {activeTab === 'private' && 'Send Private Message'}
                        {activeTab === 'owners' && 'Announce to Restaurant Owners'}
                        {activeTab === 'global' && 'System-Wide Broadcast'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === 'private' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject / Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., System Maintenance Alert"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                            <textarea
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Type your message here..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
                                    ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}
                                `}
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        <Send size={18} /> Send Notification
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Tabs
const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${active === id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
        `}
    >
        {icon}
        {label}
    </button>
);

export default AdminNotifications;
