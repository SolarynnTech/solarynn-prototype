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

  return (
    <Paper sx={{ p: 4, mb: 4 }} elevation={2} className={'mt-4'}>
      {section.title && (
        <Typography variant="h5" gutterBottom className={"!font-bold text-lg !mb-4"}>
          {section.title}
        </Typography>
      )}

      {section.questions.map((q, qi) => (
        <Box key={q.id} mb={3}>
          <Typography variant="subtitle1" gutterBottom className={"!text-md !font-semibold"}>
            {qi + 1}. {q.question}
          </Typography>

          {q.type === 'opentext' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
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
                    key={idx}
                    value={opt}
                    control={<Radio color="success" disableRipple disableTouchRipple disableFocusRipple />}
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
                    key={idx}
                    control={
                      <Checkbox
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
              variant="outlined"
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
