import React from 'react';
import { Box, Typography } from '@mui/material';

const ProjectDetails = ({ answersBySection, sectionTitles, currentFormPage, onPageChange }) => {
  const currentTitle = sectionTitles[currentFormPage];
  const currentAnswers = answersBySection[currentTitle] || {};

  return (
    <Box mb={4}>
      <h4 className="font-semibold text-lg mb-4">
        Details:
      </h4>

      <Box sx={{
        p: 3,
        bgcolor: 'grey.100',
        borderRadius: 1,
        boxShadow: 1,
        mb: 2,
        border: '1px solid',
        borderColor: 'grey.300'
      }}>
        {Object.entries(currentAnswers).map(([questionTitle, value]) => (
          <Box
            key={questionTitle}
            sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'grey.300', '&:last-child': { mb: 0, pb: 0, border: 0 } }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontSize: "14px" }}>
              {questionTitle}
            </Typography>
            <Typography>
              {Array.isArray(value) ? value.join(', ') : value}
            </Typography>
          </Box>
        ))}
      </Box>

      {sectionTitles.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
          {sectionTitles.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => onPageChange(idx)}
              sx={{
                width: "50%",
                height: 4,
                borderRadius: 2,
                backgroundColor: currentFormPage === idx ? '#2e7d32' : '#e0e0e0',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetails;
