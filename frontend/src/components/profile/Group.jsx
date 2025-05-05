import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ActionBtn from "../buttons/ActionBtn";
import SecondaryBtn from "../buttons/SecondaryBtn";
import PlaceholderBox from "../PlaceholderBox";
import UserPreview from "@/components/UserPreview";
import useProfilesStore from "@/stores/useProfilesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";

const Group = ({ title, data, groupId, columnName, isMyProfile, profile }) => {
  const SIZE = groupId === "dddc641a-049a-454a-af31-1112fb6727be"
    ? { h: 300, w: 200 }
    : { h: 150, w: 150 };

  const { profiles, setProfiles } = useProfilesStore();
  const { user, setUser } = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (!profiles?.length || !data) return;
    const dataMapped = data
      .map((id) => profiles.find((p) => p.id === id))
      .filter(Boolean);
    setDataToDisplay(dataMapped);
  }, [data, profiles]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const ids = Array.isArray(data) ? data : [];

    const matches = profiles.filter(
      (p) =>
        !ids.includes(p.id) &&
        (p.name?.toLowerCase().includes(lower) ||
          p.agency_name?.toLowerCase().includes(lower) ||
          p.official_name?.toLowerCase().includes(lower))
    );

    setFiltered(matches);
    setVisibleCount(20);
  }, [search, profiles, data]);

  const handleAddProfile = async (newProfileId) => {
    const updated = [...(user[columnName] || []), newProfileId];

    const { error } = await supabase
      .from("users")
      .update({ [columnName]: updated })
      .eq("id", user.id);

    if (error) return console.error("Failed to update user:", error.message);

    // Update user
    setUser((prev) => ({
      ...prev,
      [columnName]: updated,
    }));

    setProfiles((prevProfiles) =>
      prevProfiles.map((p) =>
        p.id === user.id ? { ...p, [columnName]: updated } : p
      )
    );

    setOpen(false);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">{title}</h3>
        {dataToDisplay.length > 1 && (
          <ActionBtn
            title={"See All"}
            onClick={() => router.push("/listing/" + profile.id + "/" + columnName)}
          />
        )}
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        {dataToDisplay.length > 0 ? (
          dataToDisplay.map((profile, index) => (
            <UserPreview
              key={index}
              link={`/profile/${profile.id}`}
              name={profile.name || profile.official_name || profile.agency_name}
              img_url={profile.profile_img}
              height={SIZE.h}
              width={SIZE.w}
            />
          ))
        ) : (
          <>
            <PlaceholderBox height={SIZE.h} width={SIZE.w} />
            <PlaceholderBox height={SIZE.h} width={SIZE.w} />
            <PlaceholderBox height={SIZE.h} width={SIZE.w} />
          </>
        )}
      </div>

      {isMyProfile && (
        <>
          <SecondaryBtn title="Add" classes="w-full block" onClick={() => setOpen(true)} />
          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Search and Add Profiles</DialogTitle>
            <DialogContent dividers>
              <div className="sticky top-0 z-10 bg-white pb-2">
                <TextField
                  fullWidth
                  placeholder="Search by name"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2"
                />
              </div>

              <div className={"overflow-y-auto max-h-[400px] scrollbar hide-scrollbar h-full"}>

                {filtered.slice(0, visibleCount).map((p, index) => (
                  <div
                    key={p.id + index}
                    className="cursor-pointer hover:bg-gray-100 px-2 py-2 border-b"
                    onClick={() => handleAddProfile(p.id)}
                  >
                    {p.name || p.agency_name || p.official_name}
                  </div>
                ))}


                {filtered.length > visibleCount && (
                  <div className="text-center my-4">
                    <PrimaryBtn
                      title="Load More"
                      onClick={() => setVisibleCount((prev) => prev + 20)}
                    />
                  </div>
                )}

              </div>

              {filtered.length === 0 && (
                <p className="text-gray-500 mt-4">No matching profiles</p>
              )}
            </DialogContent>
            <DialogActions>
              <SecondaryBtn title={"Cancel"} onClick={() => setOpen(false)}/>
            </DialogActions>
          </Dialog>
        </>
      )}

      {!isMyProfile && <SecondaryBtn title="Send A Request" classes="w-full block" />}
    </div>
  );
};

export default Group;