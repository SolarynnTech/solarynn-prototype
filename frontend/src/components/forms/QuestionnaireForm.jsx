import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from '@mui/material'
import DebouncedTextField from "@/components/forms/DebouncedTextField";

const QuestionnaireForm = ({
  sections,
  readOnly = false,
}) => {
  const [answers, setAnswers] = useState({})

  const onChange = (questionId, value, option = null) => {
    setAnswers((prev) => {
      if (option !== null) {
        const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : []
        const nextArr = prevArr.includes(option)
          ? prevArr.filter((v) => v !== option)
          : [...prevArr, option]
        return { ...prev, [questionId]: nextArr }
      }
      return { ...prev, [questionId]: value }
    })
  }

  console.log(answers, 'answers')

  return (
    <div className="questionnaire-form rounded-xl bg-gray-100 p-6 mb-6">
      {sections.map((section, si) => (
        <div key={section.id || si} className="section-item mb-8">
          {section.title && <h4 className="mb-2 font-bold text-xl underline">{section.title}</h4>}
          {section.questions.map((q, qi) => (
            <Box key={q.id || qi} mb={3}>
              <Typography variant="subtitle1" gutterBottom className={"!font-semibold"}>
                {qi + 1}. {q.question}
              </Typography>

              {/* Open Text */}
              {q.type === 'opentext' && (
                <DebouncedTextField
                  questionId={q.id}
                  initialValue={answers[q.id]}
                  readOnly={readOnly}
                  onDebouncedChange={(id, v) => {
                    setAnswers(prev => ({ ...prev, [id]: v }))
                  }}
                />
              )}

              {/* Single Select */}
              {q.type === 'singleselect' && (
                <FormControl component="fieldset" disabled={readOnly}>
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={e => onChange(q.id, e.target.value)}
                  >
                    {q.options.map((opt, idx) => (
                      <FormControlLabel
                        key={idx}
                        value={opt}
                        control={
                        <Radio
                          disableRipple

                          disableTouchRipple
                          color="success"
                          size="small"
                        />
                      }
                        label={opt}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {/* Multi Select */}
              {q.type === 'multiselect' && (
                <FormGroup>
                  {q.options.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          disableRipple
                          color="success"
                          size="small"
                          disabled={readOnly}
                          checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt)}
                          onChange={() => onChange(q.id, null, opt)}
                        />
                      }
                      label={opt}
                    />
                  ))}
                </FormGroup>
              )}

              {/* Radio Group */}
              {q.type === 'radio' && (
                <FormControl component="fieldset" disabled={readOnly}>
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={(e) => onChange(q.id, e.target.value)}
                  >
                    {q.options.map((opt, idx) => (
                      <FormControlLabel
                        key={idx}
                        value={opt}
                        control={<Radio />}
                        label={opt}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {/* Text / Number */}
              {(q.type === 'text' || q.type === 'number') && (
                <TextField
                  fullWidth
                  variant="outlined"
                  type={q.type}
                  disabled={readOnly}
                  value={answers[q.id] || ''}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  InputProps={{
                    endAdornment: q.suffix || null,
                  }}
                />
              )}
            </Box>
          ))}
        </div>
      ))}
    </div>
  );
};

export default QuestionnaireForm;
