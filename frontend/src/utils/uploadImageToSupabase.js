export default async function uploadImageToSupabase(supabase, file, userId, type = "avatar") {
  let filePath= "";

  if (type === "cover") {
    // For cover images, we might want to use a different path
    filePath = `covers/${userId}.png`;
  } else {
    // Default to avatar images
    filePath = `avatars/${userId}.png`;
  }

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