import React from "react";
import { ChevronLeft } from "lucide-react";

const RootNavigation = ({title, backBtn = false}) => {
  const onBackButtonClick = () => {
    window.history.back();
  }

  return (
    <nav className="relative px-6 py-2">
      {backBtn && (
        <button type="button" className="absolute left-0 top-2 outline-0 bg-transparent border-0 p-1.5 hover:text-green-800" onClick={onBackButtonClick}>
          <ChevronLeft/>
        </button>
        )}

      <h1 className="text-center">
        {title}
      </h1>
    </nav>
  );
}

export default RootNavigation;