import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import CommonLoadingSpinner from "./components/loadingAnimations/CommonLoading";
import ErrorFallback from "./components/errorsAndCommon/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";

const LandingPage = lazy(() =>
  import("./components/public/LandingPage.jsx")
);
const OwnerSubscriptionHome = lazy(() =>
  import("./components/owner/subscriptionMangement/OwnerSubscriptionHome.jsx")
);
const RestaurantSettings = lazy(() =>
  import("./components/owner/restaurantManagement/RestaurantSettings.jsx")
);
const EmployeeMenuPage = lazy(() =>
  import("./components/employee/orders/EmployeeMenuPage.jsx")
);
const KitchenDisplay = lazy(() =>
  import("./components/employee/orders/KitchenDisplay.jsx")
);
const POSPage = lazy(() =>
  import("./components/employee/orders/POSPage.jsx")
);
const AdminNotifications = lazy(() =>
import("./components/admin/notification/AdminNotifications.jsx")
);
const SubscriptionPlans = lazy(() =>
import("./components/owner/subscriptionMangement/SubscriptionPlans.jsx")
);
const PaymentHistory = lazy(() =>
import("./components/admin/subscriptionManagement/PaymentHistory.jsx")
);
const OwnerDashboard = lazy(() =>
import("./components/owner/dashboard/OwnerDashboard.jsx")
);
const AdminSubscriptionsPage = lazy(() =>
import("./components/admin/subscriptionManagement/AdminSubscriptionsPage.jsx")
);
const AdminDashboard = lazy(() =>
import("./components/admin/admindashboard/AdminDashboard.jsx")
);
const ReservationAvailabilitySetup = lazy(() =>
import("./components/owner/reservationManagement/ReservationAvailabilitySetup.jsx")
);
const ReservationManagementPage = lazy(() =>
import("./components/owner/reservationManagement/ReservationManagementPage.jsx")
);
const RestaurantSignup = lazy(() =>
import("./components/signup/RestaurantSignup.jsx")
);
const OwnerOrderDetailPage = lazy(() =>
import("./components/owner/orderManagement/OwnerOrderDetailPage.jsx")
);
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
const ResetPasswordPage = lazy(() => 
  import("./components/login/ResetPasswordPage")
);
// const OwnerOrderDetailPage
// const


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

              if (user.role.toLowerCase() === 'owner') {
                window.location.href = '/owner/employees/list';
              } else if (user.role.toLowerCase() === 'admin') {
                window.location.href = '/admin/dashboard';
              } else if (user.role.toLowerCase() === 'employee') {
                window.location.href = '/employee/dashboard';
              }

            }}
          >
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
           <Route path="/signup" element={<RestaurantSignup />} />
           <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                  path="dashboard"
                  element={<AdminDashboard />}
                />
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
                <Route
                  path="notifications"
                  element={<AdminNotifications />}
                />
              // In your router configuration
                <Route
                  path="users/detail/:userEncryptionId"
                  element={<UserDetailsPage />} />
                <Route
                  path="subscriptions"
                  element={<AdminSubscriptionsPage />}
                />
                <Route
                  path="payments"
                  element={<PaymentHistory />}
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
                  path="dashboard"
                  element={<OwnerDashboard />}
                /> {/* Default page */}
                
                <Route
                  path="employees/list"
                  element={<EmployeeManagementList />}
                />
                <Route
                  path="restaurant-settings"
                  element={<RestaurantSettings />}
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
                <Route
                  path="orders/:orderId"
                  element={<OwnerOrderDetailPage />}
                />
                <Route
                  path="reservations"
                  element={<ReservationManagementPage />}
                />
                <Route
                  path="reservations/availability-setup"
                  element={<ReservationAvailabilitySetup />}
                />
                <Route
                  path="subscription"
                  element={<OwnerSubscriptionHome />}
                />
                <Route
                  path="subscription/plans"
                  element={<SubscriptionPlans />}
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
                <Route path="pos" element={<POSPage />} />
                <Route path="kitchen" element={<KitchenDisplay />} />
                <Route path="menu" element={<EmployeeMenuPage />} />
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
                <Route path="profile/:encryptedId" element={<CustomerProfilePage />} />
             </Route>
            <Route path="/public/login/:encryptedId" element={<CustomerAuthPage />} />

        </Routes>
        
         </ErrorBoundary>

      </Suspense>
    </>
  );
}

export default App;
