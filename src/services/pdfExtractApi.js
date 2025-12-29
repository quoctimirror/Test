/**
 * PDF Invoice Extraction API Service
 * Calls the Python backend API to extract data from PDF invoices using pdfplumber
 */

const API_ENDPOINT = '/api/extract-invoice';

/**
 * Extract invoice data from a PDF file
 * @param {File} file - The PDF file to extract data from
 * @param {Object} options - Options object
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} - Extracted invoice data
 */
export async function extractInvoiceFromPdf(file, options = {}) {
  const { onProgress } = options;

  try {
    // Stage 1: Preparing
    if (onProgress) {
      onProgress({ stage: 'reading', progress: 10 });
    }

    // Create form data
    const formData = new FormData();
    formData.append('pdf', file);

    // Stage 2: Uploading
    if (onProgress) {
      onProgress({ stage: 'extracting', progress: 30 });
    }

    // Call API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    // Stage 3: Processing response
    if (onProgress) {
      onProgress({ stage: 'parsing', progress: 70 });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to extract invoice data');
    }

    // Stage 4: Done
    if (onProgress) {
      onProgress({ stage: 'done', progress: 100 });
    }

    return result.data;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

/**
 * Alias for backward compatibility
 */
export const readPdfInvoice = extractInvoiceFromPdf;

export default {
  extractInvoiceFromPdf,
  readPdfInvoice,
};
