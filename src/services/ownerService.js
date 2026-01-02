// src/services/ownerService.js

import { useAxios } from "../axios/instances/axiosInstances"; // Path to your axios hook

export const useOwnerService = () => {
  const { axiosOwnerInstance } = useAxios();

  return {
    getSalesStats: async () => {
      const response = await axiosOwnerInstance.get("dashboard/stats/sales");
      return response.data;
    },
    getSubscriptionStatus: async () => {
      const response = await axiosOwnerInstance.get("dashboard/subscription/status");
      return response.data;
    },
    getRecentOrders: async () => {
      const response = await axiosOwnerInstance.get("dashboard/orders/recent");
      return response.data;
    },
    getEmployeeCount: async () => {
      const response = await axiosOwnerInstance.get("dashboard/stats/employees");
      return response.data;
    },
    getTopItems: async () => {
      const response = await axiosOwnerInstance.get("dashboard/stats/top-items");
      return response.data;
    },
    getAllPackages: async () => {
      const response = await axiosOwnerInstance.get("/subscription/packages");
      return response.data;
    },
   getRestaurantCustomerLink: async () => {
  const response = await axiosOwnerInstance.get('/dashboard/restaurant/customer-link');
  return response.data;
}, 

    // 2. Create Razorpay Order
    createPaymentOrder: async (packageId) => {
      const response = await axiosOwnerInstance.post(
        `/payments/create-order/${packageId}`
      );
      return response.data;
    },

    // 3. Verify Payment
    verifyPayment: async (paymentData) => {
      const response = await axiosOwnerInstance.post(
        "/payments/verify",
        paymentData
      );
      return response.data;
    },
    // 4. Get Owner Contact Number
    getOwnerContactNumber: async () => {
      const response = await axiosOwnerInstance.get(
        `/contact-info`
      );
      return response.data;
    },
  };
};
