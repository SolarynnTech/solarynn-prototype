import React from "react";

const RootNavigation = ({title, backBtn = false}) => {
  const onBackButtonClick = () => {
    window.history.back();
  }

  return (
    <nav className="relative px-6 py-2">
      {backBtn && (
        <button type="button" className="absolute left-0 top-2" onClick={onBackButtonClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M12.7574 7.90662L4.66406 16L12.7574 24.0933" stroke="#191D31" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M27.3306 16H4.89062" stroke="#191D31" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        )}

      <h1 className="text-center">
        {title}
      </h1>
    </nav>
  );
}

export default RootNavigation;