import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    waitingForApprovalMessage: "",
    adminCode:"",
    customerPageRestaurantId: "",
}

export const specialValuesSlice = createSlice({
    name: "specialValues",
    initialState,
    reducers: {
        setWaitingForApprovalMessage: (state, action) => {
            state.waitingForApprovalMessage = action.payload;
        },
        resetWaitingForApprovalMessage: (state) => {
            state.waitingForApprovalMessage = "";
        },
        setAdminCode: (state, action) => {
            state.adminCode = action.payload;
        },
        resetAdminCode: (state) => {
            state.adminCode = "";
        },
        setCustomerPageRestaurantId: (state, action) => {
            state.customerPageRestaurantId = action.payload;
        },
        resetCustomerPageRestaurantId: (state) => {
            state.customerPageRestaurantId = "";
        },

    },
});

export const { setWaitingForApprovalMessage, resetWaitingForApprovalMessage, setAdminCode, resetAdminCode, setCustomerPageRestaurantId, resetCustomerPageRestaurantId } = specialValuesSlice.actions;
export default specialValuesSlice.reducer;