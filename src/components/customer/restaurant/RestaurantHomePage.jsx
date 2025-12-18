import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import Cookie from 'js-cookie';
import { Button } from '../../ui/button';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { LogIn, User as UserIcon, Menu, Phone, ShieldAlert, MapPin, Clock, Star, ChevronRight, Utensils } from 'lucide-react';
import { setOwnerDetails } from '../../../redux/slice/ownerDetailsSlice';
import { fetchCurrentUserStatus } from '../../../redux/slice/userSlice';
import { setCustomerPageRestaurantId } from '../../../redux/slice/specialValues';
import { setRestaurantConfig } from '../../../redux/slice/restaurantConfigSlice';
import BlockedCustomerScreen from '../BlockedCustomerScreen';

const RestaurantHomePage = () => {
    const { encryptedId } = useParams();
    const customerPageRestaurantId = useSelector(state => state.specialValues.customerPageRestaurantId);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated, statusFetchState } = useSelector(state => state.userSlice);
    const { config } = useSelector(state => state.restaurantConfig);
    const { axiosPublicInstance, axiosCustomerInstance } = useAxios();
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isCustomerBlocked = isAuthenticated && user?.role === 'CUSTOMER' && user?.status === 'NONACTIVE';
    const primaryColor = config?.primaryColor || '#f59e0b';
    const secondaryColor = config?.secondaryColor || '#000000';
    const btnTextColor = config?.buttonTextColor || '#000000';

    const loadPageData = useCallback(async () => {
        if (!encryptedId && !customerPageRestaurantId) { setError("No restaurant specified."); return; }
        setIsLoading(true);
        try {
            if (encryptedId === "undefined") navigate(`/restaurant/${customerPageRestaurantId}/home`);
            const response = await axiosPublicInstance.get(`/restaurant/details/${encryptedId}`);
            dispatch(setOwnerDetails({ restaurantEncryptedId: response.data.encryptedId, restaurantName: response.data.name }));
            await Cookie.set('restaurantId', response.data.encryptedId);

            try {
                const configResponse = await axiosPublicInstance.get(`/restaurant/config/${encryptedId}`);
                dispatch(setRestaurantConfig(configResponse.data));
            } catch (cfgErr) { console.warn("Using defaults.", cfgErr); }

            if (isAuthenticated && user?.role === 'CUSTOMER') dispatch(fetchCurrentUserStatus(axiosCustomerInstance));
        } catch (err) { setError("Sorry, this restaurant could not be found."); } 
        finally { setIsLoading(false); }
    }, [encryptedId, dispatch, axiosPublicInstance]);

    useEffect(() => { loadPageData(); dispatch(setCustomerPageRestaurantId(encryptedId)); }, [loadPageData]);

    if (isLoading || statusFetchState === 'loading') return <CommonLoadingSpinner />;
    if (isCustomerBlocked) return <BlockedCustomerScreen />;
    if (error) return <div className="text-white text-center p-10">{error}</div>;

    const actionCards = [
        { id: 'menu', icon: Menu, title: 'View Menu', description: 'Explore our delicious offerings', action: () => navigate(`/restaurant/${encryptedId}/menu`), gradient: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-400' },
        { id: 'contact', icon: Phone, title: 'Contact Us', description: 'Get in touch for reservations', action: () => navigate(`/restaurant/${encryptedId}/contact`), gradient: 'from-blue-500/20 to-purple-500/20', iconColor: 'text-blue-400' },
        { id: 'account', icon: UserIcon, title: isAuthenticated ? "My Account" : "Join Us", description: isAuthenticated ? "View profile" : "Sign up now", action: () => isAuthenticated ? navigate('/customer/profile') : navigate(`/public/login/${encryptedId}`), gradient: 'from-yellow-500/20 to-amber-500/20', iconColor: 'text-yellow-400', featured: true }
    ];

    return (
        <div 
            className="min-h-screen text-white"
            style={{ background: `linear-gradient(135deg, #111827, #000000, ${secondaryColor})` }}
        >
            {/* Header */}
            <header 
                className="backdrop-blur-md border-b border-gray-800/50 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-lg transition-colors duration-300"
                style={{ backgroundColor: `${secondaryColor}E6` }} // 90% Opacity hex
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold">
                            {user?.role === 'CUSTOMER' ? <>Welcome back, <span style={{ color: primaryColor }}>{user.name}</span>!</> : <>Welcome to <span style={{ color: primaryColor }}>{config?.restaurantName}</span></>}
                        </h1>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <Utensils size={14} /> {config?.centerQuote || 'Experience culinary excellence'}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate(isAuthenticated ? '/customer/profile' : `/public/login/${encryptedId}`)}
                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
                        className="font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90"
                    >
                        {isAuthenticated ? <UserIcon size={18} /> : <LogIn size={18} />}
                        <span className="hidden sm:inline">{isAuthenticated ? user.name : 'Sign In'}</span>
                    </Button>
                </div>
            </header>
      
            {/* Hero Section */}
            <section className="relative h-[60vh] sm:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
                <img src={config?.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} alt="Ambiance" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0 z-20 flex items-center justify-start p-6 sm:p-12">
                    <div className="text-left max-w-2xl space-y-6 animate-fade-in-up">
                        <div className="space-y-2">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight">
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #ffffff)` }}>
                                    {config?.restaurantName}
                                </span>
                            </h1>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="flex items-center gap-1"><Star style={{ color: primaryColor, fill: primaryColor }} size={16} /><span className="text-sm">{config?.bestFeature || 'Premium Dining'}</span></div>
                                <div className="flex items-center gap-1"><Clock size={16} /><span className="text-sm font-bold" style={{ color: config?.isOpenCalculated ? '#4ade80' : '#f87171' }}>{config?.isOpenCalculated ? 'Open Now' : 'Closed'}</span></div>
                            </div>
                        </div>
                        <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-lg">{config?.topLeftQuote || "Discover an extraordinary culinary journey."}</p>
                    </div>
                </div>
            </section>
      
            {/* Action Cards */}
            <section className="px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 space-y-4 animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl font-bold">What would you like to <span style={{ color: primaryColor }}>explore</span>?</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Choose from our carefully curated options</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {actionCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.id} onClick={card.action} className={`group relative bg-gradient-to-br ${card.gradient} border border-gray-800/50 rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s`, ...(card.featured ? { boxShadow: `0 0 0 2px ${primaryColor}4D` } : {}) }}>
                                    {card.featured && <div className="absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: primaryColor, color: btnTextColor }}>RECOMMENDED</div>}
                                    <div className="flex items-start justify-between mb-4"><Icon size={40} className={`${card.iconColor} group-hover:scale-110`} /><ChevronRight size={24} className="text-gray-600 group-hover:translate-x-1" /></div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-yellow-300">{card.title}</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300">{card.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Info Banner */}
            <section className="px-4 sm:px-6 py-8 border-t border-gray-800/50">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400">
                        <div className="flex items-center gap-2"><MapPin size={16} style={{ color: primaryColor }} /><span className="text-sm">{config?.locationText || 'Prime Location'}</span></div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2"><Clock size={16} style={{ color: primaryColor }} /><span className="text-sm">{config?.openingTime ? `${config.openingTime} - ${config.closingTime}` : '11:00 AM - 10:00 PM'}</span></div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2"><Phone size={16} style={{ color: primaryColor }} /><span className="text-sm">Quick Service</span></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default RestaurantHomePage;

