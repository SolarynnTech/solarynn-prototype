import { CategorySelection } from '@/components/onboarding/CategorySelection';
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";


export default function () {
  const { role, domain, setDomain, setSubDivision } = useCategoriesStore();
  const supabase = useSupabaseClient();
  const {user} = useUserStore();

  const fetchDomains = () => {
    return supabase
      .from("categories")
      .select("*")
      .eq("parent", role.id);
  };

  const selectDomain = (selectedDomain) => {
    const newDomain = { ...selectedDomain, level: "domain" };
    setDomain(newDomain);
  }

  const saveDomain = async (id) => {
    // Reset subdivision when the domain changes
    const { error, data } = await supabase
      .from("users")
      .update({ domain: id, subdivision: null })
      .eq("id", user.id)

    if (!error) {
      setSubDivision(null);
    }

    return { error, data };
  }

  // TODO: properly handle if the role was not selected
  if (!role || !user) return null;

  return (
    <CategorySelection
      title="Categories"
      subtitle={role?.title}
      description="What area best describes your work? This will shape how others see you, and it can’t be changed later"
      nextRoute="/onboarding/sub-division"
      selectedCategory={domain}
      selectCategory={selectDomain}
      saveCategory={saveDomain}
      fetchCategories={fetchDomains}
      />
  );
}
