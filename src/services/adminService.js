import { useAxios } from "../axios/instances/axiosInstances";

export const useAdminService = () => {
  const { axiosAdminInstance } = useAxios();    
    return {

            // Payment & Subscription APIs
        // 1. Fetch all payment records
        getAllPayments: async () => {
            const response = await axiosAdminInstance.get('/payments/history');
            return response.data;
        },

        // 2. Fetch all subscriptions (active & expired)
        getAllSubscriptions: async () => {
            const response = await axiosAdminInstance.get('/subscriptions/all');
            return response.data;
        },

          // Notification APIs

        // 3. Send notification to a specific user
        sendPrivateNotification: async (email, title, message) => {
            return await axiosAdminInstance.post(`/notify/user/${email}`, { title, message });
        },
        
        // 4. Send announcement to all owners
        sendOwnerAnnouncement: async (title, message) => {
            return await axiosAdminInstance.post('/notify/owners', { title, message });
        },
        
        // 5. Send announcement to all renters
        sendGlobalBroadcast: async (title, message) => {
            return await axiosAdminInstance.post('/notify/broadcast', { title, message });
        }
        
        // You can add other admin-specific calls here later
        // e.g., getDashboardStats, manageUsers, etc.
    };

};