 import { createSlice } from "@reduxjs/toolkit";

 const intialState = {
        adminPageAccess: false,
 }

    export const specialPermissionsSlice = createSlice({
        name: "specialPermissions",
        initialState: intialState,
        reducers: {
            setAdminPageAccess: (state, action) => {
                state.adminPageAccess = action.payload;
            },
            resetAdminPageAccess: (state) => {
                state.adminPageAccess = false;
            },
        },
    });

export const { setAdminPageAccess, resetAdminPageAccess } = specialPermissionsSlice.actions;
export default specialPermissionsSlice.reducer;