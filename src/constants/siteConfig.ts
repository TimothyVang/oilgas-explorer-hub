/**
 * Site Configuration
 *
 * Update this file with your actual contact information and company details.
 * This centralized configuration makes it easy to maintain consistent information
 * across the entire website.
 */

export const siteConfig = {
  company: {
    name: "BAH Oil LLC",
    legalName: "BAH Oil LLC",
    description: "South Texas conventional oil and gas operator and developer focused on Zapata County redevelopment.",
  },

  contact: {
    phone: "",
    phoneDisplay: "Available on request",
    email: "info@bah-oil-gas.com",
    supportEmail: "info@bah-oil-gas.com",
    salesEmail: "info@bah-oil-gas.com",
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
