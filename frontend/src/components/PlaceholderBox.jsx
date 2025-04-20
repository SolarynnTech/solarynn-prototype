const PlaceholderBox = ({
  width = "120",
  height = "120",
  bgColor = "gray-100",
}) => {
  return (
    <div
      className={`flex shrink-0 rounded-md items-center justify-center bg-${bgColor}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    ></div>
  );
};

export default PlaceholderBox;
