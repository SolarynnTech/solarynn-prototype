import { create } from "zustand";

const useCategoriesStore = create((set) => ({
  role: null,
  domain: null,
  subDivision: null,

  setRole: (category) => set({ role: category }),
  setDomain: (category) => set({ domain: category }),
  setSubDivision: (category) => set({ subDivision: category }),
}));

export default useCategoriesStore;
