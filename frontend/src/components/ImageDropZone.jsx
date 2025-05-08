import { Box, Typography, CircularProgress } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDropzone } from "react-dropzone";

const dropZoneStyles = {
  border: "1px dashed black",
  borderRadius: 4,
  padding: "2rem",
  textAlign: "center",
  cursor: "pointer",
};

const ImageDropZone = ({ onFile, uploading, previewUrl }) => {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (accepted) => onFile(accepted[0]),
  });

  return (
    <Box {...getRootProps()} sx={dropZoneStyles}>
      <input {...getInputProps()} />
      {/*<CloudUploadIcon sx={{ fontSize: 48, color: "#00AB55" }} />*/}
      <Typography variant="body1" mt={1}>
        {isDragActive ? "Drop your image here…" : "Drag or upload your image"}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
        You can drop any png, jpg, svg file
      </Typography>
      {uploading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      {previewUrl && (
        <Box mt={2} className={'flex justify-center items-center'}>
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: "100%", maxHeight: 200, objectFit: "cover" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageDropZone;