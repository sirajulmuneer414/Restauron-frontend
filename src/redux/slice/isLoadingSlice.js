import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    isLoading: false,

};

export const isLoadingSlice = createSlice({
    name: "isLoading",
    initialState,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        resetIsLoading: (state) => {
            state.isLoading = false;
        },
    },
})


export const { setIsLoading, resetIsLoading } = isLoadingSlice.actions;
export default isLoadingSlice.reducer;