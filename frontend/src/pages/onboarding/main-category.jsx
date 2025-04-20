import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../components/Nav/Nav";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import CategoryTile from "../../components/tiles/CategoryTile";
import useCategoriesStore from "../../stores/useCategoriesStore";

export default function SelectMainCategory() {
  const router = useRouter();

  const { mainCategory, setMainCategory } = useCategoriesStore();

  const handleNext = () => {
    if (mainCategory) {
      router.push("/onboarding/sub-category");
    }
  };

  const categories = [
    {
      title: "Public Figures",
      image: "/images/categories/main/public_figures.png",
      bg_color: "#F29797",
      level: "main",
    },
    {
      title: "Fashion Brands",
      image: "/images/categories/main/fashion_brands.png",
      bg_color: "#A6BBF3",
      level: "main",
    },
    {
      title: "Media / Publications",
      image: "/images/categories/main/media_publications.png",
      bg_color: "#D084D6",
      level: "main",
    },
    {
      title: "Industry Experts",
      image: "/images/categories/main/industry_experts.png",
      bg_color: "#AEF3B5",
      level: "main",
    },
    {
      title: "Companies",
      image: "/images/categories/main/companies.png",
      bg_color: "#F5BF6D",
      level: "main",
    },
    {
      title: "Entities",
      image: "/images/categories/main/entities.png",
      bg_color: "#C2E5FF",
      level: "main",
    },
    {
      title: "Agencies",
      image: "/images/categories/main/agencies.png",
      bg_color: "#F871B2",
      level: "main",
    },
  ];

  return (
    <div>
      <RootNavigation title={"Main Category"} backBtn={true} />

      <div className="pt-4">
        <h3 className="mb-4 font-medium">
          Please select 1 of {categories.length} that <br />
          define you the most.
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <CategoryTile
              key={index}
              title={category.title}
              img_url={category.image}
              bg_color={category.bg_color}
              isSelected={mainCategory?.title === category.title}
              onClick={() => setMainCategory(category)}
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
