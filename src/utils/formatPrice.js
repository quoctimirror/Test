/**
 * Format a number as US currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price string (e.g., "$1,234")
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0);
};

export default formatPrice;
