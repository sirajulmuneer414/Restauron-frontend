import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosEmployeeInstance } from '../../../axios/instances/axiosInstances';
import { Users, TableIcon, ChevronRight, Wifi } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    AVAILABLE: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/40', dot: 'bg-green-400' },
    OCCUPIED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40', dot: 'bg-red-400' },
    RESERVED: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40', dot: 'bg-yellow-400' },
    OUT_OF_SERVICE: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40', dot: 'bg-gray-400' },
};

const TableCard = ({ table, onClick }) => {
    const colors = STATUS_COLORS[table.status] || STATUS_COLORS.AVAILABLE;
    return (
        <button
            onClick={() => onClick(table.tableId)}
            className="w-full text-left bg-gray-900 border border-gray-700 hover:border-amber-500/60 rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10 group"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{table.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                        <Users size={13} />
                        <span>{table.capacity} Seats</span>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:text-amber-400 transition-colors mt-1" />
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit ${colors.bg} ${colors.text} ${colors.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {table.status?.replace('_', ' ')}
            </div>
        </button>
    );
};

const EmployeeTableListPage = () => {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosEmployeeInstance.get('/tables');
            setTables(response.data || []);
        } catch (err) {
            toast.error('Failed to load tables. ' + (err.response?.data?.message || ''));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchTables(); }, [fetchTables]);

    if (isLoading) return <CommonLoadingSpinner />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black p-6 text-white">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
                    <p className="text-gray-400 mt-1">Select a table to view details and manage orders</p>
                </div>

                {tables.length === 0 ? (
                    <div className="text-center text-gray-400 p-16 border border-dashed border-gray-700 rounded-xl bg-gray-900/30">
                        <Users size={48} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-300">No tables found</h3>
                        <p className="text-sm mt-1">Ask the owner to add tables from the restaurant settings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {tables.map(table => (
                            <TableCard
                                key={table.tableId}
                                table={table}
                                onClick={(id) => navigate(`/employee/tables/${id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeTableListPage;
