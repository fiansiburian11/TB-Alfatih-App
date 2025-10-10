// "use client";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Eye } from "lucide-react";
// import { useState } from "react";
// import { Input } from "../ui/input";
// import { Switch } from "../ui/switch";
// import DialogEditUser from "./dialogedituser";

// export default function DialogViewUser({ user, onUserUpdate }: { user: any; onUserUpdate?: (updatedData: any) => void }) {
//   const [open, setOpen] = useState(false);
//   const [editDialogOpen, setEditDialogOpen] = useState(false); // State untuk kontrol dialog edit

//   const roleOptions = [
//     { label: "Super Visor", value: "supervisor" },
//     { label: "Admin", value: "admin" },
//     { label: "Staff", value: "staff" },
//   ];

//   // Cari role yang sesuai dengan user
//   const userRole = roleOptions.find((option) => option.value === user.role) || { label: user.role, value: user.role };

//   // Handle tombol Edit diklik - langsung buka dialog edit
//   const handleEditClick = () => {
//     setOpen(false); // Tutup dialog view
//     setEditDialogOpen(true); // Buka dialog edit
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <Button size="icon" className="bg-[#0892D8] hover:bg-[#067ab1] text-white rounded-md">
//             <Eye size={18} />
//           </Button>
//         </DialogTrigger>

//         <DialogContent className="max-w-md rounded-xl p-6">
//           <DialogHeader className="border-b">
//             <DialogTitle className="text-lg font-semibold text">Detail User</DialogTitle>
//           </DialogHeader>

//           <div className="mt-6 space-y-6">
//             {/* Username */}
//             <div className="space-y-3">
//               <Label className="text-sm font-medium">Username</Label>
//               <Input value={user.username} readOnly className="bg-gray-50 border-gray-200 cursor-not-allowed" />
//             </div>

//             {/* Password */}
//             <div className="space-y-3">
//               <Label className="text-sm font-medium">Password</Label>
//               <Input value={"********"} readOnly className="bg-gray-50 border-gray-200 cursor-not-allowed" />
//             </div>

//             {/* Role User */}
//             <div className="space-y-3">
//               <Label className="text-sm font-medium">Role User</Label>
//               <div>
//                 <div className="flex items-center space-x-3">
//                   <Checkbox className="cursor-not-allowed" id={`view-${userRole.value}`} checked={true} />
//                   <Label htmlFor={`view-${userRole.value}`} className="text-sm font-normal">
//                     {userRole.label}
//                   </Label>
//                 </div>
//               </div>
//             </div>

//             {/* Status */}
//             <div className="space-y-3">
//               <Label className="text-sm font-medium">Status</Label>
//               <div>
//                 <div className="flex items-center space-x-3 ">
//                   <Switch checked={user.status} className="cursor-not-allowed" />
//                   <span className="text-sm">{user.status ? "Aktif" : "Nonaktif"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="mt-8 flex justify-center gap-4 pt-4 border-t">
//             <Button variant="destructive" onClick={() => setOpen(false)} className="text-white">
//               Kembali
//             </Button>
//             <Button className="bg-[#0892D8] hover:bg-[#0892D8]/80 text-white" onClick={handleEditClick}>
//               Edit
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Dialog Edit - Gunakan mode controlled */}
//       <DialogEditUser user={user} open={editDialogOpen} onOpenChange={setEditDialogOpen} onUserUpdate={onUserUpdate} />
//     </>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import DialogEditUser from "./dialogedituser";

// Tambahkan onUserUpdate di props
export default function DialogViewUser({ user, onUserUpdate }: { user: any; onUserUpdate?: (updatedData: any) => void }) {
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const roleOptions = [
    { label: "Super Visor", value: "supervisor" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
  ];

  // Cari role yang sesuai dengan user
  const userRole = roleOptions.find((option) => option.value === user.role) || { label: user.role, value: user.role };

  const handleEditClick = () => {
    setOpen(false);
    setEditDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="bg-[#0892D8] hover:bg-[#067ab1] text-white rounded-md">
            <Eye size={18} />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md rounded-xl p-6">
          <DialogHeader className="border-b">
            <DialogTitle className="text-lg font-semibold ">Detail User</DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Username */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Username</Label>
              <Input value={user.username} readOnly className="bg-gray-50 border-gray-200 cursor-not-allowed" />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Password</Label>
              <Input value={"********"} readOnly className="bg-gray-50 border-gray-200 cursor-not-allowed" />
            </div>

            {/* Role User */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Role User</Label>
              <div>
                <div className="flex items-center space-x-3">
                  <Checkbox className="cursor-not-allowed" id={`view-${userRole.value}`} checked={true} />
                  <Label htmlFor={`view-${userRole.value}`} className="text-sm font-normal">
                    {userRole.label}
                  </Label>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Status</Label>
              <div>
                <div className="flex items-center space-x-3">
                  <Switch checked={user.status} />
                  <span className="text-sm">{user.status ? "Aktif" : "Nonaktif"}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex justify-center gap-4 pt-4 border-t">
            <Button variant="destructive" onClick={() => setOpen(false)} className="text-white">
              Kembali
            </Button>
            <Button className="bg-[#0892D8] hover:bg-[#0892D8]/80 text-white" onClick={handleEditClick}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teruskan onUserUpdate ke DialogEditUser */}
      <DialogEditUser
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdate={onUserUpdate} // ← INI YANG PERLU DITAMBAH
      />
    </>
  );
}