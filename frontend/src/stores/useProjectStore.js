import { create } from "zustand";

const useProjectStore = create((set) => ({
  project: {
    starting_date: null,
    ending_date: null,
    based_in: null,
    budget : null,
    ownership_status: null,
    additional_information: null,
  },

  setProject: (project) => set({ project }),

}));

export default useProjectStore;