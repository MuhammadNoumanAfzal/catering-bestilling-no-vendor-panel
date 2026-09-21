const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const OPTIMIZED_IMAGE_MAX_DIMENSION = 2200;
const OPTIMIZED_IMAGE_QUALITY = 0.82;
const OPTIMIZE_IMAGE_SIZE_THRESHOLD = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 120000;

export function isMenuImageUploadConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to prepare this image for upload."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to optimize this image for upload."));
    }, type, quality);
  });
}

async function optimizeImageForUpload(file) {
  if (!file?.type?.startsWith("image/") || file.size <= OPTIMIZE_IMAGE_SIZE_THRESHOLD) {
    return file;
  }

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, OPTIMIZED_IMAGE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, "image/jpeg", OPTIMIZED_IMAGE_QUALITY);

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const baseName = file.name?.replace(/\.[^.]+$/, "") || "support-attachment";
  return new File([blob], `${baseName}-optimized.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

async function uploadWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Upload took too long. Please try again with a smaller image.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function uploadFileAsset(file) {
  if (!isMenuImageUploadConfigured()) {
    throw new Error(
      "Missing Cloudinary configuration. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await uploadWithTimeout(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.secure_url || !payload?.public_id) {
    throw new Error(payload?.error?.message || "File upload failed. Please try again.");
  }

  return {
    fileId: payload.public_id,
    fileUrl: payload.secure_url,
    fileName: payload.original_filename || file?.name || "document",
    mimeType: file?.type || payload.resource_type || "",
  };
}

export async function uploadMenuImage(file, options = {}) {
  if (!isMenuImageUploadConfigured()) {
    throw new Error(
      "Missing Cloudinary configuration. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const uploadFile = options.optimize ? await optimizeImageForUpload(file) : file;
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await uploadWithTimeout(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.secure_url || !payload?.public_id) {
    throw new Error(payload?.error?.message || "Image upload failed. Please try again.");
  }

  return {
    fileId: payload.public_id,
    fileUrl: payload.secure_url,
  };
}