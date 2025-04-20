import React, { useMemo } from "react";
import RootNavigation from "../../components/Nav/Nav";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import CategoryTile from "../../components/tiles/CategoryTile";
import useCategoriesStore from "../../stores/useCategoriesStore";
import { useRouter } from "next/router";

const SelectCategoriesPage = () => {
  const { mainCategory, subCategory, subDivision } = useCategoriesStore();
  const router = useRouter();

  const categories = useMemo(() => {
    return [
      mainCategory || {
        title: "Select main category",
        isEmpty: true,
      },
      subCategory || {
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
  }, [mainCategory, subCategory, subDivision]);

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
                  case "main":
                    router.push("/onboarding/main-category");
                    break;
                  case "sub-category":
                    router.push("/onboarding/sub-category");
                    break;
                  case "sub-division":
                    router.push("/onboarding/sub-division");
                    break;
                  default:
                    router.push("/onboarding/main-category");
                }
              }}
              img_url={category.image}
              bg_color={category.bg_color}
              disabled={category.disabled}
              isEmpty={category.isEmpty}
            />
          ))}
        </div>
      </div>

      <PrimaryBtn
        onClick={() => {
          router.push("/questionnaire/1/1");
        }}
        disabled={!mainCategory || !subCategory || !subDivision}
        title="Confirm"
        classes="w-full block"
      />
    </div>
  );
};

export default SelectCategoriesPage;
