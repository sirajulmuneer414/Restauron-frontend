import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import { 
    Shield, 
    ShieldOff, 
    Edit, 
    Trash, 
    AlertTriangle, 
    User, 
    Mail, 
    Phone, 
    AlertCircle, 
    FileText,
    Send,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

// --- Reusable Modals and Components ---

/**
 * A generic modal for confirming critical actions like deleting or unblocking.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm", confirmVariant = "bg-red-600 hover:bg-red-700" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="text-lg font-bold text-white mt-4">{title}</h3>
                <p className="text-sm text-gray-400 my-2">{message}</p>
                <div className="flex justify-center gap-3 mt-6">
                    <Button onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600 hover:bg-gray-700">Cancel</Button>
                    <Button onClick={onConfirm} disabled={isLoading} className={`${confirmVariant} text-white`}>
                        {isLoading ? 'Confirming...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal for blocking a customer, requiring a subject and description.
 */
const BlockCustomerModal = ({ isOpen, onClose, customer, onBlockSuccess }) => {
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useSelector((state) => state.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

    useEffect(() => {
        if (isOpen) {
            setFormData({ subject: '', description: '' });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {

        if(isReadOnly) {
            toast.error("Cannot block customer in Read-Only mode.");    
            return; // Prevent action in read-only mode
        }

        e.preventDefault();
        if (!formData.subject.trim() || !formData.description.trim()) {
            setError("Both subject and description are required.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await axiosOwnerInstance.patch(`/customer/update-status/${customer.encryptedId}`, {
                status: 'NONACTIVE',
                subject: formData.subject.trim(),
                description: formData.description.trim()
            });
            toast.success("Customer has been blocked successfully!");
            onBlockSuccess();
            onClose();
        } catch (err) {
            const errorMessage = err?.response?.data?.message || "Failed to block customer.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg m-4">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldOff className="text-red-500" size={24} />
                    <h2 className="text-xl font-bold text-white">Block Customer</h2>
                </div>
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">
                        You are blocking <strong>{customer?.name}</strong>. They will be notified with the reason provided.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} placeholder="e.g., Policy Violation" className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Provide a detailed explanation..." rows={4} className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5 text-white resize-none" required />
                    </div>
                    {error && <p className="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600 hover:bg-gray-700">Cancel</Button>
                        <Button type="submit" disabled={isReadOnly || isLoading || !formData.subject.trim() || !formData.description.trim()} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                            {isLoading ? 'Blocking...' : 'Block Customer'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Modal for editing a customer's basic information.
 */
const EditCustomerModal = ({ isOpen, onClose, customer, onSaveSuccess }) => {
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (customer) {
            setFormData({ name: customer.name || '', phone: customer.phone || '' });
        }
    }, [customer]);
    
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axiosOwnerInstance.put(`/customer/update-details/${customer.encryptedId}`, formData);
            toast.success("Customer details updated!");
            onSaveSuccess();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update details.");
            toast.error(err?.response?.data?.message || "Failed to update details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-6 text-white">Edit Customer Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                        <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5 text-white" />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600 hover:bg-gray-700">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Modal for providing a reason when rejecting an unblock request.
 */
const RejectRequestModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error("A reason for rejection is required.");
            return;
        }
        onSubmit(reason);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-xl font-bold text-white mb-4">Reason for Rejection</h2>
                <p className="text-gray-400 mb-6">Please provide a brief explanation for rejecting this request. This will be visible to the customer.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., The account remains blocked due to repeated policy violations."
                    rows={4}
                    className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-500 resize-none"
                    required
                />
                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                        {isLoading ? 'Rejecting...' : 'Reject Request'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

/**
 * Card to display information about why a customer is blocked.
 */
const BlockInformationCard = ({ customer }) => {
    if (!customer.blocked || !customer.blockSubject) return null;
    return (
        <div className="col-span-1 md:col-span-3 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
                <AlertCircle className="text-red-400 mt-1" size={24} />
                <div className="flex-1 space-y-4">
                    <h3 className="font-semibold text-red-300 text-lg">Customer Blocked</h3>
                    <div>
                        <h4 className="font-medium text-gray-300 mb-1 flex items-center gap-2"><FileText size={16} />Reason</h4>
                        <p className="text-red-200 font-semibold bg-red-900/30 px-3 py-2 rounded-lg">{customer.blockSubject}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-300 mb-1">Description</h4>
                        <div className="bg-black/30 border border-red-500/20 rounded-lg p-3">
                            <p className="text-gray-300 text-sm leading-relaxed">{customer.blockDescription}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Card to display a pending unblock request and provide actions.
 */
const UnblockRequestCard = ({ request, onApprove, onReject }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const handleApproveClick = async () => {
        setIsApproving(true);
        await onApprove(request.requestEncryptedId);
        setIsApproving(false);
    };

    const handleRejectSubmit = async (reason) => {
        setIsRejecting(true);
        await onReject(request.requestEncryptedId, reason);
        setIsRejecting(false);
        setIsRejectModalOpen(false);
    };

    return (
        <div className="col-span-1 md:col-span-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
                <Send className="text-blue-400 mt-1" size={24} />
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-300 text-lg mb-4">Pending Unblock Request</h3>
                    <div className="bg-black/30 border border-blue-500/20 rounded-lg p-4 mb-6">
                        <p className="text-gray-300 italic">"{request.message}"</p>
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                            <Clock size={14} /> Submitted on {new Date(request.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button onClick={() => setIsRejectModalOpen(true)} disabled={request.status === "REJECTED" || isApproving || isRejecting} className="bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-600 hover:text-white">
                            <XCircle size={16} className="mr-2"/> Reject
                        </Button>
                        <Button onClick={handleApproveClick} disabled={isApproving || isRejecting} className="bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500 hover:text-white">
                            {isApproving ? 'Approving...' : <><CheckCircle size={16} className="mr-2"/> Approve & Unblock</>}
                        </Button>
                    </div>
                </div>
            </div>
            <RejectRequestModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onSubmit={handleRejectSubmit} isLoading={isRejecting} />
        </div>
    );
};


// --- Main Detail Page Component ---
function CustomerDetailPage() {
    const { customerEncryptedId } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Modal visibility states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchCustomer = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosOwnerInstance.get(`/customer/fetch/${customerEncryptedId}`);
            setCustomer(response.data);
        } catch (err) {
            setError("Failed to load customer details.");
            toast.error("Could not load customer details.");
        } finally {
            setIsLoading(false);
        }
    }, [customerEncryptedId]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    // --- Action Handlers ---
    const handleUnblock = async () => {
        setIsActionLoading(true);
        try {
            await axiosOwnerInstance.patch(`/customer/update-status/${customerEncryptedId}`, { status: 'ACTIVE' });
            toast.success('Customer has been unblocked.');
            fetchCustomer();
        } catch (err) {
            toast.error("Failed to unblock customer.");
        } finally {
            setIsActionLoading(false);
            setIsUnblockModalOpen(false);
        }
    };
    
    const handleDelete = async () => {
        setIsActionLoading(true);
        try {
            await axiosOwnerInstance.delete(`/customer/delete/${customerEncryptedId}`);
            toast.success("Customer has been deleted.");
            navigate('/owner/customers');
        } catch (err) {
            toast.error("Failed to delete customer.");
        } finally {
            setIsActionLoading(false);
            setIsDeleteModalOpen(false);
        }
    };
    
    const handleApproveRequest = async (requestEncryptedId) => {
        try {
            await axiosOwnerInstance.post(`/unblock-requests/approve/${requestEncryptedId}`);
            toast.success("Request approved. Customer unblocked!");
            fetchCustomer();
        } catch (err) {
            toast.error("Failed to approve the request.");
        }
    };
    
    const handleRejectRequest = async (requestEncryptedId, reason) => {
        try {
            await axiosOwnerInstance.post(`/unblock-requests/reject/${requestEncryptedId}`, { ownerResponse: reason });
            toast.success("Request has been rejected.");
            fetchCustomer();
        } catch (err) {
            toast.error("Failed to reject the request.");
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'ACTIVE': return { text: 'Active', color: 'text-green-400', icon: <Shield size={24} /> };
            case 'NONACTIVE': return { text: 'Blocked', color: 'text-red-400', icon: <ShieldOff size={24} /> };
            default: return { text: 'Unknown', color: 'text-gray-400', icon: <User size={24} /> };
        }
    };
    
    if (isLoading) return <div className="p-10 text-center text-white">Loading customer details...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!customer) return <div className="p-10 text-center text-white">Customer not found.</div>;

    const statusInfo = getStatusInfo(customer.status);

    return (
        <div className="container mx-auto p-4 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold">{customer.name}</h1>
                    <p className="text-gray-400 mt-1 max-w-2xl">Manage customer details, status, and requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    {customer.status === 'ACTIVE' ? (
                        <Button onClick={() => setIsBlockModalOpen(true)} className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black font-semibold flex items-center gap-2">
                            <ShieldOff size={16} /> Block
                        </Button>
                    ) : (
                        <Button onClick={() => setIsUnblockModalOpen(true)} className="bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500 hover:text-black font-semibold flex items-center gap-2">
                            <Shield size={16} /> Unblock
                        </Button>
                    )}
                    <Button onClick={() => setIsEditModalOpen(true)} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500 hover:text-white font-semibold flex items-center gap-2">
                        <Edit size={16} /> Edit
                    </Button>
                    <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-600 hover:text-white font-semibold flex items-center gap-2">
                        <Trash size={16} /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/50 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                    {statusInfo.icon}
                    <div>
                        <h3 className="font-semibold text-gray-400">Status</h3>
                        <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                    </div>
                </div>
                <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-400 mb-2 flex items-center gap-2"><Mail size={16}/> Email Address</h3>
                    <p className="font-bold text-lg">{customer.email}</p>
                </div>
                <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-400 mb-2 flex items-center gap-2"><Phone size={16}/> Phone Number</h3>
                    <p className="font-bold text-lg">{customer.phone || 'Not provided'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:col-span-3 gap-y-6 mt-6">
                <BlockInformationCard customer={customer} />
                {customer.unblockRequests?.length > 0 && customer.unblockRequests.map(request => (
                    <UnblockRequestCard 
                        key={request.requestEncryptedId}
                        request={request}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                    />
                ))}
            </div>

            {/* --- All Modals --- */}
            <BlockCustomerModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} customer={customer} onBlockSuccess={fetchCustomer} />
            <EditCustomerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} customer={customer} onSaveSuccess={fetchCustomer} />
            <ConfirmationModal isOpen={isUnblockModalOpen} onClose={() => setIsUnblockModalOpen(false)} onConfirm={handleUnblock} isLoading={isActionLoading} title="Unblock Customer" message={`Are you sure you want to unblock ${customer.name}? This will also resolve any pending unblock requests.`} confirmText="Yes, Unblock" confirmVariant="bg-green-600 hover:bg-green-700"/>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} isLoading={isActionLoading} title="Delete Customer" message={`Are you sure you want to permanently delete ${customer.name}? This action cannot be undone.`} />
        </div>
    );
}

export default CustomerDetailPage;

