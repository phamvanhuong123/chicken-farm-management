import { format } from "date-fns";

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-black">{value || "Chưa nhập"}</p>
    </div>
  );
}

function FormStep3({ formData }) {
  const tongChiPhi = formData.totalCost || 0;

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Xác nhận thông tin</h3>

        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <InfoRow
            label="Ngày nhập:"
            value={
              formData.importDate
                ? format(new Date(formData.importDate), "dd/MM/yyyy")
                : "N/A"
            }
          />

          <InfoRow label="Nhà cung cấp:" value={formData.supplier} />

          <InfoRow label="Giống:" value={formData.breed} />

          <InfoRow
            label="Số lượng:"
            value={
              formData.quantity
                ? `${new Intl.NumberFormat("vi-VN").format(
                    formData.quantity
                  )} con`
                : "N/A"
            }
          />

          <InfoRow
            label="Trọng lượng:"
            value={
              formData.avgWeight
                ? `${formData.avgWeight} kg`
                : "N/A"
            }
          />

          <InfoRow label="Khu nuôi:" value={formData.area} />

          <div className="sm:col-span-2">
            <InfoRow
              label="Tổng chi phí:"
              value={new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(tongChiPhi)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default FormStep3;
