import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    restaurantEncryptedId: "",
    restaurantName: "",
}

export const ownerDetailsSlice = createSlice({
    name : "ownerDetails",
    initialState,
    reducers: {
        setOwnerDetails: (state, action) => { 
            state.restaurantEncryptedId = action.payload.restaurantEncryptedId;
            state.restaurantName = action.payload.restaurantName;
        },
        resetOwnerDetails: (state) => {
            state.restaurantEncryptedId = initialState.restaurantEncryptedId;
            state.restaurantName = initialState.restaurantName;
        }
    }
})


export const {setOwnerDetails, resetOwnerDetails} = ownerDetailsSlice.actions;
export default ownerDetailsSlice.reducer;