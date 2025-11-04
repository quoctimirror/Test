import React, { useEffect } from "react";
import SupportDetail from "@components/support/SupportDetail";

const SupportDetailPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="support-detail-page">
      <main>
        <SupportDetail />
      </main>
    </div>
  );
};

export default SupportDetailPage;
