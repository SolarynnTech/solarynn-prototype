import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import CategoryTile from "@/components/tiles/CategoryTile";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

export default function Category() {
  const router = useRouter();
  const id = router.query.id;

  const [categories, setCategories] = useState([]);
  const supabase = useSupabaseClient();
  const {user} = useUserStore();
  const [role, setRole] = useState(null);

  const fetchCategories = async () => {
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("parent", id);

    if (categories) {
      setCategories(categories);
    }
  }

  const fetchTitle = async () => {
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (category) {
      setRole(category);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchTitle();
  }, [id]);

  return (
    <div className="pt-8">
      <RootNavigation title={"Categories"} backBtn={true} />

      <div className="pt-4">
        <h2>{role?.title}</h2>
        <h3 className="mb-4 font-medium">
          Please select an area you want to see users from
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.length && categories.map((category, index) => (
            <CategoryTile
              key={index}
              title={category.title}
              img_url={category.img_url}
              bg_color={category.color}
              onClick={() => router.push("/profiles/" + category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}