import { useAxios } from "../axios/instances/axiosInstances";

export const useEmployeeService = () => {
    // --- Dashboard & Stats ---
    const { axiosEmployeeInstance } = useAxios();

    return {
    
    // Fetch summary stats for the top cards
    getDashboardStats: async () => {
        const response = await axiosEmployeeInstance.get('/dashboard/stats');
        return response.data;
    },

    // --- Table Management ---

    // Fetch all tables with current status
    getAllTables: async () => {
        const response = await axiosEmployeeInstance.get('/tables');
        return response.data;
    },

    // Mark a table as occupied, free, cleaning, etc.
    updateTableStatus: async (tableId, status) => {
        const response = await axiosEmployeeInstance.put(`/tables/${tableId}/status`, { status });
        return response.data;
    },

    // --- Order Management (Kitchen & POS) ---

    // Fetch active orders (Orders NOT completed or cancelled)
    getActiveOrders: async () => {
        const response = await axiosEmployeeInstance.get('/orders/active');
        return response.data;
    },

    // Fetch active categories (for POS filtering)
    getAllCategories: async () => {
        const response = await axiosEmployeeInstance.get('/menu/categories');
        return response.data;
    },

    // Update order status (PENDING -> PREPARING -> READY -> COMPLETED)
    updateOrderStatus: async (orderId, newStatus) => {
        // Passing status as a query parameter to match typical REST patterns for state transitions
        const response = await axiosEmployeeInstance.put(`/orders/${orderId}/status`, null, {
            params: { status: newStatus }
        });
        return response.data;
    },

    // Create a new order (Used by POS)
    createOrder: async (orderRequest) => {
        // orderRequest matches the new DTO structure
        const response = await axiosEmployeeInstance.post('/orders', orderRequest);
        return response.data;
    },

    // --- Menu (POS) ---

    // Fetch menu items for the POS view
    getMenuItems: async () => {
        const response = await axiosEmployeeInstance.get('/menu');
        return response.data;
    },
        // NEW: Search Menu with Pagination (Replaces getMenuItems for POS)
    searchMenu: async (query, category, page = 0, size = 12) => {
        const response = await axiosEmployeeInstance.get('/menu/search', {
            params: {
                query: query || '',
                category: category || 'All',
                page: page,
                size: size
            }
        });
        return response.data; // Returns { content: [...], totalPages: 5 }
    },
}
};
