const PlaceholderBox = ({ width = "", height = "", bgColor = "gray-100" }) => {
  return (
    <div
      className={`flex shrink-0 rounded-md items-center justify-center bg-${bgColor}`}
      style={{
        width: `${width ? width + "px" : "100%"}`,
        height: `${height ? height + "px" : "100%"}`,
      }}
    ></div>
  );
};

export default PlaceholderBox;
