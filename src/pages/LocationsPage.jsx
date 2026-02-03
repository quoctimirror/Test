import React from "react";
import SEO from "@components/seo/SEO";
import { LocalBusinessSchema } from "@components/seo/StructuredData";
import LocationsPage from "@components/locations/LocationsPage";

const LocationsPageWrapper = () => {
  return (
    <>
      <SEO
        title="Store Locations"
        description="Find Mirror Future Diamond showrooms and store locations. Visit us to experience our premium lab-grown diamond jewelry collection in person."
        url="/locations"
      />
      <LocalBusinessSchema />
      <LocationsPage />
    </>
  );
};

export default LocationsPageWrapper;