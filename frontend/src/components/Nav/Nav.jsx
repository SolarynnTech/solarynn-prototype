import React from "react";
import { ChevronLeft } from "lucide-react";

const RootNavigation = ({title, backBtn = false}) => {
  const onBackButtonClick = () => {
    window.history.back();
  }

  return (
    <nav className="absolute px-6 py-4 right-0 top-0 left-0 bg-gray-50 border-b border-gray-200 z-10">
      {backBtn && (
        <button type="button" className="absolute left-0 top-1.5 outline-0 bg-transparent border-0 p-1.5 hover:text-indigo-500" onClick={onBackButtonClick}>
          <ChevronLeft/>
        </button>
        )}

      <h2 className="text-center text-xs uppercase text-gray-700 tracking-widest">
        {title}
      </h2>
    </nav>
  );
}

export default RootNavigation;