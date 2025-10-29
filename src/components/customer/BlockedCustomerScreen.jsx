import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { ShieldOff, Send, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAxios } from '../../axios/instances/axiosInstances';


const BlockedCustomerScreen = () => {
    const user = useSelector(state => state.userSlice.user);
    
    const [blockInfo, setBlockInfo] = useState(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { axiosCustomerInstance } = useAxios();

    useEffect(() => {
        fetchBlockInfo();
    }, []);

    const fetchBlockInfo = async () => {
        try {
            const response = await axiosCustomerInstance.get(`/block/info/${user.userId}`);
            setBlockInfo(response.data);
        } catch (error) {
            console.error('Error fetching block info:', error);
            toast.error('Failed to load block information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please provide a reason for your unblock request.');
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosCustomerInstance.post(`/block/unblock-request/${user.userId}`, { message });
            toast.success('Your unblock request has been submitted!');
            setMessage('');
            // Refresh block info to update pending status
            fetchBlockInfo();
        } catch (error) {
            const errorMessage = error?.response?.data || 'Failed to submit request.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
            <div className="max-w-3xl w-full space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <ShieldOff size={120} className="text-red-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">Account Temporarily Blocked</h1>
                    <p className="text-xl text-gray-300">
                        Hi <span className="text-yellow-400">{user?.name}</span>, your account at{' '}
                        <span className="text-yellow-400">{blockInfo?.restaurantName}</span> has been temporarily restricted.
                    </p>
                </div>

                {/* Block Information Card */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-red-400" size={24} />
                        <h2 className="text-2xl font-bold text-red-300">Restriction Details</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <FileText size={18} className="text-red-400" />
                                Reason
                            </h3>
                            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                                <p className="text-red-200 font-semibold">{blockInfo?.subject}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Calendar size={18} className="text-red-400" />
                                Blocked On
                            </h3>
                            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                                <p className="text-red-200">{formatDate(blockInfo?.blockedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-white">Additional Details</h3>
                        <div className="bg-black/30 border border-red-500/20 rounded-lg p-4">
                            <p className="text-gray-300 leading-relaxed">{blockInfo?.description}</p>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                <div className="bg-black/50 border border-gray-800 rounded-2xl p-8 space-y-6">
                    {blockInfo?.hasPendingRequest ? (
                        // Pending Request State
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <Clock size={48} className="text-yellow-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-yellow-300">Request Under Review</h3>
                            <p className="text-yellow-200 max-w-2xl mx-auto">
                                Your unblock request has been submitted and is being reviewed by the restaurant management. 
                                You'll be notified once a decision is made.
                            </p>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                                <p className="text-yellow-300 text-sm">
                                    <strong>What happens next?</strong><br />
                                    • Restaurant management will review your request<br />
                                    • You'll receive a response within 24-48 hours<br />
                                    • If approved, your account access will be restored immediately
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Request Form
                        <div className="space-y-6">
                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-bold text-white">Request Account Restoration</h3>
                                <p className="text-gray-400 max-w-2xl mx-auto">
                                    If you believe this restriction was made in error or you'd like to appeal, 
                                    please explain your situation below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitRequest} className="space-y-6">
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                        Your Message to Restaurant Management
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Please explain why you believe your account should be restored. Be respectful and provide any relevant context..."
                                        rows={6}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum 500 characters. Be clear and respectful in your explanation.
                                    </p>
                                </div>
                                
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !message.trim()}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg"
                                >
                                    {isSubmitting ? (
                                        <>Submitting Request...</>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Unblock Request
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 space-y-2">
                    <p>If you have urgent concerns, please contact the restaurant directly.</p>
                    <p>Response time: Usually within 24-48 hours</p>
                </div>
            </div>
        </div>
    );
};

export default BlockedCustomerScreen;
