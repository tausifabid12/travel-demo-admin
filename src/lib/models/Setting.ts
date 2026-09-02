import mongoose, { Schema, Document } from "mongoose";

const NavItemSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    children: [{ _id: false, label: String, href: String, description: String }],
  },
  { _id: false },
);

export interface INavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export interface ISetting extends Document {
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  gtmTag: string;
  googleAnalyticsId: string;
  googleAdsId: string;
  facebookPixelId: string;
  searchConsoleCode: string;
  defaultOgImage: string;

  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    addressLines: string[];
    mapEmbedUrl: string;
    responsePromise: string;
  };
  social: {
    linkedin: string;
    instagram: string;
    facebook: string;
    youtube: string;
    x: string;
  };
  homepage: {
    heroHeadline: string;
    heroSubheadline: string;
    heroImageUrl: string;
    heroVideoUrl: string;
    featuredPackageIds: mongoose.Types.ObjectId[];
    featuredCaseStudyIds: mongoose.Types.ObjectId[];
    clientLogos: { name: string; logoUrl: string }[];
    stats: { label: string; value: string }[];
  };
  navigation: { header: INavItem[]; footer: INavItem[] };
  notifications: {
    enquiryRecipients: string[];
    careersRecipients: string[];
    whatsappEnabled: boolean;
    emailEnabled: boolean;
  };

  phonePeMerchantId: string;
  phonePeSaltKey: string;
  pinggoApiKey: string;
  pinggoUserId: string;
  pinggoVendorPhone: string;

  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firebaseVapidKey: string;

  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    siteTitle: { type: String, default: "Bhancer" },
    siteDescription: {
      type: String,
      default: "Premium Corporate Travel & Events",
    },
    logoUrl: { type: String, default: "" },
    footerLogoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    gtmTag: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
    googleAdsId: { type: String, default: "" },
    facebookPixelId: { type: String, default: "" },
    searchConsoleCode: { type: String, default: "" },
    defaultOgImage: { type: String, default: "" },

    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      addressLines: { type: [String], default: [] },
      mapEmbedUrl: { type: String, default: "" },
      responsePromise: { type: String, default: "We respond within 24 hours" },
    },
    social: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      x: { type: String, default: "" },
    },
    homepage: {
      heroHeadline: { type: String, default: "" },
      heroSubheadline: { type: String, default: "" },
      heroImageUrl: { type: String, default: "" },
      heroVideoUrl: { type: String, default: "" },
      featuredPackageIds: [{ type: Schema.Types.ObjectId, ref: "Package" }],
      featuredCaseStudyIds: [{ type: Schema.Types.ObjectId, ref: "CaseStudy" }],
      clientLogos: { type: [{ _id: false, name: String, logoUrl: String }], default: [] },
      stats: { type: [{ _id: false, label: String, value: String }], default: [] },
    },
    navigation: {
      header: { type: [NavItemSchema], default: [] },
      footer: { type: [NavItemSchema], default: [] },
    },
    notifications: {
      enquiryRecipients: { type: [String], default: [] },
      careersRecipients: { type: [String], default: [] },
      whatsappEnabled: { type: Boolean, default: false },
      emailEnabled: { type: Boolean, default: false },
    },

    // Secrets — never returned by GET /api/settings, see SECRET_FIELDS.
    phonePeMerchantId: { type: String, default: "" },
    phonePeSaltKey: { type: String, default: "" },
    pinggoApiKey: { type: String, default: "" },
    pinggoUserId: { type: String, default: "" },
    pinggoVendorPhone: { type: String, default: "" },

    firebaseApiKey: { type: String, default: "" },
    firebaseAuthDomain: { type: String, default: "" },
    firebaseProjectId: { type: String, default: "" },
    firebaseMessagingSenderId: { type: String, default: "" },
    firebaseAppId: { type: String, default: "" },
    firebaseVapidKey: { type: String, default: "" },
  },
  { timestamps: true },
);

/** Redacted from every read response; writable but never readable. */
export const SECRET_FIELDS = [
  "phonePeSaltKey",
  "pinggoApiKey",
  "firebaseVapidKey",
] as const;

export default mongoose.models.Setting ||
  mongoose.model<ISetting>("Setting", SettingSchema);
