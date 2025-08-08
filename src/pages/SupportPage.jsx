import React, { useEffect } from "react";
import Support from "@components/support/Support";

const SupportPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="support-page">
      <main>
        <Support />
      </main>
    </div>
  );
};

export default SupportPage;
