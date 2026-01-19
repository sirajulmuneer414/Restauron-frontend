import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Upload, Clock, MapPin, Type, Palette, Layout, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { setRestaurantConfig } from '../../../redux/slice/restaurantConfigSlice';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';

const RestaurantSettings = () => {
    // 1. Add 'watch' to destructured props
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            primaryColor: '#f59e0b',
            secondaryColor: '#000000',
            buttonTextColor: '#000000',
            useManualOpen: false,
            isOpenManual: "false"
        }
    });

    const dispatch = useDispatch();
    const { axiosOwnerInstance } = useAxios();
    
    const [bannerPreview, setBannerPreview] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const user = useSelector((state) => state.userSlice.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

    // 2. Watch specific fields for real-time UI updates
    const useManualOpen = watch('useManualOpen');
    
    // Watch colors to force re-render of inputs
    const primaryColor = watch('primaryColor');
    const secondaryColor = watch('secondaryColor');
    const buttonTextColor = watch('buttonTextColor');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axiosOwnerInstance.get('/restaurant/config');
                const data = response.data;
                
                // Populate form
                Object.keys(data).forEach(key => setValue(key, data[key]));
                
                if (data.bannerUrl) setBannerPreview(data.bannerUrl);
                dispatch(setRestaurantConfig(data));
            } catch (error) {
                console.error("Fetch Config Error:", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchConfig();
    }, [axiosOwnerInstance, setValue, dispatch]);

    const handleImageChange = (e) => {

        if (isReadOnly) {
            toast.error("Cannot change banner image in Read-Only mode.");
            return;
        }
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleResetColors = (e) => {
        e.preventDefault(); // Prevent form submit
        setValue('primaryColor', '#f59e0b');
        setValue('secondaryColor', '#000000');
        setValue('buttonTextColor', '#000000');
        toast.success("Colors reset to default");
    };

    const onSubmit = async (data) => {
        if (isReadOnly) {
            toast.error("Cannot update settings in Read-Only mode.");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            if (bannerFile) formData.append('bannerImage', bannerFile);

            const response = await axiosOwnerInstance.put('/restaurant/config', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(setRestaurantConfig(response.data));
            toast.success("Branding updated successfully!");
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <CommonLoadingSpinner />;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 text-white min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        Restaurant Branding & Config
                    </h1>
                    <p className="text-gray-400">Customize how your customers see your restaurant.</p>
                </div>
                <button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visuals Column */}
                <div className="space-y-6">
                    {/* Banner Image Section (Unchanged) */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                            <Layout size={20} /> Banner Image
                        </h3>
                        <div className="relative h-48 w-full bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-yellow-500 transition-colors group">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <Upload size={32} />
                                    <span className="mt-2 text-sm">Click to upload banner</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* --- COLOR SECTION WITH RESET BUTTON --- */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-yellow-400">
                                <Palette size={20} /> Color Theme
                            </h3>
                            {/* RESET BUTTON */}
                            <button
                                onClick={handleResetColors}
                                className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full border border-gray-700"
                                title="Reset to default colors"
                            >
                                <RotateCcw size={12} /> Reset Colors
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            
                            {/* Primary Color */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        {...register("primaryColor")} 
                                        className="h-10 w-10 rounded cursor-pointer bg-transparent border-none p-0" 
                                    />
                                    <input 
                                        type="text" 
                                        {...register("primaryColor")} 
                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-full uppercase"
                                        maxLength={7}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Buttons, Highlights</p>
                            </div>

                            {/* Secondary Color */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Secondary Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        {...register("secondaryColor")} 
                                        className="h-10 w-10 rounded cursor-pointer bg-transparent border-none p-0" 
                                    />
                                    <input 
                                        type="text" 
                                        {...register("secondaryColor")} 
                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-full uppercase"
                                        maxLength={7}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Sidebar, Backgrounds</p>
                            </div>

                            {/* Button Text Color */}
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Button Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        {...register("buttonTextColor")} 
                                        className="h-10 w-10 rounded cursor-pointer bg-transparent border-none p-0" 
                                    />
                                    <input 
                                        type="text" 
                                        {...register("buttonTextColor")} 
                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-full uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text / Quotes Section (Unchanged) */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                            <Type size={20} /> Text & Quotes
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Center Quote (Hero Section)</label>
                                <input {...register("centerQuote")} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Top Left Quote (Header)</label>
                                <input {...register("topLeftQuote")} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Best Feature Highlight</label>
                                <input {...register("bestFeature")} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations Column */}
                <div className="space-y-6">
                    {/* Operations Settings */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                            <Clock size={20} /> Operations & Time
                        </h3>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg mb-4 flex items-center justify-between">
                            <div>
                                <span className="font-bold block text-white">Manual Open/Close Mode</span>
                                <span className="text-xs text-gray-400">Ignore time and set status manually</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" {...register("useManualOpen")} />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            </label>
                        </div>

                        {useManualOpen ? (
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 animate-fade-in">
                                <label className="block text-sm text-gray-400 mb-2">Current Status (Manual)</label>
                                <select {...register("isOpenManual")} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                                    <option value="true">Open Now</option>
                                    <option value="false">Closed</option>
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Opening Time</label>
                                    <input type="time" {...register("openingTime")} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Closing Time</label>
                                    <input type="time" {...register("closingTime")} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Info */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                            <MapPin size={20} /> Location Info
                        </h3>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Location Text / Address</label>
                            <textarea {...register("locationText")} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RestaurantSettings;

