"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function UserProfileForm() {
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // submit logic
    console.log({ username, password, profileImage });
  };

  return (
    <div className="max-w-2xl p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center ">
          <div className="w-full h-60 relative">
            <Image src="/assets/genteng.jpg" alt="avatar" fill className="w-full rounded-sm " />
          </div>
          <label className="mt-3 w-full">
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            <Button className="w-full rouned-sm font-extralight bg-[#0892D8] hover:bg-[#0892D8]/80">Upload Foto Profile</Button>
          </label>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Besar file: maksimum 10 mb. <br />
            Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input type="text" value={username} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" value="********" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Button variant="destructive" className="font-extralight" onClick={() => console.log("Kembali clicked")}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
