import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosPublicInstance } from '../../../axios/instances/axiosInstances';
import Cookie from 'js-cookie';
// UI Components and Icons
import { Button } from '../../ui/button';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { LogIn, User as UserIcon, Menu, Phone, ShieldAlert } from 'lucide-react';
import { setOwnerDetails } from '../../../redux/slice/ownerDetailsSlice';

const RestaurantHomePage = () => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user data from the Redux store
  const user = useSelector(state => state.userSlice.user);
  
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if the user is a logged-in customer
  const isCustomerLoggedIn = user && user.role === 'CUSTOMER';
  
  // Data Fetching Effect
  useEffect(() => {
    if (!encryptedId) {
      setError("No restaurant specified.");
      setIsLoading(false);
      return;
    }
    
    const fetchRestaurantData = async () => {
      try {
        const response = await axiosPublicInstance.get(`/restaurant/details/${encryptedId}`);
        Cookie.set('restaurantId', encryptedId);
        setRestaurantData(response.data);
        
        // ✅ Use response.data.name instead of restaurantData.name
        console.log("Fetched restaurant data:", response.data);
        console.log("Restaurant name:", response.data.name);
        
        // ✅ Dispatch with the fetched data, not the state
        dispatch(
          setOwnerDetails({
            restaurantEncryptedId: encryptedId,
            restaurantName: response.data.name,
            // Remove RestaurantApprovalRequests if it's not defined
          })
        );
      } catch (err) {
        setError("Sorry, this restaurant could not be found.");
        console.error("Fetch restaurant error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [encryptedId, dispatch]); // Added dispatch to dependencies
  
  // Render Logic for loading and error states
  if (isLoading) {
    return <CommonLoadingSpinner />;
  }
  
  if (error || !restaurantData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white p-4">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
        <p className="text-gray-400">{error || "Could not load restaurant data."}</p>
      </div>
    );
  }
  
  return (
    <>
      <header className="bg-black/50 border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isCustomerLoggedIn ? `Welcome back, ${user.name}!` : `Welcome to ${restaurantData.name}`}
          </h1>
          <p className="text-gray-400 text-sm">Our digital storefront</p>
        </div>
        {isCustomerLoggedIn ? (
          <Button
            onClick={() => navigate('/customer/profile')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <UserIcon size={18} />
            {user.name} {/* Changed from user.email to user.name for consistency */}
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/public/login/${encryptedId}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
        )}
      </header>
      
      <div className="p-0">
        <section className="relative h-96 overflow-hidden">
          <img
            src={restaurantData.profileLogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}
            alt={`${restaurantData.name} view`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-yellow-400">{restaurantData.name}</span>
              </h1>
            </div>
          </div>
        </section>
        
        <section className="p-6">
          <h2 className="text-3xl font-bold text-center text-white mb-8">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div onClick={() => navigate(`/restaurant/${encryptedId}/menu`)} className="bg-black/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-black/70 transition-all cursor-pointer">
              <Menu size={32} className="text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">View Menu</h3>
              <p className="text-gray-400">Explore our delicious offerings</p>
            </div>
            <div onClick={() => navigate(`/restaurant/${encryptedId}/contact`)} className="bg-black/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-black/70 transition-all cursor-pointer">
              <Phone size={32} className="text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
              <p className="text-gray-400">Get in touch for reservations</p>
            </div>
            <div 
              onClick={() => isCustomerLoggedIn ? navigate('/customer/profile') : navigate(`/public/login/${encryptedId}`)} 
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 hover:bg-yellow-500/20 transition-all cursor-pointer"
            >
              <UserIcon size={32} className="text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-yellow-300 mb-2">
                {isCustomerLoggedIn ? "My Account" : "Login/Register"}
              </h3>
              <p className="text-yellow-200/80">
                {isCustomerLoggedIn ? "View your profile and orders" : "Join us for exclusive offers"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default RestaurantHomePage;

