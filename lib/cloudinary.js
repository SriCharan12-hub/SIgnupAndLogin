import crypto from "crypto";

export const uploadToCloudinary = async (file) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are missing in .env file");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "products_preset"); // User needs to create this or I'll use a signed upload if possible

  // For signed uploads, we need a signature. For simplicity, let's assume unsigned for now
  // OR explain the alternative.
  // Actually, I'll implement a signed upload logic since I have the API Key/Secret.

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(timestamp); // I'll need a helper for this

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("api_key", process.env.CLOUDINARY_API_KEY);
  uploadFormData.append("timestamp", timestamp);
  uploadFormData.append("signature", signature);
  uploadFormData.append("folder", "products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: uploadFormData,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url;
};

// Helper for signature (requires crypto which is built-in)
const generateSignature = (timestamp) => {
  const str = `folder=products&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  return crypto.createHash("sha1").update(str).digest("hex");
};
