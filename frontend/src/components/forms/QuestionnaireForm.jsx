import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  FormGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import useQuestionnaireStore from "../../stores/useQuestionnaireStore";

const QuestionnaireForm = ({
  formId,
  sections,
  totalPages = 0,
  currentPage = 0,
  readOnly = false,
}) => {
  const { forms, setAnswer } = useQuestionnaireStore();

  const onChange = (event, id) => {
    const { value } = event.target;

    setAnswer({
      questionId: id,
      value: value,
    });

    console.log("forms", forms);
  };

  return (
    <div className="questionnaire-form rounded-xl bg-gray-100 p-6 mb-6">
      {sections?.map((section, sectionIndex) => (
        <div key={sectionIndex} className="section-item mb-8">
          <h4 className={"mb-2"}>{section.title}</h4>

          {section.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-item mb-0">
              {/* Text / Number */}
              {(question.type === "text" || question.type === "number") && (
                <TextField
                  type={question.type}
                  label={question.label || question.title}
                  value={question.value}
                  disabled={readOnly}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="start">
                          {question.suffix}
                        </InputAdornment>
                      ),
                    },
                    inputLabel: {
                      shrink: !!question.value,
                    },
                  }}
                  variant="standard"
                  fullWidth
                  margin="normal"
                  onChange={(event) => onChange(event, question.id)}
                />
              )}

              {/* Select */}
              {question.type === "select" && (
                <FormControl variant="standard" fullWidth margin="normal">
                  <InputLabel>{question.label || question.title}</InputLabel>
                  <Select
                    variant="standard"
                    value={question.value}
                    disabled={readOnly}
                    onChange={(event) => onChange(event, question.id)}
                  >
                    {question.options.map((option, optIndex) => (
                      <MenuItem key={optIndex} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Checkbox Group */}
              {question.type === "checkbox" && (
                <FormGroup>
                  <FormControlLabel
                    key={questionIndex}
                    control={<Checkbox value={question.value} />}
                    label={question.label}
                    disabled={readOnly}
                    checked={question.checked}
                    onChange={(event) => onChange(event, question.id)}
                  />
                </FormGroup>
              )}

              {/* Radio Group */}
              {question.type === "radio" && (
                <FormControl component="fieldset">
                  <RadioGroup
                    value={question.value}
                    name={`radio-${sectionIndex}-${questionIndex}`}
                  >
                    {question.options.map((option, optIndex) => (
                      <FormControlLabel
                        key={optIndex}
                        disabled={readOnly}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                        onChange={(event) => onChange(event, question.id)}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            </div>
          ))}
        </div>
      ))}

      {currentPage && totalPages ? (
        <div className="pagination-info mt-6 text-center text-sm font-semibold uppercase">
          Page {currentPage} of {totalPages}
        </div>
      ) : null}
    </div>
  );
};

export default QuestionnaireForm;
