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
  const [loading, setLoading] = useState(true);
  const [universeCategories, setUniverseCategories] = useState([]);

  const categoryNamesExcluded = [
    "Book Talent",
  ];

  const fetchUniverseCategories = async () => {
    const { data, error } = await supabase.from("universe_categories").select("*");

    if (error) {
      console.error("Failed to fetch categories:", error);
    } else {
      setUniverseCategories(data);
    }
    setLoading(false);
  };

  // const fetchCategories = async () => {
  //   const { data, error } = await supabase
  //     .from("categories")
  //     .select("*")
  //     .eq("is_role", true);
  //   if (error) {
  //     console.error("Failed to fetch categories:", error);
  //   } else {
  //     setCategories(data);
  //   }
  // };

  useEffect(() => {
    // fetchCategories();
    fetchUniverseCategories();
  }, []);

  return (
    <div className="pb-8">
      <nav className="flex items-start justify-between relative gap4 mb-6">
        <h1>Welcome {user?.name || user?.email}</h1>
        <div className="flex items-center justify-between gap-4 pt-2">
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
          {universeCategories?.sort((a, b) => {
            const aAvailable = !categoryNamesExcluded.includes(a.title);
            const bAvailable = !categoryNamesExcluded.includes(b.title);
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
            }
          ).map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              img_url={category.img_url}
              isAvailable={!categoryNamesExcluded.includes(category.title)}
              bg_color={category.color}
              onClick={() => router.push("/universe-categories/" + category.id)}
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
