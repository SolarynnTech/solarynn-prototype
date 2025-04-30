import React, { useEffect, useState } from "react";
import ActionBtn from "../buttons/ActionBtn";
import QuestionnaireForm from "../forms/QuestionnaireForm";
import useQuestionnaireStore from "../../stores/useQuestionnaireStore";
import { Bookmark } from "lucide-react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  InputLabel,
  MenuItem, Radio, RadioGroup,
  Select,
  TextField
} from "@mui/material";
import useProjectStore from "../../stores/useProjectStore";

const ProjectDetails = () => {
  const { project, setProject } = useProjectStore();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Details</h3>
      </div>

      <div className="questionnaire-form rounded-xl bg-gray-100 p-6 mb-6">
        <div className="section-item mb-8">
          <h4 className={"mb-2"}>Your Profile</h4>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Starting Date"}
              value={project.starting_date}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, starting_date: value });
              }}
            />
          </div>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Ending Date"}
              value={project.ending_date}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, ending_date: value });
              }}
            />
          </div>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Based In"}
              value={project.based_in}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, based_in: value });
              }}
            />
          </div>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Budget"}
              value={project.budget}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, budget: value });
              }}
            />
          </div>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Ownership Status"}
              value={project.ownership_status}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, ownership_status: value });
              }}
            />
          </div>

          <div className="question-item mb-0">
            <TextField
              type={"text"}
              label={"Additional Information"}
              value={project.additional_information}
              variant="standard"
              fullWidth
              margin="normal"
              onChange={(event) => {
                const { value } = event.target;
                setProject({ ...project, additional_information: value });
              }}
            />
          </div>
        </div>
      </div>

      {/*<div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">*/}
      {/*  {[...Array(totalFormPages)].map((_, index) => (*/}
      {/*    <span*/}
      {/*      key={index}*/}
      {/*      className={`${*/}
      {/*        currentFormPage === index ? "bg-green-800" : "bg-gray-300"*/}
      {/*      } min-w-8 shrink-0 grow h-1 cursor-pointer rounded-full block`}*/}
      {/*      onClick={() => setCurrentFormPage(index)}*/}
      {/*    />*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default ProjectDetails;
