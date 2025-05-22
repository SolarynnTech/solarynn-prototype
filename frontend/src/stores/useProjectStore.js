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

  allProjects: [],

  setProject: (project) => set({ project }),

  setAllProjects: (updater) => set((state) => ({
    allProjects: typeof updater === "function" ? updater(state.allProjects) : updater
  })),

}));

export default useProjectStore;