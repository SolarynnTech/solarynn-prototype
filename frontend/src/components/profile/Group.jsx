import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import ActionBtn from "../buttons/ActionBtn";
import SecondaryBtn from "../buttons/SecondaryBtn";
import PlaceholderBox from "../PlaceholderBox";
import UserPreview from "@/components/UserPreview";
import useProfilesStore from "@/stores/useProfilesStore";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import SendRequest from "@/components/requests/SendRequest";
import { availabilityStatusMap } from "./ProfileImage";
import {Trash2} from "lucide-react";

const Group = ({ title, id, data, groupId, columnName, isMyProfile, profile }) => {
  const SIZE = groupId === "dddc641a-049a-454a-af31-1112fb6727be" ? { h: 300, w: 200 } : { h: 150, w: 150 };

  const { profiles, setProfiles } = useProfilesStore();
  const { user, setUser } = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [album, setAlbum] = useState(profile.album || []);

  const inputRef = useRef(null);

  const addImagesToAlbum = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    if (!profiles?.length || !data) return;
    const dataMapped = data.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);

    setDataToDisplay(dataMapped);
  }, [data, profiles, id]);

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
  }, [search, profiles, data, id]);

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

    setProfiles((prevProfiles) => prevProfiles.map((p) => (p.id === user.id ? { ...p, [columnName]: updated } : p)));

    setOpen(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const name = `${crypto.randomUUID()}.${ext}`;
    const path = `private/${user.id}/${name}`;

    const { error: uploadError } = await supabase.storage.from("professional-album").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage.from("professional-album").getPublicUrl(path);

    if (urlError || !urlData?.publicUrl) {
      console.error("Failed to get public URL:", urlError?.message);
      setUploading(false);
      return;
    }

    const newImageUrl = urlData.publicUrl;
    const updatedAlbum = [...(user.album || []), newImageUrl];
    const { error: dbError } = await supabase.from("users").update({ album: updatedAlbum }).eq("id", user.id);

    if (dbError) {
      console.error("Failed to update user album:", dbError.message);
      setUploading(false);
      return;
    }

    setUser((prev) => ({
      ...prev,
      album: updatedAlbum,
    }));

    setAlbum(updatedAlbum);

    // setPreviewUrl(newImageUrl);
    setUploading(false);
  };

  const deleteImage = async (imageUrl) => {
    const updatedAlbum = album.filter((img) => img !== imageUrl);
    const { error } = await supabase.from("users").update({ album: updatedAlbum }).eq("id", user.id);

    if (error) {
      console.error("Failed to update user album:", error.message);
      return;
    }

    setUser((prev) => ({
      ...prev,
      album: updatedAlbum,
    }));

    setAlbum(updatedAlbum);
  }

  const ImagePlaceholder = () => {
    return (
      <>
        <PlaceholderBox height={SIZE.h} width={SIZE.w} />
        <PlaceholderBox height={SIZE.h} width={SIZE.w} />
        <PlaceholderBox height={SIZE.h} width={SIZE.w} />
      </>
    );
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">{title}</h3>
        {dataToDisplay.length > 1 && (
          <ActionBtn title={"See All"} onClick={() => router.push("/listing/" + profile.id + "/" + columnName)} />
        )}
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        {/* add better handling column case */}
        {columnName === "album" ? (
          album.length > 0 ? (
            album.map((img_url, index) => {
              return (
                <div
                  key={img_url}
                  className={`flex group shrink-0 relative rounded-md items-center justify-center bg-gray-100`}
                  style={{
                    width: SIZE.w,
                    height: SIZE.h,
                    backgroundImage: `url(${img_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: `rgba(0, 0, 0, 0.25) 0px -30px 25px -10px inset`,
                  }}
                >
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 top-0 right-0 p-1 cursor-pointer"
                    onClick={() => deleteImage(img_url)}
                  >
                    <Trash2 className={"text-red-800"} size={"24"} />
                  </div>
                </div>
              );
            })
          ) : (
            <ImagePlaceholder />
          )
        ) : dataToDisplay.length > 0 ? (
          dataToDisplay.map((profile, index) => (
              <UserPreview
              key={profile?.id}
              link={`/profile/${profile?.id}`}
              name={profile?.name || profile?.email}
              img_url={profile?.profile_img}
              height={SIZE.h}
              width={SIZE.w}
            />
          ))
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {isMyProfile && (
        <>
          {/* add better handling column case */}
          {columnName !== "album" ? (
            <SecondaryBtn title="Add" classes="w-full block" onClick={() => setOpen(true)} />
          ) : (
            <>
              {!uploading ? (
                <SecondaryBtn title="Add" classes="w-full block" onClick={() => addImagesToAlbum()} />
              ) : (
                <div className={"text-center"}>
                  <CircularProgress size={24} sx={{ mt: 2 }} />
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </>
          )}
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
                    key={p.id}
                    className="cursor-pointer hover:bg-gray-100 px-2 py-2 border-b"
                    onClick={() => handleAddProfile(p.id)}
                  >
                    {p.name || p.email}
                  </div>
                ))}

                {filtered.length > visibleCount && (
                  <div className="text-center my-4">
                    <PrimaryBtn title="Load More" onClick={() => setVisibleCount((prev) => prev + 20)} />
                  </div>
                )}
              </div>

              {filtered.length === 0 && <p className="text-gray-500 mt-4">No matching profiles</p>}
            </DialogContent>
            <DialogActions>
              <SecondaryBtn title={"Cancel"} onClick={() => setOpen(false)} />
            </DialogActions>
          </Dialog>
        </>
      )}

      {!isMyProfile && profile.availability_status !== availabilityStatusMap.not_available.key && (
        <SendRequest assignerId={profile.id} groupId={groupId} />
      )}
    </div>
  );
};

export default Group;
