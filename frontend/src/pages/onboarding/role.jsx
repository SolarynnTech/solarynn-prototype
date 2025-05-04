import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

export default function SelectRole() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const { role, setRole } = useCategoriesStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_role", true);

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }

    setLoading(false);
  };

  const selectRole = async (category) => {
    console.log("user", user);
    const { data, error } = await supabase
      .from("users")
      .update({ role: category?.id })
      .eq("id", user?.id);

    if (error) {
      console.error("Error updating role:", error);
      return;
    }

    setRole({ ...category, level: "role" });
  };

  const handleNext = () => {
    if (role) {
      router.push("/onboarding/domain");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      <RootNavigation title={"Role / Activity"} backBtn={true} />

      <div className="pt-4">
        <h3 className="mb-4 font-medium">
          Please select 1 of {categories.length} roles that define you the most,
          or what you belong to
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              img_url={category.img_url}
              bg_color={category.color}
              isSelected={role?.title === category.title}
              onClick={() => selectRole(category)}
            />
          ))}
        </div>
      </div>

      <PrimaryBtn
        onClick={handleNext}
        disabled={!role}
        title="Next"
        classes="block w-full mt-8"
      />
    </div>
  );
}