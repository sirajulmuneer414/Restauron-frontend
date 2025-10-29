import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import Cookie from 'js-cookie';
// UI Components
import { Button } from '../../ui/button';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { 
  LogIn, User as UserIcon, Menu, Phone, ShieldAlert, 
  MapPin, Clock, Star, ChevronRight, Utensils
} from 'lucide-react';
// Redux Actions
import { setOwnerDetails } from '../../../redux/slice/ownerDetailsSlice';
import { fetchCurrentUserStatus } from '../../../redux/slice/userSlice'; // Import the new thunk
// Components
import BlockedCustomerScreen from '../BlockedCustomerScreen';

const RestaurantHomePage = () => {
    const { encryptedId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isAuthenticated, statusFetchState } = useSelector(state => state.userSlice);
    const { axiosPublicInstance, axiosCustomerInstance } = useAxios();
    
    const [restaurantData, setRestaurantData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // This will now reactively update when the thunk successfully updates the state
    const isCustomerBlocked = isAuthenticated && user?.role === 'CUSTOMER' && user?.status === 'NONACTIVE';

    const loadPageData = useCallback(async () => {
        if (!encryptedId) {
            setError("No restaurant specified.");
            return;
        }

        setIsLoading(true);
        try {
            // Fetch public data for the restaurant
            const response = await axiosPublicInstance.get(`/restaurant/details/${encryptedId}`);
            setRestaurantData(response.data);
            dispatch(setOwnerDetails({
                restaurantEncryptedId: response.data.encryptedId,
                restaurantName: response.data.name,
            }));
            await Cookie.set('restaurantId', response.data.encryptedId);

            // If a customer is logged in, fetch their up-to-date status for this restaurant
            if (isAuthenticated && user?.role === 'CUSTOMER') {
                dispatch(fetchCurrentUserStatus(axiosCustomerInstance));
            }
        } catch (err) {
            setError("Sorry, this restaurant could not be found.");
            console.error("Fetch restaurant error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [encryptedId, dispatch, axiosPublicInstance, axiosCustomerInstance, isAuthenticated, user?.role]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);

    // Show a loading spinner during initial page load OR while fetching user status
    if (isLoading || statusFetchState === 'loading') {
        return <CommonLoadingSpinner />;
    }

    // If the fresh status confirms the user is blocked, render the blocked screen
    if (isCustomerBlocked) {
        return <BlockedCustomerScreen />;
    } 
    // Show error page if fetching failed
    if (error || !restaurantData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-4">
                <div className="text-center space-y-4 animate-fade-in">
                    <ShieldAlert size={64} className="text-red-500 mx-auto animate-bounce" />
                    <h2 className="text-3xl font-bold">Restaurant Not Found</h2>
                    <p className="text-gray-400 max-w-md">{error || "Could not load restaurant data."}</p>
                    <Button 
                        onClick={() => navigate('/')} 
                        className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }
  
    const actionCards = [
        {
            id: 'menu',
            icon: Menu,
            title: 'View Menu',
            description: 'Explore our delicious offerings and specialties',
            action: () => navigate(`/restaurant/${encryptedId}/menu`),
            gradient: 'from-orange-500/20 to-red-500/20',
            hoverGradient: 'hover:from-orange-500/30 hover:to-red-500/30',
            iconColor: 'text-orange-400'
        },
        {
            id: 'contact',
            icon: Phone,
            title: 'Contact Us',
            description: 'Get in touch for reservations and inquiries',
            action: () => navigate(`/restaurant/${encryptedId}/contact`),
            gradient: 'from-blue-500/20 to-purple-500/20',
            hoverGradient: 'hover:from-blue-500/30 hover:to-purple-500/30',
            iconColor: 'text-blue-400'
        },
        {
            id: 'account',
            icon: UserIcon,
            title: isAuthenticated ? "My Account" : "Join Us",
            description: isAuthenticated ? "View your profile and order history" : "Sign up for exclusive offers and faster ordering",
            action: () => isAuthenticated ? navigate('/customer/profile') : navigate(`/public/login/${encryptedId}`),
            gradient: 'from-yellow-500/20 to-amber-500/20',
            hoverGradient: 'hover:from-yellow-500/30 hover:to-amber-500/30',
            iconColor: 'text-yellow-400',
            featured: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
            {/* Enhanced Header */}
            <header className="bg-black/80 backdrop-blur-md border-b border-gray-800/50 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            {user?.role === 'CUSTOMER' ? (
                                <>Welcome back, <span className="text-yellow-400">{user.name}</span>!</>
                            ) : (
                                <>Welcome to <span className="text-yellow-400">{restaurantData.name}</span></>
                            )}
                        </h1>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <Utensils size={14} />
                            Experience culinary excellence
                        </p>
                    </div>
          
                    {user?.role === 'CUSTOMER' ? (
                        <Button
                            onClick={() => navigate('/customer/profile')}
                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <UserIcon size={18} />
                            <span className="hidden sm:inline">{user.name}</span>
                            <span className="sm:hidden">Profile</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate(`/public/login/${encryptedId}`)}
                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <LogIn size={18} />
                            Sign In
                        </Button>
                    )}
                </div>
            </header>
      
            {/* Enhanced Hero Section */}
            <section className="relative h-[60vh] sm:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
                <img
                    src={restaurantData.profileLogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}
                    alt={`${restaurantData.name} ambiance`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                <div className="absolute inset-0 z-20 flex items-center justify-start p-6 sm:p-12">
                    <div className="text-left text-white max-w-2xl space-y-6 animate-fade-in-up">
                        <div className="space-y-2">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                                    {restaurantData.name}
                                </span>
                            </h1>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="flex items-center gap-1">
                                    <Star className="text-yellow-400 fill-current" size={16} />
                                    <span className="text-sm">Premium Dining</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span className="text-sm">Open Now</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-lg">
                            Discover an extraordinary culinary journey with our carefully crafted dishes and exceptional service.
                        </p>
                    </div>
                </div>
            </section>
      
            {/* Enhanced Action Cards Section */}
            <section className="px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 space-y-4 animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            What would you like to <span className="text-yellow-400">explore</span>?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Choose from our carefully curated options to enhance your dining experience
                        </p>
                    </div>
          
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {actionCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.id}
                                    onClick={card.action}
                                    className={`
                                        group relative bg-gradient-to-br ${card.gradient} ${card.hoverGradient}
                                        border border-gray-800/50 rounded-2xl p-6 sm:p-8
                                        transition-all duration-300 cursor-pointer
                                        transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10
                                        ${card.featured ? 'ring-2 ring-yellow-500/30' : ''}
                                        animate-fade-in-up
                                    `}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {card.featured && (
                                        <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                            RECOMMENDED
                                        </div>
                                    )}
                                  
                                    <div className="flex items-start justify-between mb-4">
                                        <Icon size={40} className={`${card.iconColor} group-hover:scale-110 transition-transform duration-200`} />
                                        <ChevronRight size={24} className="text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                  
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                                        {card.description}
                                    </p>
                                  
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Restaurant Info Banner */}
            <section className="px-4 sm:px-6 py-8 border-t border-gray-800/50">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-yellow-400" />
                            <span className="text-sm">Prime Location</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-yellow-400" />
                            <span className="text-sm">Daily: 11:00 AM - 10:00 PM</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-yellow-400" />
                            <span className="text-sm">Quick Service</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default RestaurantHomePage;

