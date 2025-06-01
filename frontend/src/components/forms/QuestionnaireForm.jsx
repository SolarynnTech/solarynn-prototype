import React from "react";
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
} from "@mui/material";


const OPTION_LABEL_SX = {
  fontSize: 16,
  fontWeight: "300",
  color: "#111827",
};

const getOptionSx = (isSelected, readOnly) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  mr: 0,
  border: isSelected ? "2px solid #615FFF" : "1px solid #D1D5DB",
  borderRadius: "8px",
  p: 2,
  backgroundColor: isSelected ? "#E0E7FF" : "#FFFFFF",
  cursor: readOnly ? "default" : "pointer",
  "&:hover": {
    borderColor: readOnly ? (isSelected ? "#615FFF" : "#D1D5DB") : "#615FFF",
  },
  "& .MuiRadio-root, & .MuiCheckbox-root": {
    color: isSelected ? "#615FFF" : "#9CA3AF",
    "&.Mui-checked": {
      color: "#615FFF",
    },
    mr: 1.5,
  },
});

const TEXT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset": {
      borderColor: "#D1D5DB",
    },
    "&:hover fieldset": {
      borderColor: "#9CA3AF",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#615FFF",
      borderWidth: "2px",
    },
  },
  "& .MuiOutlinedInput-input": {
    fontSize: "16px",
    color: "#111827",
    padding: "10px 12px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "16px",
    fontWeight: 500,
    color: "#6B7280",
    backgroundColor: "#FFFFFF",
    px: "4px",
    transform: "translate(12px, 12px) scale(1)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#615FFF",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    transform: "translate(12px, -6px) scale(0.75)",
  },
};

export default function QuestionnaireForm({
                                            section,
                                            answers,
                                            onChange,
                                            readOnly = false,
                                          }) {
  if (!section) return null;

  return (
    <div className={'mb-12'}>
      {section.title && (
        <Typography
          variant="h4"
          gutterBottom
          className="!font-medium !text-2xl text-center !mb-3"
        >
          {section.title}
        </Typography>
      )}

      {section.questions.map((q) => (
        <Box key={q.id} mb={3}>
          <Typography
            variant="subtitle1"
            gutterBottom
            className="!text-lg !font-medium !mb-3"
          >
            {q.question}
          </Typography>

          {q.type === "opentext" && (
            <TextField
              fullWidth
              multiline
              variant="outlined"
              size="small"
              label={q.label || ""}
              placeholder=""
              sx={TEXT_SX}
              disabled={readOnly}
              value={answers[q.id] || ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              rows={4}
            />
          )}

          {q.type === "singleselect" && (
            <FormControl component="fieldset" disabled={readOnly} fullWidth>
              <RadioGroup
                value={answers[q.id] || ""}
                onChange={(e) => onChange(q.id, e.target.value)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
                }}
              >
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <FormControlLabel
                      key={idx}
                      value={opt}
                      disabled={readOnly}
                      sx={getOptionSx(isSelected, readOnly)}
                      control={
                        <Radio
                          size="small"
                          disableRipple
                          disableTouchRipple
                          disableFocusRipple
                        />
                      }
                      label={<Typography sx={OPTION_LABEL_SX}>{opt}</Typography>}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          )}

          {q.type === "multiselect" && (
            <FormGroup>
              {q.options.map((opt, idx) => {
                const checked =
                  Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                const isLast = idx === q.options.length - 1;

                return (
                  <FormControlLabel
                    key={idx}
                    disabled={readOnly}
                    sx={{
                      ...getOptionSx(checked, readOnly),
                      mb: isLast ? 0 : 1.5,
                    }}
                    control={
                      <Checkbox
                        size="small"
                        color="primary"
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        checked={checked}
                        onChange={() => onChange(q.id, null, opt)}
                      />
                    }
                    label={<Typography sx={OPTION_LABEL_SX}>{opt}</Typography>}
                  />
                );
              })}
            </FormGroup>
          )}

          {(q.type === "text" || q.type === "number") && (
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={q.label || ""}
              placeholder={q.placeholder || ""}
              disabled={readOnly}
              value={answers[q.id] || ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              sx={TEXT_SX}
            />
          )}
        </Box>
      ))}
    </div>
  );
}
