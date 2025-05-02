import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../components/Nav/Nav";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import CategoryTile from "../../components/tiles/CategoryTile";
import useCategoriesStore from "../../stores/useCategoriesStore";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

export default function SelectDomain() {
  const router = useRouter();

  const { domain, subDivision, setSubDivision } = useCategoriesStore();

  const [categories, setCategories] = useState([]);
  const supabase = useSupabaseClient();
  const {user} = useUserStore();

  const handleNext = () => {
    if (subDivision) {
      router.push("/onboarding");
    }
  };

  const fetchCategories = async () => {
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("parent", domain.id);

    console.log("categories", categories);

    if (categories) {
      setCategories(categories);
    }
  }

  useEffect(() => {
    if(domain) {
      fetchCategories();
    }
  }, [domain]);

  const selectSubDivision = async (category) => {
    const {data, error} = await supabase
      .from("users")
      .update({ subdivision: category.id })
      .eq("id",user.id);

    if (error) {
      console.error("Error updating role:", error);
      return;
    }

    setSubDivision({...category, level: "subdivision"});
  }

  // const categories = [
  //   {
  //     title: "Actor & Actress",
  //     image: "/images/categories/sub-divisions/actor_and_actress.png",
  //     bg_color: "#F29797",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Director & Filmmaker",
  //     image: "/images/categories/sub-divisions/director_and_filmmaker.png",
  //     bg_color: "#A6BBF3",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "TV Host & Presenter",
  //     image: "/images/categories/sub-divisions/tv_host_and_presenter.png",
  //     bg_color: "#D084D6",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Comedians",
  //     image: "/images/categories/sub-divisions/comedians.png",
  //     bg_color: "#AEF3B5",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Reality TV Personality",
  //     image: "/images/categories/sub-divisions/reality_tv_personality.png",
  //     bg_color: "#F5BF6D",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Talk Show Host",
  //     image: "/images/categories/sub-divisions/talk_show_host.png",
  //     bg_color: "#C2E5FF",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Screenwriter & Scriptwriter",
  //     image:
  //       "/images/categories/sub-divisions/screenwriter_and_scriptwriter.png",
  //     bg_color: "#F871B2",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Producers",
  //     image: "/images/categories/sub-divisions/producers.png",
  //     bg_color: "#5EEC8E",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Casting Director & Talent Booker",
  //     image:
  //       "/images/categories/sub-divisions/casting_director_and_talent_booker.png",
  //     bg_color: "#FFECBD",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "TV & Radio Personality",
  //     image: "/images/categories/sub-divisions/tv_and_radio_personality.png",
  //     bg_color: "#8C9DF7",
  //     level: "sub-division",
  //   },
  //   {
  //     title: "Other",
  //     image: "/images/categories/sub-divisions/other.png",
  //     bg_color: "#9BFCD3",
  //     level: "sub-division",
  //   },
  // ];

  return (
    <div>
      <RootNavigation title={"Subdivision"} backBtn={true} />

      <div className="pt-4">
        <h2>{domain?.title}</h2>
        <h3 className="mb-4 font-medium">
          Please select 1 of {categories.length} that <br />
          define you the most.
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <CategoryTile
              key={index}
              title={category.title}
              img_url={category.img_url}
              bg_color={category.color}
              isSelected={subDivision?.title === category.title}
              onClick={() => selectSubDivision(category)}
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
