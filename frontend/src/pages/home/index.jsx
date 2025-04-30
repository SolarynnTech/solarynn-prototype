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

export default function HomePage() {
  const router = useRouter();

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
    <div className="pb-8">
      <nav className="flex items-center justify-between relative py-2 gap4 mb-6">
        <h1>Welcome Denzel</h1>
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
        {categories.map((category, index) => (
          <CategoryTile
            key={index}
            title={category.title}
            img_url={category.image}
            bg_color={category.bg_color}
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
