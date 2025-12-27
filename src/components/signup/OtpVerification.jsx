import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { axiosSignupInstance } from '../../axios/instances/axiosInstances';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import{ Button } from '../ui/button'
import { resetAllowOtp } from '../../redux/slice/signupOptionSlice';
import toast from 'react-hot-toast';
// Assuming a signup-specific instance

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRef = useRef([]);
  const signupOption = useSelector((state) => state.signupOption.signupOption);
  const otpEmail = useSelector(state => state.signupOption.otpEmail);
  const navigate = useNavigate();


  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 3000);
  }, [error]);

  useEffect(() => {
    inputRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    if(e.key === "Enter" && otp.every((digit) => digit !== "")) {

        handleVerifyOtp();
    }
  }

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];

      }
    }

    setOtp(newOtp);
  }

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const otpString = otp.join('');
    // console.log("OTP Entered: ", otpString);
    // console.log("Email: ", otpEmail);

    try {
      let response = await axiosSignupInstance.post('/restaurant/verify-otp', { email: otpEmail, otp: otpString });
        if (response.data === true) {
          // console.log("OTP Verified Successfully!");
          
        } else {
          console.error("OTP Verification Failed:", response.data);
        }
    

      if (response && response.data === true) { // Check if response data is true
        setIsLoading(false);
        toast.success("OTP Verified Successfully!");
        dispatch(resetAllowOtp()); // Reset OTP state
        navigate("/login");
        setOtp(["", "", "", "", "", ""]);
        inputRef.current[0]?.focus();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setIsLoading(false);
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRef.current[0]?.focus();
    }
  };

  const handleResendOtp =async () => {
    setTimeLeft(60);
    setOtp(["", "", "", "", "", ""]);

    let response = await axiosSignupInstance.post('/restaurant/resend-otp', { email: otpEmail });

    if(response && response.data === true){
      toast.success("OTP Resent Successfully!");
    } else {
      toast.error("Failed to resend OTP. Please try again later.");
    }

    inputRef.current[0]?.focus();

    
  }


  const isComplete = otp.every((digit) => digit !== "")

  return (
    <>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
            filter: "blur(2px) brightness(0.7)",
          }}
        />

        {/* Warm Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

        {/* Floating Lights Effect */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-amber-400/30 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-40 right-40 w-6 h-6 bg-orange-300/20 rounded-full blur-md animate-pulse delay-1000" />
        <div className="absolute bottom-32 right-32 w-3 h-3 bg-yellow-400/25 rounded-full blur-sm animate-pulse delay-2000" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-start pl-8 md:pl-16 lg:pl-24">
          <div className="w-full max-w-md space-y-8">
            {/* Back Button */}
            <button className="flex items-center text-white/70 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-400/30">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Verify Your Account</h1>
                  <p className="text-white/70 text-sm">Security verification required</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white/90 text-lg selection:text-black selection:bg-amber-500">Enter Verification Code</p>
                <p className="text-white/60 text-sm leading-relaxed">
                  We've sent a 6-digit verification code to your registered email address. Please enter the code below to
                  continue.
                </p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div className="flex space-x-3 justify-center md:justify-start">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-semibold bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center md:text-left">
                {timeLeft > 0 ? (
                  <p className="text-white/60 text-sm">
                    Resend code in <span className="text-amber-400 font-medium">{timeLeft}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={!isComplete || isLoading}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:bg-white/10 disabled:text-white/40 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Code"
                )}
              </Button>

              {/* Help Text */}
              <div className="text-center md:text-left space-y-2">
                <p className="text-white/50 text-xs">
                  Didn't receive the code? Check your spam folder or contact support.
                </p>
                <button className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors">
                  Need help? Contact support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Welcome Text (Hidden on Mobile) */}
        <div className="hidden lg:block absolute top-1/2 right-16 transform -translate-y-1/2 text-right">
          <div className="space-y-4">
            <h2 className="text-5xl font-light text-black/90">Welcome To</h2>
            <h3 className="text-6xl font-bold text-black">Restauron</h3>
            <p className="text-black/60 text-lg max-w-md ml-auto leading-relaxed">
              Your security is our priority. Complete verification to access your account safely.
            </p>
          </div>
        </div>
      </div>

    </>
  )
}


export default OtpVerification;