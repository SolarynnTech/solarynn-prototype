import {Search} from "lucide-react";
import React from "react";
import { useRouter } from "next/router";

const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="flex items-center justify-between py-3 px-4 relative rounded-xl border border-gray-400 bg-gray-100 mb-12">
      <input
        type="text"
        onChange={e => {
          setSearchQuery(e.target.value);
        }}
        value={searchQuery}
        className="border-0 grow block bg-transparent text-black placeholder:text-gray-500 focus:outline-none"
        placeholder="Type Here For Search"
        onKeyDown={key => {
          if (key.key === "Enter") {
            // Handle search
            router.push(`/search?searchQuery=${encodeURIComponent(searchQuery)}`);
          }
        }}
      />
      <Search color={"#9ca3af"} onClick={()=> {
        // Handle search
        router.push(`/search?searchQuery=${encodeURIComponent(searchQuery)}`);
      }} />
    </div>
  );
}

export default SearchBar;