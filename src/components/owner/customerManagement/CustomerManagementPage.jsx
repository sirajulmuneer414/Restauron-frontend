import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import { Search, Users, Activity, Slash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../errorsAndCommon/Pagination';

function CustomerManagementPage() {
    const navigate = useNavigate();
    const {axiosOwnerInstance} = useAxios(); // Assuming an owner-specific instance

    // Data, Filter, and Pagination states remain the same
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce and data fetching logic remain the same
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);
    
    useEffect(() => {
        setPage(0);
    }, [statusFilter]);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        const requestBody = { pageNo: page, size, search: debouncedSearch, filter: statusFilter === 'ALL' ? null : statusFilter };
        try {
            const response = await axiosOwnerInstance.post('/customer/list', requestBody);
            setCustomers(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            toast.error("Could not load customers.");
        } finally {
            setIsLoading(false);
        }
    }, [page, size, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);
    
    const getStatusStyles = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-300';
            case 'INACTIVE': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-red-500/20 text-red-300';
        }
    }

    // --- UPDATED PART ---
    return (
        <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
            <p className="text-gray-400 mb-6">View and manage all customers who have used your service.</p>

            {/* Filter and Search Controls (no changes here) */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                 <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
                        className="w-full bg-black/70 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5"/>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setStatusFilter('ALL')} className={statusFilter === 'ALL' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}>
                        <Users size={16} /> All
                    </Button>
                    <Button onClick={() => setStatusFilter('ACTIVE')} className={statusFilter === 'ACTIVE' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}>
                        <Activity size={16} /> Active
                    </Button>
                    <Button onClick={() => setStatusFilter('NONACTIVE')} className={statusFilter === 'INACTIVE' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}>
                        <Slash size={16} /> Inactive
                    </Button>
                </div>
            </div>

            {error && <div className="text-red-400 text-center py-4">{error}</div>}

            {/* Customer Table */}
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-900/70">
                        <tr>
                            {['Customer', 'Contact', 'Status', 'Actions'].map(h => 
                                <th key={h} className="py-3.5 px-4 text-left font-semibold">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-10">Loading customers...</td></tr>
                        ) : customers.length > 0 ? (
                            customers.map(customer => (
                                <tr key={customer.encryptedId} className="hover:bg-gray-800/50">
                                    <td className="p-4 font-medium">{customer.name}</td>
                                    <td className="p-4 text-gray-300">
                                        <div>{customer.email}</div>
                                        <div className="text-xs text-gray-500">{customer.phone || 'No phone number'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(customer.status)}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    {/* New "Actions" cell with the View button */}
                                    <td className="p-4">
                                        <Button 
                                            onClick={() => navigate(`/owner/customers/details/${customer.encryptedId}`)}
                                            className="bg-transparent hover:bg-gray-700 text-white flex items-center gap-2"
                                        >
                                            <Eye size={16}/> View
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-400">No customers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
        </div>
    );
}

export default CustomerManagementPage;
