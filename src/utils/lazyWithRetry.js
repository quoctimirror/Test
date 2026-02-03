import { lazy } from "react";

/**
 * Wrapper around React.lazy that retries failed chunk imports.
 *
 * After a new deployment, old chunk URLs become invalid. Users who still have
 * the previous index.html cached will request stale chunks, causing import
 * failures caught by ErrorBoundary (showing the "500" page).
 *
 * This utility:
 *  1. Retries the dynamic import up to `maxRetries` times with exponential backoff.
 *  2. If all retries fail, forces a single full-page reload so the browser
 *     fetches the latest index.html (and therefore the correct chunk URLs).
 *  3. Uses sessionStorage to prevent an infinite reload loop.
 */
const lazyWithRetry = (importFn, { maxRetries = 3 } = {}) => {
  return lazy(() => retryImport(importFn, maxRetries));
};

async function retryImport(importFn, retriesLeft) {
  try {
    return await importFn();
  } catch (error) {
    if (retriesLeft > 0) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * 2 ** (3 - retriesLeft);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryImport(importFn, retriesLeft - 1);
    }

    // All retries exhausted — try a one-time page reload
    const reloadKey = "chunk-reload-" + window.location.pathname;
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (!hasReloaded) {
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
      // Return a never-resolving promise so React doesn't render before reload
      return new Promise(() => {});
    }

    // Already reloaded once — clear flag and let ErrorBoundary handle it
    sessionStorage.removeItem(reloadKey);
    throw error;
  }
}

export default lazyWithRetry;
