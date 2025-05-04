
const UserPreview = ({
                       name = "",
                       link,
                       img_url,
                       width = "",
                       height = "",
                       bgColor = "gray-100"
}) => {
  return (
    <a
      href={link}
      className={`flex shrink-0 rounded-md items-center justify-center bg-${bgColor}`}
      style={{
        width: `${width ? width + "px" : "100%"}`,
        height: `${height ? height + "px" : "100%"}`,
        backgroundImage: `url(${img_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: `inset 0px 0px 10px rgba(0, 0, 0, 0.5)`,
      }}
    >
      <p style={{textShadow: `0 0 2px rgba(0,0,0,.2)`}} className="absolute bottom-2 left-2 truncate right-2 text-sm text-white z-[2]">{name}</p>
    </a>
  );
};

export default UserPreview;
