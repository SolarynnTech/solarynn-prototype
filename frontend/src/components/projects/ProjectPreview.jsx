const ProjectPreview = ({
                          name    = "",
                          link,
                          img_url,
                          width   = 150,
                          height  = 150,
                          bgColor = "#F3F4F6"
                        }) => (
  <a
    href={link}
    className="relative flex shrink-0 items-center justify-center rounded-md overflow-hidden"
    style={{
      width:           `${width}px`,
      height:          `${height}px`,
      backgroundColor: bgColor,
      boxShadow:       "inset 0 -30px 25px -10px rgba(0,0,0,0.25)",
    }}
  >
    {img_url && (
      <img
        src={img_url}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}

    <div className="absolute inset-0 bg-black bg-opacity-20" />

    <p
      className="absolute bottom-1 left-2 right-2 truncate text-sm font-semibold text-white"
      style={{ textShadow: "0 0 2px rgba(0,0,0,0.5)" }}
    >
      {name}
    </p>
  </a>
);

export default ProjectPreview;

