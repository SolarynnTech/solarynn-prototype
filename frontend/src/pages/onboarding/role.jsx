import { CategorySelection } from '@/components/onboarding/CategorySelection';
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function () {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const { role, setRole, setDomain, setSubDivision } = useCategoriesStore();

  const fetchRoles = () => {
    return supabase
      .from("categories")
      .select("*")
      .eq("is_role", true);
  };

  const selectRole = (category) => {
    setRole({ ...category, level: "role" });
  };

  const saveRole = async (id) => {
    // Reset the domain and subDivision when the role changes
    const { error, data } = await supabase
      .from("users")
      .update({ role: id, domain: null, subdivision: null })
      .eq("id", user?.id);

    if (!error) {
      setDomain(null);
      setSubDivision(null);
    }

    return { error, data };
  };

  // TODO: properly handle no user logged in
  if (!user) return null;

  return (
    <CategorySelection
      title="Role / Activity"
      subtitle={null}
      description="Please select a role that defines you the most, or what you belong to"
      nextRoute="/onboarding/domain"
      selectedCategory={role}
      selectCategory={selectRole}
      saveCategory={saveRole}
      fetchCategories={fetchRoles}
    />
  );
}

export async function getServerSideProps() {
  return {
    props: {}, // forces SSR
  };
}