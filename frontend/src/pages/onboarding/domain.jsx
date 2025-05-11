import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';


export default function SelectDomain() {
  const router = useRouter();

  const { role, domain, setDomain } = useCategoriesStore();
  const [categories, setCategories] = useState([]);
  const supabase = useSupabaseClient();
  const {user} = useUserStore();
  const [error, setError] = useState();
  const [isErrorToastShown, setIsErrorToastShown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (domain && !saving) {
      router.push("/onboarding/sub-division");
    }
  };

  /** @param {Error} err */
  const reportError = (err) => {
    console.error(err);
    setError(err?.message ?? String(err));
    setIsErrorToastShown(true);
  }

  const clearError = () => {
    setError(null);
    setIsErrorToastShown(false);
  }

  const dismissErrorToast = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsErrorToastShown(false)
  };

  useEffect(() => {
    // TODO: handle if the role was not selected
    if (!role) {
      return;
    }

    fetchCategories();

    async function fetchCategories() {
      clearError();
      setLoading(true);

      try {
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .eq("parent", role.id);

        if (!categories?.length) {
          throw new Error("No categories found for the selected role.");
        }

        setCategories(categories);
      } catch (error) {
        reportError(error);
      }

      setLoading(false);
    }
  }, [role, setCategories]);

  const selectDomain = async (selectedDomain) => {
    clearError();
    setSaving(true);
    const prevDomain = domain;

    try {
      const newDomain = { ...selectedDomain, level: "domain" };
      setDomain(newDomain);

      const { error } = await supabase
        .from("users")
        .update({ domain: selectedDomain.id })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      // Rollback the changes
      setDomain(prevDomain);
      reportError("Failed to save the domain");
    }

    setSaving(false);
  }

  return (
    <div>
      <RootNavigation title={"Domain"} backBtn={true} />

      <Snackbar
        open={isErrorToastShown}
        autoHideDuration={6000}
        onClose={dismissErrorToast}
        message={error}
      />

      { error && <Alert severity="error">{error}</Alert> }

      <div className="pt-4">
        <h2>{role?.title}</h2>
        <h3 className="mb-4 font-medium">
          Please select an area of your expertise or interest
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {loading && <>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
            <div className='animate-pulse bg-slate-200 h-24 rounded-lg'></div>
          </>}
          { !loading && categories.map((category, index) => (
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
        disabled={loading || !domain }
        onClick={handleNext}
        title="Next"
        classes="block w-full mt-8"
      />
    </div>
  );
}
