import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageDropZone from "@/components/ImageDropZone.jsx";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";

const PhotosSection = ({
                         imageUrls,
                         uploadingImages,
                         editingImages,
                         onToggleEditing,
                         onUploadImage,
                         onDeleteImage,
                         onViewImage,
                         userId,
                         ownerId,
                       }) => (
  <Box mb={4}>
    <Box className="flex justify-between items-center mb-4">
      <h4 className="font-semibold text-lg">
        Photos:
      </h4>
      {userId === ownerId && (
        <ActionBtn
          title={editingImages ? "Done Editing" : "Edit Images"}
          onClick={onToggleEditing}
        />
      )}
    </Box>

    {editingImages && userId === ownerId && (
      <>
        <Box mb={2}>
          {uploadingImages ? (
            <Typography>Uploading…</Typography>
          ) : imageUrls.length < 10 ? (
            <ImageDropZone
              onFile={onUploadImage}
              uploading={uploadingImages}
              previewUrl={null}
            />
          ) : null}
        </Box>
        <Box className="flex justify-end mb-2">
          <Typography variant="caption" className="text-gray-600">
            {imageUrls.length} / 10 images
          </Typography>
        </Box>
      </>
    )}

    {imageUrls.length === 0 ? (
      <Box className="mt-4 text-center text-gray-400">
        <Typography variant="body2" className="!text-sm">
          {userId === ownerId
            ? "You haven’t added any photos yet."
            : "There are no additional photos for this project."
          }
        </Typography>
      </Box>
    ) : (
      <Box className="overflow-x-auto custom-scrollbar hide-scrollbar -mx-6 px-6 mt-4">
        <Box className="flex gap-4 flex-nowrap relative">
          {imageUrls.map((url, idx) => (
            <Box key={url} className="relative flex-shrink-0">
              <img
                src={url}
                alt="Project asset"
                className={`w-44 h-60 object-cover rounded ${
                  !editingImages ? 'cursor-pointer' : ''
                }`}
                onClick={() => !editingImages && onViewImage(url)}
              />

              {editingImages && userId === ownerId && (
                <IconButton
                  size="small"
                  onClick={() => onDeleteImage(idx, url)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 32,
                    height: 32,
                    p: 0,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,1)',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ color: 'black' }}/>
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    )}
  </Box>
);

export default PhotosSection;
