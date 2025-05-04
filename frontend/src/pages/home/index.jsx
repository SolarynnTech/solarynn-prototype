import React, { useState } from "react";
import { useRouter } from "next/router";
import { Mail, Bell, Settings, Search } from "lucide-react";
import Favorites from "../../components/home/Favorites";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import YourConnections from "../../components/home/YourConnections";
import TakeALook from "../../components/home/TakeAlook";
import NavigationBar from "../../components/profile/NavigationBar";
import CategoryTile from "../../components/tiles/CategoryTile";
import SearchBar from "../../components/SearchBar";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import useUserStore from "@/stores/useUserStore";

export default function HomePage({ categories }) {
  const {user} = useUserStore();

  return (
    <div className="pb-8">
      <nav className="flex items-center justify-between relative py-2 gap4 mb-6">
        <h1>Welcome {user?.name}</h1>
        <div className="flex items-center justify-between gap-4">
          <Mail />
          <Bell />
          <Settings />
        </div>
      </nav>

      <SearchBar/>

      <Favorites />
      <RecentlyViewed />
      <YourConnections />
      <TakeALook />

      <h2 className="mb-8">Our Universe</h2>

      <div className="grid grid-cols-2 gap-3 mb-12">
        {categories?.length && categories.map((category, index) => (
          <CategoryTile
            key={index}
            title={category.title}
            img_url={category.img_url}
            bg_color={category.color}
            onClick={() => {
              // Handle category click
            }}
          />
        ))}
      </div>

      <NavigationBar />
    </div>
  );
}

export async function getServerSideProps(context) {
  const supabase = createPagesServerClient(context);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_role", true);

  return {
    props: {
      categories: data || [],
    },
  };
}
