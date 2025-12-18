import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAllowOtp, setSignupOption, setOtpEmail } from "../../redux/slice/signupOptionSlice";
import { useAxios } from "../../axios/instances/axiosInstances";
import { Button } from "../ui/button";

const FOOD_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80";

function RestaurantSignup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { axiosSignupInstance } = useAxios();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    restaurantName: "",
    yourName: "",
    yourEmail: "",
    restaurantEmail: "",
    restaurantPhone: "",
    yourPhone: "",
    password: "",
    confirmPassword: "",
    aadhaarNumber: "",
    aadhaarImage: null,
    restaurantAddress: "",
    district: "",
    state: "",
    pincode: ""
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Debounce utility
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced email validation
  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email) {
        setErrors((prev) => ({ ...prev, yourEmail: "Your Email is required" }));
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setErrors((prev) => ({ ...prev, yourEmail: "Invalid email format" }));
        return;
      }
      try {
        const response = await axiosSignupInstance.post("/check-email", { email, option: "restaurant" });
        if (response.data) {
          setErrors((prev) => ({ ...prev, yourEmail: "Email already exists" }));
        } else {
          setErrors((prev) => ({ ...prev, yourEmail: "" }));
        }
      } catch (error) {
        setErrors((prev) => ({ ...prev, yourEmail: "Error verifying email" }));
      }
    }, 500),
    []
  );

  // Change handlers
  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "yourEmail") {
      validateEmail(value);
    }

    if (name === "password" || name === "confirmPassword") {
      if (name === "password" && value && (value.length < 8 || value.length > 20)) {
        setErrors((prev) => ({ ...prev, password: "Password must be between 8 and 20 characters" }));
      }
      if (name === "password" && value && !/[0-9]/.test(value)) {
        setErrors((prev) => ({ ...prev, password: "Password must contain at least one number" }));
      }
      if (name === "password" && value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setErrors((prev) => ({ ...prev, password: "Password must contain at least one special character" }));
      }
      if (
        name === "confirmPassword" &&
        value &&
        value !== formData.password
      ) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, aadhaarImage: file }));
    setErrors((prev) => ({ ...prev, aadhaarImage: "" }));
  };

  const handleOptionSelect = (option) => {
    dispatch(setSignupOption(option));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.restaurantName.trim()) newErrors.restaurantName = "Restaurant Name is required";
    if (!formData.yourName.trim()) newErrors.yourName = "Your Name is required";
    if (!formData.yourEmail.trim()) newErrors.yourEmail = "Your Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.yourEmail)) newErrors.yourEmail = "Invalid email format";
    if (formData.restaurantEmail && !/\S+@\S+\.\S+/.test(formData.restaurantEmail)) newErrors.restaurantEmail = "Invalid email format";

    if (!formData.restaurantPhone.trim()) newErrors.restaurantPhone = "Restaurant Phone Number is required";
    else if (!/^\d{10}$/.test(formData.restaurantPhone)) newErrors.restaurantPhone = "Phone number must be 10 digits";
    if (formData.yourPhone && !/^\d{10}$/.test(formData.yourPhone)) newErrors.yourPhone = "Phone number must be 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8 || formData.password.length > 20) newErrors.password = "Password must be between 8 and 20 characters";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one number";
    else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(formData.password)) newErrors.password = "Password must contain at least one special character";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = "Aadhaar Number is required";
    else if (!/^\d{12}$/.test(formData.aadhaarNumber)) newErrors.aadhaarNumber = "Aadhaar Number must be 12 digits";

    if (!formData.aadhaarImage) newErrors.aadhaarImage = "Aadhaar Image is required";
    else {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(formData.aadhaarImage.type)) newErrors.aadhaarImage = "File must be JPG, JPEG, or PNG";
      else if (formData.aadhaarImage.size > maxSize) newErrors.aadhaarImage = "File size must be less than 5MB";
    }

    if (!formData.restaurantAddress.trim()) newErrors.restaurantAddress = "Restaurant Address is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {

      
    const form = new FormData();

    form.append("name", formData.yourName);
    form.append("email", formData.yourEmail);
    form.append("password", formData.password);
    form.append("aadhaarNumber", formData.aadhaarNumber);
    form.append("restaurantName", formData.restaurantName);
    form.append("restaurantAddress", formData.restaurantAddress);
    form.append("restaurantPhone", formData.restaurantPhone);
    form.append("district", formData.district);
    form.append("state", formData.state);
    form.append("pincode", formData.pincode);

    // Optional/nullable fields (ensure you don't append undefined)
    if(formData.restaurantEmail) form.append("restaurantEmail", formData.restaurantEmail);
    if (formData.yourPhone) form.append("phone", formData.yourPhone);

    // File field
    if (formData.aadhaarImage) {
      form.append("aadhaarPhoto", formData.aadhaarImage);
    }

      console.log("Submitting form data:", formData);

      for (let pair of form.entries()) {
  console.log(pair[0], pair[1]);
}


      const response = await axiosSignupInstance.post("/restaurant", form);
      if (response.status === 201) {
        await dispatch(setOtpEmail(formData.yourEmail));
        setFormData({
          restaurantName: "",
          yourName: "",
          yourEmail: "",
          restaurantEmail: "",
          restaurantPhone: "",
          yourPhone: "",
          password: "",
          confirmPassword: "",
          aadhaarNumber: "",
          aadhaarImage: null,
          restaurantAddress: "",
          district: "",
          state: "",
          pincode: ""
        });
        await dispatch(setAllowOtp(true));
        navigate("/otpVerification");
      } else {
        setErrors({ general: response.data.message || "Failed to register restaurant" });
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-screen m-0 p-0 bg-cover" style={{ backgroundImage: `url(${FOOD_IMAGE})` }}>
      <div className="bg-black/70 overflow-scroll p-8 min-h-screen hide-scrollbar">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl text-white font-bold text-center mt-4">Restaurant Registration</h1>
          {errors.general && <p className="text-red-500 text-center mt-4">{errors.general}</p>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Render all fields below */}
            {[
              { label: "Restaurant Name", name: "restaurantName", type: "text" },
              { label: "Your Name", name: "yourName", type: "text" },
              { label: "Your Email", name: "yourEmail", type: "email" },
              { label: "Restaurant Email (Optional)", name: "restaurantEmail", type: "email" },
              { label: "Restaurant Phone Number", name: "restaurantPhone", type: "tel" },
              { label: "Your Phone Number (Optional)", name: "yourPhone", type: "tel" },
              { label: "Password", name: "password", type: showPassword ? "text" : "password" },
              { label: "Confirm Password", name: "confirmPassword", type: showConfirmPassword ? "text" : "password" },
              { label: "Aadhaar Number", name: "aadhaarNumber", type: "text" },
              { label: "Restaurant Address", name: "restaurantAddress", type: "textarea" },
              { label: "District", name: "district", type: "text" },
              { label: "State", name: "state", type: "text" },
              { label: "Pincode", name: "pincode", type: "text" }
            ].map((field) => (
              <div className="flex flex-col gap-2" key={field.name}>
                <label className="text-white">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleinputChange}
                    placeholder={field.label}
                    className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleinputChange}
                    placeholder={field.label}
                    className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                )}
                {(field.name === "password") && (
                  <Button type="button" variant="ghost" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent" onClick={() => setShowPassword((show) => !show)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                )}
                {(field.name === "confirmPassword") && (
                  <Button type="button" variant="ghost" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent" onClick={() => setShowConfirmPassword((show) => !show)}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                )}
                {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label className="text-white">Aadhaar Image</label>
              <input type="file" name="aadhaarImage" accept=".jpg,.jpeg,.png"
                className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                onChange={handleFileChange}
              />
              {errors.aadhaarImage && <p className="text-red-500 text-sm">{errors.aadhaarImage}</p>}
            </div>

            <div className="flex items-center justify-between w-full mt-6">
              <Button type="submit" disabled={isLoading} className="bg-transparent border border-white text-white p-2 rounded hover:border-amber-500 hover:bg-amber-500 hover:text-black transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <div className="text-center">
                <h4 className="text-white">
                  Already Registered?{" "}
                  <Link to="/login" className="text-black bg-amber-500 px-4 py-1 rounded hover:bg-white transition duration-300">Login</Link>
                </h4>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-col-1 justify-center items-around" style={{ backgroundImage: `url(${FOOD_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="flex flex-col mb-20 mt-4 md:mb-auto md:mt-auto items-center justify-center text-center">
          <p className="text-white text-4xl">Welcome To</p>
          <h1 className="text-white text-5xl">Restauron</h1>
        </div>
        <div>
          <div className="flex w-full max-w-lg mb-6 md:mb-auto">
            <button onClick={() => handleOptionSelect("restaurant")}
              className="flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-md font-medium text-lg border-white bg-white text-black">
              restaurant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantSignup;

