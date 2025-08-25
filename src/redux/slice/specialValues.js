import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    waitingForApprovalMessage: "",
    adminCode:""
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
        }
    },
});

export const { setWaitingForApprovalMessage, resetWaitingForApprovalMessage, setAdminCode, resetAdminCode} = specialValuesSlice.actions;
export default specialValuesSlice.reducer;