/**
 * Site Configuration
 *
 * Update this file with your actual contact information and company details.
 * This centralized configuration makes it easy to maintain consistent information
 * across the entire website.
 */

export const siteConfig = {
  company: {
    name: "BAH Energy",
    legalName: "BAH Energy Corporation",
    description: "Redefining exploration with AI-driven precision and sustainable infrastructure.",
  },

  contact: {
    // TODO: Replace with your actual business phone number
    phone: "+1 (713) 000-0000", // Houston area code
    phoneDisplay: "+1 (713) 000-0000",
    email: "contact@bahenergy.com",
    supportEmail: "support@bahenergy.com",
    salesEmail: "sales@bahenergy.com",
  },

  location: {
    city: "Houston",
    state: "Texas",
    stateCode: "TX",
    country: "USA",
    addressLine1: "", // TODO: Add street address
    addressLine2: "",
    zipCode: "",
    displayAddress: "Houston, Texas, USA",
  },

  social: {
    linkedin: "",  // TODO: Add LinkedIn URL
    twitter: "",   // TODO: Add Twitter/X URL
    facebook: "",  // TODO: Add Facebook URL
  },

  business: {
    hoursOfOperation: "Monday - Friday: 8:00 AM - 6:00 PM CST",
    timezone: "America/Chicago",
  },
} as const;

export type SiteConfig = typeof siteConfig;
