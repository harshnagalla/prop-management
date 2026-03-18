/**
 * JSON-LD Structured Data for BhoomiQ landing page.
 *
 * Schema types:
 * - Organization: Brand identity and knowledge panel signals
 * - WebSite: Site-level metadata with search action
 * - SoftwareApplication: Describes BhoomiQ as a SaaS product
 * - WebPage: Landing page description
 * - BreadcrumbList: Navigation trail for rich results
 */

const SITE_URL = "https://prop-management-one.vercel.app";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BhoomiQ",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "AI-powered property intelligence platform built for Indian families managing property portfolios.",
  foundingDate: "2024",
  sameAs: [] as string[],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: SITE_URL,
    availableLanguage: ["English", "Hindi"],
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BhoomiQ",
  url: SITE_URL,
  description:
    "Track your family's property portfolio — bills, rental income, documents, and ROI at a glance.",
  publisher: {
    "@type": "Organization",
    name: "BhoomiQ",
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BhoomiQ",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered property portfolio management platform. Track 30+ properties — bills, rental income, documents, ROI, and ownership. AI scans your bills. Import from Excel in one click.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free to start",
    url: `${SITE_URL}/auth/sign-up`,
  },
  featureList: [
    "Property Registry with value, area, ownership splits, stamp duty, and registration details",
    "Rental Income tracking with auto-fill and monthly trends",
    "AI Bill Scanner for Indian utility bills (UGVCL, AMC, Torrent Power)",
    "Analytics Dashboard with portfolio value, rental yields, and ROI",
    "Smart Import from Excel with multi-unit building detection",
    "Sale and Profit Tracking including stamp duty and registration costs",
  ],
  screenshot: `${SITE_URL}/icon-512.png`,
  creator: {
    "@type": "Organization",
    name: "BhoomiQ",
    url: SITE_URL,
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "BhoomiQ — AI-Powered Property Intelligence",
  description:
    "Track your family's property portfolio — bills, rental income, documents, and ROI at a glance.",
  url: SITE_URL,
  isPartOf: {
    "@type": "WebSite",
    name: "BhoomiQ",
    url: SITE_URL,
  },
  about: {
    "@type": "SoftwareApplication",
    name: "BhoomiQ",
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon-512.png`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is BhoomiQ?",
      acceptedAnswer: { "@type": "Answer", text: "BhoomiQ is an AI-powered property portfolio management platform built for Indian families. It helps you track properties, utility bills, rental income, documents, and ROI from a single dashboard." },
    },
    {
      "@type": "Question",
      name: "Is BhoomiQ free?",
      acceptedAnswer: { "@type": "Answer", text: "Yes, BhoomiQ is free to get started. You can add properties, track bills and income, and use the analytics dashboard at no cost." },
    },
    {
      "@type": "Question",
      name: "What Indian utility bills does BhoomiQ support?",
      acceptedAnswer: { "@type": "Answer", text: "BhoomiQ's AI bill scanner supports UGVCL, Torrent Power, AMC water and property tax bills, Adani Gas, and more. Upload a photo or PDF and AI extracts all details automatically." },
    },
    {
      "@type": "Question",
      name: "Can I import from Excel?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. BhoomiQ has a smart Excel import that parses your property spreadsheets, detects multi-unit buildings, maps columns automatically, and imports everything in one click." },
    },
    {
      "@type": "Question",
      name: "Is my property data secure?",
      acceptedAnswer: { "@type": "Answer", text: "Your data is stored on encrypted Neon Postgres. We use industry-standard authentication and HTTPS encryption. Data is never shared with third parties." },
    },
    {
      "@type": "Question",
      name: "How does AI bill scanning work?",
      acceptedAnswer: { "@type": "Answer", text: "Upload a photo or PDF of any Indian utility bill. Our AI, powered by Google Gemini, reads the document and extracts billed amount, due date, consumption units, and meter readings automatically." },
    },
  ],
};

export function StructuredData() {
  const schemas = [
    organizationSchema,
    webSiteSchema,
    softwareApplicationSchema,
    webPageSchema,
    breadcrumbSchema,
    faqSchema,
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
