"use client";

import { showErrorToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { Star } from "lucide-react";
import Lottie from "lottie-react";
import successAnim from "@/public/assets/success.json";
import { useState } from "react";

export default function ReviewLayanan() {
  const [rating, setRating] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const [nama, setNama] = useState("");
  const [komentar, setKomentar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // ✅ state untuk tampilan sukses

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) return showErrorToast("Nama harus diisi");
    if (!komentar.trim()) return showErrorToast("Komentar harus diisi");
    if (rating < 1 || rating > 5) return showErrorToast("Rating harus antara 1-5");

    setIsLoading(true);

    try {
      const response = await api.post("/public/reviews", {
        nama: nama.trim(),
        star: rating,
        comment: komentar.trim(),
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      showErrorToast("Gagal mengirim review");
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingText = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return "Sangat Buruk";
      case 2:
        return "Buruk";
      case 3:
        return "Cukup";
      case 4:
        return "Baik";
      case 5:
        return "Sangat Baik";
      default:
        return "Pilih Rating";
    }
  };

  const getRatingColor = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return "text-red-600";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-lime-500";
      case 5:
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  const activeRating = hover || rating;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <Card className="w-[360px] shadow-md rounded-2xl border-none">
        <CardContent>
          {!isSuccess ? (
            // ===================== FORM =====================
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-[#0892D8]">Review layanan kami ya</h2>
                <p className="text-xs text-gray-500">
                  Berikan penilaian kamu terhadap layanan kami.
                  <br />
                  Setiap masukan kamu akan kami perbaiki.
                </p>
              </div>

              <Input placeholder="Masukkan Nama Anda" value={nama} onChange={(e) => setNama(e.target.value)} disabled={isLoading} required />

              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Kualitas Layanan</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={22}
                      onClick={() => !isLoading && setRating(star)}
                      onMouseEnter={() => !isLoading && setHover(star)}
                      onMouseLeave={() => !isLoading && setHover(null)}
                      className={`cursor-pointer transition-colors ${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  ))}
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(activeRating)}`}>{getRatingText(activeRating)}</span>
                </div>
              </div>

              <Textarea placeholder="Berikan Ulasan Anda" value={komentar} onChange={(e) => setKomentar(e.target.value)} disabled={isLoading} className="h-20 resize-none" required />

              <Button type="submit" className="w-full bg-[#0892D8] hover:bg-[#0892D8]/90 text-white" disabled={isLoading}>
                {isLoading ? "Mengirim..." : "Kirim"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
              <h2 className="text-2xl font-semibold text-[#0892D8]">Review</h2>
              <Lottie
                animationData={successAnim}
                loop={true}
                autoplay={true}
                style={{ width: 120, height: 120 }}
              />
              <h3 className="text-lg font-semibold text-green-600">Berhasil mengirim ulasan</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
