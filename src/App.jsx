import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import CommonLoadingSpinner from "./components/loadingAnimations/CommonLoading";
import ErrorFallback from "./components/errorsAndCommon/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";


import RestaurantSignup from "./components/signup/RestaurantSignup";


const AddNewOrderPage = lazy(() =>
import("./components/owner/orderManagement/AddNewOrderPage.jsx")
);
const OwnerOrderManagementPage = lazy(()=>
import("./components/owner/orderManagement/OwnerOrderManagementPage")
);
const CustomerProfilePage = lazy(() => 
import("./components/customer/profile/CustomerProfilePage")
);
const OrderConfirmationPage = lazy(() => 
  import("./components/customer/orderManagement/OrderConfirmationPage")
);
const CustomerMenuPage = lazy (() => 
  import("./components/customer/restaurant/CustomerMenuPage")
);
const UserDetailsPage = lazy(() => 
  import("./components/admin/userManagement/UserDetailsPage")
);
const TableManagementPage = lazy(() =>
  import("./components/owner/restaurantManagement/TableManagementPage")
);
const CustomerAuthPage = lazy(() =>
  import("./pages/customer/CustomerAuthPage")
);
const AdminLayoutPage = lazy(() =>
  import("./pages/admin/AdminLayoutPage")
);
const AddEmployee = lazy(() =>
  import("./components/owner/employeeMangement/AddEmployee")
);
const EmployeeIndividualDetails = lazy(() =>
  import("./components/owner/employeeMangement/EmployeeIndividualDetails")
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
  import("./components/admin/userManagement/UserManagementList")
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
const EmployeeLayoutPage = lazy(() =>
  import("./pages/employee/EmployeeLayoutPage")
);
const EmployeeDashboard = lazy(() =>
  import("./components/employee/EmployeeDashboard")
);
const EmployeeProfilePage = lazy(() =>
  import("./components/employee/profile/EmployeeProfilePage")
);
const EmployeeChangePasswordPage = lazy(() =>
  import("./components/employee/profile/EmployeeChangePasswordPage")
);
const CustomerLayout = lazy(() =>
  import("./pages/customer/CustomerLayout")
);
const RestaurantHomePage = lazy(() =>
  import("./components/customer/restaurant/RestaurantHomePage")
);
const RestaurantManagementList = lazy(() =>
  import("./components/admin/restaurantManagement/RestaurantManagementList")
);
const RestaurantDetailsPage = lazy(() =>
  import("./components/admin/restaurantManagement/RestaurantDetailsPage")
);
const CategoryManagementList = lazy(() => 
  import("./components/owner/menuManagement/CategoryMangementList")
);
const CategoryDetailPage = lazy(() => 
  import("./components/owner/menuManagement/CategoryDetailPage")
);
const MenuItemManagementList = lazy(() => 
  import("./components/owner/menuManagement/MenuManagementList")
);
const MenuItemDetailPage = lazy(() =>
   import("./components/owner/menuManagement/MenuItemDetailPage")
);
const CustomerManagementPage = lazy(() =>  
  import("./components/owner/customerManagement/CustomerManagementPage")
);
const CustomerDetailPage = lazy(() => 
  import("./components/owner/customerManagement/CustomerDetailPage")
);

OwnerOrderManagementPage

function App() {
  const otpPermission = useSelector((state) => state.signupOption.otp);
  const user = useSelector((state) => state.userSlice.user);


  return (
    <>
      {/* <Circle></Circle>  */}
      <Suspense fallback={<CommonLoadingSpinner />} >
   <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {

              if (user.role === 'owner') {
                window.location.href = '/owner/employees/list';
              } else if (user.role === 'admin') {
                window.location.href = '/admin/restaurants';
              } else if (user.role === 'employee') {
                window.location.href = '/employee/dashboard';
              }

            }}
          >
        
        <Routes>
           <Route path="/" element={<RestaurantSignup />} />
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
                  path="restaurant/requests"
                  element={<RestaurantApprovalRequests />}
                />
                <Route
                  path="restaurant/request/:requestId"
                  element={<RestaurantRequestDetails />}
                />
                <Route
                  path="restaurants"
                  element={<RestaurantManagementList />}
                />
                <Route
                  path="restaurants/details/:encryptedId"
                  element={<RestaurantDetailsPage />}
                />
                <Route
                  path="users"
                  element={<UserManagementList />}
                />
              // In your router configuration
                <Route
                  path="users/detail/:userEncryptionId"
                  element={<UserDetailsPage />} />

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
                <Route
                  path="employees/detail/:employeeId"
                  element={<EmployeeIndividualDetails />}
                />
                <Route
                  path="tables"
                  element={<TableManagementPage />}
                />
                <Route 
                path="category"
                element={<CategoryManagementList />}
                />
                <Route 
                path="category/detail/:categoryEncryptedId"
                element={<CategoryDetailPage />}
                />
                <Route
                  path="menu"
                  element={<MenuItemManagementList />}
                />
                <Route
                  path="menu/item/detail/:menuItemEncryptedId"
                  element={<MenuItemDetailPage />}
                />
                <Route
                  path="customers"
                  element={<CustomerManagementPage />}
                />
                <Route
                  path="customers/details/:customerEncryptedId"
                  element={<CustomerDetailPage />}
                />
                <Route
                  path="orders"
                  element={<OwnerOrderManagementPage />}
                />
                <Route
                  path="orders/new"
                  element={<AddNewOrderPage />}
                />

              </Route>
            ) : (
              <Route
                path="/owner/*"
                element={<NotAutherizedPageSignup />}
              />
            )
            }

            {user && user.role.toLowerCase() === "employee" ? (
              <Route path="/employee" element={<EmployeeLayoutPage />}>
                <Route path="dashboard" element={<EmployeeDashboard />} /> {/* Default page */}
                <Route path="profile/:specialId" element={<EmployeeProfilePage />} />{/* Profile page */}
                <Route path="change-password" element={<EmployeeChangePasswordPage />} />

                {/* Add other employee routes here */}
              </Route>
            ) : (
              <Route
                path="/employee/*"
                element={<NotAutherizedPageSignup />}
              />
            )}

            <Route path="/restaurant/:encryptedId" element={<CustomerLayout />}>
              <Route path="home" element={<RestaurantHomePage />} />
              <Route path="menu" element={<CustomerMenuPage/>} />
              <Route path="confirm-order" element={<OrderConfirmationPage /> } />

            </Route>

            <Route path="/customer" element={<CustomerLayout />}>
                <Route path="profile" element={<CustomerProfilePage />} />
             </Route>
            <Route path="/public/login/:encryptedId" element={<CustomerAuthPage />} />

        </Routes>
        
         </ErrorBoundary>

      </Suspense>
    </>
  );
}

export default App;
