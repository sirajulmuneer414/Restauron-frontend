import { createSlice } from "@reduxjs/toolkit";

const intialState = {
    signupOption: "restaurant", 
    otp:false,
    otpEmail:" "
}


export const signupOptionSlice = createSlice({
    name: "signupOption",
    initialState: intialState,
    reducers: {
        setSignupOption: (state, action) => {
            state.signupOption = action.payload;
        },
        resetSignupOption: (state) => {
            state.signupOption = "restaurant";
        },
        setAllowOtp: (state, action) => {
            state.otp = action.payload;
        },
        resetAllowOtp: (state) => {
            state.otp = false;
        },
        setOtpEmail: (state, action) => {
            state.otpEmail = action.payload;
        },
        resetOtpEmail: (state) => {
            state.otpEmail = " ";
        }
    },
});

export const { setSignupOption, resetSignupOption, setAllowOtp, resetAllowOtp, setOtpEmail, resetOtpEmail} = signupOptionSlice.actions;
export default signupOptionSlice.reducer;