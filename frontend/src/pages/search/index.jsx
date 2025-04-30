import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../components/Nav/Nav";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";

const TABLES = [
  { title: "Ad Agencies", table: "ad_agencies_data", column: "agency_name", displayField: "agency_name" },
  { title: "Business Figures", table: "business_figures_data", column: "name", displayField: "name" },
  { title: "Entertainment Figures", table: "entertainment_figures_data", column: "name", displayField: "name" },
  { title: "Fashion Figures", table: "fashion_figures_data", column: "name", displayField: "name" },
  { title: "Literature Journalism Figures", table: "literature_journalism_figures_data", column: "name", displayField: "name" },
  { title: "Music Figures", table: "music_figures_data", column: "name", displayField: "name" },
  { title: "Partial Ad Agencies", table: "partial_ad_agencies_data", column: "agency_name", displayField: "agency_name" },
  { title: "Education", table: "partial_education_data", column: "official_name", displayField: "official_name" },
  { title: "Fashion Image Agencies", table: "partial_fashion_image_agencies_data", column: "agency_name", displayField: "agency_name" },
  { title: "Political Figures", table: "political_figures_data", column: "name", displayField: "name" },
  { title: "Social Media Figures", table: "social_media_figures_data", column: "name", displayField: "name" },
  { title: "Sports Figures", table: "sports_figures_data", column: "name", displayField: "name" },
  { title: "Technology Figures", table: "technology_figures_data", column: "name", displayField: "name" },
  { title: "Visual Arts Figures", table: "visual_arts_figures_data", column: "name", displayField: "name" },
];

const DETAIL_FIELDS = [
  "description", "service_types", "locations", "companies", "occupation", "major_productions",
  "agency", "publishers", "syndicates", "genre", "record_label", "chart_data",
  "headquarters", "party", "position", "platform_specialty_fields", "sport_type",
  "teams", "companies_built", "styles", "galleries_exhibits"
];

const LINK_FIELDS = [
  { key: "website", label: "Website" },
  { key: "imdb_link", label: "IMDB Link" }
];

export default function Search() {
  const router = useRouter();
  const { searchQuery } = router.query;

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setSearchResults([]);
      setError(null);

      try {
        const allResults = [];

        for (const table of TABLES) {
          const { data, error } = await supabase
            .from(table.table)
            .select("*")
            .ilike(table.column, `%${searchQuery}%`);

          if (error) {
            console.error(`Error fetching from ${table.title}:`, error.message);
            continue;
          }

          if (data && data.length > 0) {
            allResults.push({ title: table.title, displayField: table.displayField, data });
          }
        }

        setSearchResults(allResults);
      } catch (err) {
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    }

    if (searchQuery) {
      fetchAllData();
    }
  }, [searchQuery, supabase]);

  return (
    <div>
      <RootNavigation title="Search Results" backBtn={true} />

      <div className="pt-12">
        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {!loading && searchQuery && searchResults.length > 0 ? (
            <div className="">
              {searchResults.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">{group.title}</h2>
                  <ul>
                    {group.data.map((item, itemIndex) => (
                      <li key={itemIndex} className="mb-4 pb-4 border-b border-gray-200">
                        <a
                          href={`/details/${item.id}`}
                          className="text-blue-500 hover:underline font-medium"
                        >
                          {item[group.displayField]}
                        </a>

                        {/* Render standard fields */}
                        {DETAIL_FIELDS.map((field) =>
                          item[field] ? (
                            <p key={field} className="text-gray-600">
                              <b>{field
                                .split("_")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")}:</b> {item[field]}
                            </p>
                          ) : null
                        )}

                        {/* Render link fields */}
                        {LINK_FIELDS.map(
                          ({ key, label }) =>
                            item[key] && (
                              <a
                                key={key}
                                href={item[key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline block"
                              >
                                {label}
                              </a>
                            )
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <h1 className="text-2xl font-bold">No results found</h1>
            )
          )}
        </div>
      </div>
    </div>
  );
}