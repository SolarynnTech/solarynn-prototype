import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


/**
 * Displays a list of Roles, Domains or Subdivisions that the user can select from.
 */
export function CategorySelection({ title, subtitle, description, selectedCategory, selectCategory, saveCategory, fetchCategories, nextRoute }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState();
  const [isErrorToastShown, setIsErrorToastShown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (selectedCategory && !saving) {
      router.push(nextRoute);
    }
  };

  /** @param {Error} err */
  const reportError = (err) => {
    setError(err?.message ?? String(err));
    setIsErrorToastShown(true);
  };

  const clearError = () => {
    setError(null);
    setIsErrorToastShown(false);
  };

  const dismissErrorToast = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsErrorToastShown(false);
  };

  useEffect(() => {
    loadCategories();

    async function loadCategories() {
      clearError();
      setLoading(true);

      try {
        const { data: categories, error } = await fetchCategories();

        if (error) {
          throw error;
        }

        if (!categories?.length) {
          throw new Error("No categories found.");
        }

        setCategories(categories);
      } catch (error) {
        console.error(error);
        reportError(error);
      }

      setLoading(false);
    }
  }, [setCategories]);

  const selectDomain = async (selectedDomain) => {
    clearError();
    setSaving(true);
    const prevCategory = selectedCategory;
    selectCategory(selectedDomain);

    try {
      // TODO: consider saving the selection on "Next" button click, and not on select
      const { error } = await saveCategory(selectedDomain.id);

      if (error) throw error;
    } catch (err) {
      // Rollback the changes
      selectCategory(prevCategory);

      console.error(error);
      reportError("Failed to save the domain");
    }

    setSaving(false);
  };

  return (
    <div className={"pt-8"}>
      <RootNavigation title={title} backBtn={true} />

      <Snackbar open={isErrorToastShown} autoHideDuration={6000} onClose={dismissErrorToast} message={error} />

      {error && <Alert severity="error">{error}</Alert>}

      <div className="pt-4">
        <h2>{subtitle}</h2>
        <h3 className="mb-8 font-medium">{description}</h3>

        <div className="grid grid-cols-1 gap-3">
          {loading && (
            <>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
              <div className="animate-pulse bg-slate-300 h-14 rounded-lg"></div>
            </>
          )}
          {!loading &&
            categories.map((category, index) => (
              <CategoryTile
                key={index}
                title={category.title}
                img_url={category.img_url}
                bg_color={category.color}
                isSelected={selectedCategory?.id === category.id}
                onClick={() => selectDomain(category)}
              />
            ))}
        </div>
      </div>

      <PrimaryBtn disabled={loading || !selectCategory} onClick={handleNext} title="Next" classes="block w-full mt-8" />
    </div>
  );
}
