import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Mail, Bell, Settings } from "lucide-react";
import Favorites from "../../components/home/Favorites";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import YourConnections from "../../components/home/YourConnections";
import TakeALook from "../../components/home/TakeAlook";
import NavigationBar from "../../components/profile/NavigationBar";
import CategoryTile from "../../components/tiles/CategoryTile";
import SearchBar from "../../components/SearchBar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default function HomePage() {
  const { user } = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_role", true);

    if (error) {
      console.error("Failed to fetch categories:", error);
    } else {
      setCategories(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const universe = [
    { id: 1, title: "Public Figures", img_url: "", color: "#F29797", link: "public_figures" },
    { id: 2, title: "Fashion Brands", img_url: "", color: "#A6BBF3", link: "fashion_brands" },
    { id: 3, title: "Media / Publications", img_url: "", color: "#D084D6", link: "media" },
    { id: 4, title: "Industry Experts", img_url: "", color: "#AEF3B5", link: "industry" },
    { id: 5, title: "Companies", img_url: "", color: "#F5BF6D", link: "companies" },
    { id: 6, title: "Entities", img_url: "", color: "#C2E5FF", link: "entities" },
    { id: 7, title: "Agencies", img_url: "", color: "#F871B2", link: "agencies" },
    { id: 8, title: "Events", img_url: "", color: "#5EEC8E", link: "events" },
    { id: 9, title: "Shop", img_url: "", color: "#FFECBD", link: "shop" },
    { id: 10, title: "For Sale", img_url: "", color: "#8C9DF7", link: "for_sale" },
    { id: 11, title: "Book Talent", img_url: "", color: "#9BFCD3", link: "book_talent" },
    { id: 12, title: "On Loan", img_url: "", color: "#E8F096", link: "on_loan" },
    { id: 13, title: "Gifting", img_url: "", color: "#D084D6", link: "gifting" },
  ];

  return (
    <div className="pb-8">
      <nav className="flex items-center justify-between relative py-2 gap4 mb-6">
        <h1>Welcome {user?.name}</h1>
        <div className="flex items-center justify-between gap-4">
          <Mail className="cursor-pointer hover:text-green-800" onClick={() => router.push("/mail")} />
          <Bell className="cursor-pointer hover:text-green-800" onClick={() => router.push("/notifications")} />
          <Settings className="cursor-pointer hover:text-green-800" onClick={() => router.push("/settings")} />
        </div>
      </nav>

      <SearchBar />

      <Favorites />
      <RecentlyViewed />
      <YourConnections />
      <TakeALook />

      <h2 className="mb-8">Our Universe</h2>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-12">
          {universe.map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              img_url={category.img_url}
              bg_color={category.color}
              onClick={() => router.push("/categories/" + category.id)}
            />
          ))}
        </div>
      )}

      <NavigationBar />
    </div>
  );
}


export async function getServerSideProps(context) {
  const supabase = createPagesServerClient(context);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      initialSession: session,
    },
  };
}