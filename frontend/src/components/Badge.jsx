const Badge = ({ children, textColor, text = "", bgColor }) => {
  return (
    <div
      className={`inline-flex gap-1 items-center px-3 py-1 text-sm font-medium text-${textColor} bg-${bgColor} rounded-md`}
    >
      {children}
      {text}
    </div>
  );
};

export default Badge;
