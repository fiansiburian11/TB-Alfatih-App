import { Search } from "lucide-react";
import { Input } from "../ui/input";

export default function SearchBar() {
  return (
    <div className="relative flex-1 ">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input type="text" placeholder="Cari produk" className="pl-10" />
    </div>
  );
}
