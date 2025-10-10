// components/ui/filter-search.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import SearchBar from "./searchbar";

export default function FilterSearch() {
  const tahapOptions = ["Tahap 1 : Pondasi", "Tahap 2 : Dinding", "Tahap 3 : Kuda - Kuda", "Tahap 4 : Atap", "Tahap 5 : Plafon", "Tahap 6 : Lantai", "Tahap 7 : Cat", "Lainnya"];

  return (
    <div className="flex items-center gap-3 w-full bg-white p-3 rounded-md shadow-sm">
      {/* Tombol Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 w-28 justify-start">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Semua</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {tahapOptions.map((tahap, i) => (
            <DropdownMenuItem key={i} className="cursor-pointer">
              {tahap}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <SearchBar />
    </div>
  );
}
