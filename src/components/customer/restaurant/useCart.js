import { useState } from 'react';

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item, quantity) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem => cartItem.encryptedId === item.encryptedId);

            if (existingItem) {
                // If item exists, update its quantity
                return prevItems.map(cartItem =>
                    cartItem.encryptedId === item.encryptedId
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                // If item is new, add it to the cart
                return [...prevItems, { ...item, quantity }];
            }
        });
    };

    const updateQuantity = (itemEncryptedId, newQuantity) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                return prevItems.filter(item => item.encryptedId !== itemEncryptedId);
            }
            return prevItems.map(item =>
                item.encryptedId === itemEncryptedId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
        cartItems,
        addToCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };
};
