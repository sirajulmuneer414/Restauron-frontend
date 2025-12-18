import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useCart } from './useCart';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input'; // Assuming you have an Input component
import { Label } from '../../ui/label'; // Assuming you have a Label component
import { Switch } from '../../ui/switch'; // Assuming you have a Switch component
import { ShoppingCart, CircleDot, Utensils, X, Minus, Plus, Trash2, Search } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Your MenuItemModal and CartSidebar components remain the same

const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if(isOpen) setQuantity(1); }, [isOpen]);
  if (!isOpen || !item) return null;
  const adjust = d => setQuantity(q => Math.max(1, q + d));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl m-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name} className="w-full h-full object-cover" />
          <div className="p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <CircleDot size={20} className={item.veg ? "text-green-500" : "text-red-500"} />
              <h2 className="text-3xl font-bold text-white">{item.name}</h2>
            </div>
            <p className="text-gray-400 mb-6 grow">{item.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-3xl font-bold text-yellow-400">₹{item.price.toFixed(2)}</span>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-1">
                <Button onClick={() => adjust(-1)} size="icon" variant="ghost"><Minus size={16} /></Button>
                <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                <Button onClick={() => adjust(1)} size="icon" variant="ghost"><Plus size={16} /></Button>
              </div>
            </div>
            <Button onClick={() => onAddToCart(item, quantity)} size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg">
              Add {quantity} to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ isOpen, onClose, cartItems, totalPrice, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const {encryptedId} = useParams();
  
  
    const handleProceedToOrder = () => {
        navigate(`/restaurant/${encryptedId}/confirm-order`, { state: { cartItems, totalPrice } });
    };

  return (
  <>
    <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Your Order</h2>
          <Button onClick={onClose} size="icon" variant="ghost"><X size={24} /></Button>
        </div>
        {cartItems.length > 0 ? (
          <>
            <div className="grow p-4 space-y-4 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.encryptedId} className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="grow">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-yellow-400 font-bold">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
                    <Button onClick={() => updateQuantity(item.encryptedId, item.quantity - 1)} size="icon" variant="ghost" className="h-7 w-7"><Minus size={14} /></Button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.encryptedId, item.quantity + 1)} size="icon" variant="ghost" className="h-7 w-7"><Plus size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-300">Total</span>
                <span className="text-yellow-400">₹{totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={handleProceedToOrder} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">Proceed to Order</Button>
              <Button onClick={clearCart} variant="outline" size="sm" className="w-full text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300">
                <Trash2 size={16} className="mr-2" /> Clear Cart
              </Button>
            </div>
          </>
        ) : (
          <div className="grow flex flex-col items-center justify-center text-gray-500">
            <ShoppingCart size={48} className="mb-4" />
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm">Add items from the menu to get started.</p>
          </div>
        )}
      </div>
    </div>
  </>
)

};


const CustomerMenuPage = () => {
    const { encryptedId } = useParams();
    const { axiosPublicInstance } = useAxios();
    const { cartItems, addToCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

    const [menuData, setMenuData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // State for search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVegOnly, setFilterVegOnly] = useState(false);
     const { isAuthenticated } = useSelector(state => state.userSlice); // Get auth state from Redux
    const navigate = useNavigate();

    // State for pagination/infinite scroll
    const [visibleCategories, setVisibleCategories] = useState(2); // Initially show 2 categories

    const fetchMenu = useCallback(async () => {
        if (!encryptedId) {
            setError("Restaurant ID is missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await axiosPublicInstance.get(`/menu`);
            setMenuData(response.data);
        } catch (err) {
            setError("Could not load the menu. Please try again later.");
            console.error("Failed to fetch menu:", err);
        } finally {
            setIsLoading(false);
        }
    }, [encryptedId, axiosPublicInstance]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const handleAddToCart = (item, quantity) => {

      if (!isAuthenticated) {
            toast.error('Please log in to add items to your cart.');
            setTimeout(() => {
                navigate(`/public/login/${encryptedId}`);
            }, 2000); // 2-second delay
            return;
        }
        addToCart(item, quantity);
        toast.success(`${quantity} x ${item.name} added!`);
        setSelectedItem(null);
        setIsCartOpen(true);
    };

    // Memoized filtered and paginated data
    const filteredMenuData = useMemo(() => {
        if (!menuData) return null;

        let filteredCategories = menuData.categories.map(category => {
            const filteredItems = category.menuItems.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesVeg = !filterVegOnly || item.veg;
                return matchesSearch && matchesVeg;
            });
            return { ...category, menuItems: filteredItems };
        }).filter(category => category.menuItems.length > 0);

        return { ...menuData, categories: filteredCategories };
    }, [menuData, searchTerm, filterVegOnly]);

    const paginatedCategories = useMemo(() => {
        if (!filteredMenuData) return [];
        return filteredMenuData.categories.slice(0, visibleCategories);
    }, [filteredMenuData, visibleCategories]);


    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight) {
            setVisibleCategories(prev => prev + 1); // Load one more category
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);


    if (isLoading) return <CommonLoadingSpinner />;
    if (error) return <div className="p-10 text-center text-red-400">{error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-6 text-white relative">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold mt-2">Menu for {menuData?.restaurantName}</h1>
            </header>

            {/* Search and Filter Controls */}
            <div className="mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        type="text"
                        placeholder="Search for a dish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full bg-gray-800 border-gray-700 focus:ring-yellow-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="veg-only"
                        checked={filterVegOnly}
                        onCheckedChange={setFilterVegOnly}
                    />
                    <Label htmlFor="veg-only" className="text-green-400 font-semibold">Veg Only</Label>
                </div>
            </div>

            {paginatedCategories.map((category) => (
                <section key={category.name} className="mb-12">
                    <div className="flex items-center gap-3 mb-6 border-l-4 border-yellow-500 pl-4">
                        <Utensils size={24} className="text-yellow-400" />
                        <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
                    </div>
                    {category.menuItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {category.menuItems.map((item) => (
                                <div
                                    key={item.encryptedId}
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-yellow-500/30 transition-colors duration-300 flex flex-col"
                                >
                                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                        alt={item.name} className="w-full h-48 object-cover" />
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CircleDot size={16} className={item.veg ? "text-green-500" : "text-red-500"} />
                                            <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-400 flex-grow">{item.description}</p>
                                        <div className="mt-4">
                                            <span className="text-xl font-bold text-yellow-400">₹{item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white italic">No items in this category match your filter.</p>
                    )}
                </section>
            ))}

            {visibleCategories < (filteredMenuData?.categories.length || 0) && (
                 <div className="text-center text-gray-500 py-8">Loading more...</div>
            )}
            
            {paginatedCategories.length === 0 && !isLoading && (
                 <div className="text-center text-white py-16">
                     <p className="text-lg">No menu items match your search.</p>
                     <Button variant="link" onClick={() => { setSearchTerm(''); setFilterVegOnly(false); }}>Clear filters</Button>
                 </div>
            )}


            {totalItems > 0 && (
                <div className="fixed bottom-6 right-6 z-30">
                    <Button onClick={() => setIsCartOpen(true)} size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-lg rounded-full h-16 w-48 flex items-center justify-center gap-3">
                        <ShoppingCart size={20} />View Cart ({totalItems})
                    </Button>
                </div>
            )}
            <MenuItemModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} totalPrice={totalPrice} updateQuantity={updateQuantity} clearCart={clearCart} />
        </div>
    );
};

export default CustomerMenuPage;

