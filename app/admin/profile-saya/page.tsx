"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, apiRequest } from "@/lib/axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface UserProfile {
  id: string;
  username: string;
  role: string;
  status: boolean;
  img_profile: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: UserProfile;
  refrence: null;
  error: boolean;
}

// Fungsi untuk retry request
const retryRequest = async <T,>(request: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
      }
    }
  }

  throw lastError!;
};

export default function UserProfileForm() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("/assets/genteng.jpg");
  const [uploadLoading, setUploadLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data dengan retry
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await retryRequest(() => apiRequest<ApiResponse>("/private/profile", { method: "GET" }));

        // console.log("Profile data received:", response);

        setUserData(response.data);
        setUsername(response.data.username);

        if (response.data.img_profile) {
          const fullImageUrl = response.data.img_profile.startsWith("http") ? response.data.img_profile : `https://api.rusnandapurnama.com${response.data.img_profile}`;
          setPreviewImage(fullImageUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validasi file size (max 10MB)
      if (file.size > 1 * 1024 * 1024) {
        showErrorToast("File terlalu besar. Maksimum 1MB");
        return;
      }

      // Validasi file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Format file tidak didukung. Gunakan JPG, JPEG, atau PNG");
        return;
      }

      setError(null);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Auto upload setelah file dipilih
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("img_profile", file);

      // Gunakan instance api langsung untuk FormData dengan retry
      await retryRequest(async () => {
        const response = await api.put("/private/profile/img", formData);
        return response.data;
      });

      // Refresh data profil setelah upload berhasil
      const profileResponse = await retryRequest(() => apiRequest<ApiResponse>("/private/profile", { method: "GET" }));

      setUserData(profileResponse.data);

      // Update preview image dengan yang baru
      if (profileResponse.data.img_profile) {
        const fullImageUrl = profileResponse.data.img_profile.startsWith("http") ? profileResponse.data.img_profile : `https://api.rusnandapurnama.com${profileResponse.data.img_profile}`;
        setPreviewImage(fullImageUrl);
      }

      // Show success message
      showSuccessToast("Foto profil berhasil diupdate!");
    } catch (err) {
      // console.error("Error uploading image:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupload foto profil";

      if (errorMessage.includes("Network Error") || errorMessage.includes("timeout") || errorMessage.includes("koneksi")) {
        setError(`${errorMessage}. Silakan cek koneksi internet dan coba lagi.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Refresh the page or refetch data
    window.location.reload();
  };

  if (loading) return <div className="max-w-2xl p-6 bg-white rounded-xl shadow-md">Memuat profil...</div>;

  return (
    <div className="max-w-2xl p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="flex gap-6 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-full h-60 relative">
            <Image src={previewImage} alt="avatar" sizes="fill" fill className="w-full rounded-sm object-cover" priority onError={() => setPreviewImage("/assets/genteng.jpg")} />
            {uploadLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white">Mengupload...</div>
              </div>
            )}
          </div>

          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" disabled={uploadLoading} ref={fileInputRef} />

          <Button onClick={handleButtonClick} className="w-full rounded-sm font-extralight bg-[#0892D8] hover:bg-[#0892D8]/80 mt-3" disabled={uploadLoading} type="button">
            {uploadLoading ? "Mengupload..." : "Upload Foto Profile"}
          </Button>

          <p className="text-xs text-gray-500 mt-1 text-center">
            Besar file: maksimum 1 mb. <br />
            Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input type="text" value={username || "Loading..."} readOnly className="bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" value="********" readOnly className="bg-gray-100 cursor-not-allowed" />
          </div>

          {/* Error Message dengan retry option */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              {(error.includes("Network Error") || error.includes("koneksi")) && (
                <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
                  Coba Lagi
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
