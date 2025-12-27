import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAxios } from '../../axios/instances/axiosInstances';
import toast from 'react-hot-toast';
import Table from '../../assets/login-back.jpg'; // Reuse background

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { axiosInstances } = useAxios();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-red-500 text-xl">Invalid or missing reset token.</p>
            </div>
        );
    }

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        // console.log("Resetting password with token:", token);
        // console.log("New Password:", newPassword);
        try {
            await axiosInstances.post('/auth/reset-password', {
                token: token,
                newPassword: newPassword
            });
            toast.success("Password reset successfully! Please login.");
            navigate('/login'); // Redirect to login
        } catch (error) {
            console.error("Reset Error:", error);
            toast.error(error.response?.data?.message || "Failed to reset password. Token may be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
            style={{ backgroundImage: `url(${Table})` }}
        >
            <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Set New Password</h2>
                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="text-gray-300 text-sm mb-1 block">New Password</label>
                        <Input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-gray-700/50 text-white border-gray-600 w-full"
                            placeholder="Min 8 chars"
                        />
                    </div>
                    <div>
                        <label className="text-gray-300 text-sm mb-1 block">Confirm Password</label>
                        <Input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-gray-700/50 text-white border-gray-600 w-full"
                            placeholder="Re-enter password"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
