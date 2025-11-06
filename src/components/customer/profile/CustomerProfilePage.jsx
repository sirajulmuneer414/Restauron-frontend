import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { resetUserDetails } from '../../../redux/slice/userSlice';
import toast from 'react-hot-toast';
import { User, Edit, Camera, LogOut, Trash2, Mail, Phone } from 'lucide-react';

const CustomerProfilePage = () => {
    const { axiosCustomerInstance } = useAxios();
    const dispatch = useDispatch();
    const { user: currentUser, isAuthenticated } = useSelector(state => state.userSlice);

    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', profilePictureUrl: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [imageUpload, setImageUpload] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({}); // State for validation errors

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated) return;
            try {
                const response = await axiosCustomerInstance.get('/profile/me');
                setProfileData(response.data);
            } catch (error) {
                toast.error('Could not fetch profile data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [isAuthenticated, axiosCustomerInstance]);

    // --- New, Improved Validation Logic ---
    const validateField = (name, value) => {
        let errorMsg = null;
        if (name === 'phone') {
            const phoneRegex = /^\d{10}$/; // Exactly 10 digits
            if (!phoneRegex.test(value)) {
                errorMsg = 'Phone number must be exactly 10 digits.';
            }
        } else if (name === 'name') {
            if (value.trim().length < 2) {
                errorMsg = 'Name must be at least 2 characters long.';
            }
        }
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return !errorMsg; // Return true if valid, false if invalid
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        // Validate on change to give instant feedback
        validateField(name, value);
    };
    
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageUpload(e.target.files[0]);
        }
    };

  

    const handleSaveChanges = async () => {
        // Validate all fields before saving
        const isNameValid = validateField('name', profileData.name);
        const isPhoneValid = validateField('phone', profileData.phone);
        
        if (!isNameValid || !isPhoneValid) {
            toast.error('Please fix the errors before saving.');
            return;
        }

        const toastId = toast.loading('Updating profile...');
        
        try {
            let newImageUrl = profileData.profilePictureUrl;
            if (imageUpload) {
                setProfileData(prev => ({ ...prev, profilePicture: imageUpload }));
            }
            
            
            const respnse = await axiosCustomerInstance.put('/profile/update', profileData);
            
            setProfileData(respnse.data);
            toast.success('Profile updated successfully!', { id: toastId });
            setIsEditing(false); // Exit editing mode on success
        } catch (error) {
            toast.error('Failed to update profile.', { id: toastId });
        } finally {
            setImageUpload(null);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await axiosCustomerInstance.delete('/profile/delete');
                toast.success('Account deleted successfully.');
                dispatch(resetUserDetails());
            } catch (error) {
                toast.error('Failed to delete account.');
            }
        }
    };

    const handleLogout = () => {
        dispatch(resetUserDetails());
        toast.success('Logged out successfully.');
    };

    if (isLoading) {
        return <div className="p-8 text-center text-white">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-white">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
            </header>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <img
                            src={imageUpload ? URL.createObjectURL(imageUpload) : profileData.profilePictureUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                        />
                        {isEditing && (
                            <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer hover:bg-yellow-600">
                                <Camera size={20} className="text-black"/>
                                <input id="file-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*"/>
                            </label>
                        )}
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-grow w-full">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="input-field" placeholder="Full Name"/>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    {/* Email is now non-editable */}
                                    <input type="email" name="email" value={profileData.email} className="input-field bg-gray-800/50 cursor-not-allowed" placeholder="Email Address" disabled />
                                </div>
                                <div>
                                    <input type="tel" name="phone" value={profileData.phone} onChange={handleInputChange} className="input-field" placeholder="Phone Number" maxLength="10"/>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                                <p className="text-gray-400 flex items-center gap-2"><Mail size={16}/> {profileData.email}</p>
                                <p className="text-gray-400 flex items-center gap-2"><Phone size={16}/> {profileData.phone}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Edit/Save Button */}
                    <div>
                        {isEditing ? (
                            <button onClick={handleSaveChanges} className="btn-primary">Save Changes</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2"><Edit size={16}/> Edit</button>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-800 mt-8 pt-6 space-y-4">
                     <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center gap-2"><LogOut size={16}/> Logout</button>
                     <button onClick={handleDeleteAccount} className="btn-danger w-full flex items-center justify-center gap-2"><Trash2 size={16}/> Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;

