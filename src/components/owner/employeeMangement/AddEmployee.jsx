import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import { User, Mail, Phone, CreditCard, Lock, AtSign, FileImage, UploadCloud } from 'lucide-react';


// --- Validation Schema ---
// Now includes validation for the aadhaarImage file
const AddEmployeeSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
  personalEmail: Yup.string().email('Invalid email').required('Personal email is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Phone is required'),
  aadhaarNo: Yup.string().matches(/^[0-9]{12}$/, 'Must be 12 digits').required('Aadhaar number is required'),
  aadhaarImage: Yup.mixed()
    .required('Aadhaar photo is required')
    .test('fileSize', 'File is too large (max 2MB)', (value) => value && value.size <= 2 * 1024 * 1024)
    .test('fileType', 'Unsupported file format', (value) => value && ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)),
});

// --- Helper Component for Credential Generation ---
const CredentialGenerator = ({ restaurantName }) => {
    // This component remains the same as before
    const { values, setFieldValue } = useFormikContext();
    React.useEffect(() => {
        if (values.name && restaurantName) {
            const cleanRestaurantName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanEmployeeName = values.name.toLowerCase().replace(/\s+/g, '');
            const companyEmail = `${cleanEmployeeName}@${cleanRestaurantName}.com`;
            setFieldValue('companyEmail', companyEmail);
            if (!values.generatedPassword) {
                const password = Math.random().toString(36).slice(-8);
                setFieldValue('generatedPassword', password);
            }
        }
    }, [values.name, restaurantName, setFieldValue, values.generatedPassword]);
    return null;
};

// --- Main AddEmployee Component ---
const AddEmployee = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const restaurantName = "Chillies"; // Replace with your actual data source

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        try {

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('personalEmail', values.personalEmail);
            formData.append('phone', values.phone);
            formData.append('aadhaarNo', values.aadhaarNo);
            formData.append('aadhaarImage', values.aadhaarImage);
            formData.append('companyEmail', values.companyEmail);
            formData.append('generatedPassword', values.generatedPassword);
        
        

            const response = await axiosOwnerInstance.post('/employees/add', formData);

            if (response.status === 201) {
                navigate('/owner/employees/list');
            } else {
                setErrors({ api: 'Failed to add employee. Please try again.' });
            }
        } catch (err) {
            const apiError = err.response?.data?.message || 'An unexpected error occurred during submission.';
            setErrors({ api: apiError });
            console.error('Error adding employee:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const FormInput = ({ icon: Icon, name, type, placeholder }) => (
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <Field name={name} type={type} placeholder={placeholder} className="w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30" />
            <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1 ml-2" />
        </div>
    );

    return (
        <div className="container mx-auto p-4 text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Add New Employee</h1>
                <p className="text-gray-400">Enter the details below to register a new staff member.</p>
            </div>

            <div className="max-w-2xl mx-auto bg-black/50 border border-gray-800 rounded-xl p-8">
                <Formik
                    initialValues={{
                        name: '',
                        personalEmail: '',
                        phone: '',
                        aadhaarNo: '',
                        aadhaarImage: null, // Field for the file object
                        companyEmail: '',
                        generatedPassword: '',
                    }}
                    validationSchema={AddEmployeeSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, errors, setFieldValue, values }) => (
                        <Form className="space-y-6">
                            <CredentialGenerator restaurantName={restaurantName} />
                            
                            <FormInput icon={User} name="name" type="text" placeholder="Full Name" />
                            <FormInput icon={Mail} name="personalEmail" type="email" placeholder="Employee's Personal Email" />
                            <FormInput icon={Phone} name="phone" type="tel" placeholder="10-digit Phone Number" />
                            <FormInput icon={CreditCard} name="aadhaarNo" type="text" placeholder="12-digit Aadhaar Number" />

                            {/* Aadhaar Photo Upload Field */}
                            <div>
                                <label htmlFor="aadhaarImage" className="block text-sm font-medium text-gray-300 mb-2">Aadhaar Photo</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="w-full">
                                        <input
                                            id="aadhaarImage"
                                            name="aadhaarImage"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files[0];
                                                setFieldValue('aadhaarImage', file);
                                                setImagePreview(file ? URL.createObjectURL(file) : null);
                                            }}
                                            className="hidden"
                                        />
                                        <label htmlFor="aadhaarImage" className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-500 transition-colors">
                                            <div className="text-center">
                                                <UploadCloud className="mx-auto h-8 w-8 text-gray-500" />
                                                <p className="mt-1 text-sm text-gray-400">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
                                            </div>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="flex-shrink-0">
                                            <img src={imagePreview} alt="Aadhaar Preview" className="h-24 w-36 object-cover rounded-lg border border-gray-700" />
                                        </div>
                                    )}
                                </div>
                                <ErrorMessage name="aadhaarImage" component="div" className="text-red-400 text-sm mt-1" />
                            </div>

                            {/* Generated Credentials Preview */}
                            {values.companyEmail && (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
                                    <p className="text-sm text-gray-400">The following credentials will be created:</p>
                                    <div className="flex items-center gap-2"><AtSign className="text-yellow-400" size={16} /><p className="font-mono text-yellow-300">{values.companyEmail}</p></div>
                                    <div className="flex items-center gap-2"><Lock className="text-yellow-400" size={16} /><p className="font-mono text-yellow-300">{values.generatedPassword}</p></div>
                                </div>
                            )}

                            {errors.api && <div className="text-red-400 text-center bg-red-900/30 border border-red-800 rounded-lg p-3">{errors.api}</div>}

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Button type="button" onClick={() => navigate('/owner/employees/list')} className="bg-transparent hover:bg-gray-800 text-gray-300 font-semibold py-2 px-6 rounded-lg border border-gray-700" disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Add Employee'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddEmployee;

