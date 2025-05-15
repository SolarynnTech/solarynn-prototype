import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import SecondaryBtn from "@/components/buttons/SecondaryBtn.jsx";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const MilestonesSection = ({ milestones = [], isOwner, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState([]);

  useEffect(() => {
    if (!editing) setLocal(milestones);
  }, [milestones, editing]);

  const handleChange = (idx, field, value) => {
    const copy = local.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    setLocal(copy);
  };

  const handleAdd = () => {
    setLocal([...local, { title: "", start_date: null, end_date: null }]);
  };

  const handleRemove = (idx) => {
    setLocal(local.filter((_, i) => i !== idx));
  };

  const save = async () => {
    await onSave(local);
    setEditing(false);
  };

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h4 className="font-semibold text-lg">
          Milestones
        </h4>
        {isOwner && (
          <ActionBtn title={editing ? "Done" : "Edit"} onClick={() => setEditing(!editing)}/>
        )}
      </Box>

      {!editing && local.length === 0 && (
        <p className="text-gray-400 text-center !text-sm">
          No milestones defined.
        </p>
      )}

      {!editing
        ? (
          local.map((m, i) => (
            <Box
              key={i}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={1}
              bgcolor="#f5f5f5"
              mb={1}
              borderRadius={1}
            >
              <Typography>{m.title}</Typography>
              <Typography color="text.secondary">
                {m.start_date || "—"} ↝ {m.end_date || "—"}
              </Typography>
            </Box>
          ))
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {local.map((m, i) => (
              <Box key={i} gap={1} mb={1} className={"flex items-center justify-between"}>
                <div className={"flex items-start flex-col w-full gap-5 mt-3"}>
                  <TextField
                    variant="standard"
                    placeholder={"Milestone Title"}
                    className={"w-full"}
                    value={m.title}
                    onChange={e => handleChange(i, "title", e.target.value)}
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px solid #000",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px solid #000",
                      }
                    }}
                  />

                  <DatePicker
                    label="Start Date"
                    value={m.start_date ? new Date(m.start_date) : null}
                    onChange={date =>
                      handleChange(i, "start_date", date?.toISOString().slice(0, 10))
                    }
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        fullWidth: true,
                        InputProps: {
                          disableUnderline: false,
                          sx: {
                            '&:before': { borderBottomColor: '#e0e0e0' },
                            '&:hover:before': { borderBottomColor: '#2e7d32' },
                            '&.Mui-focused:after': {
                              borderBottomColor: '#2e7d32',
                              borderBottomWidth: 2
                            },
                            '& .MuiSvgIcon-root': { color: '#2e7d32' }
                          }
                        },
                        InputLabelProps: {
                          sx: { '&.Mui-focused': { color: '#2e7d32' } }
                        }
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#2e7d32 !important',
                            color: '#fff !important'
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: 'rgba(46,125,50,0.8) !important'
                          },
                          '&.MuiPickersDay-today': {
                            borderColor: '#2e7d32'
                          }
                        }
                      }
                    }}
                  />

                  <DatePicker
                    label="End Date"
                    value={m.end_date ? new Date(m.end_date) : null}
                    onChange={date =>
                      handleChange(i, "end_date", date?.toISOString().slice(0, 10))
                    }
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        fullWidth: true,
                        InputProps: {
                          disableUnderline: false,
                          sx: {
                            '&:before': { borderBottomColor: '#e0e0e0' },
                            '&:hover:before': { borderBottomColor: '#2e7d32' },
                            '&.Mui-focused:after': {
                              borderBottomColor: '#2e7d32',
                              borderBottomWidth: 2
                            },
                            '& .MuiSvgIcon-root': { color: '#2e7d32' }
                          }
                        },
                        InputLabelProps: {
                          sx: { '&.Mui-focused': { color: '#2e7d32' } }
                        }
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#2e7d32 !important',
                            color: '#fff !important'
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: 'rgba(46,125,50,0.8) !important'
                          },
                          '&.MuiPickersDay-today': {
                            borderColor: '#2e7d32'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(i)}
                  sx={{
                    color: "error.main",
                    backgroundColor: "rgba(255, 0, 0, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 0, 0.15)",
                    },
                    p: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "28px" }}/>
                </IconButton>
              </Box>
            ))}
          </LocalizationProvider>
        )}

      {editing && (
        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <SecondaryBtn
            title="+ Add"
            classes={"!py-2 text-sm"}
            onClick={handleAdd}
          />
          <ActionBtn
            title="Save"
            onClick={save}
          />
        </Box>
      )}
    </Box>
  );
};

export default MilestonesSection;
