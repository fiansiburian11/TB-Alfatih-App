import DetailProduk from "@/components/staff/detail-produk";

export default function page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <DetailProduk params={{ id: id }} />
    </div>
  );
}
