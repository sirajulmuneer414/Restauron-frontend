import React, { useEffect } from 'react'
import RestaurantSignup from '../../components/signup/RestaurantSignup'
import EmployeeSignup from '../../components/signup/EmployeeSigup';
import { useSelector } from 'react-redux';
import '../../css/selectionSetter.css';
import AdminSignup from '../../components/signup/AdminSignup';


function Signup() {
  const signupOption = useSelector((state) => state.signupOption.signupOption);
  const adminPageAccess = useSelector((state) => state.specialPermissions.adminPageAccess);
  console.log("Signup option in signup selected:", signupOption);
  useEffect
(() => {
   
    console.log("Signup component mounted, current signup option:", signupOption);

  }, [signupOption]);
  return (
    <>
  
      {adminPageAccess ? <AdminSignup /> : signupOption === "restaurant" ? <RestaurantSignup /> : <EmployeeSignup />}
      </>
    
    
  )
}

export default Signup;