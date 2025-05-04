import { create } from "zustand";

const useUserStore = create((set) => ({
  profiles: null,

  ALL_FIELDS: [
    { name: "Description", key: "description" },
    { name: "Service Types", key: "service_types" },
    { name: "Industries Served", key: "industries_served" },
    { name: "Locations", key: "locations" },
    { name: "Top Clients", key: "top_clients" },
    { name: "Companies", key: "companies" },
    { name: "Years Active", key: "years_active" },
    { name: "Occupation", key: "occupation" },
    { name: "Platform Affiliation", key: "platform_affiliation" },
    { name: "Fashion Weeks", key: "fashion_weeks" },
    { name: "Campaigns", key: "campaigns" },
    { name: "Case Studies", key: "case_studies" },
    { name: "Platform Integrations", key: "platform_integrations" },
    { name: "Featured Work", key: "featured_work" },
    { name: "Net Worth", key: "net_worth" },
    { name: "Brand Types", key: "brand_types" },
    { name: "Industry Sectors", key: "industry_sectors" },
    { name: "Year Established", key: "year_established" },
    { name: "Revenue", key: "revenue" },
    { name: "Major Productions", key: "major_productions" },
    { name: "Agency", key: "agency" },
    { name: "Publishers", key: "publishers" },
    { name: "Bestsellers List", key: "bestsellers_list" },
    { name: "Columns", key: "columns" },
    { name: "Syndicates", key: "syndicates" },
    { name: "Genre", key: "genre" },
    { name: "Record Label", key: "record_label" },
    { name: "Chart Data", key: "chart_data" },
    { name: "Tour Data", key: "tour_data" },
    { name: "Headquarters", key: "headquarters" },
    { name: "Party", key: "party" },
    { name: "Position", key: "position" },
    { name: "Follower Count", key: "follower_count" },
    { name: "Engagement Rate", key: "engagement_rate" },
    { name: "Position Details", key: "position_details" },
    { name: "Platform Specialty Fields", key: "platform_specialty_fields" },
    { name: "Platform Specialty Platforms", key: "platform_specialty_platforms" },
    { name: "Sport Type", key: "sport_type" },
    { name: "Teams", key: "teams" },
    { name: "League", key: "league" },
    { name: "Olympic Data", key: "olympic_data" },
    { name: "Companies Built", key: "companies_built" },
    { name: "Styles", key: "styles" },
    { name: "Patents", key: "patents" },
    { name: "Product Contributions", key: "product_contributions" },
    { name: "Galleries Exhibits", key: "galleries_exhibits" },
    { name: "Mediums", key: "mediums" }
  ],

  DETAIL_FIELDS: [
    "description", "service_types", "locations", "companies", "occupation", "major_productions",
    "agency", "publishers", "syndicates", "genre", "record_label", "chart_data",
    "headquarters", "party", "position", "platform_specialty_fields", "sport_type",
    "teams", "companies_built", "styles", "galleries_exhibits"
  ],

// { name: "Description", key: "description" },
// { name: "Service Types", key: "service_types" },
// { name: "Locations", key: "locations" },
// { name: "Companies", key: "companies" },
// { name: "Occupation", key: "occupation" },
// { name: "Major Productions", key: "major_productions" },
// { name: "Agency", key: "agency" },
// { name: "Publishers", key: "publishers" },
// { name: "Syndicates", key: "syndicates" },
// { name: "Genre", key: "genre" },
// { name: "Record Label", key: "record_label" },
// { name: "Chart Data", key: "chart_data" },
// { name: "Headquarters", key: "headquarters" },
// { name: "Party", key: "party" },
// { name: "Position", key: "position" },
// { name: "Platform Specialty Fields", key: "platform_specialty_fields" },
// { name: "Sport Type", key: "sport_type" },
// { name: "Teams", key: "teams" },
// { name: "Companies Built", key: "companies_built" },
// { name: "Styles", key: "styles" },
// { name: "Galleries Exhibits", key: "galleries_exhibits" }

  LINK_FIELDS: [
    { key: "website", label: "Website" },
    { key: "imdb_link", label: "IMDB Link" }
  ],

  setProfiles: (profiles) => set({ profiles }),
}));

export default useUserStore;