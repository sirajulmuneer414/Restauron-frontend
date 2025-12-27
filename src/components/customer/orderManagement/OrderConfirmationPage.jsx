import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import toast from 'react-hot-toast';

import DatePicker from "react-datepicker";
import { format } from 'date-fns';

// Import a separate CSS file for custom date picker styles
import "../../../css/customer/OrderConfirmationPage.css"; 
// Import icons
import { ClipboardList, SlidersHorizontal, MessageSquare, CalendarClock, CreditCard, Wallet } from 'lucide-react';


const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { encryptedId: restaurantEncryptedId } = useParams();
    const { axiosCustomerInstance } = useAxios();

    const { cartItems, totalPrice } = location.state || { cartItems: [], totalPrice: 0 };

    const [orderType, setOrderType] = useState('DINE_IN');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [dineInTime, setDineInTime] = useState('now');
    const [customerRemarks, setCustomerRemarks] = useState('');
    const [reservationDateTime, setReservationDateTime] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reservationFee = 50.0;
    const isReservation = orderType === 'DINE_IN' && dineInTime === 'reserve';

    let finalAmount = totalPrice;
    if (isReservation && paymentMethod === 'CASH') {
        finalAmount += reservationFee;
    }

    const handleReserveClick = () => {
        setDineInTime('reserve');
        setPaymentMethod('ONLINE');
    }

    const handleToTakeAwayClick = () => {
        setOrderType('TAKE_AWAY');
        setDineInTime('now');
    }


    const handlePlaceOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const orderPayload = {
            restaurantEncryptedId,
            items: cartItems.map(item => ({
                menuItemEncryptedId: item.encryptedId,
                quantity: item.quantity,
            })),
            orderType,
            paymentMode: paymentMethod,
            customerRemarks,
            scheduledDate: isReservation ? format(reservationDateTime, 'yyyy-MM-dd') : null,
            scheduledTime: isReservation ? format(reservationDateTime, 'HH:mm:ss') : null,
        };

        try {
            await axiosCustomerInstance.post('/orders/create', orderPayload);
            toast.success('Order placed successfully! Redirecting to menu...');
            // Clear cart from Redux store here if needed
            setTimeout(() => {
                navigate(`/restaurant/${restaurantEncryptedId}/menu`);
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order.');
            // console.log(error);
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-6 text-white text-center">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                <p className="text-gray-400 mt-2">Add items to your cart to place an order.</p>
                <Button onClick={() => navigate(`/restaurant/${restaurantEncryptedId}/menu`)} className="mt-6">
                    Back to Menu
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 text-white">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold">Confirm Your Order</h1>
                <p className="text-gray-400 mt-1">Review your items and choose your preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Order Options */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Service Type Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="flex items-center text-xl font-semibold mb-4">
                            <SlidersHorizontal size={20} className="mr-3 text-yellow-400" />
                            Service & Payment
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2">Service Type</label>
                                <div className="flex gap-4">
                                    <Button onClick={() => setOrderType('DINE_IN')} variant={orderType === 'DINE_IN' ? 'selected' : 'outline'} className="w-fit">Dine-in</Button>
                                    <Button onClick={() => setOrderType('TAKE_AWAY')} variant={orderType === 'TAKE_AWAY' ? 'selected' : 'outline'} className="w-fit">Take-away</Button>
                                </div>
                            </div>
                            <div>
                                <label className=" text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                                <div className="flex gap-4">
                                    <Button onClick={() => setPaymentMethod('CASH')} disabled={dineInTime == "reserve"} variant={paymentMethod === 'CASH' ? 'selected' : 'outline'} className="w-fit flex items-center gap-2"><Wallet size={16}/>Pay with Cash</Button>
                                    <Button onClick={() => setPaymentMethod('ONLINE')} variant={paymentMethod === 'ONLINE' ? 'selected' : 'outline'} className="w-fit flex items-center gap-2" ><CreditCard size={16}/>Pay Online</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Card */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                            <h3 className="flex items-center text-xl font-semibold mb-4">
                                <CalendarClock size={20} className="mr-3 text-yellow-400" />
                                Schedule
                            </h3>
                            <div className="flex gap-4 mb-4">
                                <Button onClick={() => setDineInTime('now')} variant={dineInTime === 'now' ? 'selected' : 'outline'} className="w-fit">Dine-in Now</Button>
                                <Button onClick={handleReserveClick} variant={dineInTime === 'reserve' ? 'selected' : 'outline'} className="w-fit">Reserve a Table</Button>
                            </div>
                            
                            {dineInTime === 'reserve' && (
                                <div className="p-4 bg-gray-800/50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Reservation Date & Time</label>
                                    <DatePicker
                                        selected={reservationDateTime}
                                        onChange={(date) => setReservationDateTime(date)}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        minDate={new Date()}
                                        timeIntervals={30}
                                        
                                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500"
                                        calendarClassName="react-datepicker-custom"
                                    />
                                </div>
                            )}
                        </div>
                    
                     {/* Remarks Card */}
                     <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="flex items-center text-xl font-semibold mb-4">
                            <MessageSquare size={20} className="mr-3 text-yellow-400" />
                            Special Instructions
                        </h3>
                        <textarea
                            id="remarks"
                            value={customerRemarks}
                            onChange={(e) => setCustomerRemarks(e.target.value)}
                            placeholder="e.g., make it extra spicy, no nuts, table near window..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white h-24 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h2 className="flex items-center text-xl font-semibold mb-4 border-b border-gray-700 pb-3">
                                <ClipboardList size={20} className="mr-3 text-yellow-400" />
                                Order Summary
                            </h2>
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.encryptedId} className="flex justify-between items-center text-sm">
                                        <p className="text-gray-300">{item.name} <span className="text-gray-500">x{item.quantity}</span></p>
                                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <p>Subtotal</p>
                                    <p>₹{totalPrice.toFixed(2)}</p>
                                </div>
                                {isReservation && (
                                     <div className="flex justify-between text-sm text-yellow-400">
                                        <p>Reservation Fee</p>
                                        <p>₹{reservationFee.toFixed(2)}</p>
                                     </div>
                                )}
                            </div>

                            <div className="border-t border-gray-600 mt-4 pt-4">
                                <div className="flex justify-between items-center font-bold text-2xl">
                                    <span>Total to Pay:</span>
                                    <span className="text-yellow-400">₹{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <Button onClick={handlePlaceOrder} size="lg" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold" disabled={isSubmitting}>
                                {isSubmitting ? 'Placing Order...' : (paymentMethod === 'ONLINE' ? `Pay ₹${finalAmount.toFixed(2)} Online` : 'Place Order Now')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;

