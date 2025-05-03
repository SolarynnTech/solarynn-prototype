export default async function uploadImageToSupabase(supabase, file, userId) {
  const filePath = `avatars/${userId}.png`;

  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // ✅ allows replacing existing image
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    return null;
  }

  const { data } = supabase
    .storage
    .from("profile-images")
    .getPublicUrl(filePath);

  return data?.publicUrl || null;
}