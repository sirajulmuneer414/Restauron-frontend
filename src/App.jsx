import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import CommonLoadingSpinner from "./components/loadingAnimations/CommonLoading";


const AdminLayoutPage = lazy(() =>
  import("./pages/admin/AdminLayoutPage")
);
const AddEmployee = lazy(() =>
  import("./components/owner/employeeMangement/AddEmployee")
);

const Signup = lazy(() =>
  import("./pages/signupAndLogin/Signup")
);
const OtpVerifcationPage = lazy(() =>
  import("./pages/signupAndLogin/OtpVerifcationPage")
);
const Login = lazy(() =>
  import("./pages/signupAndLogin/Login")
);
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
const OwnerLayoutPage = lazy(() =>
  import("./pages/owner/OwnerLayoutPage")
);
const EmployeeManagementList = lazy(() =>
  import("./components/owner/employeeMangement/EmployeeManagementList")
);
const RestaurantRequestDetails = lazy(() =>
  import("./components/admin/RestaurantRequestDetails")
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
              {/* Define admin-specific routes here */}
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
              path="/admin/*"
              element={<NotAutherizedPageSignup />}
            />
          )}
          {user && user.role.toLowerCase() === "owner" ? (
            <Route
              path="/owner"
              element={<OwnerLayoutPage />}
            >
              {/* Define owner-specific routes here */}
              <Route
                path="employees/list"
                element={<EmployeeManagementList />}
              />
              <Route
                path="employees/add"
                element={<AddEmployee />}
              />

            </Route>
          ) : (
            <Route
              path="/owner/*"
              element={<NotAutherizedPageSignup />}
            />
          )

          }
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
