import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Check, Star, Zap } from 'lucide-react';
import { useOwnerService } from '../../../services/ownerService';
import { useSelector } from 'react-redux';
import { useRazorpayService } from '../../../services/razorpayService';

const SubscriptionPlans = () => {
    const ownerService = useOwnerService();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const userDetails = useSelector((state) => state.userSlice.user);
    const razorpayService = useRazorpayService();

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const data = await ownerService.getAllPackages();
            setPackages(data);
        } catch (error) {
            toast.error("Failed to load subscription plans");
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate final price based on Offer
    const getPriceDetails = (pkg) => {
        let finalPrice = Number(pkg.price); // Ensure number
        let hasOffer = false;

        if (pkg.offer && pkg.offer.discount > 0) {
            hasOffer = true;
            const discountValue = Number(pkg.offer.discount);
            
            // Check for both 'PERCENT' and 'percent' to be safe
            if (pkg.offer.discountType?.toUpperCase() === 'PERCENT') {
                finalPrice = finalPrice - (finalPrice * (discountValue / 100));
            } else if (pkg.offer.discountType?.toUpperCase() === 'CASH') {
                finalPrice = finalPrice - discountValue;
            }
        }
        // Return rounded integer for clean display if desired, or keep decimals
        return { 
            originalPrice: pkg.price, 
            finalPrice: Math.max(0, Math.round(finalPrice)), // Rounding prevents weird decimals
            hasOffer 
        };
    };


    const handleSubscribe = async (pkg) => {
        const { finalPrice } = getPriceDetails(pkg);
        
        try {
            // 1. Create Order on Backend
            const orderData = await ownerService.createPaymentOrder(pkg.id);
            const contactNumber = await ownerService.getOwnerContactNumber();
            console.log("Owner Contact Number:", contactNumber);
            const razorpayKey = await razorpayService.getRazorpayKey();
            console.log("Razorpay Key:", razorpayKey);
            
            // 2. Open Razorpay Options
            const options = {
                key: razorpayKey, // Replace with your Test Key ID
                amount: orderData.amount, // Amount in paise (already handled by backend)
                currency: "INR",
                name: "Restauron",
                description: `Subscription: ${pkg.name}`,
                order_id: orderData.id, // Razorpay Order ID from backend
                handler: async function (response) {
                    // 3. Verify Payment on Success
                    try {
                        const verifyData = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            amountPaid: orderData.amount,
                            packageId: pkg.id
                        };
                        
                        await ownerService.verifyPayment(verifyData);
                        toast.success("Subscription Activated Successfully!");
                        // Redirect to dashboard after delay
                        setTimeout(() => window.location.href = "/owner/dashboard", 2000);

                    } catch (err) {
                        toast.error("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: `${userDetails.name}`, // You can fetch logged-in user details here
                    email: `${userDetails.email}`,
                    contact: `${contactNumber}`
                },
                theme: { color: "#4F46E5" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response){
                toast.error(`Payment Failed: ${response.error.description}`);
            });

        } catch (error) {
            console.error(error);
            toast.error("Could not initiate payment");
        }
    };

    if (loading) return <div className="text-center py-20">Loading Plans...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Choose Your Plan
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Unlock the full potential of Restauron with our premium packages.
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3 md:grid-cols-2 items-center">
                {packages.map((pkg) => {
                    const { originalPrice, finalPrice, hasOffer } = getPriceDetails(pkg);
                    
                    return (
                        <div key={pkg.id} className="relative bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                            {/* Offer Badge */}
                            {hasOffer && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wide">
                                    {pkg.offer.discountType === 'PERCENT' ? `${pkg.offer.discount}% OFF` : `SAVE ₹${pkg.offer.discount}`}
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                                <p className="text-gray-500 text-sm mt-2">{pkg.description}</p>
                            </div>

                            <div className="mb-6 flex items-baseline">
                                {hasOffer && (
                                    <span className="text-lg text-gray-400 line-through mr-2">
                                        ₹{originalPrice}
                                    </span>
                                )}
                                <span className="text-4xl font-extrabold text-gray-900">
                                    ₹{finalPrice}
                                </span>
                                <span className="text-base font-medium text-gray-500 ml-1">
                                    /{pkg.durationAmount} {pkg.durationType}
                                </span>
                            </div>

                            {/* Features List (Static for now, or dynamic if you add features to entity) */}
                            <ul className="mb-8 space-y-4 flex-1">
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} /> Full Dashboard Access
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} /> Unlimited Orders
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} /> 24/7 Support
                                </li>
                            </ul>

                            <button
                                onClick={() => handleSubscribe(pkg)}
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> Subscribe Now
                            </button>
                            
                            {hasOffer && pkg.offer.expiry && (
                                <p className="text-xs text-red-500 mt-3 text-center">
                                    Offer valid until {pkg.offer.expiry}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
