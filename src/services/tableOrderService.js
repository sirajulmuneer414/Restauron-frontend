import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Service for public table-side ordering (no authentication required)
 */
export const tableOrderService = {
  /**
   * Get table information and available menu items
   * @param {string} encryptedTableId - Encrypted table ID from QR code
   * @returns {Promise} Table info with menu categories
   */
  async getTableOrderInfo(encryptedTableId) {
    const response = await axios.get(`${API_BASE_URL}/api/public/table-order/${encryptedTableId}`);
    return response.data;
  },

  /**
   * Place an order from a table
   * @param {string} encryptedTableId - Encrypted table ID
   * @param {Object} orderData - Order data with customer details and items
   * @returns {Promise} Order confirmation details
   */
  async placeTableOrder(encryptedTableId, orderData) {
    const response = await axios.post(
      `${API_BASE_URL}/api/public/table-order/${encryptedTableId}/place-order`,
      orderData
    );
    return response.data;
  }
};
