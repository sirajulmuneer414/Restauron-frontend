import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
    name: "",
    role: "",
    email: "",
    userId: ""
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
        }
    }
});

export const {setUserDetails, resetUserDetails} = userSlice.actions;

export default userSlice.reducer;