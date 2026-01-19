import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- NEW: Async Thunk for fetching status ---
export const fetchCurrentUserStatus = createAsyncThunk(
    'user/fetchCurrentStatus',
    async (axiosCustomerInstance, { getState, rejectWithValue }) => {
        // We only proceed if there's actually a user in the state
        const { user } = getState().userSlice;
        if (!user?.userId) {
            return rejectWithValue('No user to fetch status for.');
        }

        try {
            const response = await axiosCustomerInstance.get(`/profile/status/${user.userId}`);
            // The backend should return an object like { status: 'ACTIVE' }
            return response.data; 
        } catch (error) {
            console.error("Failed to fetch user status:", error);
            return rejectWithValue(error.response?.data || 'Could not fetch status');
        }
    }
);


// --- Your Existing Slice ---
const initialState = {
    user: {
        name: "",
        role: "",
        email: "",
        userId: "",
        specialId: "",
        status: "ACTIVE",
        restaurantName: "",
        restaurantAccessLevel: ""
    },
    isAuthenticated: false,
    // Add a status for the fetch operation
    statusFetchState: 'idle' 
};

export const userSlice = createSlice({
    name: "user", // The name of the slice
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            state.user.name = action.payload.name;
            state.user.role = action.payload.role;
            state.user.email = action.payload.email;
            state.user.userId = action.payload.userId;
            state.user.status = action.payload.status; // Initial status from login
            state.user.restaurantAccessLevel = action.payload.restaurantAccessLevel;
            state.user.restaurantName = action.payload.restaurantName;
            state.isAuthenticated = true;
        },
        resetUserDetails: (state) => {
            state.user = initialState.user;
            state.isAuthenticated = false;
            state.statusFetchState = 'idle';
        },
        setSpecialId: (state, action) => {
            state.user.specialId = action.payload.specialId;
        },
        resetSpecialId: (state) => {
            state.user.specialId = initialState.user.specialId;
        }
    },
    // --- NEW: Extra Reducers to handle the async thunk ---
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUserStatus.pending, (state) => {
                state.statusFetchState = 'loading';
            })
            .addCase(fetchCurrentUserStatus.fulfilled, (state, action) => {
                state.statusFetchState = 'succeeded';
                // Update only the status field on the existing user object
                if (state.user) {
                    state.user.status = action.payload.status;
                }
            })
            .addCase(fetchCurrentUserStatus.rejected, (state, action) => {
                state.statusFetchState = 'failed';
                // You might want to log the error, but we don't need to change the user state
                console.error('Status fetch failed:', action.payload);
            });
    }
});

export const { setUserDetails, resetUserDetails, setSpecialId, resetSpecialId } = userSlice.actions;

// Don't forget to export the default reducer
export default userSlice.reducer;