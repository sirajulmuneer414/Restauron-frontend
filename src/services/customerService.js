import useAxios from "../axiosinstances/axiosInstances";

export const useCustomerService = () => {
  const { axiosCustomerInstance } = useAxios();

  return {
    // Get customer orders (status: 'ACTIVE', 'COMPLETED', or null for all)
    getCustomerOrders: async (status = null) => {
      const params = status ? { status } : {};
      const response = await axiosCustomerInstance.get('/orders', { params });
      return response.data;
    },

    // Get order details
    getOrderDetails: async (encryptedOrderId) => {
      const response = await axiosCustomerInstance.get(`/orders/${encryptedOrderId}`);
      return response.data;
    },

    // Submit rating for a menu item
    submitRating: async (encryptedOrderId, encryptedMenuItemId, ratingData) => {
      const response = await axiosCustomerInstance.post(
        `/orders/${encryptedOrderId}/items/${encryptedMenuItemId}/rate`,
        ratingData
      );
      return response.data;
    },

    // Get ratings for a menu item
    getMenuItemRatings: async (encryptedMenuItemId) => {
      const response = await axiosCustomerInstance.get(
        `/orders/menu-items/${encryptedMenuItemId}/ratings`
      );
      return response.data;
    },

    // Get rating stats (average + count)
    getMenuItemRatingStats: async (encryptedMenuItemId) => {
      const response = await axiosCustomerInstance.get(
        `/orders/menu-items/${encryptedMenuItemId}/rating-stats`
      );
      return response.data;
    },
  };
};
