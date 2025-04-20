import { create } from "zustand";

const useCategoriesStore = create((set) => ({
  mainCategory: null,
  subCategory: null,
  subDivision: null,

  setMainCategory: (category) => set({ mainCategory: category }),
  setSubCategory: (category) => set({ subCategory: category }),
  setSubDivision: (category) => set({ subDivision: category }),
}));

export default useCategoriesStore;
