import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from '@mui/material';


export default function QuestionnaireForm({
                                            section,
                                            answers,
                                            onChange,
                                            readOnly = false,
                                          }) {
  if (!section) return null;

  const textFieldStyles = {
    '& .MuiInput-underline:before': {
      borderBottom: '1px solid #000',
    },
    '& .MuiInput-underline:after': {
      borderBottom: '1px solid #000',
    },
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }} elevation={2} className={'mt-4 !bg-[#F5F5F5]'}>
      {section.title && (
        <Typography variant="h5" gutterBottom className={"!font-bold !text-base !mb-4"}>
          {section.title}
        </Typography>
      )}

      {section.questions.map((q, qi) => (
        <Box key={q.id} mb={3}>
          <Typography variant="subtitle1" gutterBottom className={"!text-sm !font-semibold !mb-3"}>
            {qi + 1}. {q.question}
          </Typography>

          {q.type === 'opentext' && (
            <TextField
              fullWidth
              multiline
              variant="standard"
              focused
              color="black"
              sx={textFieldStyles}
              rows={4}
              disabled={readOnly}
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          )}

          {q.type === 'singleselect' && (
            <FormControl component="fieldset" disabled={readOnly}>
              <RadioGroup
                value={answers[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
              >
                {q.options.map((opt, idx) => (
                  <FormControlLabel
                    slotProps={{
                      typography: {
                        sx: { fontSize: 14, fontWeight: 'bold' }
                      }
                    }}
                    key={idx}
                    value={opt}
                    control={<Radio color="success"   size={'small'} disableRipple disableTouchRipple disableFocusRipple />}
                    label={opt}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {q.type === 'multiselect' && (
            <FormGroup>
              {q.options.map((opt, idx) => {
                const checked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                return (
                  <FormControlLabel
                    slotProps={{
                      typography: {
                        sx: { fontSize: 14, fontWeight: 'bold' }
                      }
                    }}
                    key={idx}
                    control={
                      <Checkbox
                        size={'small'}
                        color="success"
                        disableRipple
                        disableTouchRipple
                        disabled={readOnly}
                        checked={checked}
                        onChange={() => onChange(q.id, null, opt)}
                      />
                    }
                    label={opt}
                  />
                );
              })}
            </FormGroup>
          )}

          {(q.type === 'text' || q.type === 'number') && (
            <TextField
              fullWidth
              variant="standard"
              focused
              color="black"
              sx={textFieldStyles}
              type={q.type}
              disabled={readOnly}
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
              InputProps={{ endAdornment: q.suffix || null }}
            />
          )}
        </Box>
      ))}
    </Paper>
  );
}
