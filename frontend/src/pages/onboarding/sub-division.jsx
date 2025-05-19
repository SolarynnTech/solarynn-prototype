import { CategorySelection } from '@/components/onboarding/CategorySelection';
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function () {
  const { domain, subDivision, setSubDivision } = useCategoriesStore();
  const supabase = useSupabaseClient();
  const {user} = useUserStore();

  const fetchSubDivisions = () => {
    return supabase
      .from("categories")
      .select("*")
      .eq("parent", domain.id);
  }

  const selectSubDivision = (category) => {
    setSubDivision({ ...category, level: "subdivision" });
  }

  const saveSubDivision = (id) => {
    return supabase
      .from("users")
      .update({ subdivision: id })
      .eq("id", user.id);
  }

  // TODO: properly handle no user or no domain
  if (!domain || !user) return null;

  return (
    <CategorySelection
      title="Focus"
      subtitle={domain?.title}
      description="Refining your details helps us improve your visibility across the platform"
      nextRoute="/onboarding"
      selectedCategory={subDivision}
      selectCategory={selectSubDivision}
      saveCategory={saveSubDivision}
      fetchCategories={fetchSubDivisions}
    />
  );
}
