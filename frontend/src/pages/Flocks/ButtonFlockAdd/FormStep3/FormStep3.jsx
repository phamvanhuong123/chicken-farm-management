import { format } from "date-fns"
function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-black">{value || "Chưa nhập"}</p>
    </div>
  )
}
function FormStep3 ({register}){
  const formData = {
    ngayNhap: new Date("2024-01-15T00:00:00"), // Dùng new Date()
    nhaCungCap: "Trang trại ABC",
    giong: "Gà Broiler",
    soLuong: 1500,
    trongLuong: 0.5,
    khuNuoi: "Khu A",
    gia: 30000, // Thêm giá để tính tổng chi phí (1500 * 30000 = 45,000,000)
  }
const tongChiPhi = (formData.gia || 0) * (formData.soLuong || 0)

 
    return <>
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Xác nhận thông tin</h3>
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <InfoRow
          label="Ngày nhập:"
          value={
            formData.ngayNhap ? format(formData.ngayNhap, "dd/MM/yyyy") : "N/A"
          }
        />
        <InfoRow label="Nhà cung cấp:" value={formData.nhaCungCap} />
        <InfoRow label="Giống:" value={formData.giong} />
        <InfoRow
          label="Số lượng:"
          value={
            formData.soLuong
              ? `${new Intl.NumberFormat("vi-VN").format(formData.soLuong)} con` // Thêm format số
              : "N/A"
          }
        />
        <InfoRow
          label="Trọng lượng:"
          value={
            formData.trongLuong
              ? `${formData.trongLuong} kg`
              : "N/A"
          }
        />
        <InfoRow label="Khu nuôi:" value={formData.khuNuoi} />
        <div className="sm:col-span-2">
          <InfoRow
            label="Tổng chi phí:"
            value={`${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(tongChiPhi)}`}
          />
        </div>
      </div>
    </div>
    </>
}
export default FormStep3