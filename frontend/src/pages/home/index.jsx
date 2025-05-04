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
          {categories.map((category) => (
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