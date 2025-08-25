import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import CommonLoadingSpinner from "./components/loadingAnimations/CommonLoading";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import RestaurantRequestDetails from "./components/admin/RestaurantRequestDetails";


const Signup = lazy(() => import("./pages/signupAndLogin/Signup"));
const OtpVerifcationPage = lazy(() =>
  import("./pages/signupAndLogin/OtpVerifcationPage")
);
const Login = lazy(() => import("./pages/signupAndLogin/Login"));
const WaitingForApproval = lazy(() =>
  import("./components/login/WaitingForApproval")
);
const NotAutherizedPageSignup = lazy(() =>
  import("./components/errorsAndCommon/NotAutherizedPageSignup")
);
const RestaurantApprovalRequests = lazy(() =>
  import("./components/admin/RestaurantApprovalRequests")
);
const UserManagementList = lazy(() =>
  import("./components/admin/UserManagementList")
);


function App() {
  const otpPermission = useSelector((state) => state.signupOption.otp);
  const user = useSelector((state) => state.userSlice.user);

  return (
    <>
      {/* <Circle></Circle>  */}

      <Suspense fallback={<CommonLoadingSpinner />} >
        <Routes>
          <Route path="/" element={<Signup />} />
          {otpPermission ? (
            <Route path="/otpVerification" element={<OtpVerifcationPage />} />
          ) : (
            <Route
              path="/otpVerification"
              element={<NotAutherizedPageSignup />}
            />
          )}

          <Route path="/login" element={<Login />} />
          <Route
            path="/waiting-for-approval"
            element={<WaitingForApproval />}
          />

          {user && user.role.toLowerCase() === "admin" ? (
            <Route path="/admin" element={<AdminLayoutPage />}>

              <Route
                path="restaurants/requests"
                element={<RestaurantApprovalRequests />}
              />
              <Route
                path="restaurant/request/:requestId"
                element={<RestaurantRequestDetails />}
              />
              <Route
                path="users"
                element={<UserManagementList />}
                />
            </Route>
          ) : (
            <Route
              path="/admin/restaurants/requests"
              element={<NotAutherizedPageSignup />}
            />
          )}
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
