import { createSlice } from '@reduxjs/toolkit';

// Default / Fallback Theme
const initialState = {
    config: {
        restaurantName: 'Restauron',
        bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        primaryColor: '#f59e0b', // Yellow-500
        secondaryColor: '#000000', // Black
        buttonTextColor: '#000000',
        centerQuote: 'Experience Culinary Excellence',
        topLeftQuote: 'Premium Dining',
        bestFeature: 'Best Ambience',
        locationText: 'Prime Location',
        openingTime: '09:00',
        closingTime: '22:00',
        isOpenManual: true,      // The manual toggle switch value
        useManualOpen: false,    // "Mode": true = Manual, false = Automatic
        isOpenCalculated: false, // Final calculated status (for UI)
    },
    status: 'idle', // idle | loading | succeeded | failed
    error: null
};

// Helper to check time
const checkIsOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

const restaurantConfigSlice = createSlice({
    name: 'restaurantConfig',
    initialState,
    reducers: {
        setRestaurantConfig: (state, action) => {
            const data = action.payload;
            state.config = { ...state.config, ...data };
            
            // Calculate "isOpenCalculated"
            if (data.useManualOpen) {
                state.config.isOpenCalculated = data.isOpenManual;
            } else {
                state.config.isOpenCalculated = checkIsOpen(data.openingTime, data.closingTime);
            }
        },
        resetConfig: (state) => {
            state.config = initialState.config;
            state.status = 'idle';
        }
    }
});

export const { setRestaurantConfig, resetConfig } = restaurantConfigSlice.actions;
export default restaurantConfigSlice.reducer;
