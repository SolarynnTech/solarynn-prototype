import React from 'react';
import { Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ProjectImage = ({ imgUrl, isFav, onToggleFav,  onImageClick }) => (
  <Box className="relative">
    <img
      src={imgUrl}
      alt="Preview"
      className="mt-2 rounded-md w-full h-auto max-h-[400px] object-contain"
      onClick={onImageClick}
      style={{ cursor: onImageClick ? 'pointer' : 'default' }}
    />

    <IconButton
      onClick={onToggleFav}
      sx={{
        position: 'absolute',
        zIndex: 10,
        top: 16,
        right: 16,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        bgcolor: 'rgba(255,255,255,1)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
      }}
    >
      {isFav ? (
        <FavoriteIcon color="success" sx={{ fontSize: 28 }} />
      ) : (
        <FavoriteBorderIcon color="success" sx={{ fontSize: 28 }} />
      )}
    </IconButton>
  </Box>
);

export default ProjectImage;

