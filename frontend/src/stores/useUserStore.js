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

  groups: [],

  ALL_GROUPS: [
    { id: "0744fe1a-e737-40e0-a3c8-5883fadcd574", title: "Founder(s) / key people", column: "key_people"},
    { id: "0d7a3e9e-7f5a-4231-8c29-40c53a3bd9cd", title: "Founder(s)", column: "founders"},
    { id: "34b734a0-e560-4f69-8613-e43cefeff998", title: "Clients / talents", column: "clients"},
    { id: "3823492a-bc48-4aaf-8f35-36956aff054d", title: "I like/support what you doing", column: "i_support"},
    { id: "4302e22f-5e21-4d57-ad98-1ca6b4afcaef", title: "Showroom", column: "showroom"},
    { id: "602d4b41-e1d4-426a-a1c6-cd80258890bf", title: "Staff / team", column: "staff_team"},
    { id: "76e9ccb4-3066-40e2-b10c-80cd5faaae29", title: "Affiliated company", column: "affiliated"},
    { id: "879c2a29-ca0a-48fb-bd8c-4e34a52f319c", title: "We worked together", column: "worked_together"},
    { id: "dddc641a-049a-454a-af31-1112fb6727be", title: "Professional album", column: "album"},
    { id: "fa45fb48-4799-423b-9eb5-7d7c2864cf24", title: "Staff", column: "staff"},
  ],

  setUser: (updater) =>
    set((state) => ({
      user: typeof updater === "function" ? updater(state.user) : updater,
    })),

  setSocialNetworks: (updater) =>
    set((state) => ({
      social_networks: typeof updater === "function" ? updater(state.social_networks) : updater,
    })),

  setGroups: (updater) =>
    set((state) => ({
      groups: typeof updater === "function" ? updater(state.groups) : updater,
    })),
}));

export default useUserStore;