import { CategorySelection } from '@/components/onboarding/CategorySelection';
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {useEffect} from "react";

export default function () {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const { role, setRole, setDomain, setSubDivision } = useCategoriesStore();

  const fetchRoles = async () => {
    const {data, error} = await supabase
      .from("categories")
      .select("*")
      .eq("is_role", true);

    data.sort((a, b) => a.number - b.number);

    return { data, error};
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
      title="Select Your User Type"
      subtitle={null}
      description="How would you like to be seen on the platform? This will define your experience and can’t be changed later"
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