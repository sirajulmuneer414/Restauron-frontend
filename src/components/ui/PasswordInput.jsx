import React, { useState } from 'react';
import { Field, ErrorMessage } from 'formik';
import { Eye, EyeOff,LockIcon} from 'lucide-react';


const PasswordInput = ({ name, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
        <LockIcon className="
    absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400 transition-colors" size={20} />
      <Field
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:border-yellow-500 text-white"
      />
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-yellow-400"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
      </div>
      <ErrorMessage name={name} component="div" className="text-red-400 text-xs mt-1.5 ml-2 font-medium" />
    </div>
  );
};

export default PasswordInput;
