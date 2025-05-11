import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SelectDomain() {
  const router = useRouter();

  const { role, domain, setDomain } = useCategoriesStore();
  const [categories, setCategories] = useState([]);
  const supabase = useSupabaseClient();
  const {user} = useUserStore();

  const handleNext = () => {
    if (domain) {
      router.push("/onboarding/sub-division");
    }
  };

  useEffect(() => {
    // TODO: handle if the role was not selected
    if (!role) {
      return;
    }

    fetchCategories();

    async function fetchCategories() {
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("parent", role.id);

      if (categories) {
        setCategories(categories);
      }

      // TODO: handle error state
    }
  }, [role, setCategories]);

  const selectDomain = async (selectedDomain) => {
    const prevDomain = domain;

    try {
      const newDomain = { ...selectedDomain, level: "domain" };
      setDomain(newDomain);

      const { data, error } = await supabase
        .from("users")
        .update({ domain: selectedDomain.id })
        .eq("id", user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      // Rollback the changes
      setDomain(prevDomain);

      // TODO: display error to the user
      console.error("Error updating role:", error);
    }
  }

  return (
    <div>
      <RootNavigation title={"Domain"} backBtn={true} />

      <div className="pt-4">
        <h2>{role?.title}</h2>
        <h3 className="mb-4 font-medium">
          Please select an area of your expertise or interest
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.length && categories.map((category, index) => (
            <CategoryTile
              key={index}
              title={category.title}
              img_url={category.img_url}
              bg_color={category.color}
              isSelected={domain?.title === category.title}
              onClick={() => selectDomain(category)}
            />
          ))}
        </div>
      </div>

      <PrimaryBtn
        onClick={handleNext}
        title="Next"
        classes="block w-full mt-8"
      />
    </div>
  );
}
