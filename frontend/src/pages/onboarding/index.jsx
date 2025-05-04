import React, { useMemo } from "react";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import { useRouter } from "next/router";

const SelectCategoriesPage = () => {
  const { role, domain, subDivision } = useCategoriesStore();
  const router = useRouter();

  const categories = useMemo(() => {
    return [
      role || {
        title: "Select main category",
        isEmpty: true,
      },
      domain || {
        title: "Select sub category",
        isEmpty: true,
        disabled: true,
      },
      subDivision || {
        title: "Select under sub category",
        isEmpty: true,
        disabled: true,
      },
    ];
  }, [role, domain, subDivision]);

  return (
    <div className="flex flex-col h-full justify-between grow">
      <RootNavigation title="Select Categories" />

      <div className="flex grow flex-col justify-center">
        <h3 className="mb-4">You have selected</h3>

        <div className="grid grid-cols-1 gap-4 w-full">
          {categories.map((category, index) => (
            <CategoryTile
              key={index}
              title={category.title}
              onClick={() => {
                if (category.disabled) return;
                switch (category.level) {
                  case "role":
                    router.push("/onboarding/role");
                    break;
                  case "domain":
                    router.push("/onboarding/domain");
                    break;
                  case "subdivision":
                    router.push("/onboarding/sub-division");
                    break;
                  default:
                    router.push("/onboarding/role");
                }
              }}
              img_url={category.img_url}
              bg_color={category.color}
              disabled={category.disabled}
              isEmpty={category.isEmpty}
            />
          ))}
        </div>
      </div>

      <PrimaryBtn
        onClick={() => {
          router.push("/questionnaire");
        }}
        disabled={!role || !domain || !subDivision}
        title="Confirm"
        classes="w-full block"
      />
    </div>
  );
};

export default SelectCategoriesPage;
