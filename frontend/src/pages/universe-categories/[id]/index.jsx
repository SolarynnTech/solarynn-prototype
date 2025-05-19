import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import CategoryTile from "@/components/tiles/CategoryTile";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function UniverseCategories() {
  const { id } = useRouter().query;
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [categories, setCategories] = useState([]);
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const catsQuery = supabase
      .from("universe_sub_categories")
      .select("*")
      .eq("universe-category", id);

    const colorQuery = supabase
      .from("universe_categories")
      .select("color")
      .eq("id", id)
      .single();

    Promise.allSettled([catsQuery, colorQuery])
      .then(([catsRes, colorRes]) => {
        if (catsRes.status === "fulfilled" && !catsRes.value.error) {
          setCategories(catsRes.value.data);
        } else {
          console.error(
            "Failed to fetch sub-categories:",
            catsRes.reason || catsRes.value.error
          );
        }

        if (colorRes.status === "fulfilled" && !colorRes.value.error) {
          setColor(colorRes.value.data.color);
        } else {
          console.warn(
            "Failed to fetch category color:",
            colorRes.reason || colorRes.value.error
          );
          setColor("grey");
        }
      })
      .catch((e) => {
        console.error("Unexpected error:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="pt-8">
      <RootNavigation title={"Categories"} backBtn={true}/>

      <div className="pt-4">
        <h3 className="mb-4 font-medium">Please select subcategory</h3>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No subcategories were found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <CategoryTile
                key={index}
                title={category.title}
                img_url={category.img_url}
                bg_color={color}
                onClick={() => router.push("/universe-categories/" + id + "/" + category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
