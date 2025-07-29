
export default async function uploadImageToSupabase(supabase, file, userId, folder = "avatars") {
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${folder}/${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(uniqueFileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Image upload error:", uploadError);
    return null;
  }

  const { data, error: urlError } = supabase.storage
    .from("profile-images")
    .getPublicUrl(uniqueFileName);

  if (urlError || !data?.publicUrl) {
    console.error("Error getting public URL:", urlError);
    return null;
  }

  return data.publicUrl || null;
}