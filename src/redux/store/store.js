import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session'; // sessionStorage
// Import your existing slices
import signupOption from '../slice/signupOptionSlice';
import isLoadingSlice from '../slice/isLoadingSlice';
import specialPermissionsSlice from '../slice/specialPermissions';
import userSlice from '../slice/userSlice';
import specialValuesSlice from '../slice/specialValues';
import ownerDetailsSlice from '../slice/ownerDetailsSlice';

// Step 1: Combine all your reducers
const rootReducer = combineReducers({
    signupOption: signupOption,
    isLoadingSlice: isLoadingSlice,
    specialPermissions: specialPermissionsSlice,
    userSlice: userSlice,
    specialValues: specialValuesSlice,
    ownerDetailsSlice: ownerDetailsSlice,
});

// Step 2: Configure persistence
const persistConfig = {
    key: 'restauron',
    storage: storageSession, // Use sessionStorage
    whitelist: ['userSlice', 'specialPermissions', 'ownerDetailsSlice'], // only these slices will be persisted
    blacklist: ['isLoadingSlice', 'signupOption', 'specialValues'] // these won't be persisted
};

// Step 3: Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 4: Configure store with persisted reducer
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// Step 5: Create persistor
export const persistor = persistStore(store);

// Export store as default (to maintain compatibility with your existing imports)
export default store;

// Also export as named export for convenience
export { store };

