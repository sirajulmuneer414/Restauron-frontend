import React, { useEffect, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useAdminService } from '../../../services/adminService';

const PaymentHistory = () => {
    const adminService = useAdminService();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const data = await adminService.getAllPayments();
            setPayments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Search Transaction ID..." 
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Restaurant</th>
                            <th className="px-6 py-4 font-semibold">Payment Ref</th>
                            <th className="px-6 py-4 font-semibold">Plan</th>
                            <th className="px-6 py-4 font-semibold">Amount</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                        ) : payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                    <br/>
                                    <span className="text-xs text-gray-400">{new Date(payment.paymentDate).toLocaleTimeString()}</span>
                                </td>
                                <td className="px-6 py-4 font-medium">{payment.restaurantName}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.razorpayPaymentId}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                        {payment.packageName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">₹{payment.amount}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        SUCCESS
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">No transactions found.</div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
