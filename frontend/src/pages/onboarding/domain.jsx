import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

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

  const fetchCategories = async () => {
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("parent", role.id);

    console.log("categories", categories);

    if (categories) {
      setCategories(categories);
    }
  }

  useEffect(() => {
    if(role) {
      fetchCategories();
    }
  }, [role]);

  const selectDomain = async (category) => {
    const {data, error} = await supabase
      .from("users")
      .update({ domain: category.id })
      .eq("id",user.id);

    if (error) {
      console.error("Error updating role:", error);
      return;
    }

    setDomain({...category, level: "domain"});
  }


  // const categories = [
  //   {
  //     title: "Entertainment & Media",
  //     image: "/images/categories/sub-categories/entertainment_and_media.png",
  //     bg_color: "#F29797",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Music Industry",
  //     image: "/images/categories/sub-categories/music_industry.png",
  //     bg_color: "#A6BBF3",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Sports & Athletics",
  //     image: "/images/categories/sub-categories/sports_and_athletics.png",
  //     bg_color: "#D084D6",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Fashion & Modeling",
  //     image: "/images/categories/sub-categories/fashion_and_modeling.png",
  //     bg_color: "#AEF3B5",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Business & Finance",
  //     image: "/images/categories/sub-categories/business_and_finance.png",
  //     bg_color: "#F5BF6D",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Technology & Innovation",
  //     image: "/images/categories/sub-categories/technology_and_innovation.png",
  //     bg_color: "#C2E5FF",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Social & Digital Personalities",
  //     image:
  //       "/images/categories/sub-categories/social_and_digital_personalities.png",
  //     bg_color: "#F871B2",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Literature & Journalism",
  //     image: "/images/categories/sub-categories/literature_and_journalism.png",
  //     bg_color: "#5EEC8E",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Visual Arts & Design",
  //     image: "/images/categories/sub-categories/visual_arts_and_design.png",
  //     bg_color: "#FFECBD",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Politics & Government",
  //     image: "/images/categories/sub-categories/politics_and_government.png",
  //     bg_color: "#8C9DF7",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Academia & Thought Leadership",
  //     image:
  //       "/images/categories/sub-categories/academia_and_thought_leadership.png",
  //     bg_color: "#9BFCD3",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Activism & Humanitarian Work",
  //     image:
  //       "/images/categories/sub-categories/activism_and_humanitarian_work.png",
  //     bg_color: "#E8F096",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Religion & Spirituality",
  //     image: "/images/categories/sub-categories/religion_and_spirituality.png",
  //     bg_color: "#9BFCD3",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Law & Justice",
  //     image: "/images/categories/sub-categories/law_and_justice.png",
  //     bg_color: "#E8F096",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Medicine & Health",
  //     image: "/images/categories/sub-categories/medicine_and_health.png",
  //     bg_color: "#F29797",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Military & Defense",
  //     image: "/images/categories/sub-categories/military_and_defense.png",
  //     bg_color: "#A6BBF3",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Culinary & Hospitality",
  //     image: "/images/categories/sub-categories/culinary_and_hospitality.png",
  //     bg_color: "#D084D6",
  //     level: "sub-category",
  //   },
  //   {
  //     title: "Culture & Heritage",
  //     image: "/images/categories/sub-categories/culture_and_heritage.png",
  //     bg_color: "#AEF3B5",
  //     level: "sub-category",
  //   },
  // ];

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
