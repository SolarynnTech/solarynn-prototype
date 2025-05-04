import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import useProfilesStore from "@/stores/useProfilesStore";

export default function Search() {
  const router = useRouter();
  const { searchQuery } = router.query;
  const { profiles, DETAIL_FIELDS, LINK_FIELDS } = useProfilesStore();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setSearchResults([]);
      setError(null);

      try {
        const allResults = [];

        profiles.forEach((profile) => {
          if(profile.name === searchQuery || profile.agency_name === searchQuery || profile.official_name === searchQuery) {
            const { __title, __displayField, ...rest } = profile;
            const group = allResults.find((g) => g.title === __title);

            if (group) {
              group.data.push({ ...rest, id: profile.id });
            } else {
              allResults.push({
                title: __title,
                displayField: __displayField,
                data: [{ ...rest, id: profile.id }],
              });
            }
          }
        })

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
  }, [searchQuery, profiles]);

  return (
    <div>
      <RootNavigation title="Search Results" backBtn={true} />

      <div className="pt-12">

        <SearchBar/>

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
                          href={`/profile/${item.id}`}
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