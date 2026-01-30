import { Helmet } from "react-helmet-async";

function JsonLd({ data }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MIRROR FUTURE DIAMOND",
    url: "https://www.mirrorfuturediamond.com",
    logo: "https://www.mirrorfuturediamond.com/favicon-512.png",
    description:
      "Premium lab-grown diamond jewelry with innovative AR try-on experience.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Nguyen Hue Boulevard",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Vietnamese"],
    },
    sameAs: [
      "https://www.facebook.com/mirrorfuturediamond",
      "https://www.instagram.com/mirrorfuturediamond",
    ],
  };
  return <JsonLd data={data} />;
}

export function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "MIRROR FUTURE DIAMOND",
    url: "https://www.mirrorfuturediamond.com",
    image: "https://www.mirrorfuturediamond.com/favicon-512.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Nguyen Hue Boulevard",
      addressLocality: "Ho Chi Minh City",
      addressRegion: "HCM",
      addressCountry: "VN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    priceRange: "$$$",
  };
  return <JsonLd data={data} />;
}

export function ProductSchema({ product }) {
  if (!product) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: "MIRROR FUTURE DIAMOND",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      price: product.price,
      seller: {
        "@type": "Organization",
        name: "MIRROR FUTURE DIAMOND",
      },
    },
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbSchema({ items }) {
  if (!items || items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
        ? `https://www.mirrorfuturediamond.com${item.url}`
        : undefined,
    })),
  };
  return <JsonLd data={data} />;
}

export function WebSiteSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MIRROR FUTURE DIAMOND",
    url: "https://www.mirrorfuturediamond.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.mirrorfuturediamond.com/products?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLd data={data} />;
}
