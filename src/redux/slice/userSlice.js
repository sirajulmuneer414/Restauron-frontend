import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
    name: "",
    role: "",
    email: "",
    userId: "",
    specialId: ""
    }
}


export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            state.user.name = action.payload.name;
            state.user.role = action.payload.role;
            state.user.email = action.payload.email;
            state.user.userId = action.payload.userId;
        },
        resetUserDetails: (state) => {
            state.user = initialState.user;
        },
        setSpecialId: (state, action) => {
            state.user.specialId = action.payload.specialId;
        },
        resetSpecialId: (state) => {
            state.user.specialId = initialState.user.specialId;
        }

    }
});

export const {setUserDetails, resetUserDetails, setSpecialId, resetSpecialId} = userSlice.actions;

export default userSlice.reducer;