import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  social_networks: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    tiktok: "https://www.tiktok.com/",
    snapchat: "https://www.snapchat.com",
    x: "https://www.x.com/",
    linkedin: "https://www.linkedin.com/",
    reddit: "https://www.reddit.com/",
  },

  setUser: (updater) =>
    set((state) => ({
      user: typeof updater === "function" ? updater(state.user) : updater,
    })),

  setSocialNetworks: (updater) =>
    set((state) => ({
      social_networks: typeof updater === "function" ? updater(state.social_networks) : updater,
    })),
}));

export default useUserStore;